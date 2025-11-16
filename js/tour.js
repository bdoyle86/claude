// Tour page logic

document.addEventListener('DOMContentLoaded', async () => {
    await db.init();

    // Check authentication
    const user = await db.getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize game manager
    await gameManager.init();

    if (!gameManager.gameState) {
        window.location.href = 'create-band.html';
        return;
    }

    // Load page
    loadPage();
});

function loadPage() {
    // Update displays
    document.getElementById('moneyDisplay').textContent = `$${gameManager.gameState.money.toLocaleString()}`;
    document.getElementById('fameDisplay').textContent = gameManager.gameState.fame.toLocaleString();

    // Load tour options
    loadTourOptions();
}

function loadTourOptions() {
    const container = document.getElementById('tourOptions');
    const tours = CONFIG.game.tourTypes;
    const currentFame = gameManager.gameState.fame;
    const currentMoney = gameManager.gameState.money;

    container.innerHTML = Object.entries(tours).map(([key, tour]) => {
        const isUnlocked = currentFame >= tour.minFame;
        const canAfford = currentMoney >= tour.cost;
        const isAvailable = isUnlocked && canAfford;

        return `
            <div class="rounded-xl border-2 p-6 transition-all ${
                isAvailable
                    ? 'border-white/20 hover:border-primary hover:bg-primary/10 cursor-pointer'
                    : 'border-white/10 opacity-50'
            }" ${isAvailable ? `onclick='selectTour("${key}")'` : ''}>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="material-symbols-outlined text-3xl ${isAvailable ? 'text-primary' : 'text-gray-500'}">
                                ${key === 'LOCAL_GIGS' ? 'location_city' : key === 'REGIONAL_TOUR' ? 'map' : 'public'}
                            </span>
                            <div>
                                <h3 class="text-xl font-bold ${isAvailable ? 'text-white' : 'text-gray-500'}">${tour.name}</h3>
                                ${!isUnlocked ? `<p class="text-xs text-red-400">Requires ${tour.minFame} Fame (You have ${currentFame})</p>` : ''}
                                ${isUnlocked && !canAfford ? `<p class="text-xs text-red-400">Cannot afford (Need $${tour.cost})</p>` : ''}
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p class="text-gray-400">Cost</p>
                                <p class="font-bold ${isAvailable ? 'text-white' : 'text-gray-500'}">$${tour.cost.toLocaleString()}</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Est. Earnings</p>
                                <p class="font-bold text-green-400">~$${tour.estimatedMoney.toLocaleString()}</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Est. Fame</p>
                                <p class="font-bold text-primary">+${tour.estimatedFame}</p>
                            </div>
                        </div>

                        ${isAvailable ? `
                            <div class="mt-3 text-sm text-gray-300">
                                <p>Potential profit: <span class="font-bold text-green-400">~$${(tour.estimatedMoney - tour.cost).toLocaleString()}</span></p>
                            </div>
                        ` : ''}
                    </div>

                    ${isAvailable ? `
                        <button class="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-bold text-white transition-all whitespace-nowrap">
                            <span class="material-symbols-outlined">rocket_launch</span>
                            <span>Book Tour</span>
                        </button>
                    ` : `
                        <div class="flex items-center gap-2 px-6 py-3 bg-gray-600/20 rounded-lg font-bold text-gray-500 whitespace-nowrap">
                            <span class="material-symbols-outlined">lock</span>
                            <span>Locked</span>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function selectTour(tourType) {
    const tour = CONFIG.game.tourTypes[tourType];

    // Confirm
    const confirmed = confirm(
        `Book ${tour.name}?\n\n` +
        `Cost: $${tour.cost.toLocaleString()}\n` +
        `Est. Earnings: ~$${tour.estimatedMoney.toLocaleString()}\n` +
        `Est. Fame: +${tour.estimatedFame}\n` +
        `Potential Profit: ~$${(tour.estimatedMoney - tour.cost).toLocaleString()}\n\n` +
        `This action will be queued for your next turn.`
    );

    if (!confirmed) return;

    // Queue the action
    gameManager.queueAction({
        actionType: 'GO_ON_TOUR',
        tourType: tourType
    });

    // Show success message
    const successMsg = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = `${tour.name} is booked! Click "END TURN" on the dashboard to hit the road.`;
    successMsg.classList.remove('hidden');

    // Scroll to success message
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Redirect after a delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}
