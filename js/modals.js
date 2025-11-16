// Game Over / Win Modals

function showGameOverModal(result, gameState) {
    const modalHtml = result === 'win' ? getWinModalHtml(gameState) : getLoseModalHtml(gameState);

    // Create modal element
    const modalDiv = document.createElement('div');
    modalDiv.id = 'gameOverModal';
    modalDiv.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modalDiv.innerHTML = modalHtml;

    document.body.appendChild(modalDiv);

    // Setup event listeners
    setupGameOverListeners(result);
}

function getWinModalHtml(gameState) {
    return `
        <div class="bg-background-dark rounded-xl border border-primary p-8 max-w-lg w-full shadow-2xl text-center">
            <div class="mb-6">
                <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-4 animate-bounce">
                    <span class="material-symbols-outlined text-6xl text-primary" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                </div>
                <h2 class="text-4xl font-black text-white mb-2">HALL OF FAME!</h2>
                <p class="text-xl text-primary font-bold mb-4">You're a Legend!</p>
            </div>

            <div class="bg-white/5 rounded-lg p-6 mb-6">
                <p class="text-gray-300 text-lg mb-4">
                    Congratulations! <strong class="text-primary">${gameState.band_name}</strong> has reached <strong>${gameState.fame}</strong> fame and will be forever remembered in the Band Manager Hall of Fame!
                </p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-white/5 p-3 rounded">
                        <p class="text-gray-400">Final Money</p>
                        <p class="text-white font-bold text-lg">$${gameState.money.toLocaleString()}</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded">
                        <p class="text-gray-400">Final Fame</p>
                        <p class="text-primary font-bold text-lg">${gameState.fame.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <button id="viewHallOfFameBtn" class="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all">
                    View Hall of Fame
                </button>
                <button id="playAgainBtn" class="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all">
                    Start a New Band
                </button>
            </div>
        </div>
    `;
}

function getLoseModalHtml(gameState) {
    return `
        <div class="bg-background-dark rounded-xl border border-red-500/50 p-8 max-w-lg w-full shadow-2xl text-center">
            <div class="mb-6">
                <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-4">
                    <span class="material-symbols-outlined text-6xl text-red-400">sentiment_dissatisfied</span>
                </div>
                <h2 class="text-4xl font-black text-white mb-2">Game Over</h2>
                <p class="text-xl text-red-400 font-bold mb-4">The Band Broke Up</p>
            </div>

            <div class="bg-white/5 rounded-lg p-6 mb-6">
                <p class="text-gray-300 text-lg mb-4">
                    Oh no! <strong class="text-red-400">${gameState.band_name}</strong> ran out of money and had to break up.
                    You ended with <strong>$${gameState.money.toLocaleString()}</strong> and <strong>${gameState.fame}</strong> fame.
                </p>
                <p class="text-gray-400 text-sm">
                    Don't give up! Every famous band had to start somewhere. Learn from your mistakes and try again!
                </p>
            </div>

            <div class="flex flex-col gap-3">
                <button id="tryAgainBtn" class="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all">
                    Try Again
                </button>
                <button id="viewStatsBtn" class="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all">
                    View My Stats
                </button>
            </div>
        </div>
    `;
}

function setupGameOverListeners(result) {
    if (result === 'win') {
        document.getElementById('viewHallOfFameBtn').addEventListener('click', () => {
            window.location.href = 'hall-of-fame.html';
        });

        document.getElementById('playAgainBtn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to start a new band? This will delete your current progress.')) {
                await gameManager.resetGame();
                window.location.href = 'create-band.html';
            }
        });
    } else {
        document.getElementById('tryAgainBtn').addEventListener('click', async () => {
            if (confirm('Start a new band? This will delete your current progress.')) {
                await gameManager.resetGame();
                window.location.href = 'create-band.html';
            }
        });

        document.getElementById('viewStatsBtn').addEventListener('click', () => {
            window.location.href = 'biography.html';
        });
    }
}
