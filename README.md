# M-CARE

Expo / React Native client with a PHP and MySQL backend. Sign-in, maternal profiles,
symptom reports, follow-up requests, nutrition check-ins, care activity, and voice-note
references are read from and written to MySQL. The app does not include demo credentials
or a seeded patient.

## Start the backend locally

1. Start the XAMPP database service (`sudo /opt/lampp/lampp startmysql` on the local XAMPP installation).
2. Add the API session and app-record tables to the existing `mcare` database:

   ```bash
   /opt/lampp/bin/mysql -u root < backend/schema.sql
   ```

3. Start the API from the project root. Set the database password if the local MySQL root account has one:

   ```bash
   MCARE_DB_DSN='mysql:host=127.0.0.1;dbname=mcare;charset=utf8mb4' \
   MCARE_DB_USER=root MCARE_DB_PASSWORD='' \
   php -S 0.0.0.0:8000 -t backend/public
   ```

   The health endpoint is `http://localhost:8000/api.php?action=health`.

## Start the app

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` for the device running the app.
For web use `http://localhost:8000/api.php`; Android emulator use `http://10.0.2.2:8000/api.php`;
physical devices need the development computer's LAN IP. Restart Expo after changing the URL.

```bash
npm install
npm run web
```

Mothers can create an account from the sign-in screen. Clinician and CHW accounts are not
publicly self-registered; provision them directly in the database with a PHP `password_hash()`
hash using the helper (it prompts for the password):

```bash
MCARE_DB_DSN='mysql:host=127.0.0.1;dbname=mcare;charset=utf8mb4' \
MCARE_DB_USER=root MCARE_DB_PASSWORD='' \
php backend/create-care-user.php doctor 'Clinician Name' clinician@example.org
```

Do not expose the database to the public internet.

## Important deployment work

The API uses the existing `users`, `maternal_profiles`, `pregnancies`, `symptom_reports`, and consent
tables; the SQL script only adds `mcare_api_sessions` and `mcare_app_records`. The API is a local
development foundation. Before using real clinical data in production, deploy it behind HTTPS, use
a restricted database account and managed secrets, configure a specific CORS
origin, add facility and consent rules, audit access, and complete a security review. Audio files
are not uploaded by this API; only their local URI reference is stored, so use a protected file
service before relying on voice notes across devices.

## Development

```bash
npx expo lint
npx tsc --noEmit
```
