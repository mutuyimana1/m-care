# M-CARE

M-CARE is an Expo / React Native maternal-care app prototype.

## Run locally

```bash
npm install
npx expo start
```

## Demo sign-in accounts

Use the following prototype-only credentials on the login screen:

| Role | Email | Password |
| --- | --- | --- |
| Mother | `mother@mcare.demo` | `Mother123!` |
| Clinician | `doctor@mcare.demo` | `Doctor123!` |

The credential examples are in `src/data/demo-users.json`. Authentication is local demo
authentication, not a production identity provider. The session and sample patient records are
held in memory and reset when the app restarts. Do not enter real patient information.

## Implemented prototype flows

- Mother: pregnancy overview, reminders, profile, and educational guidance.
- Clinician: patient lookup, duplicate checks, maternal registration, patient records, and follow-up.
- Registration: personal information and consent, pregnancy confirmation, obstetric and medical
  history, measurements, laboratory results, completeness summary, and clinician approval.

Secure storage, facility-to-facility sharing, EMR import, offline synchronization, and production
clinical workflows require a backend and are not implemented in this prototype.

## Development

Run lint and type-check:

```bash
npx expo lint
npx tsc --noEmit
```
