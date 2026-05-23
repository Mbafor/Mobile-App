# Auth setup (OTP + Google)

## Supabase dashboard

1. **Authentication → Providers → Email**  
   - Enable Email provider  
   - Enable **Email OTP** (6-digit codes), not magic links only  

2. **Authentication → Providers → Google**  
   - Enable Google  
   - Add Client ID / Secret from Google Cloud Console  

3. **Authentication → URL configuration → Redirect URLs**  
   Add every URL your app uses:

   ```
   olivesforum://auth/callback
   http://localhost:8081/auth/callback
   http://127.0.0.1:8081/auth/callback
   exp://127.0.0.1:8081/--/auth/callback
   ```

   Replace host/port with your Expo dev server if different.

4. **Site URL** (optional for web): `http://localhost:8081`

## Mobile (Expo Go)

- Use `npm run start:phone` or `npm run start:lan` — not web (`w`) for daily dev.
- Google opens in-app browser; OTP uses Supabase email.

## Web

- Google redirects the browser to Google, then back to `/auth/callback`.
- Allow pop-ups if testing Paystack on web.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| No email code | Turn on Email OTP in Supabase; check spam |
| Google “redirect_uri_mismatch” | Add exact redirect URL from logs to Supabase |
| Web MIME type / JSON bundle error | Clear cache: `npm run start:clear`; use web only after bundle succeeds |
| `Permission denied` on admin | `profiles.is_admin = true` for your user |
