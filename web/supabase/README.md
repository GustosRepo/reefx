# ReefXOne Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: ReefXOne
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

## 2. Get Your API Keys

1. Go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

## 3. Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. You should see "Success. No rows returned" (this is normal)

This creates:
- ✅ All database tables (profiles, subscriptions, tanks, reef_logs, etc.)
- ✅ Row Level Security (RLS) policies (users can only access their own data)
- ✅ Indexes for fast queries
- ✅ Triggers for auto-updating timestamps
- ✅ Storage bucket for photos

## 4. Verify the Setup

Go to **Table Editor** and you should see these tables:
- `profiles`
- `subscriptions`
- `tanks`
- `reef_logs`
- `thresholds`
- `maintenance`
- `equipment`
- `livestock`
- `gallery_photos`

## 5. Create .env.local File

```bash
cd web
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in your actual values:

```env
# From Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Leave these for now (we'll add them later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 6. Test the Connection

Start your Next.js dev server:

```bash
npm run dev
```

Once we update the auth pages, you should be able to:
- Register a new account
- See your profile in Supabase Dashboard > Table Editor > profiles
- Automatically get a default tank and free subscription

## Next Steps

After this setup:
1. ✅ Update auth pages to use Supabase Auth (login/register)
2. ✅ Migrate data operations from localStorage to Supabase
3. ✅ Set up Stripe for payments
4. ✅ Add real-time features
5. ✅ Implement SMS alerts with Twilio

## Troubleshooting

**"Cannot connect to Supabase"**
- Double-check your URL and keys in `.env.local`
- Make sure to restart your dev server after changing env vars

**"Row Level Security policy violation"**
- Make sure you're authenticated (logged in)
- Check that the RLS policies were created correctly in SQL Editor

**"Schema already exists" error**
- You can safely ignore this if re-running the schema
- Or drop and recreate tables (⚠️ loses all data)

## Storage Bucket Setup

The schema should have created the `gallery` bucket automatically. If not:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `gallery`
4. Public: `false` (private)
5. The SQL schema already set up the policies
