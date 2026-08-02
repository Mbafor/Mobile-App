# Push notification setup — steps you need to run

Context: `user_push_tokens` has 0 rows despite 497 users opting in. Root cause
(see `docs/user-analytics-2026-08-02.md` §7): the app has never been built as
a real EAS/push-capable client, and Android push has no FCM v1 credentials.
This does **not** add Firebase as a backend — Supabase remains the only data
store. Firebase is used here only as Google's required push-delivery
transport for Android (see `docs/SCREENS.md`).

Repo-side scaffolding (`eas.json`, `app.config.ts`, `.gitignore`,
`eas-cli` devDependency) is already done. Everything below needs your
account access and can't be done for you.

---

## 1. Log in to EAS

```
npx eas login
```

Use the Expo account that owns project ID `6c248f6f-3e13-46f1-bf0f-1bf8352aa702`
(already set in `.env` as `EXPO_PUBLIC_EAS_PROJECT_ID`). Check with:

```
npx eas whoami
npx eas project:info
```

If `project:info` doesn't resolve to that ID under your account, stop and
figure out who owns it before continuing — don't create a second project.

---

## 2. Android — Firebase / FCM v1 credentials

1. Go to https://console.firebase.google.com → **Add project** (or open an
   existing one if your org already has one for Voila).
2. Inside the project: **Add app → Android**.
   - Package name: `com.Voila.app` (must match `app.config.ts` exactly).
3. Download the generated `google-services.json`.
4. Place it at the **repo root**: `Mobile-App/google-services.json`.
   (It's already git-ignored — don't commit it. `app.config.ts` picks it up
   automatically once the file exists.)
5. In Firebase console: **Project settings (gear icon) → Service accounts**
   → **Generate new private key**. This downloads a second JSON file
   (the service-account key, not `google-services.json` — don't mix them up).
6. Upload that service-account key to EAS:
   ```
   npx eas credentials
   ```
   - Select **Android**
   - Select **Push Notifications: Manage your FCM V1 key**
   - Choose **Set up a new FCM V1 key** and point it at the service-account
     JSON from step 5.

---

## 3. iOS — APNs key

Requires an active Apple Developer Program membership on the account tied
to `com.Voila.app`.

```
npx eas credentials
```
- Select **iOS**
- Select **Push Notifications**
- Let EAS generate and upload the APNs key (it will prompt you to log in
  with your Apple ID and handle the certificate/key creation itself).

---

## 4. Build a push-capable client

Expo Go **cannot** receive push notifications (removed in SDK 53+), so
testing requires one of these:

```
npm run build:dev         # installable dev client, fastest iteration
npm run build:preview     # internal-distribution build, closer to prod
npm run build:production  # store-ready build
```

Each prints a QR code / link once the build finishes on EAS's servers —
install it on a **real device** (push tokens don't work in simulators).

---

## 5. Verify it actually works

1. Open the installed build, log in, and grant the push permission prompt.
2. Watch the device logs (`npx expo start --dev-client` and check the
   terminal, or `adb logcat` / Xcode console) for either:
   - No `[push-registration]` or `[NotificationProvider]` warnings → success.
   - A warning → it'll now tell you exactly what failed (see
     `src/features/notifications/services/push-registration.ts`).
3. Confirm a row actually landed:
   ```sql
   select count(*) from public.user_push_tokens;
   ```
   Should be > 0 after one real device registers.

---

## 6. Later (not blocking push from working)

- `eas.json`'s `submit.production` block is currently empty — fill in
  App Store Connect / Play Console identifiers when you're ready to submit
  through `eas submit` instead of manual uploads.
