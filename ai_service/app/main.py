"""Small advisory language service. It never diagnoses or changes case status."""
from __future__ import annotations

import hmac
import json
import os
import re
import unicodedata
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="M-CARE Maternal Language Service", version="0.1.0")
_LEXICON = json.loads(Path(__file__).with_name("kinyarwanda_lexicon.json").read_text(encoding="utf-8"))


def normalize_text(value: str) -> str:
    """Normalize separators for matching without changing the original wording."""
    value = unicodedata.normalize("NFKC", value).casefold().replace("’", "'")
    value = re.sub(r"[^\w\s']", " ", value, flags=re.UNICODE)
    return re.sub(r"\s+", " ", value).strip()


def phrase_matches(text: str, phrase: str) -> bool:
    normalized_phrase = normalize_text(phrase)
    return bool(normalized_phrase and re.search(r"(?:^|\s)" + re.escape(normalized_phrase) + r"(?:$|\s)", text))


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    language_hint: Literal["en", "rw", "auto"] = "auto"


class AnalyzeResponse(BaseModel):
    original_text: str
    language: Literal["en", "rw", "unknown"]
    intent: Literal["symptom", "nutrition", "appointment", "medication", "postpartum", "general"]
    symptom_cues: list[str]
    potential_warning_signals: list[str]
    needs_human_review: bool
    mixed_language: bool = False
    matched_cues: list[dict[str, str]] = Field(default_factory=list)
    clarification_needed: bool = False
    advisory_only: Literal[True] = True


INTENTS = {
    "symptom": ("pain", "bleed", "fever", "headache", "vision", "breath", "convulsion", "ububabare", "amaraso", "umuriro", "umutwe", "amaso", "guhumeka", "igicuri"),
    "nutrition": ("food", "eat", "nutrition", "meal", "ibiryo", "kurya", "imirire", "amafunguro"),
    "appointment": ("appointment", "visit", "clinic", "anc", "gahunda", "igihe cyo gusura", "ikigo nderabuzima"),
    "medication": ("medicine", "medication", "drug", "tablet", "umuti", "imiti", "ibinini"),
    "postpartum": ("postpartum", "after birth", "breastfeed", "postnatal", "nyuma yo kubyara", "konka"),
}
INTENTS = {
    name: tuple(dict.fromkeys(phrases + tuple(_LEXICON["intent_terms"].get(name, ()))))
    for name, phrases in INTENTS.items()
}
WARNING_CUES = {
    "convulsions": ("convulsion", "seizure", "igicuri", "gufatwa n'igicuri", "gufatwa n’ igicuri"),
    "severe_bleeding": ("heavy bleeding", "severe bleeding", "bleeding heavily", "kuva amaraso menshi", "amaraso menshi"),
    "breathing_difficulty": ("difficulty breathing", "cannot breathe", "shortness of breath", "guhumeka bigoranye", "kubura umwuka"),
    "severe_headache_or_vision": ("severe headache", "blurred vision", "vision changes", "umutwe uribwa cyane", "kutabona neza"),
    "severe_abdominal_pain": ("severe abdominal pain", "severe stomach pain", "ububabare bukabije mu nda"),
    "reduced_fetal_movement": ("baby stopped moving", "reduced fetal movement", "umwana ntiyinyeganyeza", "umwana yahagaritse kunyeganyega"),
    "fever": ("high fever", "umuriro mwinshi"),
}
SYMPTOMS = {
    "headache": ("headache", "umutwe"), "vision_change": ("blurred vision", "vision changes", "kutabona neza"),
    "bleeding": ("bleeding", "kuva amaraso"), "abdominal_pain": ("abdominal pain", "stomach pain", "ububabare mu nda"),
    "fever": ("fever", "umuriro"), "breathing_difficulty": ("difficulty breathing", "guhumeka bigoranye", "kubura umwuka"),
    "convulsions": ("convulsion", "seizure", "igicuri"), "reduced_fetal_movement": ("reduced fetal movement", "baby stopped moving", "umwana ntiyinyeganyeza"),
    "vomiting": (), "swelling": (),
}


def require_service_token(authorization: str | None = Header(default=None)) -> None:
    expected = os.environ.get("MCARE_AI_SERVICE_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="AI language service is not configured")
    scheme, _, supplied = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


def contains_any(text: str, phrases: tuple[str, ...]) -> bool:
    return any(phrase_matches(text, phrase) for phrase in phrases)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "advisory-language-only"}


@app.get("/v1/terminology", dependencies=[Depends(require_service_token)])
def terminology() -> dict[str, object]:
    """Return the development vocabulary and its explicit review status."""
    return _LEXICON


@app.post("/v1/analyze", response_model=AnalyzeResponse, dependencies=[Depends(require_service_token)])
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    text = normalize_text(body.text)
    rw_terms = [phrase for item in _LEXICON["symptoms"].values() for phrase in item["expressions"]]
    rw_terms.extend(term for terms in _LEXICON["intent_terms"].values() for term in terms)
    rw_markers = tuple(rw_terms) + ("ndababara", "ndafite", "umwana", "inda", "ndashaka", "ububabare", "amaraso", "umuriro", "nyuma yo kubyara")
    en_markers = ("the", "and", "have", "what", "when", "where", "my", "is", "can", "should", "please", "headache", "fever", "bleeding", "pain", "food", "medicine")
    detected_language: Literal["en", "rw", "unknown"]
    if body.language_hint != "auto":
        detected_language = body.language_hint
    elif contains_any(text, rw_markers):
        detected_language = "rw"
    elif contains_any(text, en_markers):
        detected_language = "en"
    else:
        detected_language = "unknown"

    matched_intent = "general"
    for intent, phrases in INTENTS.items():
        if contains_any(text, phrases):
            matched_intent = intent
            break
    matched_cues: list[dict[str, str]] = []
    for name, phrases in SYMPTOMS.items():
        entry = _LEXICON["symptoms"].get(name)
        hits = [phrase for phrase in phrases if phrase_matches(text, phrase)]
        if entry:
            hits.extend(phrase for phrase in entry["expressions"] if phrase_matches(text, phrase))
        if hits:
            matched_cues.append({"concept": name, "matched_expression": hits[0], "review_status": entry["review_status"] if entry else "english_baseline_unvalidated"})
    cues = [item["concept"] for item in matched_cues]
    warnings = [name for name, phrases in WARNING_CUES.items() if contains_any(text, phrases)]
    for signal, phrases in _LEXICON["potential_warning_expressions"].items():
        if contains_any(text, tuple(phrases)) and signal not in warnings:
            warnings.append(signal)
    en_seen = contains_any(text, en_markers)
    rw_seen = contains_any(text, rw_markers)
    clarification_needed = any(item["review_status"] == "pending_context_review" for item in matched_cues)
    return AnalyzeResponse(
        original_text=body.text,
        language=detected_language,
        intent=matched_intent,  # type: ignore[arg-type]
        symptom_cues=cues,
        potential_warning_signals=warnings,
        needs_human_review=bool(cues or warnings or matched_intent in {"medication", "symptom"}),
        mixed_language=en_seen and rw_seen,
        matched_cues=matched_cues,
        clarification_needed=clarification_needed,
    )
