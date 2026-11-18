# M-CARE outbound calling: inspection and integration status

## Phase 1 findings

- The existing PHP application uses PDO/MySQL, authenticated sessions, CSRF checks, and role/facility/CHW scoping. `tbl_mothers` already stores the phone and preferred language. `tbl_mothers.consent_given` is a general registration flag; it is not specific enough to authorize automated telephone calls.
- `tbl_reminders` and ANC follow-up dates already exist, but there is no outbound call queue or job runner. There is no dedicated appointment or medication-schedule table.
- The IVR development lab and `asterisk/agi/mcare_ivr.php` are intentionally synthetic/inbound. The simulator never contacts Asterisk. Existing synthetic `ivr_calls` cannot be used as live call records.
- Existing IVR prompt storage and WAV upload flow can be reused. The local Python services support offline Kinyarwanda audio transcription/intent work; they do not provide live telephone audio speech-to-text or text-to-speech. The outbound call therefore uses DTMF and prerecorded prompts. AI does not control calls or make clinical decisions.
- Asterisk 22.10.1 is installed and its systemd service is active. The running process is owned by `asterisk`; AMI TCP is listening on `127.0.0.1:5038`. `/etc/asterisk` configuration is root-readable; this workspace user cannot read or safely edit `extensions.conf`, `pjsip_mcare.conf`, or `manager.conf`. No system configuration was changed. The PHP app’s default CLI database connection failed; a separate temporary test DB at `127.0.0.1:3307` was available, contained no mother records and only synthetic IVR calls, and was used to apply/test migrations 012–014. These migrations have not been applied to the application database.
- The current project Asterisk examples bind local test signaling to loopback and contain no outbound route. A normal mobile SIM number is not, by itself, a SIP trunk or an Asterisk PJSIP endpoint.

## MTN Rwanda connection research

