#!/usr/bin/env python3
"""Exercise AMI framing and originate/hangup actions against a local fake server."""
from __future__ import annotations

import os
import socket
import subprocess
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_action(conn: socket.socket) -> dict[str, str]:
    data = bytearray()
    while not data.endswith(b"\r\n\r\n"):
        chunk = conn.recv(1)
        if not chunk:
            break
        data.extend(chunk)
    return {
        key.strip(): value.strip()
        for line in data.decode().splitlines()
        if ":" in line
        for key, value in [line.split(":", 1)]
    }


def main() -> None:
    server = socket.socket()
    server.bind(("127.0.0.1", 0))
    server.listen()
    port = server.getsockname()[1]
    received: list[dict[str, str]] = []

    def serve() -> None:
        for _ in range(3):
            conn, _ = server.accept()
            with conn:
                conn.sendall(b"Asterisk Call Manager/22\r\n")
                login = read_action(conn)
                assert login["Action"] == "Login"
                assert login["Username"] == "smoke-user"
                assert login["Secret"] == "smoke-secret"
                conn.sendall(b"Response: Success\r\nMessage: Authentication accepted\r\n\r\n")
                action = read_action(conn)
                received.append(action)
                conn.sendall(b"Response: Success\r\nMessage: Action accepted\r\n\r\n")

    thread = threading.Thread(target=serve, daemon=True)
    thread.start()
    php = r'''
require $argv[1];
$s=mcare_ami_settings();
mcare_ami_originate($s,'250788708084',17,'mcare-smoke-1');
$s['numberFormat']='national';$s['numberPrefix']='9';
mcare_ami_originate($s,'250788708084',18,'mcare-smoke-2');
mcare_ami_hangup($s,'PJSIP/250788708084@mcare-mtn-00000001','mcare-hang-smoke-1');
'''
    env = os.environ.copy()
    env.update({
        "MCARE_AMI_HOST": "127.0.0.1",
        "MCARE_AMI_PORT": str(port),
        "MCARE_AMI_USERNAME": "smoke-user",
        "MCARE_AMI_SECRET": "smoke-secret",
        "MCARE_OUTBOUND_PJSIP_ENDPOINT": "mcare-mtn",
        "MCARE_OUTBOUND_CALLER_ID": "+250788700000",
        "MCARE_OUTBOUND_NUMBER_FORMAT": "rwanda_e164",
    })
    try:
        result = subprocess.run(["php", "-r", php, str(ROOT / "inc/asterisk_ami.php")], env=env, capture_output=True, text=True, timeout=15)
        if result.returncode:
            raise RuntimeError(result.stderr or result.stdout)
    finally:
        server.close()
    thread.join(timeout=3)
    assert len(received) == 3, received
    originate, national_originate, hangup = received
    assert originate["Action"] == "Originate"
    assert originate["Channel"] == "PJSIP/250788708084@mcare-mtn"
    assert originate["Context"] == "mcare-outbound"
    assert originate["Exten"] == "17"
    assert originate["Async"] == "true"
    assert national_originate["Action"] == "Originate"
    assert national_originate["Channel"] == "PJSIP/90788708084@mcare-mtn"
    assert national_originate["Exten"] == "18"
    assert hangup["Action"] == "Hangup"
    assert hangup["Channel"].startswith("PJSIP/")
    print("AMI originate and hangup framing passed against a local fake AMI server; no telephone call was placed.")


if __name__ == "__main__":
    main()
