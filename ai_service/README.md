# M-CARE language service (development foundation)

This private FastAPI service provides advisory English/Kinyarwanda intent and candidate symptom cue extraction. The local, versioned vocabulary is in `app/kinyarwanda_lexicon.json`; it preserves matched source wording, maps reviewed expressions to concepts, and labels every proposed Kinyarwanda mapping as pending review. It does not translate patient messages, generate treatment advice, make diagnoses, create alerts, or change clinical records. PHP remains authoritative for identity, permissions, clinical rules, alert routing, referral status, and audit records.

The lexicon and its synthetic evaluation examples are a development module, not a clinically validated language resource. A fluent Kinyarwanda-speaking maternal-health professional must review expressions, context, and mappings. Do not infer severity from a concept match. The service returns candidate warning phrases only; approved PHP rules and professional review remain the operational safety path.

The mother education helper can call this service when both `MCARE_AI_SERVICE_URL` and `MCARE_AI_SERVICE_TOKEN` are set in PHP's environment, for example `http://127.0.0.1:8100`. The helper sends only the current question over the private HTTP connection, uses a 1.5 second timeout, and falls back to its published-content behavior when the service is unavailable. Existing immediate emergency guidance runs before this optional call. Candidate cues route the mother to urgent care or professional review; they do not create database alerts or clinical decisions. Keep the service bound to a private interface and use the same high-entropy token in both processes.

Run locally with Python 3.11+:

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export MCARE_AI_SERVICE_TOKEN='use-a-long-random-secret-from-your-secret-store'
uvicorn app.main:app --host 127.0.0.1 --port 8100
```

`GET /health` is a liveness check. `POST /v1/analyze` requires `Authorization: Bearer <service-token>` and accepts `{ "text": "...", "language_hint": "en|rw|auto" }`. It returns the original text, candidate concepts, matched vocabulary expression, language guess, mixed-language indicator, and review flags. `GET /v1/terminology` returns the versioned vocabulary and approval notice; it also requires the service token. The service is not connected to live patient data by default and does not log request bodies. Keyword matching is a development baseline, not a validated clinical NLP model. Do not use its labels to triage patients.

## Translation model decision

No automatic translation model is installed or used for maternal-health messages. The public `facebook/nllb-200-distilled-600M` model is about 2.48 GB and is published under CC-BY-NC 4.0; that license and its general-purpose translation scope make it an unsuitable default dependency for an unspecified production healthcare deployment. Machine translation must not silently replace clinician-reviewed Kinyarwanda content. If a translation provider is later selected, review its license, privacy terms, Kinyarwanda clinical quality, and human-review workflow first. The portal's approved content should continue to be authored/reviewed in both languages.
