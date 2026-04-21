# MockMate — Launch Checklist

## 🚨 Blockers (must fix before launch)

### Missing API routes
- [x] `/api/extract-text` — built, handles PDF/DOCX/DOC/TXT via `pdf-parse` and `mammoth`.
- [x] `/api/generate-questions-on-demand` — built, auth-gated, persists questions to session.

### Missing database columns
- [x] `chat_messages` and `qa_records` JSONB columns added via migration 016.

### Payments / plan gating
- [x] Stripe integration complete: `lib/stripe.ts`, `/api/stripe/checkout`, `/api/stripe/webhook`, migration 017 (adds `stripe_customer_id`, `stripe_subscription_id`).
- [x] Pricing section already existed on landing page at `#pricing`.

### Delete account is broken
- [x] `/api/delete-account` built — deletes `interview_sessions`, `users` row, then calls `auth.admin.deleteUser()`. Settings wired to call it.

---

## ⚠️ High Priority (should fix before launch)

### Monthly session reset
- [x] Rolling 30-day reset via pg_cron (migration 020) — resets each user based on their `sessions_reset_at` date, not calendar month. Paid users also reset via `invoice.paid` Stripe webhook.

### Auth callback cleanup
- [x] All `console.log` statements removed from `app/auth/callback/page.tsx`.
- [x] `monthly_session_limit: 5` added to new user insert.

### Rate limiting
- [x] Rate limiting added to all API routes via Upstash Redis (`lib/rate-limit.ts`). Fails open without env vars. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to activate.

### Legal pages
- [x] Terms of Service at `/legal/terms` — exists with full content.
- [x] Privacy Policy at `/legal/privacy` — exists with full content.
- [x] Footer links to both pages confirmed on landing page.

### Landing page
- [x] `/#pricing` section exists with Free / Job Seeker / Student tiers and billing toggle.
- [x] Footer includes legal links.

---

## 📋 Medium Priority (polish before or shortly after launch)

### Create Resume page
- [ ] Currently shows a placeholder page. Feature is in the sidebar — build it out or mark as coming soon when ready.

### Help & Support links
- [x] `Contact Support` wired to `mailto:support@mockmate.io`.
- [ ] `Documentation`, `Leave a Review`, and `Changelog` still point to `#` — wire real URLs once domain and product pages are set up.

### Email (Resend)
- [x] Welcome email on signup — `send-welcome-email` edge function deployed, fires from auth callback on first sign-in.
- [ ] Switch to custom sending domain once finalized (currently using `info@eightfivemedia.com`). Update `from` in `check-student-expiry` and `send-welcome-email` edge functions.
- [ ] Session limit warning email not yet implemented.

### Profile image storage
- [x] `profile-images` bucket set to public via SQL. Avatar uploads and display confirmed working.

### Error monitoring
- [x] Sentry installed and configured (`@sentry/nextjs`, `instrumentation.ts`, `global-error.tsx`). Dormant until `NEXT_PUBLIC_SENTRY_DSN` env var is added — create a free project at sentry.io to get the DSN.

### SEO & meta
- [ ] Add `<title>`, `<meta name="description">`, and Open Graph tags to the landing page and auth pages.
- [ ] Add a `sitemap.xml` and `robots.txt`.
- [ ] Add a favicon (check if `/public` has one).

---

## 🧹 Low Priority (post-launch cleanup)

### Notification preferences
- [ ] Notification toggle state is persisted to `localStorage` only. If you ever want to send actual emails/push notifications, move prefs to a `users.notification_prefs` JSONB column.

### Student verification flow
- [ ] DB migrations and partial UI exist (`/app/auth/reverify-student/`) but the end-to-end flow (email domain check → verification badge → student pricing) hasn't been confirmed working.

### Session mode tabs in Interview Session
- [ ] The active interview page shows Chat Mode / Questions Mode tabs regardless of how the session was created. Consider locking the mode to whatever was chosen at session creation to avoid confusion.

### Onboarding → real data
- [ ] The onboarding page has static copy. After a user completes their first session, consider skipping or hiding the onboarding page automatically.

### Remove sample sessions from nav
- [ ] `/dashboard/sample-sessions` is accessible but not in the sidebar. Either add it with intent or gate it behind an onboarding flow. Currently discoverable only via the onboarding page link.

### AI model config
- [ ] `AI_MODEL` env var defaults to `gpt-4o-mini`. Document the supported values and what changes at each tier. Consider exposing this as a per-plan setting (e.g. pro users get GPT-4o).

### Mobile experience
- [ ] The dashboard uses a sidebar that collapses to a hamburger on mobile. Run a full mobile test pass — some pages use `height: calc(100vh - 64px)` with fixed layouts that may scroll poorly on iOS Safari.

---

## ✅ Already done

- Auth flow (login, signup, OAuth callback, session caching)
- Interview chat mode (AI conversation, timer, session completion)
- Interview questions mode (generate, score, feedback)
- Past sessions list with stats
- Session history view (chat bubbles + Q&A records)
- Score/feedback generation and storage
- AI cost tracking (token usage → Supabase Edge Function)
- Session limit gating (`check-session-allowance` Edge Function)
- Settings page (profile, password, plan display, notifications)
- Supabase RLS and security advisor fixes (migrations 014, 015)
- API cost safeguards (migration 013)

---

## 📝 Task List

### Must ship

- [x] Build `/api/extract-text` route (file → plain text for PDF/DOC/DOCX)
- [x] Build `/api/generate-questions-on-demand` route (Questions mode in active session)
- [x] Run DB migrations: `chat_messages` and `qa_records` columns on `interview_sessions`
- [x] Stripe integration: Checkout session + webhook → update `users.plan`
- [x] Build `/pricing` section on landing page with Free / Pro / Student tiers
- [x] Fix delete account: server route that actually deletes user data before signing out
- [x] Add `monthly_session_limit: 5` to new user insert in `app/auth/callback/page.tsx`
- [x] Remove all `console.log` statements from `app/auth/callback/page.tsx`
- [x] Add ToS page (`/legal/terms`)
- [x] Add Privacy Policy page (`/legal/privacy`)
- [x] Set up monthly cron to reset `sessions_used_this_month = 0`

### Should ship

- [x] Add rate limiting to all `/api/*` routes
- [x] Verify `profile-images` Supabase storage bucket exists with correct public RLS policy
- [x] Add welcome email on signup
- [x] Add Sentry (or equivalent) for error monitoring
- [x] Wire Help & Support tab links — Contact Support wired to mailto
- [ ] Switch Resend to custom sending domain (deferred — no domain yet)
- [ ] Add session-limit warning email
- [ ] Add OG tags, meta descriptions, and favicon (deferred — no domain/logo yet)
- [ ] Add `sitemap.xml` and `robots.txt` (deferred — no domain yet)
- [ ] Wire remaining Help & Support links (Documentation, Leave a Review, Changelog)
- [ ] Either build Create Resume feature or mark as coming soon

### Nice to have

- [ ] Mobile test pass (especially iOS Safari with fixed-height layouts)
- [ ] Lock interview session to the mode chosen at creation (no mid-session tab switch)
- [ ] Auto-skip onboarding after user completes their first session
- [ ] Move notification prefs from `localStorage` to `users.notification_prefs` DB column
- [ ] Verify student verification end-to-end (`.edu` email → discount → renewal)
