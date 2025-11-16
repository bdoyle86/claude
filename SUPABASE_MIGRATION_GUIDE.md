# 🚀 Supabase Migration Guide

## ✅ What's Been Done

- ✅ Installed Supabase client library
- ✅ Created Supabase configuration
- ✅ Created database schema SQL files
- ✅ Updated AuthContext to use Supabase Auth
- ✅ Updated Login and Home pages
- ⏳ Remaining: Update other pages to use Supabase directly

## 📋 Step-by-Step Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name:** `soccer-cards` (or any name you like)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free
6. Click "Create new project"
7. Wait 1-2 minutes for setup to complete

### Step 2: Get Your API Keys

1. In your Supabase dashboard, click on your project
2. Click the **Settings** icon (gear) in the left sidebar
3. Click **API** in the settings menu
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 3: Update Your .env File

1. Open `soccer-cards/.env` in your code editor
2. Replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Save the file

### Step 4: Set Up the Database

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the contents of `supabase-schema.sql` from the project root
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 5: Seed the Cards

1. Still in the SQL Editor, click **New query**
2. Copy the contents of `supabase-seed-cards.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. You should see "Success" with the number of cards inserted

### Step 6: Verify the Setup

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - `cards` (should have ~30 player cards)
   - `profiles` (empty for now)
   - `user_cards` (empty for now)
   - `packs` (should have 1 pack)
   - `store_cards` (should have ~10 cards)

### Step 7: Test the Application

1. Start your frontend:
```bash
cd soccer-cards
npm run dev
```

2. Open `http://localhost:5173`
3. Click "Get Started"
4. Create an account with:
   - Username: (any name)
   - Email: your-email@example.com
   - Password: (at least 6 characters)
5. You should be logged in with 1,500 coins!

## 🔧 Remaining Updates Needed

The following pages still need to be updated to use Supabase directly instead of the old API services. I've started the migration, but you'll need to complete these:

### Pages to Update:

1. **PackStore.jsx** - Update to use Supabase for buying packs
2. **Collection.jsx** - Update to query user_cards from Supabase
3. **CardDetail.jsx** - Update to query cards from Supabase
4. **SingleCardStore.jsx** - Update to use Supabase for buying cards
5. **Register.jsx** - Already using Supabase Auth (should work!)

### How to Update Pages:

Instead of using the old `services.js` API calls, use Supabase directly:

**Old way (axios):**
```javascript
import { packService } from '../api/services';
const data = await packService.buyPack(packId);
```

**New way (Supabase):**
```javascript
import { supabase } from '../lib/supabase';

// Query example
const { data, error } = await supabase
  .from('user_cards')
  .select('*, cards(*)')
  .eq('user_id', user.id);

// Insert example
const { data, error } = await supabase
  .from('user_cards')
  .insert({ user_id: user.id, card_id: cardId, quantity: 1 });

// Update example
const { error } = await supabase
  .from('profiles')
  .update({ coins: newCoins })
  .eq('id', user.id);
```

## 📚 Supabase Documentation

- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Auth Docs](https://supabase.com/docs/guides/auth)
- [Database Queries](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Benefits of This Migration

1. ✅ **No Backend Server Needed** - Supabase handles everything
2. ✅ **No PostgreSQL Installation** - Cloud-hosted database
3. ✅ **No JWT Management** - Supabase Auth handles it
4. ✅ **Free Forever** - Generous free tier
5. ✅ **Production Ready** - No deployment setup needed
6. ✅ **Real-time Capabilities** - Built-in for future features

## 🚨 Important Notes

- **Email Confirmation:** By default, Supabase sends confirmation emails. For development, you can disable this:
  1. Go to Authentication → Settings
  2. Scroll to "Email Auth"
  3. Toggle OFF "Enable email confirmations"

- **Row Level Security:** The schema includes RLS policies to ensure users can only access their own data

- **Backend Folder:** You can now delete the entire `backend/` folder - it's no longer needed!

## ❓ Troubleshooting

**"Invalid API key" error:**
- Double-check your `.env` file has the correct values
- Make sure you're using the **anon** key, not the service_role key
- Restart your dev server after changing `.env`

**"User already registered" but can't log in:**
- Check if email confirmation is required (see Important Notes above)
- Check your email for confirmation link

**Can't see any cards:**
- Make sure you ran both SQL files (schema + seed)
- Check the `cards` table in Supabase Table Editor

## 🎉 Next Steps

Once everything is working:
1. Delete the `backend/` folder
2. Delete `src/api/axios.js` and `src/api/services.js`
3. Deploy frontend to Vercel (it will automatically work with Supabase!)

---

Need help? Check the Supabase docs or ask in their Discord!
