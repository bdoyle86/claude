# ⚽ Soccer Card Trading Game - MVP

A full-stack web application for collecting, opening, and trading soccer player cards. Built with React, Node.js, Express, and PostgreSQL.

## 🎯 Features

### MVP Features
- **User Authentication** - Sign up and login with secure JWT authentication
- **Currency System** - Start with 1,500 coins to buy packs and cards
- **Pack Opening** - Buy standard packs containing 5 random cards with varying rarities
- **Card Collection** - View all your cards with filtering by rarity and sorting options
- **Card Details** - View detailed player stats and information
- **Single Card Store** - Buy specific cards at fixed prices
- **Mobile-First Design** - Fully responsive with beautiful Tailwind CSS styling

### Card Rarities
- **Common** (70% drop rate) - Bronze tier players
- **Rare** (25% drop rate) - Silver tier players
- **Epic** (5% drop rate) - Gold tier legendary players

## 🛠 Tech Stack

### Frontend
- React 19
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Vite for build tooling

### Backend
- Node.js & Express
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd /path/to/your/workspace
# Repository already cloned
```

### 2. Set Up PostgreSQL Database

First, create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE soccer_cards;

# Exit psql
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd soccer-cards/backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit the .env file if needed to match your PostgreSQL credentials
# Default credentials: user=postgres, password=postgres, db=soccer_cards

# Initialize the database schema
npm run init-db

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd soccer-cards

# Install dependencies (already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎮 Usage

### First Time Setup

1. **Start PostgreSQL** - Ensure PostgreSQL is running
2. **Start Backend** - Run `npm run dev` in the `backend` directory
3. **Start Frontend** - Run `npm run dev` in the `soccer-cards` directory
4. **Open Browser** - Navigate to `http://localhost:5173`

### User Flow

1. **Welcome Page** - Click "GET STARTED" to create an account
2. **Sign Up** - Create your account with username, email, and password
3. **Home Dashboard** - View your starting balance of 1,500 coins
4. **Pack Store** - Buy standard packs for 100 coins each
5. **Open Packs** - Reveal 5 random cards with varying rarities
6. **Collection** - View all your cards, filter by rarity, sort alphabetically
7. **Card Details** - Click any card to see detailed player stats
8. **Card Store** - Buy specific cards at fixed prices

## 📁 Project Structure

```
soccer-cards/
├── backend/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   └── schema.sql            # Database schema
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── packController.js     # Pack opening logic
│   │   ├── collectionController.js
│   │   └── storeController.js
│   ├── data/
│   │   └── seedCards.js          # 50+ soccer player cards
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── packRoutes.js
│   │   ├── collectionRoutes.js
│   │   └── storeRoutes.js
│   ├── scripts/
│   │   └── initDb.js             # Database initialization
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json
│
└── src/
    ├── api/
    │   ├── axios.js              # Axios configuration
    │   └── services.js           # API service functions
    ├── components/
    │   ├── auth/
    │   │   └── ProtectedRoute.jsx
    │   └── (old game components - can be removed)
    ├── context/
    │   └── AuthContext.jsx       # Authentication context
    ├── pages/
    │   ├── Welcome.jsx           # Landing page
    │   ├── Register.jsx          # Sign up page
    │   ├── Login.jsx             # Login page
    │   ├── Home.jsx              # Home dashboard
    │   ├── PackStore.jsx         # Pack purchase & opening
    │   ├── Collection.jsx        # Card collection viewer
    │   ├── CardDetail.jsx        # Individual card details
    │   └── SingleCardStore.jsx   # Buy specific cards
    ├── App.jsx                   # Main app with routing
    ├── main.jsx                  # Entry point
    └── index.css                 # Tailwind CSS & custom styles
```

## 🗄 Database Schema

### Tables

- **users** - User accounts with authentication
- **cards** - Soccer player cards with stats
- **user_cards** - Junction table for user's collection
- **packs** - Available packs for purchase
- **store_cards** - Cards available in single card store

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user (protected)

### Packs
- `GET /api/packs` - Get available packs (protected)
- `POST /api/packs/buy` - Buy and open a pack (protected)

### Collection
- `GET /api/collection` - Get user's cards (protected)
- `GET /api/collection/stats` - Get collection statistics (protected)
- `GET /api/collection/:cardId` - Get card details (protected)

### Store
- `GET /api/store` - Get available cards in store (protected)
- `POST /api/store/buy` - Buy a specific card (protected)

## 🎨 Design Features

- **Mobile-First** - Optimized for smartphones and tablets
- **Dark Theme** - Beautiful dark mode with neon accents
- **Smooth Animations** - Card reveals and transitions
- **Responsive Grid** - Adapts to any screen size
- **Custom Fonts** - Bangers, Bungee, and Plus Jakarta Sans
- **Material Icons** - Google Material Symbols

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected routes on backend and frontend
- SQL injection prevention with parameterized queries
- CORS configuration for API security

## 🚢 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend

# Install Heroku CLI if needed
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CLIENT_URL=https://your-frontend-url.com

# Deploy
git push heroku main

# Initialize database
heroku run npm run init-db
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from soccer-cards directory
cd soccer-cards
vercel

# Set environment variable
# VITE_API_URL=https://your-backend-url.herokuapp.com/api
```

### Environment Variables

**Backend (.env):**
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com/api
```

## 📝 Future Enhancements (Out of MVP Scope)

- Player-to-player trading
- Multiple pack types with different distributions
- Sell cards back to the store
- Daily login rewards
- Achievements and quests
- Leaderboards
- Team building and battles
- Live market pricing based on supply/demand
- Card animations and sound effects

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `backend/.env`
- Verify database exists: `psql -U postgres -c "\l"`

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify `VITE_API_URL` in frontend `.env`

### Cards Not Displaying
- Check if database was seeded: `psql -U postgres -d soccer_cards -c "SELECT COUNT(*) FROM cards;"`
- Re-run seed: Restart backend (seeds automatically on start)

## 👨‍💻 Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd soccer-cards
npm test
```

### Code Style
- ESLint configured for both frontend and backend
- Prettier for code formatting

## 📄 License

MIT License - Feel free to use this project for learning and education!

## 🙏 Acknowledgments

- Built as an educational tool to teach kids about markets and commerce
- Player images from Google's public image database
- Icons from Google Material Symbols
- Tailwind CSS for amazing styling

---

**Made with ⚽ and ❤️ for young soccer fans!**
