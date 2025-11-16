# Soccer Card Tycoon - MVP

A mobile-first web-based collectible card game where players can acquire, open, and view soccer player cards with varying rarities. Built with React, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- **User Authentication**: Sign up and login with email/password
- **Currency System**: Earn and spend coins to purchase packs and cards
- **Pack Store**: Buy standard packs with randomized cards
- **Pack Opening**: Animated card reveal experience with rarity-based distribution
- **My Collection**: View, filter, and sort your card collection
- **Card Market**: Purchase specific cards directly from the store
- **Mobile-First Design**: Optimized for mobile devices with a retro gaming aesthetic

### Rarity System
- **Common (70%)**: Base player cards
- **Rare (25%)**: Quality player cards
- **Epic (5%)**: Elite player cards

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom retro gaming theme
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router v6

## Prerequisites

- Node.js 16+ and npm
- Supabase account (already configured)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd soccer-card-tycoon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**

   The Supabase project is already configured with the following credentials:
   - Project URL: `https://hetjmscabxbmnolsofyk.supabase.co`
   - Anon Key: Already configured in the code

   **Run the seed data script:**
   - Go to your Supabase project at https://hetjmscabxbmnolsofyk.supabase.co
   - Navigate to SQL Editor
   - Copy and paste the contents of `seed-data.sql`
   - Click "Run" to populate the database with sample data

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create a new account to start playing!

## Database Schema

The application uses the following tables:

### cards
Stores all player card information including stats and rarity.

### packs
Defines available pack types with prices and card counts.

### profiles
User profiles with username and coin balance.

### user_cards
Junction table linking users to their card collection.

### store_cards
Cards available for individual purchase in the market.

## Project Structure

```
soccer-card-tycoon/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.jsx   # Bottom navigation bar
│   │   ├── Card.jsx        # Card display component
│   │   ├── Header.jsx      # App header with coins
│   │   └── ProtectedRoute.jsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication state
│   ├── lib/               # Utility libraries
│   │   └── supabase.js    # Supabase client
│   ├── pages/             # Page components
│   │   ├── Login.jsx      # Login page
│   │   ├── Register.jsx   # Registration page
│   │   ├── Home.jsx       # Dashboard/Home
│   │   ├── PackStore.jsx  # Pack purchase page
│   │   ├── PackOpening.jsx # Pack opening experience
│   │   ├── Collection.jsx  # User's card collection
│   │   └── Market.jsx      # Single card store
│   ├── App.jsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.jsx           # App entry point
├── seed-data.sql          # Database seed script
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Project dependencies
```

## Usage

### Creating an Account
1. Click "SIGN UP!" on the login page
2. Enter username, email, and password
3. You'll start with 1,500 coins

### Buying Packs
1. Navigate to "Pack Store" from the home page or bottom navigation
2. Click "Buy Pack" (100 coins)
3. Confirm your purchase
4. Open the pack to reveal your cards!

### Pack Opening
1. After purchase, you'll see the pack opening screen
2. Click "REVEAL NEXT" to reveal cards one by one
3. Or click "REVEAL ALL" to see all cards at once
4. New cards are highlighted with a "NEW!" badge
5. Click "AWESOME!" when done to view your collection

### Viewing Your Collection
1. Navigate to "My Collection"
2. Filter by rarity: All, Common, Rare, Epic
3. Sort by name (A-Z) or rating
4. Click on cards to view details

### Buying Individual Cards
1. Go to "Market" from the home page
2. Browse available cards
3. Click the coin button to purchase
4. Cards are added immediately to your collection

## Game Economy

- **Starting Coins**: 1,500
- **Standard Pack**: 100 coins (5 cards)
- **Card Prices in Market**:
  - Epic: 500 coins
  - Rare: 300 coins
  - Common: 150 coins

## Customization

### Adding More Cards
1. Open Supabase SQL Editor
2. Insert new cards into the `cards` table
3. Use the same structure as in `seed-data.sql`

### Adjusting Rarity Distribution
Edit the rarity probability in `src/pages/PackOpening.jsx`:
```javascript
// Current distribution: 70% Common, 25% Rare, 5% Epic
if (rand < 0.05) {
  rarity = 'Epic'
} else if (rand < 0.30) {
  rarity = 'Rare'
} else {
  rarity = 'Common'
}
```

### Styling
All colors and design tokens are in `tailwind.config.js`. Modify the theme to change the visual appearance.

## Future Enhancements

- Player-to-player trading
- Multiple pack types with different rarity distributions
- Detailed player statistics
- Sell cards back to the store
- Dynamic pricing based on supply/demand
- Daily rewards and challenges
- Squad building and tournaments

## Troubleshooting

### Cards not showing images
- The seed data uses placeholder images from Unsplash
- Replace with actual player images by updating the `image_url` field in the database

### Authentication errors
- Verify Supabase credentials are correct
- Check that Row Level Security (RLS) policies are properly configured

### Packs not opening
- Ensure the `cards` table has data
- Check browser console for errors

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ⚽ for soccer fans and card collectors!
