#!/usr/bin/env python3
"""Train and evaluate the M-CARE bilingual intent classifier for one queued job.

This worker uses only the existing governed dataset and training tables. It is
not a medical advice model and never activates a model for clinical decisions.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import signal
import sys
import tempfile
from pathlib import Path
from typing import Any

try:
    import joblib
    import pymysql
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, classification_report, f1_score
    from sklearn.pipeline import Pipeline
except ImportError as exc:  # Give operators a useful installation message.
    print(
        f"Missing training dependency ({exc}). Install with: "
        "python3 -m pip install -r ai_service/requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(2)


class TrainingError(Exception):
    """A job cannot be trained safely with the available configuration/data."""


class TrainingInterrupted(TrainingError):
    """The worker received SIGINT or SIGTERM while processing a job."""


class JobUnavailable(TrainingError):
    """The job does not exist, is not queued, or is owned by another worker."""


def required_db_config() -> dict[str, Any]:
    """Read DB settings; host/port defaults match the local M-CARE install."""
    required = ["MCARE_DB_USER", "MCARE_DB_PASSWORD", "MCARE_DB_NAME"]
    missing = [name for name in required if name not in os.environ]
    if missing:
        raise TrainingError(
            "Missing database environment variable(s): " + ", ".join(missing)
            + ". Set them before running the worker. An empty local MariaDB "
              "password is valid; export MCARE_DB_PASSWORD='' explicitly."
        )
    try:
        port = int(os.getenv("MCARE_DB_PORT", "3306"))
    except ValueError as exc:
        raise TrainingError("MCARE_DB_PORT must be an integer.") from exc
    if not 1 <= port <= 65535:
        raise TrainingError("MCARE_DB_PORT must be between 1 and 65535.")
    return {
        "host": os.getenv("MCARE_DB_HOST", "127.0.0.1"),
        "port": port,
        "user": os.environ["MCARE_DB_USER"],
        "password": os.environ["MCARE_DB_PASSWORD"],
        "database": os.environ["MCARE_DB_NAME"],
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": False,
        "connect_timeout": 8,
        "read_timeout": 60,
        "write_timeout": 60,
    }


def connect_db(config: dict[str, Any]):
    try:
        return pymysql.connect(**config)
    except pymysql.MySQLError as exc:
        raise TrainingError(
            "Could not connect to the M-CARE database. Check MCARE_DB_HOST, "
            "MCARE_DB_PORT, MCARE_DB_USER, MCARE_DB_PASSWORD and MCARE_DB_NAME. "
            f"Database reported: {exc}"
        ) from exc


def log_event(cursor, job_id: int, level: str, message: str, details=None) -> None:
    cursor.execute(
        "INSERT INTO tbl_ai_training_job_logs(job_id,log_level,message,details) "
        "VALUES(%s,%s,%s,%s)",
        (
            job_id,
            level,
            message[:2000],
            json.dumps(details, ensure_ascii=False, allow_nan=False) if details is not None else None,
        ),
    )


def set_job_failed(db, job_id: int, message: str, details=None) -> None:
    """Persist failure only for a job this worker had queued/running."""
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "UPDATE tbl_ai_training_jobs SET status='failed',error_summary=%s,finished_at=NOW() "
                "WHERE job_id=%s AND status IN ('queued','running')",
                (message[:4000], job_id),
            )
            if cursor.rowcount:
                log_event(cursor, job_id, "error", "Training job failed.", {"error": message[:1000], **(details or {})})
            db.commit()
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise


def claim_job(db, job_id: int) -> dict[str, Any]:
    """Atomically claim a queued job and check the existing job/dataset schema."""
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM tbl_ai_training_jobs WHERE job_id=%s FOR UPDATE", (job_id,))
            job = cursor.fetchone()
            if not job:
                db.rollback()
                raise JobUnavailable(f"Training job {job_id} does not exist.")
            if job["status"] != "queued":
                db.rollback()
                raise JobUnavailable(
                    f"Training job {job_id} is '{job['status']}', not 'queued'; it was not changed."
                )
            if job["job_type"] != "classifier_training":
                reason = f"This worker supports classifier_training jobs, not '{job['job_type']}'."
                cursor.execute(
                    "UPDATE tbl_ai_training_jobs SET status='failed',error_summary=%s,finished_at=NOW() "
                    "WHERE job_id=%s AND status='queued'",
                    (reason, job_id),
                )
                log_event(cursor, job_id, "error", "Unsupported training job type.", {"job_type": job["job_type"]})
                db.commit()
                raise TrainingError(reason)
            cursor.execute("SELECT status FROM tbl_ai_datasets WHERE dataset_id=%s", (job["dataset_id"],))
            dataset = cursor.fetchone()
            if not dataset or dataset["status"] != "approved":
                reason = "The selected dataset does not exist or is not professionally approved."
                cursor.execute(
                    "UPDATE tbl_ai_training_jobs SET status='failed',error_summary=%s,finished_at=NOW() "
                    "WHERE job_id=%s AND status='queued'",
                    (reason, job_id),
                )
                log_event(cursor, job_id, "error", reason)
                db.commit()
                raise TrainingError(reason)
            cursor.execute(
                "UPDATE tbl_ai_training_jobs SET status='running',started_at=NOW(),error_summary=NULL "
                "WHERE job_id=%s AND status='queued'",
                (job_id,),
            )
            if cursor.rowcount != 1:
                db.rollback()
                raise JobUnavailable(f"Training job {job_id} was claimed by another worker.")
            log_event(cursor, job_id, "info", "Training started on the approved dataset.")
            db.commit()
            return job
    except (JobUnavailable, TrainingError):
        raise
    except Exception:
        db.rollback()
        raise


def read_examples(db, dataset_id: int) -> dict[str, list[dict[str, str]]]:
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT example_id,split_name,language,input_text,annotations,source_digest "
                "FROM tbl_ai_dataset_examples WHERE dataset_id=%s AND quality_status='approved' "
                "ORDER BY example_id",
                (dataset_id,),
            )
            rows = cursor.fetchall()
    except Exception as exc:
        raise TrainingError(f"Could not load the approved dataset examples: {exc}") from exc

    if not rows:
        raise TrainingError("The approved dataset contains no approved examples.")

    splits: dict[str, list[dict[str, str]]] = {"train": [], "validation": [], "test": []}
    digest_split: dict[str, str] = {}
    for row in rows:
        split = row["split_name"]
        language = row["language"]
        text = row["input_text"]
        if split not in splits:
            raise TrainingError(f"Example {row['example_id']} has an unsupported dataset split.")
        if language not in ("en", "rw"):
            raise TrainingError(f"Example {row['example_id']} has language '{language}'; expected en or rw.")
        if not isinstance(text, str) or not text.strip():
            raise TrainingError(f"Example {row['example_id']} has empty input text.")

        digest = row["source_digest"]
        if digest:
            previous = digest_split.setdefault(str(digest), split)
            if previous != split:
                raise TrainingError(
                    "Data leakage detected: one source_digest occurs in more than one split."
                )

        annotations = row["annotations"]
        try:
            if isinstance(annotations, (bytes, bytearray)):
                annotations = annotations.decode("utf-8")
            if isinstance(annotations, str):
                annotations = json.loads(annotations)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise TrainingError(f"Example {row['example_id']} contains invalid annotation JSON.") from exc
        if not isinstance(annotations, dict):
            raise TrainingError(f"Example {row['example_id']} annotations must be a JSON object.")
        intent = annotations.get("intent")
        if not isinstance(intent, str) or not intent.strip() or len(intent.strip()) > 80:
            raise TrainingError(
                f"Example {row['example_id']} needs a non-empty string annotations.intent (max 80 characters)."
            )
        splits[split].append({"text": text.strip(), "intent": intent.strip(), "language": language})

    if len(splits["train"]) < 20:
        raise TrainingError("At least 20 professionally approved training examples are required.")
    if not splits["validation"] or not splits["test"]:
        raise TrainingError("Approved validation and held-out test examples are required.")
    for split_name, examples in splits.items():
        languages = {item["language"] for item in examples}
        if languages != {"en", "rw"}:
            raise TrainingError(f"The {split_name} split must include both English and Kinyarwanda examples.")

    train_labels = {item["intent"] for item in splits["train"]}
    if len(train_labels) < 2:
        raise TrainingError("Training examples must cover at least two intent labels.")
    train_counts = {label: sum(item["intent"] == label for item in splits["train"]) for label in train_labels}
    rare = sorted(label for label, count in train_counts.items() if count < 2)
    if rare:
        raise TrainingError("Each intent needs at least two training examples; insufficient: " + ", ".join(rare))
    for split_name in ("validation", "test"):
        unseen = {item["intent"] for item in splits[split_name]} - train_labels
        if unseen:
            raise TrainingError(
                f"The {split_name} split contains intent labels absent from training: " + ", ".join(sorted(unseen))
            )
    return splits


def build_classifier() -> Pipeline:
    """Character n-grams tolerate spelling variation in English and Kinyarwanda."""
    return Pipeline(
        [
            (
                "features",
                TfidfVectorizer(
                    analyzer="char",
                    ngram_range=(2, 5),
                    min_df=1,
                    sublinear_tf=True,
                    max_features=150000,
                ),
            ),
            ("classifier", LogisticRegression(max_iter=1200, class_weight="balanced", random_state=42)),
        ]
    )


def evaluate(pipeline: Pipeline, examples: dict[str, list[dict[str, str]]]) -> dict[str, Any]:
    result = {}
    for split_name in ("validation", "test"):
        items = examples[split_name]
        truth = [item["intent"] for item in items]
        predicted = pipeline.predict([item["text"] for item in items])
        by_language = {}
        for language in ("en", "rw"):
            pairs = [
                (item["intent"], pred)
                for item, pred in zip(items, predicted)
                if item["language"] == language
            ]
            by_language[language] = {
                "examples": len(pairs),
                "accuracy": round(accuracy_score([pair[0] for pair in pairs], [pair[1] for pair in pairs]), 4),
                "macro_f1": round(f1_score([pair[0] for pair in pairs], [pair[1] for pair in pairs], average="macro", zero_division=0), 4),
            }
        result[split_name] = {
            "examples": len(items),
            "accuracy": round(accuracy_score(truth, predicted), 4),
            "macro_f1": round(f1_score(truth, predicted, average="macro", zero_division=0), 4),
            "by_language": by_language,
            "classification_report": classification_report(
                truth, predicted, output_dict=True, zero_division=0
            ),
        }
    return result


def save_artifact(pipeline: Pipeline, model_dir: str, version: str) -> Path:
    if not model_dir.strip():
        raise TrainingError("MCARE_MODEL_DIR is required and must name a private model-artifact directory.")
    root = Path(model_dir).expanduser()
    root.mkdir(mode=0o750, parents=True, exist_ok=True)
    root = root.resolve()
    artifact = root / f"{version}.joblib"
    temporary_name = None
    try:
        with tempfile.NamedTemporaryFile(prefix=f".{version}-", suffix=".tmp", dir=root, delete=False) as tmp:
            temporary_name = tmp.name
        joblib.dump(pipeline, temporary_name)
        os.replace(temporary_name, artifact)
        return artifact
    except Exception as exc:
        if temporary_name:
            try:
                Path(temporary_name).unlink(missing_ok=True)
            except OSError:
                pass
        raise TrainingError(f"Could not write the trained model artifact to {root}: {exc}") from exc


def persist_success(db, job: dict[str, Any], job_id: int, artifact: Path, metrics: dict[str, Any], labels: list[str], train_count: int) -> int:
    artifact_hash = hashlib.sha256(artifact.read_bytes()).hexdigest()
    model_version = f"intent-job-{job_id}"
    summary = {
        "component": "intent_classifier",
        "algorithm": "character_tfidf_logistic_regression",
        "languages": ["en", "rw"],
        "train_examples": train_count,
        "labels": labels,
        "evaluation": metrics,
        "artifact_sha256": artifact_hash,
    }
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tbl_ai_model_versions(model_name,version,model_type,status,evaluation_summary) "
                "VALUES(%s,%s,%s,'development',%s)",
                (
                    "mcare-bilingual-intent",
                    model_version,
                    "supervised_intent_classifier",
                    json.dumps(summary, ensure_ascii=False, allow_nan=False),
                ),
            )
            model_id = int(cursor.lastrowid)
            cursor.execute(
                "INSERT INTO tbl_ai_model_evaluations(model_id,dataset_id,job_id,evaluation_scope,metrics) "
                "VALUES(%s,%s,%s,%s,%s)",
                (
                    model_id,
                    job["dataset_id"],
                    job_id,
                    "validation-and-held-out-test",
                    json.dumps(metrics, ensure_ascii=False, allow_nan=False),
                ),
            )
            cursor.execute(
                "UPDATE tbl_ai_training_jobs SET status='succeeded',output_model_id=%s,metrics=%s,artifact_path=%s,finished_at=NOW() "
                "WHERE job_id=%s AND status='running'",
                (
                    model_id,
                    json.dumps(summary, ensure_ascii=False, allow_nan=False),
                    str(artifact),
                    job_id,
                ),
            )
            if cursor.rowcount != 1:
                raise TrainingError("Training job stopped being running before results could be recorded.")
            log_event(
                cursor,
                job_id,
                "info",
                "Training and held-out evaluation completed; model remains in development.",
                {"model_id": model_id, "model_version": model_version, "artifact": str(artifact)},
            )
        db.commit()
        return model_id
    except Exception:
        db.rollback()
        raise


def handle_signal(signum, _frame) -> None:
    signal_name = signal.Signals(signum).name
    raise TrainingInterrupted(f"Training interrupted by {signal_name}.")


def run_job(job_id: int) -> dict[str, Any]:
    if job_id <= 0:
        raise TrainingError("--job-id must be a positive integer.")
    db_config = required_db_config()
    db = connect_db(db_config)
    artifact: Path | None = None
    success = False
    claimed = False
    try:
        job = claim_job(db, job_id)
        claimed = True
        model_dir = os.getenv("MCARE_MODEL_DIR", "")
        if not model_dir.strip():
            raise TrainingError("MCARE_MODEL_DIR is required. Set it to a private directory for model artifacts.")
        examples = read_examples(db, int(job["dataset_id"]))
        model = build_classifier()
        train_items = examples["train"]
        model.fit([item["text"] for item in train_items], [item["intent"] for item in train_items])
        metrics = evaluate(model, examples)
        version = f"intent-job-{job_id}"
        artifact = save_artifact(model, model_dir, version)
        model_id = persist_success(
            db,
            job,
            job_id,
            artifact,
            metrics,
            sorted({item["intent"] for item in train_items}),
            len(train_items),
        )
        success = True
        return {
            "job_id": job_id,
            "model_id": model_id,
            "version": version,
            "status": "succeeded",
            "model_status": "development",
            "artifact": str(artifact),
            "metrics": metrics,
        }
    except JobUnavailable:
        raise
    except Exception as exc:
        # A signal can arrive in the tiny interval after the success transaction
        # commits but before persist_success() returns. Preserve the artifact if
        # the database already records that commit as successful.
        committed = False
        if claimed and not success:
            try:
                with db.cursor() as cursor:
                    cursor.execute(
                        "SELECT status,artifact_path FROM tbl_ai_training_jobs WHERE job_id=%s",
                        (job_id,),
                    )
                    persisted = cursor.fetchone()
                committed = bool(
                    persisted
                    and persisted["status"] == "succeeded"
                    and artifact is not None
                    and persisted["artifact_path"] == str(artifact)
                )
            except Exception:
                # If DB state is unavailable, keep the artifact for inspection;
                # deleting it could invalidate a success transaction.
                committed = True
        if artifact is not None and not success and not committed:
            try:
                artifact.unlink(missing_ok=True)
            except OSError:
                pass
        if claimed:
            try:
                set_job_failed(db, job_id, str(exc), {"exception_type": type(exc).__name__})
            except Exception as record_exc:
                print(
                    f"Could not record job {job_id} failure in the database: {record_exc}",
                    file=sys.stderr,
                )
        raise
    finally:
        db.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Train and evaluate one approved M-CARE intent dataset.")
    parser.add_argument("--job-id", type=int, required=True, help="ID of an existing queued classifier_training job")
    args = parser.parse_args(argv)
    previous_sigint = signal.signal(signal.SIGINT, handle_signal)
    previous_sigterm = signal.signal(signal.SIGTERM, handle_signal)
    try:
        result = run_job(args.job_id)
        print(json.dumps(result, ensure_ascii=False, allow_nan=False))
        return 0
    except JobUnavailable as exc:
        print(f"Job not run: {exc}", file=sys.stderr)
        return 3
    except TrainingError as exc:
        print(f"Training failed: {exc}", file=sys.stderr)
        return 1
    except pymysql.MySQLError as exc:
        print(f"Database operation failed: {exc}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("Training interrupted by keyboard interrupt.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Unexpected training failure ({type(exc).__name__}): {exc}", file=sys.stderr)
        return 1
    finally:
        signal.signal(signal.SIGINT, previous_sigint)
        signal.signal(signal.SIGTERM, previous_sigterm)


if __name__ == "__main__":
    raise SystemExit(main())
