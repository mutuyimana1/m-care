# M-CARE IVR development module

## Scope and inspected environment

This module is limited to local development and demonstration. Web simulator calls are synthetic database sessions; local SIP calls are accepted only by the example Asterisk loopback endpoints. There is no telephone trunk, public number, outbound route, SMS action, real emergency dispatch, or call recording.

The existing application is PHP/PDO and MySQL/MariaDB with role checks in `inc/auth.php`; published pregnancy/nutrition content is stored in `tbl_education_content` and `tbl_nutrition_content`; `tbl_reminders` exists but has no authenticated appointment/medication API. The Python FastAPI service offers advisory intent cues. The existing local Kinyarwanda ASR service transcribes WAV/FLAC and requires human review. M-CARE currently has no dedicated appointment table or medication schedule. The IVR fixtures therefore use separate synthetic-only data rather than exposing real patient phone records.

Environment inspected for this implementation: PHP 8.4.24, Python 3.13.15, MariaDB client 11.8.9, PHP PDO MySQL/cURL/fileinfo enabled, and `ffmpeg` available. The database server was not running during implementation. Asterisk and local SIP clients were not installed. No system text-to-speech engine was found. Kinyarwanda voice generation is not claimed; keypad mode is the fallback. Uploaded WAV prompt files can be played by Asterisk. Browser previews use the browser's installed speech voices only; the interface reports when a Kinyarwanda voice is unavailable.

## Integration design

- `ivr_calls` holds one independent TEST call per UUID, state, language, and caller fixture. Each menu input locks only that call row. The development capacity setting defaults to 10 and can be raised to 100.
- `ivr_call_events`, `ivr_call_queue`, and `ivr_emergency_escalations` record test lifecycle, simulated queue actions, and test escalations. Test escalation never inserts an M-CARE alert or notification.
- `ivr_menu_options`, `ivr_voice_prompts`, and `ivr_test_config` store editable development menus, bilingual prompt text/audio, and capacity settings.
- `ivr_test_fixture_data` contains fictional appointment/reminder rows only. It has no foreign key to mothers and cannot access live patient data.
- Administrators and supervisors open `ivr_dashboard`. Supervisors see only calls they created. Mothers and staff cannot access the admin simulator API. Asterisk test channels are recorded separately as `asterisk_local`.
- Pregnancy education reads only active content from the existing M-CARE publication tables. If no approved content is published in the selected language/stage, the simulator says so.
- The ASR test proxy sends one manually selected local sample to the existing localhost Kinyarwanda ASR endpoint. Optional intent analysis is advisory and cannot advance a menu, trigger escalation, or notify a worker.

## Database setup

Back up the development database first, then apply the additive migration:

```sh
cd /opt/lampp/htdocs/care
mysql -u root care_db < migrations/010_ivr_development.sql
```

If your local MySQL credentials differ, use your existing database account and settings from `inc/connect.php`. Optional `MCARE_DB_HOST`, `MCARE_DB_PORT`, `MCARE_DB_USER`, `MCARE_DB_PASSWORD`, and `MCARE_DB_DATABASE` environment overrides support isolated test instances; unset overrides preserve the app's existing local defaults. This migration does not alter existing maternal tables. It creates IVR-only tables and synthetic fixtures. Do not load real caller numbers into IVR test data.

## Web simulator

1. Start the existing XAMPP Apache and MySQL services and sign in as an administrator (role 1) or supervisor (role 4).
2. Open **IVR development lab** in the left navigation.
3. Start callers using a listed synthetic fixture and a `TEST-` caller ID. Each new call creates an independent session card. Start ten callers to exercise the configured initial capacity.
4. Choose language and keypad actions independently on each card. Calls can retrieve only published pregnancy/nutrition material, view synthetic fixture appointments/reminders, record a test emergency escalation, enter the simulated queue, and terminate.
5. Queue controls only update the simulated call state. They do not ring or transfer an Asterisk channel.
6. The settings panel changes the test capacity (1–100), bilingual prompt text, audio prompt files, and caller-facing menu labels. Menu action keys remain fixed.

The caller ID field enforces a `TEST-` prefix. Caller fixtures contain no mother ID, phone lookup, or access to `tbl_mothers`. The only selected patient-like information is synthetic fixture metadata.

## Local Kinyarwanda speech test

The test page uses the existing authenticated local proxy settings `MCARE_ASR_SERVICE_URL` and `MCARE_ASR_SERVICE_TOKEN` from the private Apache environment. It accepts a short WAV/FLAC file and does not save the audio. The existing service returns a draft transcript and labels it for human review. If available, the optional English/Kinyarwanda intent service returns advisory cues only.

The ASR package/model installation and launch steps are already documented in [the local Kinyarwanda ASR guide](../ai_service/kinyarwanda_asr/README.md). Kinyarwanda transcription is not reliable enough to replace keypad navigation or professional review. English speech recognition is not configured. Missing service/dependency errors are surfaced in the test page.

## Asterisk and actual local SIP calls

