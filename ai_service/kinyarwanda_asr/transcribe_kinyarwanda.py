#!/usr/bin/env python3
"""Transcribe one local WAV/FLAC file with M-CARE's bundled Kinyarwanda ASR model."""
import argparse
import json
from pathlib import Path

from server import MODEL_ID, transcribe_bytes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, help="Path to a WAV or FLAC recording")
    args = parser.parse_args()
    try:
        text = transcribe_bytes(Path(args.file).read_bytes())
        print(json.dumps({"ok": True, "text": text, "language": "rw", "model": MODEL_ID,
                          "transcript_review_required": True}, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "message": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
