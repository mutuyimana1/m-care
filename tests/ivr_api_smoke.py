#!/usr/bin/env python3
"""Authenticated local-only IVR API smoke and concurrency checks."""
from __future__ import annotations

import concurrent.futures
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid

BASE = os.environ.get("MCARE_IVR_BASE_URL", "http://localhost/care").rstrip("/")
SESSION = os.environ.get("MCARE_IVR_PHPSESSID", "")
CSRF = os.environ.get("MCARE_IVR_CSRF", "")
if not SESSION or not CSRF:
    print("SKIP: set MCARE_IVR_PHPSESSID and MCARE_IVR_CSRF from an authorized local test session.")
    raise SystemExit(2)

COOKIE = f"PHPSESSID={SESSION}"
passed: list[str] = []
failures: list[str] = []
owned_calls: set[int] = set()


def request(action: str, data: dict | None = None, *, authorized: bool = True):
    url = f"{BASE}/ivr_api.php?action={urllib.parse.quote(action)}"
    headers = {"Accept": "application/json"}
    if authorized:
        headers["Cookie"] = COOKIE
    if data is None:
        req = urllib.request.Request(url, headers=headers)
    else:
        payload = dict(data)
        if authorized:
            payload["_csrf"] = CSRF
        body = urllib.parse.urlencode(payload).encode()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPHandler()) if authorized else urllib.request.build_opener(urllib.request.HTTPHandler(), _NoRedirect())
        with opener.open(req, timeout=20) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return response.status, raw
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", errors="replace")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def api(action: str, data: dict | None = None):
    status, raw = request(action, data)
    try:
        body = __import__("json").loads(raw)
    except Exception as exc:
        raise AssertionError(f"{action} returned HTTP {status}: {raw[:300]}") from exc
    return status, body


def check(name, fn):
    try:
        fn()
        passed.append(name)
        print(f"PASS {name}")
    except Exception as exc:
        failures.append(name)
        print(f"FAIL {name}: {exc}")
    finally:
        for call_id in list(owned_calls):
            try:
                end(call_id)
            except Exception:
                pass
        owned_calls.clear()


def start(fixture="synthetic_anonymous"):
    caller = "TEST-" + uuid.uuid4().hex[:12].upper()
    status, result = api("start", {"fixture": fixture, "caller_number": caller})
    if status != 200 or not result.get("ok"):
        raise AssertionError(result.get("error", result))
    call = result["call"]
    owned_calls.add(int(call["call_id"]))
    assert call["is_test"] is True and call["call_uuid"]
    return call


