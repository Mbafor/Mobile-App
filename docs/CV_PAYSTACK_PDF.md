# CV Builder — Paystack & PDF export

## What’s implemented

- **Preview** — Any template can be selected and previewed for free (no Paystack).
- **PDF export** — Structured CV data → dedicated HTML/CSS templates (`pdf/html/`) → `expo-print` (never screen capture). Preview UI is separate (`CVTemplateRenderer` / `CVPreviewModal`).
- **Per-template download (GHS 100)** — Paystack only when tapping **Download** with a template the user has not purchased yet. Unlock is stored per `user_id` + `template_id` in `cv_payments` (`type = template_unlock`).
- **Paystack checkout** — In-app browser session (`expo-web-browser`) after Supabase Edge Functions initialize/verify the transaction.

## Business rules

1. Preview and template switching are always free.
2. Payment appears only on **Download**, never on preview or template selection.
3. Paying unlocks **one template only** for that user, permanently.
4. Re-downloading with an already-purchased template skips Paystack.

## Setup (required for payments)

1. **Run migrations** in Supabase SQL Editor:
   - `supabase/migrations/010_cv_builder.sql`
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
2. **Templates** — switch layouts and preview any design (free).
3. **Download Modern** — Pay GHS 100 → PDF exports → Modern shows checkmark on template card.
4. **Download Modern again** — skips Paystack, exports immediately.
5. **Download Executive** — Pay GHS 100 again (Modern stays unlocked, others still locked).

Payments without deployed functions show: *Payment service is not deployed yet…*
