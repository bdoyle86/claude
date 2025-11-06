# ⚽ Soccer Card Trader - Educational Trading Game

A fun and engaging web game that teaches kids (and adults!) about markets, commerce, supply and demand through soccer card trading!

## 🎮 Game Overview

Soccer Card Trader is an interactive trading game where players:
- Open card packs to discover soccer players of various rarities
- Visit different shops with unique specialties and pricing
- Buy low and sell high to make profits
- React to dynamic market events that affect card prices
- Complete quests to earn rewards and XP
- Build a valuable collection and level up

## 🎯 Educational Goals

This game teaches:
- **Supply and Demand**: Different shops pay different prices for the same card
- **Market Volatility**: Random events create price fluctuations (like real markets!)
- **Opportunity Cost**: Deciding when to sell vs. hold cards
- **Risk Management**: Balancing cash vs. collection value
- **Resource Management**: Using profits to buy packs or specific cards

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🎲 How to Play

### Starting Out
- You begin with **$10,000 cash** and a **starter pack** of 5 cards
- Your goal is to grow your **Net Worth** (cash + collection value)

### The Core Game Loop

1. **Open Packs**: Buy card packs to discover random players
   - Starter Pack ($1,000) - Mostly common cards
   - Standard Pack ($2,500) - Mix of rarities
   - Premium Pack ($7,500) - Guaranteed Gold card (unlocks at Level 3)
   - Elite Pack ($20,000) - Guaranteed Platinum card (unlocks at Level 7)
   - Icon Pack ($100,000) - Guaranteed Icon card (unlocks at Level 15)

2. **Visit Shops**: Buy and sell cards at different shops
   - **The Local Pitch**: Deals in Bronze and Silver cards, stable prices
   - **Champions' Hall**: Rare and Epic cards only (unlocks at Level 5)
   - **The Collector's Corner**: Legendary cards with volatile prices (unlocks at Level 10)
   - **The Boot Room**: Buys ANY card, but at terrible prices (your "liquidity" option)

3. **Trade Smart**:
   - Check multiple shops for the best prices
   - Watch for market events that create price spikes
   - Buy cards when prices are low, sell when they're high
   - Some shops won't buy certain rarities - plan accordingly!

4. **Complete Quests**:
   - Earn bonus cash and XP
   - Track your progress in specific challenges
   - Unlock harder quests as you level up

5. **Level Up**:
   - Gain XP from every action (buying, selling, opening packs)
   - Unlock new packs and shops
   - Access harder quests with better rewards

## 📊 Card Rarities

Cards come in 5 tiers, each with different drop rates and values:

- **Bronze** (Common) - 60% drop rate - $100-750 base value
- **Silver** (Uncommon) - 25% drop rate - $500-1,250 base value
- **Gold** (Rare) - 10% drop rate - $2,000-4,500 base value
- **Platinum** (Epic) - 4% drop rate - $10,000-23,000 base value
- **Icon** (Legendary) - 1% drop rate - $50,000-99,000 base value

Higher rarity = Higher rating = Higher value!

## 📰 Market Events

Random events create opportunities (and risks!):

- **Hat-Trick Hero**: A player scores 3 goals - their club's cards surge 50%!
- **Championship Victory**: A team wins - prices jump 40%!
- **Market Flood**: New shipment arrives - prices crash 35%!
- **Collector's Quest**: Wealthy collector wants a nation's cards - pays 60% more!
- **High Demand**: A position is trending - 35% price boost!
- **Market Crash**: Economic crisis - all prices drop 30%!

Events last 2-3 actions, so act fast!

## 💡 Trading Tips

1. **Buy Low, Sell High**: Check all available shops before buying/selling
2. **Timing is Everything**: Market events can double your profits or cause losses
3. **Balance Your Portfolio**: Keep some cash on hand for good opportunities
4. **Diversify**: Don't put all your money into one card type
5. **Complete Quests**: They're a great source of bonus income
6. **Watch Your Net Worth**: It's the true measure of success (cash + collection value)
7. **The Boot Room**: Only use it when desperate - they pay terrible prices but buy anything
8. **Patience Pays**: Sometimes holding a card for the right market event is better than selling immediately

## 🎯 Quest System

Quests give you goals and rewards:

