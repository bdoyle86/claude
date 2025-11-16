// Game Master - ChatGPT API Integration
// Handles turn resolution and game logic through the AI

class GameMaster {
    constructor() {
        this.systemPrompt = `You are the 'Game Master' for a text-based band manager simulation game. Your target audience is 10-13 years old. Your role is to receive the player's current game state and the actions they just took. You must calculate the outcome of this turn.

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
    }

    // Process a turn through the ChatGPT API
    async processTurn(gameState, bandMembers, actionsTaken) {
        const request = this.buildRequest(gameState, bandMembers, actionsTaken);

        try {
            // In a production environment, this should call a backend endpoint
            // that proxies the OpenAI API to keep the API key secure
            const response = await this.callOpenAI(request);
            return this.parseResponse(response);
        } catch (error) {
            console.error('Error processing turn:', error);
            // Return fallback response
            return this.getFallbackResponse(gameState, actionsTaken);
        }
    }

    buildRequest(gameState, bandMembers, actionsTaken) {
        return {
            gameState: {
                bandName: gameState.band_name,
                money: gameState.money,
                fame: gameState.fame,
                currentTurn: gameState.current_turn
            },
            bandMembers: bandMembers.map(member => ({
                name: member.name,
                instrument: member.instrument,
                skill: member.skill_level,
                genre: member.genre
            })),
            actionsTaken: actionsTaken
        };
    }

    async callOpenAI(request) {
        // Try to call backend proxy first
        try {
            const response = await fetch(CONFIG.openai.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                console.warn('Backend returned error, falling back to mock response');
                return this.getMockResponse(request);
            }

            const data = await response.json();
            console.log('✓ Using OpenAI API response');
            return data;
        } catch (error) {
            console.warn('Backend not available, using mock response:', error.message);
            return this.getMockResponse(request);
        }
    }

    parseResponse(response) {
        // Validate response structure
        if (!response.updatedGameState || !response.newEmails) {
            throw new Error('Invalid response format from Game Master');
        }

        return {
            money: response.updatedGameState.money,
            fame: response.updatedGameState.fame,
            emails: response.newEmails,
            assets: response.newlyCreatedAssets || {}
        };
    }

    // Mock response for development/testing
    getMockResponse(request) {
        const { gameState, bandMembers, actionsTaken } = request;
        let newMoney = gameState.money;
        let newFame = gameState.fame;
        const emails = [];
        const assets = {};

        // Process each action
        actionsTaken.forEach(action => {
            if (action.actionType === 'RECORD_ALBUM') {
                const studio = CONFIG.game.studioLevels[action.studioLevel];
                newMoney -= studio.cost;

                // Calculate quality based on band and studio
                const avgSkill = bandMembers.reduce((sum, m) => sum + m.skill, 0) / Math.max(bandMembers.length, 1);
                const qualityScore = Math.min(100, Math.floor(avgSkill + studio.qualityBonus + Math.random() * 20));

                assets.album = {
                    name: action.albumName,
                    qualityScore: qualityScore,
                    genre: action.genre
                };

                emails.push({
                    subject: `Album '${action.albumName}' is finished!`,
                    body: `Recording your new ${action.genre} album cost $${studio.cost}. ${qualityScore > 70 ? "It sounds amazing!" : "It turned out pretty good!"} Quality score: ${qualityScore}/100.`
                });
            }

            if (action.actionType === 'GO_ON_TOUR') {
                const tour = CONFIG.game.tourTypes[action.tourType];
                newMoney -= tour.cost;

                // Tour earnings vary based on fame and randomness
                const earnings = Math.floor(tour.estimatedMoney * (0.8 + Math.random() * 0.4));
                const fameGain = Math.floor(tour.estimatedFame * (0.8 + Math.random() * 0.4));

                newMoney += earnings;
                newFame += fameGain;

                assets.tour = {
                    name: tour.name,
                    moneyMade: earnings - tour.cost,
                    fameGained: fameGain
                };

                emails.push({
                    subject: `${tour.name} Complete!`,
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

        // Deduct band member salaries
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

    getFallbackResponse(gameState, actionsTaken) {
        // If API fails, return a basic response
        return {
            money: gameState.money,
            fame: gameState.fame,
            emails: [{
                subject: 'System Message',
                body: 'There was a problem processing your turn. Please try again later.'
            }],
            assets: {}
        };
    }
}

// Create singleton instance
const gameMaster = new GameMaster();
