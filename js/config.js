// Configuration file for Band Manager Simulation
// In production, these values should come from environment variables or a backend

const CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL', // Replace with your Supabase project URL
        anonKey: 'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key
    },
    openai: {
        // NOTE: In production, API calls should go through a backend proxy
        // to keep your API key secure. Never expose API keys in frontend code.
        apiKey: 'YOUR_OPENAI_API_KEY', // This should be handled by a backend
        model: 'gpt-4o-mini', // Cost-effective model for game logic
        endpoint: '/api/game-master' // Backend endpoint to proxy OpenAI requests
    },
    game: {
        initialMoney: 5000,
        initialFame: 0,
        winFameTarget: 1000,
        loseMoneyThreshold: -1000,
        studioLevels: {
            FREE: { cost: 0, qualityBonus: 0, name: "Mom's Garage" },
            LOW: { cost: 500, qualityBonus: 10, name: 'Local Studio' },
            HIGH: { cost: 5000, qualityBonus: 30, name: 'Pro Sound Factory' }
        },
        tourTypes: {
            LOCAL_GIGS: {
                minFame: 0,
                cost: 500,
                name: 'Local Gigs',
                estimatedMoney: 2000,
                estimatedFame: 20
            },
            REGIONAL_TOUR: {
                minFame: 100,
                cost: 2000,
                name: 'Regional Tour',
                estimatedMoney: 8000,
                estimatedFame: 80
            },
            WORLD_TOUR: {
                minFame: 500,
                cost: 10000,
                name: 'World Tour',
                estimatedMoney: 50000,
                estimatedFame: 400
            }
        },
        genres: ['Rock', 'Pop', 'Hip-Hop', 'Punk', 'Electronic', 'Country', 'Jazz', 'Metal'],
        instruments: ['Guitar', 'Bass', 'Drums', 'Vocals', 'Keyboard', 'Saxophone']
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
