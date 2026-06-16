# Supabase Auth setup — Voila

**All authentication uses Supabase** (no Firebase).

## 1. Environment variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Restart Expo: `npx expo start -c`

## 2. Email + password + OTP

**Authentication → Providers → Email**

1. Enable **Email** provider  
2. Enable **Confirm email** (required for OTP verification after sign-up)  
3. Enable **Email OTP** — template must include `{{ .Token }}` (6-digit code)  
4. Set **OTP expiry** to **600 seconds (10 minutes)**  
5. Configure SMTP or use Supabase built-in mailer for production  

**App flow:**

1. Welcome → Continue with email  
2. Enter **email + password** (min 8 characters)  
3. If email must be confirmed → **6-digit OTP** screen  
4. Verified users sign in with password only (no OTP)  

Apply migration `022_require_profile_email.sql` so `profiles.email` is required.

## 3. Google OAuth

**Authentication → URL Configuration** — add redirect URLs:

| Platform | Redirect URL |
|----------|----------------|
| Dev build | `Voila://auth/callback` |
| Expo Go | `exp://127.0.0.1:8081/--/auth/callback` |
| Web | `http://localhost:8081/auth/callback` |

## 4. Database

- `001` — profiles + user_preferences on signup  
- `022` — `profiles.email` NOT NULL, sync from `auth.users`  

## 5. Test checklist

| Test | Expected |
|------|----------|
| New user | Email + password → OTP email → verify → onboarding |
| Returning user | Email + password → dashboard (no OTP) |
| Google | OAuth → signed in |
| Log out | Welcome screen |

## 6. Troubleshooting

- **No OTP email:** Confirm email + Email OTP enabled; check spam; template has `{{ .Token }}`  
- **Invalid code:** Use latest code; try resend; verify uses `signup` then `email` type  
- **Invalid login credentials:** Wrong password, or account needs OTP confirmation first  
- **Stuck on splash:** Check `.env`; restart with `-c`  