**Easy Quests** (Level 1+)
- First Profit: Make $1,000 in profit
- Shopping Spree: Buy 3 cards
- Pack Hunter: Open 3 packs

**Medium Quests** (Level 3+)
- Rising Trader: Make $5,000 in profit
- Gold Rush: Collect 3 Gold cards
- Strike Force: Collect 5 Strikers

**Hard Quests** (Level 8+)
- Market Master: Make $25,000 in profit
- Elite Collector: Get a Platinum card
- Six Figure Collection: Reach $100,000 collection value

**Legendary Quests** (Level 15+)
- Icon Hunter: Get an Icon card
- Trading Tycoon: Make $100,000 in profit

## 📈 Progression System

### Leveling Up
- Earn XP from all actions (buying, selling, opening packs, completing quests)
- Higher value transactions = more XP
- Each level unlocks new content

### Unlocks by Level
- **Level 1**: Start game, Local Pitch, Boot Room, Starter & Standard Packs
- **Level 3**: Premium Pack unlocked
- **Level 5**: Champions' Hall shop unlocked
- **Level 7**: Elite Pack unlocked
- **Level 10**: The Collector's Corner shop unlocked
- **Level 15**: Icon Pack unlocked

## 🎨 Features

- **Beautiful UI**: Dark theme with card rarity colors and smooth animations
- **Pack Opening Animation**: Exciting card reveal sequence
- **Real-time Stats**: Track cash, collection value, and net worth
- **Net Worth Graph**: Visual representation of your trading success
- **Auto-save**: Game saves automatically every 30 seconds
- **Mobile Responsive**: Play on any device
- **Market News Ticker**: Stay informed about active events
- **Collection Manager**: Sort and filter your cards
- **Quest Tracking**: Progress bars show how close you are to rewards

## 🛠 Technical Details

Built with:
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **LocalStorage** - Game save persistence
- **CSS Animations** - Smooth, engaging visuals
- **Vanilla JS** - No unnecessary dependencies

### Project Structure
```
src/
├── components/        # React components
│   ├── Dashboard.jsx  # Main stats and overview
│   ├── PackOpening.jsx # Pack purchase and opening
│   ├── Shops.jsx      # Buy/sell interface
│   ├── Collection.jsx # Card collection viewer
│   ├── Quests.jsx     # Quest tracking
│   └── MarketNews.jsx # Event ticker
├── data/              # Game data
│   ├── cards.js       # Card generation and rarities
│   ├── packs.js       # Pack definitions
│   ├── shops.js       # Shop logic and pricing
│   ├── events.js      # Market event system
│   └── quests.js      # Quest definitions
├── utils/             # Game logic
│   ├── gameLogic.js   # Core game state management
│   └── marketEngine.js # Market pricing and events
├── App.jsx            # Main app component
└── App.css            # Styling and animations
```

## 🎓 For Educators

This game is perfect for teaching:
- **Economics**: Supply/demand, market forces, arbitrage
- **Math**: Percentages, profit calculations, statistics
- **Decision Making**: Risk vs. reward, opportunity cost
- **Financial Literacy**: Asset valuation, portfolio management

**Discussion Questions:**
1. Why do different shops pay different prices for the same card?
2. How do market events represent real-world supply and demand?
3. When is it better to hold an asset vs. selling immediately?
4. What's the difference between cash and net worth?

## 🎮 Game Design Philosophy

Inspired by classic trading games like "Drug Wars" but made family-friendly and educational. The game teaches real economic concepts through:

- **Multiple Markets**: Different shops = different prices (geographic arbitrage)
- **Random Events**: Supply shocks and demand surges (market volatility)
- **Rarity System**: Scarcity creates value (supply limitation)
- **Collection Value**: Assets have worth beyond immediate cash (investment value)

## 🤝 Contributing

This is an educational project! Feel free to:
- Add new card players or clubs
- Create new market event types
- Design new quests
- Improve the UI/UX
- Add new features (e.g., card sets, trading with friends, tournaments)

## 📝 License

MIT License - Feel free to use this for educational purposes!

## 🙏 Acknowledgments

Created to teach a 10-year-old about markets and commerce through something they love: soccer!

---

**Have fun trading and learning! ⚽💰**
