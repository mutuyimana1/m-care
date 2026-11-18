"""Private local Kinyarwanda speech-to-text service; transcripts require review."""
from __future__ import annotations

import hmac
import io
import math
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

app = FastAPI(title="M-CARE Kinyarwanda Speech Recognition", version="1.0.0")
MODEL_ID = "badrex/w2v-bert-2.0-kinyarwanda-asr"
MODEL_PATH = Path(__file__).with_name("model")
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
MAX_AUDIO_SECONDS = 120
_model_lock = threading.Lock()
_inference_lock = threading.BoundedSemaphore(1)
_processor: Any = None
_model: Any = None


def require_service_token(authorization: str | None = Header(default=None)) -> None:
    expected = os.environ.get("MCARE_ASR_SERVICE_TOKEN", "")
    scheme, _, supplied = (authorization or "").partition(" ")
    if not expected or scheme.lower() != "bearer" or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def load_model() -> tuple[Any, Any]:
    global _model, _processor
    if _model is None or _processor is None:
        with _model_lock:
            if _model is None or _processor is None:
                if not (MODEL_PATH / "model.safetensors").is_file():
                    raise RuntimeError("The local Kinyarwanda ASR model files are missing.")
                import torch
                from transformers import AutoModelForCTC, AutoProcessor

                torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
                torch.set_num_interop_threads(1)
                _processor = AutoProcessor.from_pretrained(str(MODEL_PATH), local_files_only=True)
                _model = AutoModelForCTC.from_pretrained(str(MODEL_PATH), local_files_only=True)
                _model.eval()
    return _processor, _model


def transcribe_bytes(data: bytes) -> str:
    import numpy as np
    import soundfile as sf
    import torch
    from scipy.signal import resample_poly

    try:
        audio_file = io.BytesIO(data)
        info = sf.info(audio_file)
        if info.frames <= 0 or info.samplerate <= 0 or info.frames / info.samplerate > MAX_AUDIO_SECONDS:
            raise ValueError(f"The recording must be {MAX_AUDIO_SECONDS} seconds or shorter.")
        audio_file.seek(0)
        audio, sample_rate = sf.read(audio_file, dtype="float32", always_2d=False)
    except Exception as exc:
        raise ValueError("Use a supported WAV or FLAC audio recording.") from exc
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    if audio.size < 1600:
        raise ValueError("The recording is too short to transcribe.")
    if sample_rate <= 0 or audio.size / sample_rate > MAX_AUDIO_SECONDS:
        raise ValueError(f"The recording must be {MAX_AUDIO_SECONDS} seconds or shorter.")
    if sample_rate != 16000:
        divisor = math.gcd(int(sample_rate), 16000)
        audio = resample_poly(audio, 16000 // divisor, int(sample_rate) // divisor).astype(np.float32)

    processor, model = load_model()
    chunks = [audio[start:start + 8 * 16000] for start in range(0, audio.size, 8 * 16000)]

    def decode(chunk: Any) -> str:
        inputs = processor(chunk, sampling_rate=16000, return_tensors="pt")
        with torch.inference_mode():
            predicted_ids = torch.argmax(model(**inputs).logits, dim=-1)
        return processor.batch_decode(predicted_ids)[0].strip()

    with _inference_lock, ThreadPoolExecutor(max_workers=min(4, len(chunks))) as executor:
        text = " ".join(value for value in executor.map(decode, chunks) if value).strip()
    if not text:
        raise ValueError("No Kinyarwanda speech was recognized. You can enter the report as text.")
    return text


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "kinyarwanda-asr", "model": MODEL_ID}


@app.post("/v1/transcribe", dependencies=[Depends(require_service_token)])
async def transcribe(file: UploadFile = File(...)) -> dict[str, object]:
    if file.content_type not in {"audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Upload a WAV or FLAC audio recording.")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large (25 MB maximum).")
    try:
        text = await run_in_threadpool(transcribe_bytes, data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        # Keep server internals out of the response; details belong in private logs.
        raise HTTPException(status_code=503, detail="Speech recognition is unavailable. Please enter the report as text.") from exc
    return {
        "text": text,
        "language": "rw",
        "model": MODEL_ID,
        "transcript_review_required": True,
        "clinical_use": "advisory_transcription_only",
    }
