# AQUAXONE / REEFXONE — 2026 Audit
*Audited: May 12, 2026*

---

## 🔴 Security (Fix Now)

### 1. Debug logs shipping to production
**File:** `mobile/src/lib/supabase.ts` (lines 9–10)

Remove these two lines — they log env var info in every production build:
```ts
console.log('[Supabase Init] URL type:', typeof supabaseUrl, 'Key type:', typeof supabaseAnonKey);
console.log('[Supabase Init] URL defined:', !!supabaseUrl, 'Key defined:', !!supabaseAnonKey);
```

### 2. No input validation on API write routes
**Files:** `web/src/app/api/logs/route.ts`, tanks, maintenance, etc.

All POST routes do `await request.json()` and trust the shape with no schema validation. A user can send arbitrary data and insert garbage into the DB. Add **Zod** to all write routes.

### 3. No pagination on `/api/logs` GET
**File:** `web/src/app/api/logs/route.ts`

Returns ALL logs for a tank with no limit. On a power user account this could be thousands of rows per response. Add `limit`/`offset` query params with a server-side cap.

### 4. `STRIPE_WEBHOOK_SECRET!` non-null assertion
**File:** `web/src/app/api/stripe/webhook/route.ts` (line 23)

Will throw a runtime error if that env var is missing in production. Check it explicitly at module load like `STRIPE_SECRET_KEY` is already handled.

### 5. `logEntry: any` in mobile log screen
**File:** `mobile/app/(tabs)/log.tsx` (line 75)

Bypasses all TypeScript safety. Type it properly against the `ParameterLog` shared type.

---

## 🟠 Performance (High Impact)

### 6. `react-native-chart-kit` is outdated
**File:** `mobile/app/(tabs)/history.tsx`

This library is from 2019, renders via SVG canvas, blocks the JS thread, and has no Reanimated 4 support. It's likely causing scroll jank in the history screen. Replace with **`react-native-gifted-charts`** (Reanimated 4 native, actively maintained) or **Victory Native XL**.

### 7. No data caching on mobile
**Files:** `mobile/app/(tabs)/index.tsx`, `history.tsx`, etc.

Every `useFocusEffect` triggers a fresh Supabase round-trip. With multiple tabs this means hitting the DB on every tab switch. Add **TanStack Query for React Native** to deduplicate and cache requests, or at minimum a module-level Map with a short TTL.

### 8. Thresholds re-fetched on every dashboard visit
**File:** `mobile/app/(tabs)/index.tsx` (line 60)

Thresholds almost never change but are fetched inside `loadDashboardData` every time. Move them into `TankContext` or a dedicated context that fetches once per session.

### 9. Web dashboard is fully client-rendered
**File:** `web/src/app/dashboard/page.tsx`

Marked `"use client"` with manual `useEffect` data fetching — the worst pattern for TTFB on Next.js 15 App Router. Move the initial data fetch to a React Server Component with `Suspense` + skeleton boundaries for instant HTML + streaming data.

### 10. `getCurrentUser` makes 2 serial DB calls
**File:** `web/src/utils/auth.ts`

`auth.getUser()` then a separate `profiles` query every time. On the server the session is already in the cookie — use the server Supabase client and do a single query with a JOIN instead.

### 11. `AppLayout` fires extra API calls on every page render
**File:** `web/src/components/AppLayout.tsx` (line 42)

`getCurrentUser()` + `/api/admin/check` fire on every page mount. These should be resolved once at the root layout level and passed down via context.

### 12. `parameters` array recalculated on every render
**Files:** `mobile/app/(tabs)/index.tsx`, `log.tsx`, `history.tsx`

The `parameters` array (REEF_PARAMETERS / FRESHWATER_PARAMETERS selection) is recomputed on every render. Wrap with `useMemo` keyed on `isReefMode`.

---

## 🟡 Architecture (Important)

### 13. Subscription sync gap between mobile and web
**Files:** `mobile/src/lib/revenuecat.ts`, `web/src/utils/stripe.ts`, `web/supabase/add-revenuecat-sync.sql`

