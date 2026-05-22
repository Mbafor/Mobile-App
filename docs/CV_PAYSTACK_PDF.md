# CV Builder — Paystack & PDF export

## What’s implemented

- **PDF export** — `expo-print` + `expo-sharing`; five HTML/CSS layouts under `src/features/cv-builder/pdf/html/`
- **Download (GHS 100)** — Hub toolbar + footer; checks `cv_payments` so the same CV is never charged twice
- **Template unlock (GHS 100)** — All five layouts (ATS, Modern, Tech, Executive, Minimal); unlock is permanent per user per template
- **Paystack checkout** — WebView modal after Supabase Edge Functions initialize/verify the transaction

## Setup (required for payments)

1. **Run migration** in Supabase SQL Editor:
   - `supabase/migrations/011_cv_payments_template_id.sql`

2. **Deploy edge functions** and set secrets:
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_test_...
   supabase functions deploy paystack-initialize
   supabase functions deploy paystack-verify
   ```

3. **App `.env`**:
   ```
   EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   ```

4. Restart Expo: `npx expo start -c`

## Test flow

1. Create a CV and fill sections.
2. **Templates** — select any layout → pay GHS 100 → template applies.
3. **Download** — tap Download (GHS 100) → pay → share/save PDF.
4. Tap Download again on the same CV — should skip payment and go straight to PDF.

Payments without deployed functions show: *Payment service is not deployed yet…*
