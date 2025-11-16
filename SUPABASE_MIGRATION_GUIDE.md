# 🚀 Supabase Setup Guide

## ✅ Migration Complete!

- ✅ Installed Supabase client library
- ✅ Created Supabase configuration
- ✅ Created database schema with RLS policies
- ✅ Updated all pages to use Supabase directly
- ✅ Migrated authentication to Supabase Auth
- ✅ Created pack and store data SQL files
- ✅ Built comprehensive Profile page with stats
- ✅ Added bottom navigation across all pages

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

### Step 5: Seed the Player Cards

1. Still in the SQL Editor, click **New query**
2. Copy the contents of `supabase-seed-cards.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. You should see "Success" with ~30 cards inserted

### Step 6: Add Pack Data

1. Click **New query** in the SQL Editor
2. Copy the contents of `supabase-packs-data.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. You should see 3 packs inserted (Starter, Premium, Mega)

### Step 7: Populate the Card Store

1. Click **New query** in the SQL Editor
2. Copy the contents of `supabase-store-cards.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. You should see ~11 featured cards added to the store

### Step 8: Verify the Setup

1. Click **Table Editor** in the left sidebar
2. You should see these tables with data:
   - `cards` - ~30 player cards (Messi, Ronaldo, etc.)
   - `packs` - 3 packs (Starter, Premium, Mega)
   - `store_cards` - ~11 featured cards for direct purchase
   - `profiles` - Empty (will populate when users register)
   - `user_cards` - Empty (will populate when users get cards)

3. Click on each table to verify the data looks correct

### Step 9: Test the Application

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

## 🎮 What You Can Do Now

The app is fully functional with these features:

1. **User Registration & Login** - Email-based authentication with Supabase Auth
2. **Pack Store** - Buy and open card packs (Starter, Premium, Mega)
3. **Card Collection** - View all your cards with filtering and sorting
4. **Card Details** - See detailed stats for each player
5. **Single Card Store** - Buy specific cards directly
6. **User Profile** - View stats, edit username, manage account
7. **Bottom Navigation** - Easy navigation across all pages

### Pack Types Available:

- **Starter Pack** (100 coins) - 5 cards, perfect for beginners
- **Premium Pack** (250 coins) - 5 cards, better drop rates
- **Mega Pack** (450 coins) - 10 cards, increased Epic chances

### Featured Cards in Store:

- **Epic Cards** (500 coins) - Messi, Ronaldo, De Bruyne
- **Rare Cards** (300 coins) - Mbappé, Haaland, Salah, Neymar, Lewandowski
- **Common Cards** (150 coins) - Bruno Fernandes, Son, Sterling

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

- **Backend Folder:** The `backend/` folder is no longer used. You can delete it if you'd like to clean up the project!

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

### Optional Cleanup:
1. Delete the `backend/` folder (no longer needed)
2. Delete `src/api/` folder (axios and services files are obsolete)

### Ready to Deploy:
1. **Vercel** - Push to GitHub and connect to Vercel
   - Environment variables will auto-sync from your `.env` file
   - No backend deployment needed!
2. **Netlify** - Similar process, drag and drop or connect to Git
3. **Any static host** - Build with `npm run build` and deploy the `dist` folder

### Future Features to Consider:
- Daily login bonuses (free coins)
- Achievement system (badges for collection milestones)
- Trading system between users
- Leaderboard (top collectors)
- More player cards and teams
- Special event packs (seasonal cards)

---

Need help? Check the Supabase docs or ask in their Discord!
