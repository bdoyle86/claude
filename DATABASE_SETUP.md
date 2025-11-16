# 🗄️ Database Setup Quick Guide

This guide will help you set up the complete database for the Soccer Card Trading Game.

## 📦 What You'll Be Setting Up

1. **Database Schema** - Tables, relationships, and security policies
2. **Player Cards** - ~30 soccer players with stats (Messi, Ronaldo, etc.)
3. **Packs** - 3 types of card packs users can buy
4. **Store Items** - 11 featured cards for direct purchase

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- ✅ You've created a Supabase project
- ✅ You have your API keys in the `.env` file
- ✅ You're logged into Supabase dashboard

### Step-by-Step Instructions

#### 1. Open SQL Editor
- Go to your Supabase project dashboard
- Click **SQL Editor** in the left sidebar
- Keep this tab open - you'll use it 4 times

#### 2. Run Schema (Creates Tables)
- Click **New query**
- Open `soccer-cards/supabase-schema.sql` from your project
- Copy ALL the contents
- Paste into SQL Editor
- Click **Run** (or Cmd/Ctrl + Enter)
- ✅ Success! Tables created

#### 3. Add Player Cards
- Click **New query** (opens a fresh editor)
- Open `supabase-seed-cards.sql` from project root
- Copy ALL the contents
- Paste into SQL Editor
- Click **Run**
- ✅ Success! ~30 cards inserted

#### 4. Add Card Packs
- Click **New query**
- Open `supabase-packs-data.sql` from project root
- Copy ALL the contents
- Paste into SQL Editor
- Click **Run**
- ✅ Success! 3 packs added

#### 5. Populate Store
- Click **New query**
- Open `supabase-store-cards.sql` from project root
- Copy ALL the contents
- Paste into SQL Editor
- Click **Run**
- ✅ Success! 11 store cards added

## ✅ Verification

### Check Your Tables

1. Click **Table Editor** in the left sidebar
2. You should see these tables:

#### `cards` table
- Should have ~30 rows
- Click on it to see players like Messi, Ronaldo, Mbappé
- Each card has: name, club, country, rarity, stats

#### `packs` table
- Should have 3 rows:
  - Starter Pack (100 coins, 5 cards)
  - Premium Pack (250 coins, 5 cards)
  - Mega Pack (450 coins, 10 cards)

#### `store_cards` table
- Should have ~11 rows
- Featured cards with prices (150-500 coins)
- Stock set to -1 (unlimited)

#### `profiles` table
- Should be empty (will fill when users register)
- Has columns: id, username, coins, created_at, updated_at

#### `user_cards` table
- Should be empty (will fill when users get cards)
- Has columns: id, user_id, card_id, quantity, acquired_at

## 🎯 What Each SQL File Does

### `supabase-schema.sql`
Creates the database structure:
- **Tables**: cards, profiles, user_cards, packs, store_cards
- **Security**: Row Level Security policies (users can only see their own data)
- **Automation**: Trigger to auto-create profile when user registers
- **Relationships**: Foreign keys linking tables together

### `supabase-seed-cards.sql`
Adds 30+ player cards:
- **3 Epic cards** (5% drop rate) - Messi, Ronaldo, De Bruyne
- **8 Rare cards** (25% drop rate) - Mbappé, Haaland, Salah, etc.
- **20+ Common cards** (70% drop rate) - Various players

Each card includes:
- Player name, club, country
- Overall rating
- Individual stats (pace, shooting, passing, dribbling, defending, physical)
- Image URL
- Rarity tier

### `supabase-packs-data.sql`
Adds 3 pack types for the Pack Store:
- Different prices
- Different card counts
- Different image URLs
- All packs use the same rarity distribution

### `supabase-store-cards.sql`
Populates the Single Card Store:
- Epic cards: 500 coins each
- Rare cards: 300 coins each
- Common cards: 150 coins each
- Unlimited stock (-1 means infinite)

## 🧪 Testing Your Setup

### Test 1: View Cards
```sql
SELECT player_name, rarity, overall_rating
FROM cards
ORDER BY overall_rating DESC
LIMIT 10;
```
Should show top 10 players

### Test 2: View Packs
```sql
SELECT name, price, card_count FROM packs;
```
Should show 3 packs

### Test 3: View Store
```sql
SELECT c.player_name, c.rarity, sc.price
FROM store_cards sc
JOIN cards c ON sc.card_id = c.id
ORDER BY sc.price DESC;
```
Should show store items with prices

## ⚠️ Troubleshooting

**Error: "relation 'cards' does not exist"**
- You didn't run the schema file first
- Run `supabase-schema.sql` before any other files

**Error: "duplicate key value"**
- You ran a seed file twice
- Either delete the data or ignore (it won't duplicate)

**No cards showing in Table Editor**
- Make sure you clicked **Run** (not just paste)
- Check for error messages in SQL Editor
- Verify you're looking at the correct project

**Store is empty**
- Make sure cards were inserted first (seed-cards.sql)
- The store SQL references card IDs that must exist

## 🎉 You're Done!

Your database is now fully set up with:
- ✅ 30+ player cards
- ✅ 3 card packs for purchase
- ✅ 11 featured cards in the store
- ✅ User authentication ready
- ✅ Security policies in place

Start the app with `npm run dev` and test it out!

## 📝 Next Steps

1. Register a new account (you'll get 1,500 coins)
2. Buy a Starter Pack (100 coins)
3. Open it and see your new cards
4. Visit the Collection to see all your cards
5. Check the Store for specific cards to buy
6. View your Profile to see collection stats

Enjoy building your ultimate soccer squad! ⚽
