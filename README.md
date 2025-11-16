# Band Manager Simulation

A turn-based, text-heavy simulation game where players manage a band's career, finances, and fame. Built for ages 10-13.

## Overview

**Band Manager** is an educational simulation game where you:
- Start with a new band and $5,000
- Recruit talented musicians
- Record albums in different studios
- Go on tours to earn money and fame
- Reach 1,000 fame to enter the Hall of Fame!

### Win Condition
Reach **1,000 Fame** to be inducted into the Band Manager Hall of Fame.

### Lose Condition
If your money drops below **-$1,000**, your band breaks up and it's game over.

## Tech Stack

- **Frontend**: HTML5, CSS (Tailwind CSS), Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **AI Game Logic**: ChatGPT API (gpt-4o-mini or gpt-4o)
- **Icons**: Material Symbols
- **Fonts**: Spline Sans

## Project Structure

```
band-manager-simulation/
├── index.html                 # Login/Signup page
├── create-band.html          # Create new band page
├── dashboard.html            # Main dashboard with inbox
├── band-members.html         # Hire/fire band members
├── record-album.html         # Record new albums
├── tour.html                 # Book tours
├── history.html              # View albums & tours history
├── biography.html            # Band biography & stats
├── hall-of-fame.html         # High scores leaderboard
├── js/
│   ├── config.js             # Configuration settings
│   ├── supabase-client.js    # Supabase database operations
│   ├── game-master.js        # ChatGPT API integration
│   ├── game-manager.js       # Core game logic & state
│   ├── auth.js               # Authentication logic
│   ├── dashboard.js          # Dashboard page logic
│   ├── band-members.js       # Band members page logic
│   ├── record-album.js       # Record album page logic
│   ├── tour.js               # Tour page logic
│   ├── history.js            # History page logic
│   ├── biography.js          # Biography page logic
│   ├── hall-of-fame.js       # Hall of Fame page logic
│   └── modals.js             # Game over/win modal logic
├── supabase/
│   └── schema.sql            # Database schema & migrations
├── package.json              # Node.js dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher) - for running a local development server
2. **Supabase Account** - [Sign up for free](https://supabase.com)
3. **OpenAI API Key** (optional for production) - [Get API key](https://platform.openai.com/api-keys)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd band-manager-simulation
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name, database password, and region
   - Wait for the project to be created

2. **Run the database schema**:
   - In your Supabase dashboard, go to the SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL script
   - This will create all necessary tables and policies

3. **Get your Supabase credentials**:
   - In your Supabase dashboard, go to Settings → API
   - Copy the **Project URL**
   - Copy the **anon/public** API key

### Step 4: Configure the Application

1. **Update `js/config.js`**:
   ```javascript
   const CONFIG = {
       supabase: {
           url: 'YOUR_SUPABASE_PROJECT_URL',
           anonKey: 'YOUR_SUPABASE_ANON_KEY'
       },
       // ... rest of config
   };
   ```

2. **Optional - Set up OpenAI API** (for production):
   - The game currently uses mock AI responses for development
   - To use real ChatGPT API, you need to create a backend proxy
   - See "Production Deployment" section below

### Step 5: Run the Development Server

```bash
npm run dev
```

The game will open in your browser at `http://localhost:3000`.

## How to Play

### 1. Create Your Band
- Sign up with an email and password
- Choose your band name
- Start with $5,000 and 0 fame

### 2. Build Your Band
- Navigate to **Band Members**
- Hire musicians with different skills and genres
- Each member has a signing bonus and weekly salary

### 3. Record Albums
- Go to **Studio**
- Choose an album name and genre
- Select a studio quality level (Free, $500, or $5,000)
- Better studios = higher quality albums

### 4. Go on Tour
- Navigate to **Tour**
- Choose from available tours (unlocked by fame level):
  - **Local Gigs** (0+ fame): Small shows, low cost
  - **Regional Tour** (100+ fame): Medium venues
  - **World Tour** (500+ fame): Stadiums and arenas

### 5. End Your Turn
- Click the **END TURN** button on the dashboard
- The AI processes your actions
- Check your inbox for results
- Money and fame are updated

### 6. Win the Game
- Reach 1,000 fame to enter the Hall of Fame
- Avoid bankruptcy (below -$1,000)

## Game Mechanics

