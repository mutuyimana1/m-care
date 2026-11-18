# M-CARE requirements audit

This audit compares the two supplied M-CARE requirements documents with the PHP/MySQL code in this repository. “Implemented” means a staff-facing web workflow exists in this codebase; it does not imply clinical approval, deployment readiness, or verification against a live database.

## Functional requirements

| Requirement | Status | Current coverage and gap |
| --- | --- | --- |
| FR-01 User management | Partial | Staff login, roles, facility assignment, password change, activation, and role checks exist. Administrators can link a woman account to one maternal profile. There is no public self-registration, account recovery process, MFA, or complete security review. |
| FR-02 Maternal management | Partial | Staff can register and manage maternal profiles, consent/language, pregnancy confirmation and pregnancy dating. A linked woman can view her own profile context, pregnancy summary and appointment information in the web portal. |
| FR-03 ANC management | Partial | Staff can record ANC observations, laboratory/preventive fields, history, and next appointment. Approved schedule calculation, full clinical baseline analysis, and EMR import are absent. |
| FR-04 Symptom reporting | Partial | Staff and linked women can submit guided reports with symptoms, onset, severity, pattern, worsening, prior care, optional vitals, notes, and reference number. The mother form now has optional Kinyarwanda voice capture and local ASR transcription when the copied model service is installed/configured; the mother reviews and edits the transcript before adding it to the report. English voice, clinical validation, and deployment configuration remain absent. |
| FR-05 Alert management | Partial | Alerts are generated, assigned to CHW/facility, filtered, acknowledged, escalated, closed, and notified in-app. Priority currently uses configurable symptom weights, not validated clinical rules. Assignment/response workflows are basic. |
| FR-06 Nutrition support | Partial | Staff can record nutrition check-ins and create education content. Linked women can submit their own simple check-ins and read published education in their preferred language or English. |
| FR-07 Professional communication | Partial | Staff can message other staff and linked women; women can choose an assigned CHW or facility professional, exchange messages in an auto-refreshing one-to-one thread, and tag a topic and selected symptoms for context. Expected response time/availability and voice/video messaging are absent. Chat does not generate automated medical advice. |
| FR-14 Bilingual guidance helper | Partial | Women can ask questions in English or Kinyarwanda. The helper ranks active education/nutrition content in the selected language and pregnancy stage; symptom and danger-sign questions are routed to human review or urgent-care instructions. This is content retrieval, not a trained clinical model, and it needs clinically reviewed content in each language. |
| FR-08 Community follow-up | Implemented for staff | CHWs can record visits, contact method/result, condition, action, next visit, symptom reports, and follow-up records, subject to assigned-case scope. |
| FR-09 Referral management | Implemented for staff | Staff can create referrals and update status, arrival confirmation, outcome, and notes. No external facility integration or automated transport coordination exists. |
| FR-10 Education and reminders | Partial | Staff can create education and reminder records. Content is not delivered to mothers and reminders are not sent by a scheduler/channel integration. |
| FR-11 Notifications | Partial | In-app notifications are generated and can be marked read. SMS, USSD, push, and delivery/retry tracking are absent. |
| FR-12 Reporting | Partial | Dashboard and basic maternal, ANC, alert, and referral operational summaries exist. Further indicators and validation against program definitions remain. |
| FR-13 Audit management | Partial | Important actions use the audit log, but coverage is not yet a complete tamper-resistant audit design. |

## Screens and user journey

The repository provides staff login, dashboard, maternal and pregnancy records, ANC, symptom reporting, alerts, referrals, CHW visits, nutrition check-ins, reminders, education/content management, messaging, notifications, reports, facilities, users, and system settings. A role-restricted mother web portal now provides symptom reporting, optional Kinyarwanda voice transcription, pregnancy/appointment summary, referral and report tracking, one-to-one care-team chat, English/Kinyarwanda interface choices, education reading, nutrition check-ins, and in-app notifications. The voice feature requires the local ASR service and lets mothers review/edit transcripts. Its question helper retrieves published content in the selected language and stage; it does not train on patient chats or generate diagnoses. Staff/admin pages remain primarily English. Kinyarwanda UI and symptom translations need review by fluent maternal-health professionals. The system does not provide public onboarding, a native mobile app, English voice reporting, SMS/USSD, or an approved clinical triage engine. Facility clinical case detail and care planning are present in a basic staff case profile, not a complete end-to-end clinical workflow.

Pregnancy dating can use LMP or ultrasound EDD and show an estimate/source/confidence in the profile. Maternal history, observations, selected risk flags, and missing-data prompts are captured. The system does not yet implement the full requested hypertension/preeclampsia baseline, infection-monitoring analysis, ANC completeness engine, approved next-contact schedule, or personalized care-plan recommendations.

## Non-functional requirements and operational readiness

