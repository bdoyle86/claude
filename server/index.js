// Secure Backend Proxy for OpenAI API
// This server acts as a proxy to keep your OpenAI API key secure

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for the Game Master
const SYSTEM_PROMPT = `You are the 'Game Master' for a text-based band manager simulation game. Your target audience is 10-13 years old. Your role is to receive the player's current game state and the actions they just took. You must calculate the outcome of this turn.

RULES:
1. Think step-by-step about the player's actions and state. Did they record an album? Did they go on tour?
2. Calculate the costs and rewards. A tour costs money but should generate money and fame. Recording an album costs money.
3. Consider band member skills/genres. If an album's genre matches the band's, it should be more successful.
4. Invent small, simple, random events (e.g., "A magazine review gave you +5 Fame," "Your van broke down, -$500").
5. Generate 1-3 short 'email' messages for the player explaining these results. The tone MUST be simple, clear, and fun (e.g., "Wow!", "Oh no!").
6. You MUST respond ONLY with a valid, non-minified JSON object. Do not include any text, notes, or apologies outside the JSON structure.

Response format:
{
  "updatedGameState": {
    "money": <new money value>,
    "fame": <new fame value>
  },
  "newEmails": [
    {
      "subject": "Email subject",
      "body": "Email body text"
    }
  ],
  "newlyCreatedAssets": {
    "album": {
      "name": "Album name",
      "qualityScore": <0-100>,
      "genre": "Genre"
    },
    "tour": {
      "name": "Tour name",
      "moneyMade": <amount>,
      "fameGained": <amount>
    }
  }
}`;

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Band Manager API is running' });
});

// Game Master endpoint
app.post('/api/game-master', async (req, res) => {
    try {
        const { gameState, bandMembers, actionsTaken } = req.body;

        // Validate request
        if (!gameState || !bandMembers || !actionsTaken) {
            return res.status(400).json({
                error: 'Missing required fields: gameState, bandMembers, actionsTaken'
            });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OpenAI API key not configured, using mock response');
            return res.json(getMockResponse(req.body));
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(req.body)
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API error:', error);
            return res.status(500).json({
                error: 'OpenAI API request failed',
                details: error
            });
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        res.json(result);
    } catch (error) {
        console.error('Error in game-master endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Mock response function (fallback when no API key)
function getMockResponse(request) {
    const { gameState, bandMembers, actionsTaken } = request;
    let newMoney = gameState.money;
    let newFame = gameState.fame;
    const emails = [];
    const assets = {};

    // Studio costs
    const studioCosts = {
        FREE: 0,
        LOW: 500,
        HIGH: 5000
    };

    const studioBonus = {
        FREE: 0,
        LOW: 10,
        HIGH: 30
    };

    // Tour data
    const tourData = {
        LOCAL_GIGS: { cost: 500, estimatedMoney: 2000, estimatedFame: 20 },
        REGIONAL_TOUR: { cost: 2000, estimatedMoney: 8000, estimatedFame: 80 },
        WORLD_TOUR: { cost: 10000, estimatedMoney: 50000, estimatedFame: 400 }
    };

    // Process each action
    actionsTaken.forEach(action => {
        if (action.actionType === 'RECORD_ALBUM') {
            const studio = studioCosts[action.studioLevel];
            const bonus = studioBonus[action.studioLevel];
            newMoney -= studio;

            // Calculate quality
            const avgSkill = bandMembers.reduce((sum, m) => sum + m.skill, 0) / Math.max(bandMembers.length, 1);
            const qualityScore = Math.min(100, Math.floor(avgSkill + bonus + Math.random() * 20));

            assets.album = {
                name: action.albumName,
                qualityScore: qualityScore,
                genre: action.genre
            };

            emails.push({
                subject: `Album '${action.albumName}' is finished!`,
                body: `Recording your new ${action.genre} album cost $${studio}. ${qualityScore > 70 ? "It sounds amazing!" : "It turned out pretty good!"} Quality score: ${qualityScore}/100.`
            });
        }

        if (action.actionType === 'GO_ON_TOUR') {
            const tour = tourData[action.tourType];
            newMoney -= tour.cost;

            const earnings = Math.floor(tour.estimatedMoney * (0.8 + Math.random() * 0.4));
            const fameGain = Math.floor(tour.estimatedFame * (0.8 + Math.random() * 0.4));

            newMoney += earnings;
            newFame += fameGain;

            assets.tour = {
                name: tour.name || action.tourType.replace('_', ' '),
                moneyMade: earnings - tour.cost,
                fameGained: fameGain
            };

            emails.push({
                subject: `Tour Complete!`,
                body: `Your tour was ${earnings > tour.cost * 2 ? 'a huge success' : 'pretty good'}! It cost $${tour.cost} but you earned $${earnings}. You also gained ${fameGain} fame points!`
            });
        }
    });

    // Random event (30% chance)
    if (Math.random() < 0.3) {
        const events = [
            { subject: 'Magazine Feature!', body: 'A music blog wrote about your band! +5 Fame', fame: 5 },
            { subject: 'Radio Play!', body: 'Your song got played on local radio! +10 Fame', fame: 10 },
            { subject: 'Equipment Repair', body: 'Your guitar needed fixing. -$200', money: -200 },
            { subject: 'Fan Donation!', body: 'A generous fan sent you money! +$500', money: 500 }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        emails.push({ subject: event.subject, body: event.body });
        if (event.fame) newFame += event.fame;
        if (event.money) newMoney += event.money;
    }

    // Deduct salaries
    const totalSalary = bandMembers.reduce((sum, m) => sum + (m.salary_per_turn || 0), 0);
    if (totalSalary > 0) {
        newMoney -= totalSalary;
        emails.push({
            subject: 'Payroll',
            body: `Paid your band members their salaries: $${totalSalary}`
        });
    }

    return {
        updatedGameState: {
            money: newMoney,
            fame: newFame
        },
        newEmails: emails,
        newlyCreatedAssets: assets
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`🎸 Band Manager API running on port ${PORT}`);
    console.log(`📡 Game Master endpoint: http://localhost:${PORT}/api/game-master`);
    console.log(`🔑 OpenAI API key: ${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Not configured (using mock responses)'}`);
});

module.exports = app;
