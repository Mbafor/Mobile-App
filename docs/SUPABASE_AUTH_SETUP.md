# Supabase Auth setup — Olives Forum

**All authentication uses Supabase only** (no Firebase). Supabase generates OTP codes and sends emails.

## 1. Environment variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Restart Expo: `npx expo start -c`

## 2. Email OTP (primary sign-in)

**Authentication → Providers → Email**

1. Enable **Email** provider  
2. Enable **Email OTP** (6-digit code in email)  
3. Set **OTP expiry** to **600 seconds (10 minutes)**  
4. Dev: disable **Confirm email** for faster testing  
5. Email template must include `{{ .Token }}`

**App flow:** Welcome → Continue with email → enter code → onboarding

## 3. Google & Apple OAuth

**Authentication → URL Configuration** — add:

| Platform | Redirect URL |
|----------|----------------|
| Dev build | `olivesforum://auth/callback` |
| Expo Go | `exp://127.0.0.1:8081/--/auth/callback` |

Configure Google and Apple providers in Supabase dashboard.

## 4. Database

Migration `001` creates `profiles` + `user_preferences` on new `auth.users` via trigger.

## 5. Test checklist

| Test | Expected |
|------|----------|
| Email OTP | Code arrives → verify → onboarding |
| Google | Returns signed in |
| Session persist | Reopen app → still logged in |
| Log out | Returns to Welcome |

## 6. Troubleshooting

- **Stuck on splash:** Check `.env`; restart with `-c`  
- **No OTP email:** Enable Email OTP; check spam; verify template  
- **Invalid code:** Expired after 10 min — resend  
