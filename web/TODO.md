# REEFXONE - Production Roadmap

## ✅ COMPLETED

### Phase 1: Foundation
- [x] Next.js 15 + React 19 setup
- [x] Supabase integration (PostgreSQL + Auth)
- [x] Database schema (9 tables with RLS)
- [x] User authentication (register/login/logout)
- [x] Session management with middleware
- [x] API routes for all data operations
- [x] Unit preferences (Fahrenheit/Celsius, Gallons/Liters)
- [x] Conversion utilities
- [x] Password reset flow (Supabase-native)
- [x] Feedback system

### Phase 2: Core Features
- [x] Dashboard with charts
- [x] Parameter logging (temp, salinity, alk, pH, cal, mag, po4, no3)
- [x] History page (view/edit/delete logs)
- [x] Maintenance tracking
- [x] Equipment inventory
- [x] Livestock inventory
- [x] Settings (thresholds, profile)
- [x] Multi-tank database support
- [x] Multi-tank UI (tank selector, per-tank data filtering)
- [x] Photo Gallery page
- [x] Landing page with pricing

### Phase 3: Payments & Subscriptions
- [x] Stripe checkout integration
- [x] Stripe webhook handling
- [x] Subscription page
- [x] Feature access control (equipment, livestock, gallery)
- [x] Upgrade prompts on locked features

---

## 🚀 CRITICAL (Before Production Deploy)

### 1. Stripe Setup
**Priority: HIGHEST** 💰
- [ ] Create Stripe account (if not done)
- [ ] Add real Stripe keys to production env
- [ ] Create Stripe products in Stripe Dashboard:
  - Premium ($4.99/month)
  - Super Premium ($9.99/month)
- [ ] Add `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_SUPER_PREMIUM_PRICE_ID` to `.env.local`
- [ ] Set up Stripe webhook endpoint in Stripe Dashboard
- [ ] Test full payment flow in Stripe test mode

### 2. Email Verification
**Priority: MEDIUM** 📧
- [ ] Enable email confirmation in Supabase settings
- [ ] Create email confirmation page
- [ ] Handle email confirmation redirect
- [ ] Resend confirmation email button

---

## 📝 IMPORTANT (Ship Within 2 Weeks)

### 5. Photo Gallery (Super Premium Feature)
**Monetization Feature**
- [ ] Create `/gallery` page
- [ ] API route: `/api/photos` (CRUD)
- [ ] Supabase Storage integration
- [ ] Image upload component
- [ ] Gallery grid view
- [ ] Photo metadata (date, caption, tank)
- [ ] Storage limit enforcement (500MB/5GB)
- [ ] Image optimization/compression

### 6. SMS Alerts (Premium Feature)
**Monetization Feature**
- [ ] Create Twilio account
- [ ] Add Twilio credentials to `.env.local`
- [ ] API route: `/api/alerts/send-sms`
- [ ] Alert settings page (phone number, enabled parameters)
- [ ] Trigger SMS when parameters exceed thresholds
- [ ] SMS history log
- [ ] Test mode for SMS

### 7. Better Error Handling
**UX Improvement**
- [ ] Toast notifications library (react-hot-toast)
- [ ] Global error boundary component
- [ ] API error formatting
- [ ] User-friendly error messages
- [ ] Retry mechanisms for failed requests
- [ ] Offline mode detection

### 8. Loading States
**UX Improvement**
- [ ] Skeleton loaders for dashboard
- [ ] Loading spinners for forms
- [ ] Optimistic UI updates
- [ ] Progress indicators for uploads
- [ ] Disable buttons during submission

---

## 🎨 NICE TO HAVE (Post-Launch)

### 9. Data Export
- [ ] Export logs to CSV
- [ ] Export maintenance history
- [ ] Export equipment list
- [ ] Export livestock inventory
- [ ] Email backup feature

### 10. Multi-Tank UI
- [ ] Tank selector dropdown
- [ ] Create/edit/delete tanks
- [ ] Switch between tanks in dashboard
- [ ] Per-tank logs and maintenance
- [ ] Tank comparison view

### 11. Advanced Features
- [ ] Dark/light theme toggle
- [ ] PWA manifest for mobile install
- [ ] Push notifications
- [ ] Social sharing (share tank stats)
- [ ] Community features (public tanks)
- [ ] Integration with reef calculators
- [ ] Barcode scanner for equipment

### 12. Analytics & Insights
- [ ] Parameter trend predictions
- [ ] Correlation analysis (what affects what)
- [ ] Cost tracking (maintenance + equipment)
- [ ] Tank health score
- [ ] Growth tracking for corals

---

## 🐛 KNOWN ISSUES

- [x] ~~Need to add email field validation in registration~~ (implemented)
- [ ] History page needs loading skeleton
- [ ] History page should use user's temp_unit preference
- [ ] Settings page has temperature unit confusion (label says °C but defaults are °F values)
- [ ] Some pages missing proper empty state components
- [ ] Need real favicon (placeholder icons exist)

---

## 📦 DEPLOYMENT CHECKLIST

### Pre-Launch
- [x] Create privacy policy page
- [x] Create terms of service page
- [x] SEO meta tags and OpenGraph
- [ ] Set up Vercel project
- [ ] Add production environment variables
- [ ] Configure custom domain
- [ ] Set up SSL certificate (auto with Vercel)
- [ ] Add Google Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Run Lighthouse audit
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

### Post-Launch
- [ ] Monitor Stripe webhooks
- [ ] Monitor Supabase usage
- [ ] Set up backup strategy
- [ ] Create user onboarding flow
- [ ] Write documentation
- [ ] Create demo video
- [ ] Set up customer support email
- [ ] Create FAQ page

---

## 💡 REVENUE STRATEGY

**Tier Pricing:**
- Free: Basic parameter logging
- Premium ($4.99/mo): Equipment tracking, SMS alerts
- Super Premium ($9.99/mo): Livestock inventory, photo gallery (5GB), priority support

**Target Customers:**
- Reef hobbyists who want to track parameters
- Serious reefers managing expensive equipment
- Breeders managing large livestock inventories

**Marketing Channels:**
- Reef2Reef forums
- Reddit r/ReefTank
- Instagram reef community
- YouTube reef channels
- Facebook reef groups

---

## 🎯 SUCCESS METRICS

**Phase 1 (First Month):**
- 100 registered users
- 10 paying customers
- $50 MRR

**Phase 2 (3 Months):**
- 500 registered users
- 50 paying customers
- $250 MRR

**Phase 3 (6 Months):**
- 1,000 registered users
- 100 paying customers
- $500 MRR

---

**Last Updated:** December 5, 2025
**Version:** 1.0.0-beta
