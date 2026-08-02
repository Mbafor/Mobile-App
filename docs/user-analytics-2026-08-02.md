# Voila Africa — User & Engagement Analytics

**Snapshot date:** 2026-08-02
**Source:** live production Supabase database (`auth.users`, `profiles`, and related tables)

---

## 1. Executive summary

| Metric | Value |
|---|---|
| Total registered accounts | **498** |
| Completed onboarding | **398** (80%) |
| Stuck mid-onboarding | **100** (20%) |
| Never signed in after creating an account | **37** |
| Active in last 7 days (WAU) | **120** (24% of total) |
| Active in last 30 days (MAU) | **314** (63% of total) |
| Active in last 24 hours (DAU) | **13** |
| Partner organization accounts | **1** |
| Admin / super-admin accounts | 12 / 2 |

**Headline read:** the platform grew fast in June–July (150 → 325 signups), but weekly active users (120) are less than a quarter of the total base — the core gap right now is **activation and retention**, not acquisition.

---

## 2. Growth — signups by month

| Month | Signups |
|---|---|
| 2026-05 | 9 |
| 2026-06 | 150 |
| 2026-07 | 325 |
| 2026-08 (partial) | 14 |

July alone accounts for **65%** of all-time signups — almost certainly tied to a specific push (campus outreach, campaign, or referral event). Worth identifying what drove it so it can be repeated.

---

## 3. Retention by signup cohort

Signup month vs. how many of that cohort are still active today.

| Signup cohort | Signed up | Active in last 30d | 30d retention | Active in last 7d |
|---|---|---|---|---|
| 2026-05 | 9 | 6 | 67% | 6 |
| 2026-06 | 150 | 22 | **15%** | 7 |
| 2026-07 | 325 | 273 | 84%* | 94 |
| 2026-08 | 14 | 13 | 93%* | 13 |

\* July/August numbers are inflated by recency (most of the window is still "within 30 days" of signup) — not a true apples-to-apples retention rate yet. **The June cohort is the one real data point we have**, and it's a warning sign: 85% of everyone who signed up in June is now gone.

---

## 4. Onboarding funnel (where the 100 incomplete accounts are stuck)

| Stage | Count |
|---|---|
| Created account, never entered a name | 40 |
| Entered name, no country | 19 |
| Entered basic info, no academic info | 29 |
| Filled everything, but never hit "Finish" | 12 |
| **Completed onboarding** | **398** |

40 of the 100 incomplete accounts didn't even get through step 1 — likely people who verified an OTP and then closed the app. The 12 who filled every field but never finished are the cheapest group to recover (a push/email nudge could convert them immediately).

---

## 5. Activity detail

| Window | Active users | % of total |
|---|---|---|
| 24 hours | 13 | 2.6% |
| 7 days | 120 | 24.1% |
| 30 days | 314 | 63.1% |
| 90 days | 461 | 92.6% |
| Never signed in | 37 | 7.4% |

---

## 6. Demographics

### Country (top 20 of 38 represented; 59 profiles have no country set)

| Country | Users |
|---|---|
| Ghana | 146 |
| Cameroon | 143 |
| Nigeria | 36 |
| Kenya | 24 |
| Rwanda | 12 |
| Tanzania | 8 |
| Albania | 7 |
| Liberia | 7 |
| Ethiopia | 7 |
| Uganda | 6 |
| Zimbabwe | 5 |
| South Sudan | 3 |
| Gambia | 3 |
| United Kingdom | 3 |
| Benin | 2 |
| South Africa | 2 |
| Zambia | 2 |
| DR Congo | 2 |
| Sierra Leone | 2 |
| Egypt | 1 |

Ghana + Cameroon = **58%** of the entire user base. This is effectively a two-country platform right now, not pan-African yet.

### University (top 15 — see Data Quality note below, these undercount due to duplicates)

| University (as entered) | Users |
|---|---|
| Kwame Nkrumah University of Science and Technology | 50 |
| KNUST | 43 |
| University of Buea | 34 |
| University of Bamenda | 20 |
| Kwame Nkrumah university of science and technology | 5 |
| University of Nairobi | 4 |
| KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY | 4 |
| Kwame Nkrumah University Of Science And Technology | 4 |
| University of Ghana | 4 |
| UNIVERSITY OF BUEA | 3 |
| University of The Gambia | 3 |
| Knust | 3 |
| Ashesi University | 3 |
| The university of Bamenda | 3 |

**Merged (true) totals:** KNUST variants = **112 users** (22% of the entire platform is from one university), University of Buea variants = 37, University of Bamenda variants = 23.

### Degree level

| Level | Users |
|---|---|
| Bachelors | 320 |
| Masters | 43 |
| High school | 33 |
| Professional | 9 |
| PhD | 5 |

### Top self-reported career interests (also has case-duplicate issue)

Academia (23+11 dup), Software Engineering (20+8 dup), Research (9), Entrepreneurship (5+5 dup), Cybersecurity (5), Project Management (4), Accounting (4).

