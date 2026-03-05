# Gecko Academy Platform — Launch Readiness Audit

Date: 2026-03-05

## 1) Launch Readiness Score

**58 / 100**

## 2) Launch Recommendation

**LAUNCH WITH LIMITATIONS**

The application has strong foundations (typed codebase, Drizzle usage, protected server layouts, tests passing), but there are multiple launch blockers in RBAC, onboarding privilege assignment, invite/code entropy, and missing production hardening controls (security headers, rate limiting, CSRF posture). A limited launch is possible only after P0 fixes below.

---

## 3) Critical Launch Blockers (P0)

### P0-1: Self-service privilege escalation during onboarding
- **File path:** `app/onboarding/actions.ts`
- **Function/component:** `setPlatformRole`
- **Why issue exists:** The onboarding action accepts any role in `platformRoleEnum` and updates the current user without restriction.
- **Risk level:** **Critical** (student can set self to `admin`/`school_admin`/`teacher`).
- **Recommended fix:** Restrict self-assignment to `student` only (or only allow `student` + approved flow state), and move elevated role assignment to admin-only actions.
- **How to test fix:**
  1. Attempt POST/server action payload with `platformRole=admin` as a normal user.
  2. Verify DB `users.platform_role` remains `student` and action returns validation/authorization error.

### P0-2: Admin dashboard authorization uses read-level permission shared by all roles
- **File path:** `app/(dashboard)/(with-sidebar)/dashboard/admin/page.tsx`
- **Function/component:** `AdminDashboardPage`
- **Why issue exists:** `requirePermission(['classes:read'])` is used; this permission is granted to `student`, `teacher`, and `school_admin` in permission mapping.
- **Risk level:** **Critical** (privilege boundary break; admin UX/data exposure).
- **Recommended fix:** Replace with `requireRole(['admin'])` or require `users:write`/admin-scoped permission and split permission model into true admin-only capabilities.
- **How to test fix:**
  1. Sign in as student/teacher and open `/dashboard/admin`.
  2. Confirm redirect/403.
  3. Sign in as admin and confirm access works.

### P0-3: Invite and class-code generation uses `Math.random` and short token space
- **File paths:** `lib/education/invite-token.ts`, `lib/education/join-code.ts`
- **Function/component:** `generateInviteToken`, `generateJoinCode`
- **Why issue exists:** Non-cryptographic RNG and short lengths (invite 8–10, join 6–8) are brute-forceable at scale, especially without endpoint rate limiting.
- **Risk level:** **Critical** (invite abuse, unauthorized class joins).
- **Recommended fix:** Use `crypto.randomBytes` / `crypto.getRandomValues` with >=128-bit entropy (e.g., base32/base64url token length 22+); keep one-way hashed tokens in DB if possible.
- **How to test fix:**
  1. Verify token generator output length/charset and uniqueness in 1M generation simulation.
  2. Run brute-force script against join/invite endpoints with rate limit enabled; verify throttling and no successful enumeration.

### P0-4: Missing rate limiting on invite and join pathways
- **File path:** `lib/actions/class-invite.ts`, `lib/actions/education.ts`
- **Function/component:** `joinClassWithInviteAction`, `joinClassByCodeAction`
- **Why issue exists:** No per-IP/per-user throttles; TODO explicitly notes missing rate limiting.
- **Risk level:** **Critical** (credential stuffing-equivalent for codes/tokens, abuse and DB load).
- **Recommended fix:** Add centralized sliding-window limiter (Redis/Upstash/Edge KV) for join, sign-in, and invite-read actions.
- **How to test fix:**
  1. Replay 50+ invalid attempts/min from same IP.
  2. Confirm 429 responses and lockout decay behavior.

---

## 4) High Priority Issues (P1)

### P1-1: No explicit security headers/CSP in Next config
- **File path:** `next.config.ts`
- **Function/component:** Next config export
- **Why issue exists:** No `headers()` policy for CSP, HSTS, X-Frame-Options, Referrer-Policy, etc.
- **Risk level:** **High** (increased XSS/clickjacking/mixed-content exposure).
- **Recommended fix:** Add strict CSP (nonce-based for scripts), HSTS (prod), `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`.
- **How to test fix:** Validate headers with integration tests (`curl -I`) and Mozilla Observatory.

### P1-2: School admin access checks are not school-scoped
- **File paths:** `app/(dashboard)/(with-sidebar)/dashboard/students/[studentId]/page.tsx`, `lib/db/queries/education.ts`
- **Function/component:** `StudentProfilePage`, `hasStudentEnrollment`
- **Why issue exists:** School admin gate only checks whether student has *any* enrollment, not enrollment in same school/tenant.
- **Risk level:** **High** (cross-tenant student data exposure / IDOR).
- **Recommended fix:** Enforce school/org scoping in every school-admin query (join through class->organization or user.schoolId).
- **How to test fix:**
  1. Create two schools with separate students.
  2. Login as School A admin and request School B student profile URL.
  3. Expect 404/403.

### P1-3: Authentication cookies always `secure: true` in some flows
- **File paths:** `lib/auth/session.ts`, `middleware.ts`
- **Function/component:** `setSession`, middleware cookie refresh
- **Why issue exists:** `secure: true` is hardcoded (not environment-gated in session setter/refresh), which can break non-HTTPS self-hosted environments and test rigs.
- **Risk level:** **High** (auth instability across environments).
- **Recommended fix:** `secure: process.env.NODE_ENV === 'production'` or explicit env toggle.
- **How to test fix:** Validate sign-in/session persistence in local HTTP and production HTTPS.