| Area | Status | Gap |
| --- | --- | --- |
| Security and privacy | Partial | Authentication, role checks, CSRF protection, prepared statements in key workflows, password hashing, and audit records exist. Encryption at rest/key management, formal privacy/security review, session hardening review, and a production security assessment are not provided. |
| Performance/scalability | Not verified | No load or scale validation is included. |
| Reliability/continuity | Not implemented | Automated backup/restore, disaster recovery, offline operation, and synchronization are absent. |
| Usability/accessibility/language | Partial | Staff web interface and language fields/content metadata exist. A mother-friendly accessible app and complete Kinyarwanda UI/content workflow are absent. |
| Compatibility | Partial | PHP web dashboard exists. No Android mother application is present. |
| Interoperability | Not implemented | No documented REST API or HL7 FHIR integration exists. |
| Maintainability | Partial | PHP modules, SQL schema, installation README, and a migration are present. Automated test suite/API docs and full operational runbooks are absent. |
| Data quality | Partial | Validation, foreign keys, duplicate checks, and scoped forms exist. Clinical data governance, comprehensive validation, and end-to-end database verification remain. |
| Clinical safety | Partial | Emergency guidance and non-diagnostic caveats exist. Symptom thresholds, content, schedules, routing, and escalation protocols need approval by qualified maternal-health professionals. This system does not dispatch emergency care. |

## Before real-world use

1. Obtain maternal-health clinical approval for symptom catalogue, alert rules, urgent instructions, referral routing, education, and ANC schedule.
2. Have fluent Kinyarwanda-speaking maternal-health professionals review localized labels, symptom names, and Kinyarwanda guidance before deployment. Publish and maintain approved education content in both languages.
3. Implement and security-review a native mother-facing application and required basic-phone channels.
4. Add an API and evaluate integration needs with the intended health information system.
5. Configure production secrets, HTTPS, backups, monitoring, retention/access policies, and recovery procedures.
6. Apply required migrations to an existing database (or import the current `care_db.sql` into a new database), then validate workflows against that database using synthetic records.

Do not use real patient data until these deployment and clinical governance steps have been completed and validated for the intended setting.

## Kinyarwanda language module status

The private `ai_service` includes a local, versioned Kinyarwanda maternal-health vocabulary at `ai_service/app/kinyarwanda_lexicon.json`. The service normalizes punctuation and Unicode for matching, recognizes listed English/Kinyarwanda and mixed-language expressions, returns the original text and matched vocabulary phrase, marks context-sensitive concepts for clarification/human review, and serves the vocabulary through an authenticated endpoint. Its bundled examples are synthetic and explicitly pending reviewer validation. When the private service URL and token are configured, the mother education helper uses candidate cues to direct symptom questions to a human professional with general urgent-care safety wording; it does not trigger emergency classification, create alerts, or make clinical decisions. This improves deterministic coverage; it is not a trained language model, automatic translator, or proof of clinical understanding. Fuzzy spelling correction is not enabled because unsafe near-matches can change clinical meaning.

No external translation model has been downloaded or wired into patient workflows. One public multilingual model considered for this work is distributed under a non-commercial license and is a general translation model, so it is not an appropriate unreviewed default for this healthcare project. For now, Kinyarwanda patient guidance must be written/reviewed in Kinyarwanda and the terminology vocabulary must be validated by fluent local maternal-health professionals. The language-cue analyzer is optional, called only when the private service URL/token are configured, and is not integrated into PHP symptom-triggered alert prioritization.

## Automatic report summary and notification

Mother and staff/CHW symptom submissions now create a `tbl_report_analyses` record. The structured intake summary restates the selected symptom catalogue entries, patient-entered severity/pattern/worsening/care-seeking fields, optional measurements, missing report fields, and matching symptoms in the mother's 30 most recent reports. It is explicitly marked as not a diagnosis. Existing symptom-catalogue weights continue to provide the operational alert routing priority; this new summary does not independently classify emergencies or change that priority. In-app review notifications go to active administrators, the mother's assigned CHW, and active professionals/supervisors at her facility. Authorized staff can see summaries in Symptom Reports, Alerts, and Maternal Intelligence review. Apply migration 007 to existing databases.

## Specification-wide implementation boundary

This repository is the PHP/MySQL staff dashboard and mother web portal described above, with advisory language and optional Kinyarwanda ASR services. It is not yet the complete platform in the supplied master prompt. The major unimplemented or partial items remain: clinician-approved clinical rule sets and validated ML models; a governed bilingual training/evaluation workflow; provider-independent generative AI and RAG over approved documents; persistent conversational symptom collection and AI-to-human handover; WebSocket live messaging and assignment/availability/escalation workflows; English voice and deployment validation of Kinyarwanda transcription; external SMS/USSD/push delivery; native mobile and offline synchronization; REST/FHIR integrations; automated backups and production key management; and district analytics/model administration. These require further implementation, configuration, approved content/data, and operational integrations; they must not be represented as complete based only on the existing portal pages.
