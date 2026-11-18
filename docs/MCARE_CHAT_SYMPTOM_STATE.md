# M-CARE chatbot symptom state

The existing `mother_chatbot` page continues to use the existing `mother_assistant` endpoint. The endpoint now records each turn and updates one structured conversation state for the authenticated mother.

## State and persistence

Migration `008_maternal_chat_state.sql` creates:

- `tbl_mcare_chat_conversations`: owner, language, active/closed status, and JSON state.
- `tbl_mcare_chat_turns`: original user and M-CARE text, normalized text, extracted fields, and intent.

The state stores reported symptom concepts, the mother’s original wording, severity as described, onset, duration, frequency, associated symptoms, worsening, pregnancy profile context, questions already asked, answers received, and remaining information. Unknown values stay null or appear in `missing_information`.

The page reloads recent turns for the same active conversation. “Clear conversation” deletes its turns, clears its state, and closes it. Inactive conversations older than 30 days have their turns and state cleared when a new conversation is opened. Stored messages are not training data and are not used for model improvement.

## Duplicate handling

Kinyarwanda and English symptom variants are normalized to a shared symptom concept. When an already reported symptom appears again, the state retains the new original wording, merges any new severity/onset/worsening details, explicitly acknowledges the symptom, and chooses a question not already asked. Corrections such as “I am telling you that my head hurts” are treated as a correction and receive an apology plus acknowledgement.

For headache, the next-question selector uses known pregnancy/postpartum profile information. When that information is missing, it asks about it once. It then asks for missing onset, visual changes, or severity as appropriate. Urgent cues are checked before conversational selection, and repeated open alerts in the same conversation are reused instead of creating duplicate alerts.

## Verification

Run the synthetic regression checks with:

```sh
php tests/mcare_chat_intelligence_smoke.php
```

These examples check extraction, correction acknowledgement, state updates, question repetition, and urgent cue routing. They are software regression examples, not a professionally reviewed clinical dataset or proof of clinical validity. Kinyarwanda terminology and clinical pathways still require review by qualified Rwanda-based maternal health and language professionals.