### P1-4: Potential account/session confusion in Stripe checkout return route
- **File path:** `app/api/stripe/checkout/route.ts`
- **Function/component:** `GET`
- **Why issue exists:** Route sets session based on Stripe session payload without requiring authenticated requester match.
- **Risk level:** **High** (session fixation/account mix-up if session IDs leak).
- **Recommended fix:** Require authenticated user and verify `client_reference_id === current_user.id`; otherwise reject.
- **How to test fix:** Replay checkout success URL from different account; ensure no session mutation.

---

## 5) Medium / Low Issues (P2 / P3)

### P2-1: Onboarding UX/route inconsistency between localized and non-localized paths
- **File paths:** `app/onboarding/role/page.tsx`, `app/[locale]/onboarding/role/page.tsx`
- **Why issue exists:** Non-locale route renders role picker; locale route immediately redirects based on existing role. Behavior mismatch can appear as broken onboarding.
- **Risk level:** **Medium**.
- **Fix:** Consolidate to one canonical onboarding flow and i18n wrapper.
- **Test:** Open `/onboarding/role` and `/{locale}/onboarding/role` for new users; verify identical expected behavior.

### P2-2: Middleware protected prefixes incomplete vs real app surface
- **File path:** `middleware.ts`
- **Why issue exists:** Protected prefixes include only `/dashboard`, `/onboarding`, `/classroom`; app also exposes `/teacher`, `/admin`, `/students`, `/learning` routes.
- **Risk level:** **Medium** (inconsistent redirect behavior, potential future bypasses if layout-level auth removed).
- **Fix:** Add all protected route families or use deny-by-default matcher strategy.
- **Test:** Unauthenticated requests to each app route should consistently redirect to sign-in.

### P3-1: Duplicate migration file naming around avatar column may confuse ops
- **File paths:** `lib/db/migrations/0015_add_users_avatar_url.sql`, `lib/db/migrations/0016_add_users_avatar_url.sql`
- **Why issue exists:** Two similarly named migrations adding same column.
- **Risk level:** **Low** (operational clarity/deployment confusion).
- **Fix:** Remove unused duplicate from repo and document canonical migration lineage.
- **Test:** Fresh `drizzle-kit migrate` on empty DB should produce deterministic schema and no duplicate-op noise.

---

## 6) Database Integrity Findings

- `class_invites` is present in schema and migration (`0024_class_invites.sql`) and in migration journal, so the known runtime error is likely from environments that did not apply latest migrations rather than code absence.
- Recommend startup migration check in CI/CD and a release gate that verifies latest migration index applied.

---

## 7) Reliability & Error Handling Findings

- Positive: server pages commonly use `requireRole`/`requirePermission` and return redirects rather than crashing.
- Gaps:
  - Build currently fails in this environment due external Google Fonts fetch during `next build`; requires self-hosting/fallback strategy for deterministic builds.
  - No global error boundary audit was found in app route groups; validate for critical user flows.

---

## 8) Performance & Scalability Findings

- Main risks are abuse-driven (missing rate limits) rather than query complexity.
- Some query areas perform multiple sequential DB operations; could benefit from transaction batching and indexed filters by role/tenant.

---

## 9) Deployment Readiness

### Required production environment variables
- `POSTGRES_URL`
- `AUTH_SECRET`
- `BASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Optional/operational:
- `DEMO_SEED` (for demo seeding scripts only; do not enable in production unless intentional).

---

## Minimum Viable Launch Plan

### Must fix before launch (hard gate)
1. Onboarding role escalation (P0-1)
2. Admin route permission flaw (P0-2)
3. Crypto-safe invite/code tokens + rate limiting (P0-3, P0-4)
4. School-admin tenant scoping (P1-2)

### Disable or limit at initial launch
- Disable public invite link generation and class code joins until entropy + rate limit controls are in place.
- Disable school-admin student profile deep links until tenant scoping is validated.

### Can ship later
- Migration cleanup, middleware prefix normalization, performance tuning, improved observability dashboards.

---

## Top 10 Things Most Likely To Break In Production

1. Unauthorized role elevation from onboarding.
2. Unauthorized access to admin surfaces from non-admin roles.
3. Invite token brute force and mass-enrollment abuse.
4. Join code enumeration due weak entropy + no throttling.
5. Cross-tenant student profile access by school admins.
6. Session/cookie behavior differences across HTTP/HTTPS environments.
7. Stripe success URL replay causing account/session confusion.
8. Build instability due runtime external font dependency.
9. Inconsistent localized/non-localized onboarding behavior.
10. Environment drift where migrations are not fully applied (e.g., missing `class_invites`).

---

## Security Hardening Checklist

- [ ] Restrict onboarding role assignment to least privilege (`student`).
- [ ] Move elevated role changes behind admin-only audited actions.
- [ ] Enforce role + tenant checks in **every** server action and query path.
- [ ] Replace `Math.random` tokens/codes with cryptographic RNG.
- [ ] Add rate limiting (sign-in, invite lookup, join by code, join by invite).
- [ ] Add centralized audit logs for role changes and enrollment joins.
- [ ] Add CSP + security headers in `next.config.ts`.
- [ ] Add CSRF defense-in-depth for sensitive mutations (origin checks / CSRF token).
- [ ] Add integration tests for route-level authorization matrix by role.
- [ ] Add migration-version health check to deployment pipeline.
