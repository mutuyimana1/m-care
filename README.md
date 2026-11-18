# M-CARE

M-CARE is a PHP and MySQL web dashboard for maternal registration, pregnancy and ANC tracking, symptom reports, alerts, referrals, community follow-up, messages, nutrition check-ins, education, reminders, notifications, reporting, user/facility management, and audit records.

## Requirements

- Apache with `mod_rewrite` and PHP 8.0 or newer (the symptom rule code uses PHP 8 `match`).
- MySQL 5.7+ or MariaDB with InnoDB and `utf8mb4` support.
- PHP PDO MySQL, OpenSSL, bcrypt, mbstring, and cURL support. PHP cURL and fileinfo are needed for optional Kinyarwanda transcription; cURL is also used to connect the optional private text language service.

## Install locally (XAMPP)

1. Copy this directory to the Apache document root (for example, `/opt/lampp/htdocs/care`).
2. Start Apache and MySQL.
3. Import `care_db.sql` into MySQL. It creates and selects the `care_db` database.
4. For an existing database, back it up and apply pending migrations in numeric order. The IVR development module is added by `migrations/010_ivr_development.sql`; see [docs/IVR_DEVELOPMENT.md](docs/IVR_DEVELOPMENT.md) for setup and testing. Skip migrations already applied and skip them for a fresh import containing the corresponding schema.
5. Set the database host, username, password, and database name in `inc/connect.php` for your environment.
6. Open `http://localhost/care/` and sign in with username `admin` and password `Admin@1234`. The seeded account is forced to change its password at first sign-in.
7. Create named accounts for each staff member and assign each account to a facility where applicable. Configure facilities and confirm mother-to-CHW assignments before using case queues.

Extensionless links depend on Apache `mod_rewrite`; `.htaccess` contains the rewrite rule. If using a server that ignores `.htaccess`, enable overrides or access the `.php` filenames directly.

## User roles

1. Administrator: system management and all operational modules.
2. Healthcare Professional: clinical records, alerts, referrals, guidance, messaging, and reports.
3. Community Health Worker: community follow-up, symptom reporting, alerts, referrals, and messaging.
4. Supervisor: oversight, alerts, referrals, visits, messages, and reports.
5. Pregnant/postpartum woman: self-service symptom reporting, maternal education, nutrition check-ins, care-team messaging, notifications, and personal report/referral follow-up. An administrator links the account to an existing maternal profile.

## MVP workflows included

- Staff registration records include possible duplicate checks, consent capture, and preferred language.
- Authorized professionals can confirm a pregnancy and record dating method, confidence, LMP, and ultrasound EDD. Gestational age/trimester summaries are shown when LMP is available.
- Case profiles combine pregnancy dating, reported medical/obstetric history, ANC observations, alerts, referral status, and baseline completeness prompts. Professionals can record a history review.
- ANC records include BP, height, temperature, respiratory rate, weight, labs, preventive services, and a manually selected next appointment.
- Symptom reports capture onset, severity, pattern, worsening, care already sought, and optional temperature/BP; a reference code is returned and assigned CHW/facility staff are notified. Alert weights remain provisional until clinically approved.
- CHWs can record visits, referrals, nutrition check-ins, and follow-up. Operational reporting includes alert acknowledgement time and referral completion rate.
- A linked pregnant/postpartum woman can choose English or Kinyarwanda for the portal, view her pregnancy and next-appointment summary, submit symptom reports and nutrition check-ins, read published guidance, chat with assigned care-team members in an auto-refreshing private thread, tag concern topics and symptoms for professional review, and review notifications, reports, and referral updates. The automatic helper retrieves only active guidance in the selected language and relevant pregnancy/postpartum stage; it does not learn from chats or generate clinical advice. Publish clinically reviewed content in both languages to enable answers in both languages.
- Role checks and CSRF form tokens are enforced for signed-in web operations. CHW case queues and key records are scoped to assigned mothers; facility professionals see alerts assigned to them or their facility.

## Clinical safety and deployment

See [docs/REQUIREMENTS_AUDIT.md](docs/REQUIREMENTS_AUDIT.md) for a feature-by-feature comparison with the supplied overview and MVP specification, including partial and unimplemented items.
The advisory English/Kinyarwanda terminology service and its review limits are documented in [ai_service/README.md](ai_service/README.md). It can provide candidate cues to the mother education helper when configured; it does not process symptom-report submissions or create clinical alerts.
The local IVR simulator and test-call setup are documented in [docs/IVR_DEVELOPMENT.md](docs/IVR_DEVELOPMENT.md). The integration-ready outbound calling work, MTN Unicall requirements, consent flow, AMI channel status, and deployment steps are documented in [docs/OUTBOUND_CALLING.md](docs/OUTBOUND_CALLING.md). Real mobile routing remains unavailable until MTN authorizes a SIP trunk and its exact connection details are configured.
The optional local Kinyarwanda voice transcription module, including the copied model files and setup instructions, is documented in [ai_service/kinyarwanda_asr/README.md](ai_service/kinyarwanda_asr/README.md).
Symptom submissions also create a structured intake summary and in-app review notices for administrators, the assigned CHW, and facility staff. The summary and its limits are described in the requirements audit.

Alert levels currently derive from the configured symptom severity weights. These are workflow prompts, not diagnoses or a substitute for clinical assessment. Qualified maternal-health professionals must review the symptom catalogue, thresholds, response procedures, education content, and referral workflow before deployment. The symptom-report interface instructs users to seek immediate care in an emergency; the application does not provide emergency dispatch.

The mother portal and its guidance helper support English and Kinyarwanda; the staff and administrator screens are still primarily English. The Kinyarwanda interface and seeded symptom terms require review by fluent local maternal-health professionals. This workspace includes a staff web dashboard and a linked mother web portal, but it is not the complete product described in the specification. It does not yet include public mother self-registration, offline synchronization, English voice reporting, SMS/USSD/push delivery, professional availability and response-time messaging, video calling, FHIR integration, encryption-at-rest/key management, automated backups, or production-grade hosting configuration. Optional Kinyarwanda voice transcription requires the separate local ASR service. Clinical triage thresholds and education content require approval by qualified maternal-health professionals. Do not use real patient data until access controls, privacy/security review, backups, clinical workflows, and deployment configuration are validated for the intended health setting.
