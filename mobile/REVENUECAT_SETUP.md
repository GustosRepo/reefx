# RevenueCat Setup Guide for AquaXone

## Overview
This guide will help you set up RevenueCat for in-app purchases in your iOS app.

---

## Step 1: Create RevenueCat Account

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Sign up / Log in
3. Create a new project called "AquaXone"

---

## Step 2: Configure iOS App in RevenueCat

1. In RevenueCat dashboard, go to **Project Settings → Apps**
2. Click **+ New App**
3. Select **iOS App**
4. Enter:
   - App name: `AquaXone`
   - Bundle ID: `com.aquaxone.app`
5. You'll need your App Store Connect **Shared Secret**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - My Apps → AquaXone → App Information → App-Specific Shared Secret
   - Generate one if you haven't
   - Paste it in RevenueCat

---

## Step 3: Create Products in App Store Connect

Before RevenueCat can sell anything, you need products in App Store Connect:

1. Go to App Store Connect → My Apps → AquaXone
2. Go to **Subscriptions** (in left sidebar)
3. Create a **Subscription Group** called "AquaXone Premium"
4. Add subscriptions:

| Reference Name | Product ID | Price | Duration |
|---------------|------------|-------|----------|
| Premium Monthly | `com.aquaxone.premium.monthly` | $4.99 | 1 Month |
| Premium Yearly | `com.aquaxone.premium.yearly` | $49.99 | 1 Year |
| Super Premium Monthly | `com.aquaxone.superpremium.monthly` | $9.99 | 1 Month |
| Super Premium Yearly | `com.aquaxone.superpremium.yearly` | $99.99 | 1 Year |

---

## Step 4: Create Entitlements in RevenueCat

1. In RevenueCat dashboard → **Entitlements**
2. Create entitlements:
   - `premium` - For Premium tier access
   - `super_premium` - For Super Premium tier access

---

## Step 5: Create Offerings in RevenueCat

1. Go to **Offerings**
2. Create a "default" offering (or it may already exist)
3. Add packages:
   - Link your App Store products to the entitlements

---

## Step 6: Get Your API Key

1. Go to **Project Settings → API Keys**
2. Copy the **Public SDK key** (starts with `appl_`)
3. Add it to your `.env` file:

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxx
```

---

## Step 7: Configure Webhook (for web sync)

1. In RevenueCat → **Project Settings → Webhooks**
2. Click **+ New Webhook**
3. URL: `https://your-domain.com/api/webhooks/revenuecat`
4. (Optional) Add an authorization header for security
5. Select events to receive:
   - ✅ Initial Purchase
   - ✅ Renewal
   - ✅ Cancellation
   - ✅ Uncancellation
   - ✅ Expiration
   - ✅ Billing Issue

---

## Step 8: Add Web Environment Variable

Add to your web app's `.env.local`:

```
REVENUECAT_WEBHOOK_SECRET=your_optional_secret_here
```

---

## Step 9: Test with Sandbox

1. Create a Sandbox Tester in App Store Connect:
   - Users and Access → Sandbox → Testers
2. On your iPhone, sign out of App Store
3. When making a purchase in the app, sign in with sandbox account
4. Sandbox subscriptions renew quickly (monthly = 5 mins)

---

## Database Schema Update (Optional)

If you want to track RevenueCat-specific data, add these columns to your `subscriptions` table:

```sql
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS revenuecat_product_id TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_store TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_environment TEXT;
```

---

## How It All Works Together

```
┌─────────────────────┐
│   User on iPhone    │
│   Taps "Subscribe"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Apple IAP Sheet   │
│   User confirms     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    RevenueCat SDK   │
│  Validates receipt  │
└──────────┬──────────┘
           │
           ├───────────────────────────┐
           │                           │
           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Mobile App Updates │     │  RevenueCat Webhook │
│  CustomerInfo       │     │  → Your Web API     │
│  → User sees premium│     │  → Updates Supabase │
└─────────────────────┘     └─────────────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │     Supabase DB     │
                            │  subscriptions table│
                            │  tier = "premium"   │
                            └─────────────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                                                  │
              ▼                                                  ▼
    ┌─────────────────────┐                        ┌─────────────────────┐
    │   Web App Checks    │                        │  Mobile App Checks  │
    │   Supabase on load  │                        │  RevenueCat SDK     │
    │   → Shows premium   │                        │  OR Supabase        │
    └─────────────────────┘                        └─────────────────────┘
```

---

## Testing Checklist

- [ ] RevenueCat project created
- [ ] iOS app configured with Bundle ID
- [ ] App Store Connect products created
- [ ] Entitlements created in RevenueCat
- [ ] Products linked to entitlements
- [ ] API key added to mobile `.env`
- [ ] Webhook URL configured in RevenueCat
- [ ] Sandbox tester created
- [ ] Test purchase works
- [ ] Web app shows premium after mobile purchase

---

## Troubleshooting

**"No offerings available"**
- Products not approved in App Store Connect yet
- Products not linked to offerings in RevenueCat

**"Purchase failed"**
- Not signed in with sandbox account
- Product IDs don't match

**"Web doesn't update after purchase"**
- Webhook URL incorrect
- Webhook not receiving events (check RevenueCat logs)

---

## Cost Summary

| Revenue | Apple | RevenueCat | You Keep |
|---------|-------|------------|----------|
| $0-2,500/mo | 15% | Free | 85% |
| $2,500+/mo | 15% | 1% | 84% |

Apple takes 15% (Small Business Program) or 30% of all IAP revenue.
RevenueCat is free until $2,500/mo tracked revenue, then 1%.