### Turn-Based System
- Each turn, you can queue multiple actions (record albums, go on tours, hire/fire members)
- Click "END TURN" to process all actions
- The AI Game Master calculates outcomes and generates feedback emails

### Money Management
- **Income**: Tours, album sales (passive over time)
- **Expenses**: Studio costs, tour costs, band member salaries, signing bonuses
- **Goal**: Stay above -$1,000 to avoid bankruptcy

### Fame System
- **Earn Fame**: Complete tours, release high-quality albums
- **Random Events**: Magazine features, radio play, etc.
- **Goal**: Reach 1,000 fame

### Band Members
- Each member has:
  - **Instrument**: Guitar, Drums, Vocals, Bass, etc.
  - **Genre**: Rock, Pop, Hip-Hop, etc.
  - **Skill Level**: 0-100 (affects album quality)
  - **Salary**: Paid each turn
- Matching genres between band members and albums increases success

## Database Schema

The game uses 6 main tables:

1. **game_state** - One row per user with money, fame, current turn
2. **band_members** - All musicians in the player's band
3. **albums** - All recorded albums
4. **tours** - All completed tours
5. **inbox_messages** - Email feedback from the AI
6. **hall_of_fame** - Public leaderboard of top bands

See `supabase/schema.sql` for the complete schema.

## AI Integration

The game uses ChatGPT API as the "Game Master" to:
- Calculate turn outcomes
- Generate random events
- Create personalized feedback emails
- Balance game difficulty

### Current Setup (Development)
The `game-master.js` file includes a **mock response system** for development that works without an OpenAI API key.

### Production Setup (Optional)
To use real ChatGPT API:

1. Create a backend server (Node.js, Python, etc.)
2. Create an endpoint that proxies requests to OpenAI
3. Update `CONFIG.openai.endpoint` in `config.js`
4. Never expose your API key in frontend code

**Example backend endpoint** (Node.js/Express):
```javascript
app.post('/api/game-master', async (req, res) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(req.body) }
        ],
        response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(response.choices[0].message.content));
});
```

## Production Deployment

### Deploy to Vercel/Netlify

1. **Build static files** (already done - pure HTML/CSS/JS)
2. **Set environment variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. **Deploy**:
   ```bash
   # Vercel
   vercel deploy

   # Netlify
   netlify deploy
   ```

### Security Considerations

- ✅ Supabase Row Level Security (RLS) is enabled
- ✅ API keys are configured in `config.js` (client-side only for demo)
- ⚠️ For production: Move Supabase keys to environment variables
- ⚠️ For production: Create a backend proxy for OpenAI API

## Development

### Running Locally

```bash
npm run dev
```

### Modifying Game Balance

Edit `js/config.js` to change:
- Initial money and fame
- Win/lose thresholds
- Studio costs and quality bonuses
- Tour costs and rewards
- Available genres and instruments

### Adding New Features

1. **New Actions**: Add to `game-manager.js` action queue
2. **New Screens**: Create HTML + JS files following existing patterns
3. **New Database Tables**: Update `supabase/schema.sql` and `supabase-client.js`

## Troubleshooting

### "Cannot read property of undefined" errors
- Make sure Supabase credentials are correct in `config.js`
- Check browser console for specific errors

### Database errors
- Verify SQL schema was run successfully in Supabase
- Check RLS policies are enabled

### Authentication issues
- Confirm email verification is disabled (or check spam for verification email)
- Check Supabase Auth settings

### Game not processing turns
- Check browser console for API errors
- Verify `game-master.js` mock responses are working
- Ensure `game-manager.js` is loaded

## Future Enhancements

Potential features to add:
- [ ] Real ChatGPT API integration with backend
- [ ] More detailed album sales over time
- [ ] Merchandise and sponsorships
- [ ] Social media system
- [ ] Rival bands
- [ ] Music awards and nominations
- [ ] Multi-player competitions
- [ ] Sound effects and music
- [ ] Mobile-responsive improvements
- [ ] Progressive Web App (PWA) support

## Credits

- **Design Pattern**: Tailwind CSS + Material Symbols
- **Database**: Supabase
- **AI**: OpenAI ChatGPT
- **Target Audience**: Ages 10-13

## License

MIT License - Feel free to use this for educational purposes!

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

**Have fun building your band to legendary status!** 🎸🎤🥁
