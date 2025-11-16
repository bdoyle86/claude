# Band Manager API Server

This is the secure backend proxy for the Band Manager game. It handles OpenAI API requests to keep your API key secure.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your OpenAI API key

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Endpoints

### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Band Manager API is running"
}
```

### POST /api/game-master
Main game logic endpoint. Processes turn data and returns game results.

**Request:**
```json
{
  "gameState": {
    "bandName": "The Awesome Band",
    "money": 10000,
    "fame": 50,
    "currentTurn": 4
  },
  "bandMembers": [
    { "name": "Riff", "instrument": "Guitar", "skill": 70, "genre": "Rock" }
  ],
  "actionsTaken": [
    {
      "actionType": "RECORD_ALBUM",
      "albumName": "My First Hit",
      "genre": "Rock",
      "studioLevel": "HIGH"
    }
  ]
}
```

**Response:**
```json
{
  "updatedGameState": {
    "money": 8500,
    "fame": 75
  },
  "newEmails": [
    {
      "subject": "Album 'My First Hit' is done!",
      "body": "Recording cost $3,000. It sounds amazing!"
    }
  ],
  "newlyCreatedAssets": {
    "album": {
      "name": "My First Hit",
      "qualityScore": 85,
      "genre": "Rock"
    }
  }
}
```

## Fallback Mode

If no OpenAI API key is configured, the server automatically uses mock responses. This is useful for:
- Development and testing
- Demos without API costs
- Offline development

## Security

- API key is stored server-side only
- Never exposed to frontend code
- Uses environment variables for configuration
- CORS enabled for local development (configure for production)

## Production Deployment

For production:
1. Deploy to a platform like Heroku, Railway, or Vercel
2. Set environment variables in your hosting platform
3. Update frontend `config.js` to point to your production API URL
4. Configure CORS for your production domain
