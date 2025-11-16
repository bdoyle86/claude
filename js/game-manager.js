// Game Manager - Handles game state and turn processing
// This is the main game logic controller

class GameManager {
    constructor() {
        this.gameState = null;
        this.bandMembers = [];
        this.albums = [];
        this.tours = [];
        this.messages = [];
        this.actionQueue = [];
        this.isProcessingTurn = false;
    }

    // Initialize game manager
    async init() {
        try {
            await this.loadGameData();
            return true;
        } catch (error) {
            console.error('Failed to initialize game manager:', error);
            return false;
        }
    }

    // Load all game data from database
    async loadGameData() {
        this.gameState = await db.getGameState();

        if (this.gameState) {
            this.bandMembers = await db.getBandMembers();
            this.albums = await db.getAlbums();
            this.tours = await db.getTours();
            this.messages = await db.getInboxMessages();
        }

        return this.gameState;
    }

    // Create a new game
    async createNewGame(bandName) {
        try {
            this.gameState = await db.createGameState(bandName);

            // Add welcome message
            await db.addInboxMessage({
                turn_received: 1,
                subject: 'Welcome to Band Manager!',
                body: `Welcome, ${bandName}! You're starting with $${CONFIG.game.initialMoney}. Recruit band members, record albums, and go on tour to build your fame. Good luck!`,
                is_read: false
            });

            await this.loadGameData();
            return this.gameState;
        } catch (error) {
            console.error('Failed to create new game:', error);
            throw error;
        }
    }

    // Queue an action for the current turn
    queueAction(action) {
        this.actionQueue.push(action);
    }

    // Clear all queued actions
    clearActionQueue() {
        this.actionQueue = [];
    }

    // Get current action queue
    getActionQueue() {
        return [...this.actionQueue];
    }

    // Process end of turn
    async endTurn() {
        if (this.isProcessingTurn) {
            console.warn('Turn is already being processed');
            return false;
        }

        this.isProcessingTurn = true;

        try {
            // Get fresh data
            await this.loadGameData();

            // Process the turn through Game Master
            const result = await gameMaster.processTurn(
                this.gameState,
                this.bandMembers,
                this.actionQueue
            );

            // Update game state
            const newTurn = this.gameState.current_turn + 1;
            this.gameState = await db.updateGameState({
                money: result.money,
                fame: result.fame,
                current_turn: newTurn
            });

            // Add new emails
            for (const email of result.emails) {
                await db.addInboxMessage({
                    turn_received: newTurn,
                    subject: email.subject,
                    body: email.body,
                    is_read: false
                });
            }

            // Save new assets
            if (result.assets.album) {
                await db.addAlbum({
                    name: result.assets.album.name,
                    quality_score: result.assets.album.qualityScore,
                    genre: result.assets.album.genre,
                    total_money_made: 0,
                    turn_created: newTurn
                });
            }

            if (result.assets.tour) {
                await db.addTour({
                    name: result.assets.tour.name,
                    money_made: result.assets.tour.moneyMade,
                    fame_gained: result.assets.tour.fameGained,
                    turn_completed: newTurn
                });
            }

            // Clear action queue
            this.clearActionQueue();

            // Reload all data
            await this.loadGameData();

            // Check win/lose conditions
            this.checkGameEndConditions();

            return true;
        } catch (error) {
            console.error('Failed to process turn:', error);
            return false;
        } finally {
            this.isProcessingTurn = false;
        }
    }

    // Check if game has ended (win or lose)
    checkGameEndConditions() {
        // Check lose condition
        if (this.gameState.money < CONFIG.game.loseMoneyThreshold) {
            this.triggerGameOver('lose');
            return 'lose';
        }

        // Check win condition
        if (this.gameState.fame >= CONFIG.game.winFameTarget) {
            this.triggerGameOver('win');
            return 'win';
        }

        return null;
    }

    // Trigger game over
    async triggerGameOver(result) {
        if (result === 'win') {
            // Add to hall of fame
            await db.addToHallOfFame(
                this.gameState.band_name,
                this.gameState.fame
            );

            // Show win modal
            if (typeof showGameOverModal === 'function') {
                showGameOverModal('win', this.gameState);
            }
        } else {
            // Show lose modal
            if (typeof showGameOverModal === 'function') {
                showGameOverModal('lose', this.gameState);
            }
        }
    }

    // Hire a band member
    async hireBandMember(member) {
        // Check if player can afford it
        if (member.signing_bonus && this.gameState.money < member.signing_bonus) {
            throw new Error('Not enough money to hire this member');
        }

        // Deduct signing bonus
        if (member.signing_bonus) {
            await db.updateGameState({
                money: this.gameState.money - member.signing_bonus
            });
        }

        // Add member
        await db.addBandMember({
            name: member.name,
            instrument: member.instrument,
            skill_level: member.skill_level,
            genre: member.genre,
            salary_per_turn: member.salary_per_turn
        });

        // Reload data
        await this.loadGameData();
    }

    // Fire a band member
    async fireBandMember(memberId) {
        await db.removeBandMember(memberId);
        await this.loadGameData();
    }

    // Get available recruits (static list for now)
    getAvailableRecruits() {
        const recruits = [
            {
                name: 'Jaxx Static',
                instrument: 'Bass',
                skill_level: 60,
                genre: 'Metal',
                salary_per_turn: 200,
                signing_bonus: 500
            },
            {
                name: 'Vivi Vandal',
                instrument: 'Vocals',
                skill_level: 78,
                genre: 'Pop-Punk',
                salary_per_turn: 300,
                signing_bonus: 750
            },
            {
                name: 'Spike',
                instrument: 'Keyboard',
                skill_level: 55,
                genre: 'Synthwave',
                salary_per_turn: 150,
                signing_bonus: 400
            },
            {
                name: 'Luna Eclipse',
                instrument: 'Guitar',
                skill_level: 82,
                genre: 'Rock',
                salary_per_turn: 350,
                signing_bonus: 1000
            },
            {
                name: 'Thunder',
                instrument: 'Drums',
                skill_level: 70,
                genre: 'Punk',
                salary_per_turn: 250,
                signing_bonus: 600
            }
        ];

        return recruits;
    }

    // Reset the game
    async resetGame() {
        await db.resetGame();
        this.gameState = null;
        this.bandMembers = [];
        this.albums = [];
        this.tours = [];
        this.messages = [];
        this.actionQueue = [];
    }

    // Get game statistics for biography
    getGameStats() {
        const bestAlbum = this.albums.reduce((best, album) => {
            return !best || album.quality_score > best.quality_score ? album : best;
        }, null);

        const totalEarnings = this.tours.reduce((sum, tour) => sum + tour.money_made, 0);

        return {
            bandName: this.gameState?.band_name || 'Unknown',
            memberCount: this.bandMembers.length,
            albumCount: this.albums.length,
            tourCount: this.tours.length,
            bestAlbum: bestAlbum,
            totalEarnings: totalEarnings,
            currentTurn: this.gameState?.current_turn || 1,
            currentMoney: this.gameState?.money || 0,
            currentFame: this.gameState?.fame || 0
        };
    }
}

// Create singleton instance
const gameManager = new GameManager();
