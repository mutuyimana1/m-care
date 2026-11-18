# M-CARE local Asterisk adapter

These files are development examples. The PJSIP transport binds to `127.0.0.1`; the only dialplan target is extension `700`; there is no SIP trunk, public number, outbound route, SMS action, or real-patient lookup.

`agi/mcare_ivr.php` launches once per SIP channel through Asterisk AGI. Each invocation creates a distinct `ivr_calls` row and reads its own DTMF events. Audio playback uses optional uploaded WAV prompt assets; without recorded prompt audio Asterisk uses a short beep and still waits for DTMF. Browser simulation supports text display and uploaded audio playback independently.

Install the PHP database driver and point `inc/connect.php` at the development database before running the AGI. The AGI reuses that existing PDO configuration. Do not put live credentials or real patient numbers in the local PJSIP fixtures.