Asterisk 22.10.1 is installed and active in the current inspected environment, but its `/etc/asterisk` files are root-readable and were not modified during this work. The supplied files under `asterisk/` are still examples for the isolated local IVR test. They do not establish a working external trunk. The outbound integration and MTN requirements are documented separately in [OUTBOUND_CALLING.md](OUTBOUND_CALLING.md). Asterisk's PJSIP endpoint/AOR/auth model and AGI `GET DATA` DTMF collection are documented by the [official PJSIP guide](https://docs.asterisk.org/Configuration/Channel-Drivers/SIP/Configuring_res_pjsip/PJSIP-Configuration-Sections-and-Relationships/), [AGI guide](https://docs.asterisk.org/Asterisk_22_Documentation/API_Documentation/Dialplan_Applications/AGI/), and [GET DATA reference](https://docs.asterisk.org/Asterisk_23_Documentation/API_Documentation/AGI_Commands/get_data/).

Install Asterisk only if you want to test SIP. On a Debian/Kali development host, the package-manager path is `sudo apt update && sudo apt install asterisk`; package installations may create or enable a system service. Check for an existing Asterisk process and port 5060 use before starting another instance. Keep this isolated: do not overwrite an existing `/etc/asterisk` tree. Use a copy of the example files in a separate development config directory and launch Asterisk with `-C <your-local-asterisk.conf> -f -vvv`. The official project describes package-manager and source installation options in its [installation guide](https://docs.asterisk.org/Getting-Started/Installing-Asterisk/).

Setup outline:

1. Install Asterisk from the OS package manager or official Asterisk source instructions. Do not add a trunk, provider registration, public bind, or external firewall rule.
2. Create a private local config directory. Copy `asterisk/pjsip.conf.example`, `asterisk/pjsip_users.conf.example`, `asterisk/extensions.conf.example`, and `asterisk/rtp.conf.example` there. Rename the users file to `pjsip_users.conf`, uncomment its include line in `pjsip.conf`, and replace every `CHANGE-THIS-LOCAL-*` password with a unique random test password.
3. Add the example IVR context to the local `extensions.conf`. Set the endpoint context to `mcare-ivr-test`; extension `700` is the only defined destination. No dial-out extension exists.
4. Copy `asterisk/asterisk.conf.example` and `asterisk/modules.conf.example` into the private config directory. Review their paths and point `astetcdir` there, `astagidir` to this project's `asterisk/agi`, and `astmoddir` to the module directory installed by your package (find it with `dpkg -L asterisk | grep '/modules/res_pjsip.so'`). Keep Asterisk runtime, spool, and logs under a separate development directory. Use an account that can read the PHP project and connect to its development database. If using `MCARE_DB_*` environment overrides, export the same values for the Asterisk process; Apache `.htaccess` variables are not inherited by the PBX.
5. Make the local AGI script executable (`chmod 750 /opt/lampp/htdocs/care/asterisk/agi/mcare_ivr.php`). Ensure its PHP CLI configuration has PDO MySQL and reads the same development database settings as the web app.
6. Launch Asterisk with the custom config path. Confirm `pjsip show endpoints` lists only test endpoints and `dialplan show mcare-ivr-test` has only extension 700.
7. Configure one local SIP softphone per account (`6001`–`6010`) on the same host, server `127.0.0.1`, port `5060`, UDP. Dial `700` from each client. Prompts require WAV recordings uploaded through the dashboard; without them the AGI falls back to a beep and DTMF collection. Asterisk can play WAV assets, while browser playback also supports the uploaded audio formats shown in the UI.
8. Verify real channel concurrency separately from browser simulation with `asterisk -rx 'core show channels concise'` and the `call_source='asterisk_local'` rows in IVR history. Ten browser cards prove ten simulated sessions only; they do not prove ten concurrent SIP calls.

All ten endpoint definitions bind to loopback-only signaling and share one restricted inbound context. The configuration contains no outbound registrations, trunks, `Dial()` destinations, or public endpoint. Review the final local Asterisk configuration before starting it.

## Prompt audio and recordings

The application stores only generic prompt audio uploaded by an administrator. It does not record caller audio. For Asterisk, provide WAV prompt files; a local `ffmpeg` conversion example is:

```sh
ffmpeg -i prompt-source.wav -ac 1 -ar 8000 -c:a pcm_s16le prompt.wav
```

Record or commission English and Kinyarwanda prompt audio for welcome, menu, education, emergency guidance, queue, and closing keys. Have Kinyarwanda wording checked by a fluent maternal-health professional. The browser's speech synthesis is a convenience preview and is not used by Asterisk.

## Tests and limits

Run the HTTP smoke/concurrency suite after applying the migration and signing in with an authorized development account:

```sh
MCARE_IVR_BASE_URL=http://localhost/care \
MCARE_IVR_PHPSESSID='<authenticated local PHP session id>' \
MCARE_IVR_CSRF='<session CSRF token>' \
python3 tests/ivr_api_smoke.py
```

The suite exercises English/Kinyarwanda selection, menu navigation, invalid keys, repeat, published-content lookup, synthetic appointment data, emergency test escalation, queue answer/reject, call termination, independent sessions, capacity at ten, unauthorized requests, and missing speech/audio service behavior. It cleans up calls it starts. It requires the web server, database migration, an authenticated test session, and Python's standard library only.

This environment did not have a running MariaDB server or Asterisk, so database-backed API tests and actual SIP concurrency cannot be reported as passing here. Run the web suite locally and run the separate ten-softphone SIP check above. The bundled ASR model is a large optional dependency; Kinyarwanda recognition accuracy requires local clinical/language review.