Mobile uses **RevenueCat** (App Store), web uses **Stripe**. A user who subscribes via the App Store has no web access and vice versa — this is a revenue leak. Need a single source of truth: either sync RevenueCat webhooks → `subscriptions` table, or map Stripe ↔ RevenueCat customer entitlements. The `add-revenuecat-sync.sql` exists but it's unclear if it's fully wired end-to-end.

### 14. Duplicate `freshwaterTypes` array
**File:** `mobile/src/context/TankContext.tsx`

The `freshwaterTypes` array is defined identically in both `refreshTanks` and `setCurrentTank`. Extract to a module-level constant.

### 15. Web TankContext loads tanks client-side only
**File:** `web/src/context/TankContext.tsx`

Causes a flash of empty state on every hard refresh. Prefetch tanks server-side in an RSC and hydrate into context.

### 16. `localStorage` accessed during SSR
**File:** `web/src/app/dashboard/page.tsx` (lines 53+)

`alertsMuted` and `maintenanceMuted` state is initialized from `localStorage` in a `useState` initializer. This causes a hydration mismatch. The `typeof window !== 'undefined'` guard is already there but the pattern should move to `useLayoutEffect` or a custom `useLocalStorage` hook.

---

## 🔵 Code Quality (Clean Up)

### 17. `subscription.ts.old` leftover file
**File:** `web/src/utils/subscription.ts.old`

Dead file, delete it.

### 18. `babel-preset-expo` in `dependencies` not `devDependencies`
**File:** `mobile/package.json`

It's a build tool and shouldn't ship in the production bundle. Move to `devDependencies`.

### 19. 14 `.ipa` build files committed to the repo
**Directory:** `mobile/`

These are massive binary files that belong in EAS artifact storage, not git. Add `*.ipa` to `.gitignore` and remove them from the repo.

### 20. RevenueCat `require()` fallback is fragile
**File:** `mobile/src/lib/revenuecat.ts` (line 18)

The silent try/catch around `require('react-native-purchases')` makes debugging painful. If RevenueCat is required for production, import it properly. If it's truly optional, document why explicitly.

### 21. `console.log` / `console.error` throughout production code
Strip console calls in production builds via the `babel-plugin-transform-remove-console` Babel plugin, or route through a proper logger (e.g. Sentry breadcrumbs, `react-native-logs`).

### 22. Stripe type cast via `as any`
**File:** `web/src/app/api/stripe/webhook/route.ts`

`(subscription as any).current_period_start` — Stripe's TypeScript types support this directly. Remove the `any` cast.

---

## ✅ What's Already Good

- Next.js 15 + Expo 54 + React 19 — bleeding edge, solid foundation
- Supabase RLS policies on all tables
- `supabase.auth.getUser()` (not `getSession()`) used in all server routes — correct
- Stripe webhook signature verification is done right
- `Promise.all` parallel fetch in web dashboard
- `SecureStore` for auth tokens on mobile
- Guest mode with demo data — great UX decision
- Error boundary on mobile `_layout.tsx`
- `sitemap.ts` with dynamic learn articles — good for SEO
- Promo code + affiliate tracking system is well-structured

---

## Priority Order

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | Remove debug logs from supabase.ts | 🔴 Security | Low |
| 2 | Zod validation on API write routes | 🔴 Security | Medium |
| 3 | Paginate `/api/logs` GET | 🔴 Security/Perf | Low |
| 4 | Fix subscription sync (RevenueCat ↔ Stripe) | 🟠 Revenue | High |
| 5 | Replace `react-native-chart-kit` | 🟠 UX | Medium |
| 6 | Web dashboard RSC conversion | 🟠 Perf | Medium |
| 7 | TanStack Query on mobile | 🟠 Perf | Medium |
| 8 | Delete `.ipa` files + `.old` file + move babel-preset-expo | 🔵 Cleanup | Low |
| 9 | `console.log` stripping in production | 🔵 Cleanup | Low |
