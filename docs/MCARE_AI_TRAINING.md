# M-CARE AI response and training workflow

## Integration plan and current design

The existing `mother_assistant.php` remains the single chatbot endpoint. It first applies the current deterministic emergency checks and medicine-safety response. Only after those checks does it call `inc/mcare_llm.php`. That provider adapter receives the current message, a short recent conversation window, structured symptom state, and up to five same-language excerpts from approved knowledge documents or published education. It does not receive names or maternal identifiers. Model responses are logged with a one-way prompt digest and source titles. If generation is not configured, unavailable, or lacks approved information for a clinical concern, the existing safe response path remains in effect.

The training workflow is separate from chat inference. `ai_training.php` imports de-identified JSONL into the new database tables. Dataset examples start pending. A different nurse/health professional (role 2 or 4) must review each example and approve the dataset; an administrator can then queue a training job. `ai_service/train_intent.py` trains a character n-gram TF-IDF and logistic regression intent classifier, evaluates validation and held-out test splits including language-specific counts, stores evaluation results, and registers the artifact as a development model. This classifier does not generate medical advice and is not used for clinical triage.

## Configure dynamic response generation

Set these variables in the PHP/Apache process environment, then restart the web server. Never put keys in this repository or expose them in `phpinfo()`.

```sh
MCARE_LLM_PROVIDER=openai
MCARE_LLM_API_KEY=your-secret-from-a-secret-store
MCARE_LLM_MODEL=your-approved-model-name
```

`MCARE_LLM_PROVIDER` supports `openai`, `anthropic`, `gemini`, and `ollama`. For OpenAI-compatible deployments, `MCARE_LLM_BASE_URL` can override the API base. For Ollama, set `MCARE_LLM_BASE_URL` to a private local endpoint (for example `http://127.0.0.1:11434`) and set the model name; no API key is required. The external provider will receive the mother’s message and recent conversation text when enabled. Review provider privacy, retention, data processing terms, and locally applicable approvals before enabling it. Emergency checks run before any provider request.

## Prepare and train an intent model

Install the worker dependencies in a private Python environment (Python 3.10+):

```sh
python3 -m venv ai_service/.venv
ai_service/.venv/bin/pip install -r ai_service/requirements.txt
```

The intent worker uses `scikit-learn` and `joblib` for training and artifacts,
and `PyMySQL` for the existing MariaDB tables. These packages are already
listed in `ai_service/requirements.txt`; no separate model download is needed.
Keep this environment on the application server and do not expose its model
directory through the web server.

Upload UTF-8 JSONL through **AI datasets & training**. Each row must contain `text`, `language` (`en` or `rw`), `intent`, and a pseudonymous `source_group`. Rows sharing a source group are held in the same deterministic train/validation/test split. Do not use patient identifiers or unconsented chat content. The uploader must provide the authorization basis. Example:

```json
{"text":"Ndumva ndwaye","language":"rw","intent":"discomfort","source_group":"review-set-a-01"}
```

An independent clinical professional reviews every example and approves the dataset. An administrator queues `classifier_training`; run the worker on a private server:

```sh
MCARE_DB_HOST=127.0.0.1 MCARE_DB_USER=... MCARE_DB_PASSWORD=... MCARE_DB_NAME=care_db \
MCARE_MODEL_DIR=/var/lib/mcare/models \
ai_service/.venv/bin/python ai_service/train_intent.py --job-id 123
```

`MCARE_DB_USER`, `MCARE_DB_PASSWORD`, and `MCARE_DB_NAME` must be set explicitly;
an empty local MariaDB password is supported by setting
`MCARE_DB_PASSWORD=''`. `MCARE_DB_HOST` and `MCARE_DB_PORT` default to
`127.0.0.1` and `3306`. `MCARE_MODEL_DIR` is required and must point to a
private directory outside the public web root.

The worker claims only a `queued` `classifier_training` job whose dataset is
approved. It trains only professionally approved examples with a valid
`annotations.intent`. At least 20 training examples, two labels with at least
two examples per label, and non-empty validation and test splits are required;
all three splits must include both `en` and `rw`, evaluation labels must occur
in training, and a source digest cannot cross splits. Invalid or insufficient
data marks the claimed job failed with an error in the existing job/log tables.
Validation and held-out test metrics are recorded alongside the model version
and artifact path. SIGINT/SIGTERM also marks a claimed job failed when the
database remains reachable. The model status is always `development`; the
worker never activates it or uses it for clinical decisions. The current
intent classifier is not connected to conversational generation or clinical
triage. A clinically validated, held-out dataset and formal deployment
approval are required before activation.

## Database

Apply `migrations/009_ai_training_workflow.sql` to create the dataset, review, offline-job, evaluation, and retrieval-chunk tables. It is safe to reapply. The schema records dataset provenance and review decisions; it does not populate examples or assert that training has happened.