MTN Rwanda publicly lists **MTN Unicall**, including SIP trunking, hosted PBX, and hosted call centre products. MTN says Unicall subscriptions are for registered companies, NGOs, and government institutions; it directs enquiries to **3111** or **sales.rw@mtn.com**. The public product page does not publish SIP host/port, authentication, registration versus source-IP method, authorized number formats, caller-ID rules, concurrent call limits, price per minute, or trial terms. These values must come from MTN after eligibility and service approval. [MTN Unicall](https://www.mtn.co.rw/mtn-unicall1/)

The existing SIM number `0788708084` must not be sent as caller ID unless MTN authorizes it for the trunk. The integration requires the provider-approved CLI. No MTN credentials, host names, IP addresses, dial rules, or prices are assumed in this project.

## Implementation architecture

1. A staff member with an authorized role opens a mother profile and records the source of her explicit automated-call consent. Withdrawal is recorded separately and blocks new calls.
2. PHP validates the staff member's scope, phone number, consent, call purpose, local calling hours, duplicate-call interval, and concurrency limit. It creates a production call record and sends a restricted AMI `Originate` action to Asterisk on loopback.
3. Asterisk routes the PJSIP mobile channel through the separately configured provider trunk. When answered, the `mcare-outbound` context launches `mcare_outbound_ivr.php`.
4. The IVR plays uploaded, approved Kinyarwanda/English WAV prompts. It offers generic public information or records a callback request. It does not disclose pregnancy, appointment, or other patient-specific data to whoever answers.
5. A local AMI event listener consumes Asterisk channel events and records ringing, answer, hangup, busy, no-answer, and failure states. PHP submission success alone is never recorded as an answered/completed call.
6. The outbound dashboard displays real call records and callback requests to scoped staff.

## Code added in this phase

- `migrations/012_outbound_calling.sql` adds explicit call consent, production call records/events, callback requests, AMI listener heartbeat, and separate production prompts. Migrations `013_outbound_reminder_queue.sql` and `014_outbound_queue_priority.sql` add reminder deduplication and stable priority ordering.
- `outbound_call_api.php`, `inc/asterisk_ami.php`, and `asterisk/outbound_ami_events.php` implement scoped manual origination, AMI status tracking, and call cancellation.
- `mother_profile.php` and `inc/outbound_call_controls.php` provide consent recording, manual calls, and per-mother history. `outbound_calls.php` provides call monitoring and callback-request handling.
- `asterisk/extensions_outbound.conf.example`, `asterisk/manager_outbound.conf.example`, `asterisk/pjsip_outbound.conf.example`, and the service/environment examples provide integration templates. They contain no provider credentials or guessed MTN configuration. The queue worker supports staff-scheduled calls, up to two manual retries, and optional queuing from existing reminders (disabled unless `MCARE_REMINDER_CALLS_ENABLED=1`).

## Required deployment configuration

1. Start the existing XAMPP MySQL/MariaDB service, back up `care_db`, then apply `migrations/012_outbound_calling.sql`, `migrations/013_outbound_reminder_queue.sql`, and `migrations/014_outbound_queue_priority.sql` in order using the normal project database account.
2. Contact MTN Enterprise Business at 3111 or sales.rw@mtn.com and request MTN Unicall SIP trunking for outbound Rwanda mobile calls from Asterisk 22. Ask for the integration parameters listed below, a permitted test destination, and the approved caller ID.
3. Review the current live Asterisk configuration as an administrator and back it up. Do not replace the existing PJSIP, dialplan, or AMI files. Merge the outbound examples after substituting only MTN-supplied values. Keep AMI bound to `127.0.0.1`; use a long random AMI secret and a trunk credential stored in a root/asterisk-readable private configuration file.
4. Install the AMI values in a root-owned environment source used by Apache PHP and the event-listener service. `apache/mcare-outbound.conf.example` is a template for a private Apache server/vhost configuration; do not put the AMI secret in `.htaccess`. The listener needs the same database connection as the application. Keep secrets out of PHP source, browser JavaScript, and the repository.
5. Copy and install `mcare-ami-events.service.example` as `mcare-ami-events.service`. Confirm the heartbeat is current before trying an originate. Install `mcare-outbound-scheduler.service.example` and `mcare-outbound-scheduler.timer.example` under their corresponding unit names to dispatch queued calls. Keep `MCARE_REMINDER_CALLS_ENABLED` unset or `0` until due `tbl_reminders` records have been reviewed for content and intended calling behavior. `MCARE_OUTBOUND_NUMBER_FORMAT` must match MTN's number format (`national` or `rwanda_e164`); set the optional digits-only `MCARE_OUTBOUND_NUMBER_PREFIX` only if MTN instructs you to use a dialing prefix.
6. Upload clinician-approved, mono 8 kHz PCM WAV recordings for every `outbound_*` prompt in both languages. The API fails closed when those recordings are missing.
7. Enable the Asterisk outbound context and the provider-facing PJSIP endpoint only after reviewing the merged configuration and firewall/network requirements with MTN.

### Provider values required before any mobile call

- Whether MTN Unicall supports Asterisk customer-managed SIP trunking for this account and outbound mobile termination.
- SIP host, port, transport, codecs, authentication model (REGISTER credentials or source-IP authorization), outbound proxy if any, and approved source IP.
- Number format (national or E.164), any required prefix, DTMF mode, ring timeout, concurrent channel limit, rate limits, and commercial pricing.
- Provider-authorized caller ID and written confirmation whether `0788708084` may be presented.
- SIP/RTP network and firewall requirements, test destination, and billing/trial terms.

The authenticated PJSIP trunk block and number format are intentionally incomplete until these values are supplied. The current system has no authorized mobile route, so the new manual-call action will return a setup error and will not place a call until the service is configured.

Staff can schedule an individual call up to 30 days ahead from the mother profile, cancel queued calls, and retry a busy, unanswered, or failed call up to two times. The dashboard lets staff queue up to 20 explicitly selected, consented recipients. Staff can assign a priority from 1 (highest) to 5 (normal); the worker sends higher-priority queued calls first and respects the configured concurrency limit. Automatic dispatch from existing `tbl_reminders` is opt-in through `MCARE_REMINDER_CALLS_ENABLED=1`; it does not modify the existing reminder `is_sent` field, and duplicate reminder/call attempts are blocked.

## Verification levels

- **Local Asterisk**: verify the outbound context and prompt AGI with a local test channel; this does not prove mobile termination.
- **PHP/AMI integration**: verify AMI authentication, originate acceptance, event listener heartbeat, and lifecycle updates; AMI acceptance does not prove that a handset rang.
- **Real mobile**: place an authorized low-volume call to an agreed test number, answer it, test the bilingual prompt and DTMF actions, hang up, and confirm the recorded lifecycle. Only this test proves mobile calling.

Never test against a real patient without recorded automated-call consent. Keep calls between 08:00 and 18:00 Africa/Kigali by default. Outbound prompts do not announce personal health details. Callback requests must be reviewed by the care team; the automated system does not diagnose or prescribe.