def get_call(call_id):
    url = f"{BASE}/ivr_api.php?action=call&call_id={call_id}"
    req = urllib.request.Request(url, headers={"Cookie": COOKIE, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            status, raw = response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        status, raw = error.code, error.read().decode()
    body = __import__("json").loads(raw)
    if status != 200 or not body.get("ok"):
        raise AssertionError(body)
    return body["call"]


def step(call_id, digit):
    status, body = api("step", {"call_id": call_id, "digit": digit})
    if status != 200 or not body.get("ok"):
        raise AssertionError(body)
    return body["call"], body.get("message", "")


def choose_language(lang="en", fixture="synthetic_anonymous"):
    call = start(fixture)
    call, _ = step(call["call_id"], "1" if lang == "rw" else "2")
    return call


def end(call_id):
    status, body = api("end", {"call_id": call_id})
    if status not in (200, 404):
        raise AssertionError(body)


def test_welcome_and_english():
    call = choose_language("en")
    assert call["language"] == "en" and call["menu"] == "main"


def test_kinyarwanda():
    call = choose_language("rw")
    assert call["language"] == "rw" and call["menu"] == "main"


def test_invalid_digit_and_repeat():
    call = choose_language("en"); call_id = call["call_id"]
    before, _ = step(call_id, "9")
    assert before["state"] == "main_menu" and before["last_event"]["type"] == "invalid_input"
    repeated, _ = step(call_id, "7")
    assert repeated["menu"] == "main"


def test_pregnancy_education():
    call = choose_language("en"); call_id = call["call_id"]
    call, _ = step(call_id, "1")
    assert call["menu"] == "education"
    call, message = step(call_id, "1")
    assert call["state"] == "content" and "published" in message.lower()


def test_appointment_fixture():
    call = choose_language("en", "synthetic_pregnancy_1")
    call, message = step(call["call_id"], "4")
    assert "Synthetic demonstration appointment" in message and "actual appointments" in message.lower()


def test_medication_fixture():
    call = choose_language("en", "synthetic_pregnancy_2")
    call, message = step(call["call_id"], "5")
    assert "no medicine or dose" in message.lower()


def test_emergency_test_escalation():
    call = choose_language("en"); call, _ = step(call["call_id"], "2"); call, message = step(call["call_id"], "1")
    assert call["state"] == "emergency_ack" and "no health worker was notified" in message.lower()


def test_queue_answer():
    call = choose_language("en"); call, _ = step(call["call_id"], "6"); call_id = call["call_id"]
    assert call["status"] == "queued"
    status, body = api("queue_resolve", {"call_id": call_id, "decision": "answer"})
    assert status == 200 and body["ok"] and get_call(call_id)["status"] == "answered_simulated"


def test_queue_reject():
    call = choose_language("en"); call, _ = step(call["call_id"], "6"); call_id = call["call_id"]
    status, body = api("queue_resolve", {"call_id": call_id, "decision": "reject"})
    assert status == 200 and body["ok"] and get_call(call_id)["status"] == "active"


def test_call_termination():
    call = start(); call_id = call["call_id"]; end(call_id)
    assert get_call(call_id)["status"] == "completed"


def test_session_isolation():
    left = start(); right = start()
    l, _ = step(left["call_id"], "1")
    r, _ = step(right["call_id"], "2")
    assert l["language"] == "rw" and r["language"] == "en" and l["call_uuid"] != r["call_uuid"]


def test_ten_parallel_sessions():
    def create(i):
        call = start("synthetic_pregnancy_" + str((i % 3) + 1))
        result, _ = step(call["call_id"], "1" if i % 2 else "2")
        return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        calls = list(pool.map(create, range(10)))
    assert len({c["call_uuid"] for c in calls}) == 10
    assert len({c["call_id"] for c in calls}) == 10
    assert sum(c["language"] == "rw" for c in calls) == 5


def test_capacity_limit():
    for old_id in list(owned_calls):
        end(old_id)
    status, settings = api("stats")
    capacity = int(settings["capacity"])
    if capacity < 10:
        raise AssertionError(f"Configured capacity is {capacity}; expected at least 10")
    started = []
    try:
        for _ in range(capacity):
            started.append(start())
        status, body = api("start", {"fixture":"synthetic_anonymous","caller_number":"TEST-LIMIT-REACHED"})
        assert status == 429 and "limit" in body.get("error", "").lower()
    finally:
        for call in started:
            end(call["call_id"])


def test_fake_real_phone_rejected():
    status, body = api("start", {"fixture":"synthetic_anonymous","caller_number":"+250788123456"})
    assert status == 422 and "TEST-" in body.get("error", "")


def test_unknown_action_rejected():
    status, body = api("not_a_real_action")
    assert status == 404 and not body.get("ok")


def test_unauthenticated_api_rejected():
    status, _ = request("list", authorized=False)
    assert status in (302, 303, 401, 403)


def test_missing_audio_prompt_is_safe():
    call = start()
    assert "audio_path" in call and "prompt" in call


def test_missing_asr_file_validation():
    status, body = api("speech_test", {"language":"rw"})
    assert status == 422 and "sample" in body.get("error", "").lower()


checks = [
    ("start call + English selection", test_welcome_and_english),
    ("Kinyarwanda selection", test_kinyarwanda),
    ("invalid keypad input + repeat", test_invalid_digit_and_repeat),
    ("published pregnancy education path", test_pregnancy_education),
    ("synthetic appointment lookup", test_appointment_fixture),
    ("synthetic medication reminder", test_medication_fixture),
    ("emergency escalation is test-only", test_emergency_test_escalation),
    ("simulated healthcare worker answer", test_queue_answer),
    ("simulated worker unavailable", test_queue_reject),
    ("call termination", test_call_termination),
    ("independent caller state isolation", test_session_isolation),
    ("ten concurrent simulated sessions", test_ten_parallel_sessions),
    ("configured concurrency capacity limit", test_capacity_limit),
    ("real phone number blocked in simulator", test_fake_real_phone_rejected),
    ("unknown backend action failure", test_unknown_action_rejected),
    ("unauthenticated API access rejected", test_unauthenticated_api_rejected),
    ("missing prompt audio handled without failure", test_missing_audio_prompt_is_safe),
    ("missing ASR sample validation", test_missing_asr_file_validation),
]

try:
    for name, test in checks:
        check(name, test)
finally:
    for call_id in list(owned_calls):
        try:
            end(call_id)
        except Exception:
            pass

print(f"\nIVR API test report: {len(passed)} passed, {len(failures)} failed")
if failures:
    print("Failed: " + ", ".join(failures))
    raise SystemExit(1)