---

## 7. Feature engagement

### Opportunities (the core product)

| Metric | Value |
|---|---|
| Total opportunities live | 593 |
| Users who ever saved one | **42** (8.4% of all users) |
| Total saves | 106 |
| Users who ever marked "applied" | **18** (3.6% of all users) |
| Total applications tracked | 25 |
| Tracker stage breakdown | saved: 90, applied: 14, offer: 2 |

Only **1 in 12** registered users has ever saved an opportunity. For the platform's core value proposition, this is the single biggest engagement gap.

### Mentorship

| Metric | Value |
|---|---|
| Approved mentors | 11 |
| Mentorship requests ever made | 74 (73 matched, 1 cancelled) |
| Mentorships ever started | 73 |
| **Currently active mentorships** | **14** |
| Ended by student leaving | **44** (60% of all mentorships!) |
| Removed by mentor | 14 |
| Ended normally | 1 |
| Currently on waiting list | 0 |
| `wants_mentor` = yes | 2 (feature just shipped — see note) |

**60% of every mentorship that has ever existed ended because the student left.** Only 14 are currently active out of 73 ever started. This is a strong signal that whatever's happening after a match — the coach quality, session cadence, or expectations set at match time — isn't holding up. Worth a direct look at *why* students are leaving (is there an exit reason captured anywhere users can free-text?).

Note: `wants_mentor` (the new onboarding question) only has 2 responses so far because migration 066 shipped very recently — 496 of 498 profiles predate the question and will never get asked it unless they redo onboarding.

### CV Builder

| Metric | Value |
|---|---|
| Users who created a CV | 71 (14.3%) |
| Total CVs created | 78 |
| Paid CV unlocks | 3 payments, 2 unique paying users |
| Revenue to date | GHS 300 |

### Events

| Metric | Value |
|---|---|
| Events hosted | 1 |
| Registrations | 2 |

Only one event has ever been run on the platform — too little data to draw conclusions, but also a sign this feature (built earlier) hasn't been used yet.

### Push notifications — a real gap

| Metric | Value |
|---|---|
| Users with `push_enabled = true` preference | **497 / 498** |
| Users with an actual registered push token | **0** |

Essentially every user has push notifications turned on in their preferences, but **zero device push tokens exist in the database** — meaning the app is either not requesting/registering push permission at all, or the registration call is silently failing. This is worth checking as a code-level bug, since deadline reminders, mentor match notifications, and message alerts are all built assuming push works.

---

## 8. Support & feedback signals

| Type | Count |
|---|---|
| Bug reports | 2 |
| Feature requests | 1 |
| General feedback | 3 |
| Feature survey responses | 5 |

Very low volume — either genuinely few issues, or these in-app feedback channels aren't being surfaced/used by most users (worth checking how discoverable they are).

---

## 9. Data quality issues found

1. **University is free text with no normalization** — the same school appears under 5+ spelling/case variants (KNUST alone splits into 7 rows). This undercounts real concentration and breaks any "students from your university" feature. Fix: constrain to a dropdown/autocomplete backed by a canonical list, and backfill-merge existing variants.
2. **Career interests have the same case-duplication problem** ("Academia" vs "academia", "Software Engineering" vs "Software engineering").
3. **59 profiles have no country set** despite country being asked in onboarding step 1 — likely people who abandoned before finishing that step, consistent with the funnel data in §4.

---

## 10. Recommended actions, roughly prioritized

1. **Investigate the push-token gap.** 497 users opted in, 0 tokens registered — likely a real bug, and it silently disables deadline reminders, mentor-match alerts, and message notifications for 100% of users.
2. **Chase the 12 users who filled every onboarding field but never hit Finish** — cheapest possible re-activation, a single nudge email/push could convert them today (once push works).
3. **Understand the June cohort's 85% drop-off.** Compare what changed between June and July — onboarding UX, mentorship availability, opportunity freshness — since July's cohort is retaining dramatically better so far.
4. **Look into why 60% of mentorships end with the student leaving.** Consider adding an exit-reason prompt when a student leaves a mentorship, if one doesn't already exist — right now there's no data on *why*, only that it happens.
5. **Opportunities engagement (8% save rate) is low for the core feature.** Worth checking whether the browse/recommendation experience surfaces relevant opportunities per user, or whether this is a discovery problem.
6. **Normalize the university field** (§9) — affects any future "students from your school" or university-level partnership reporting.
7. **Geographic concentration (58% Ghana+Cameroon, 22% single university)** — fine if intentional (early-market focus), but worth confirming it's intentional before assuming "pan-African" traction in reporting to stakeholders.

---

*Methodology note: all counts are direct SQL queries against the production database at the snapshot time above. "Active" = `auth.users.last_sign_in_at` within the stated window. Revenue figures are Paystack-confirmed (`status = 'success'`) CV payments only.*
