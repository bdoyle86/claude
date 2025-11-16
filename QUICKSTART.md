# Quick Start Guide

Get the Band Manager game running in 5 minutes!

## Step 1: Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Name it "band-manager" (or whatever you like)
4. Set a database password and choose a region
5. Wait for the project to initialize (~2 minutes)

## Step 2: Run the Database Setup (1 minute)

1. In Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" button
7. You should see "Success. No rows returned"

## Step 3: Get Your Credentials (30 seconds)

1. In Supabase, go to Settings → API
2. Copy the **Project URL**
3. Copy the **anon/public** key

## Step 4: Configure the Game (30 seconds)

1. Open `js/config.js` in your code editor
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon key
4. Save the file

## Step 5: Start the Servers (1 minute)

**Terminal 1 - Backend Server:**
```bash
cd server
npm install
npm start
```

You should see:
```
🎸 Band Manager API running on port 3001
🔑 OpenAI API key: Configured ✓
```

**Terminal 2 - Frontend Server:**
```bash
# In a new terminal, from project root
npm install
npm run dev
```

The game will open at http://localhost:3000

## Step 6: Play! 🎸

1. Click "Sign Up"
2. Enter an email and password (can be fake for testing)
3. Create your band name
4. Start managing your band!

## Troubleshooting

**"Cannot connect to database"**
- Check that you updated `js/config.js` with correct Supabase credentials
- Make sure SQL schema was run successfully in Supabase

**"Backend not available"**
- Make sure the backend server is running on port 3001
- Check Terminal 1 for errors

**"No rows returned" after SQL**
- That's actually success! The tables were created

**Game stuck on "Processing turn"**
- Check browser console (F12) for errors
- Make sure both servers are running

## Using the Real OpenAI API

The backend server is already configured with your OpenAI API key!

If you see this in the console:
- `✓ Using OpenAI API response` - Real AI is working!
- `Backend not available, using mock response` - Using fallback (still playable!)

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check out the [server/README.md](server/README.md) for API details
- Have fun building your band to fame!

---

**Need help?** Check the browser console (F12) for error messages, or refer to the main README.
