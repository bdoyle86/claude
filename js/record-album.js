// Record Album page logic

let selectedStudio = null;

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
    // Update money display
    document.getElementById('moneyDisplay').textContent = `$${gameManager.gameState.money.toLocaleString()}`;

    // Populate genres
    const genreSelect = document.getElementById('albumGenre');
    CONFIG.game.genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });

    // Populate studio options
    loadStudioOptions();

    // Setup form
    document.getElementById('albumForm').addEventListener('submit', handleSubmit);
}

function loadStudioOptions() {
    const container = document.getElementById('studioOptions');
    const studios = CONFIG.game.studioLevels;

    container.innerHTML = Object.entries(studios).map(([key, studio]) => {
        const canAfford = gameManager.gameState.money >= studio.cost;
        return `
            <div
                class="flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all studio-option ${!canAfford ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-white/20' : 'border-gray-300 dark:border-white/20 hover:border-primary hover:bg-primary/20'}"
                data-studio="${key}"
                ${!canAfford ? 'data-disabled="true"' : ''}
            >
                ${selectedStudio === key ? '<div class="flex items-center justify-between"><p class="text-gray-900 dark:text-white text-lg font-bold leading-normal">' + studio.name + '</p><span class="material-symbols-outlined text-primary text-2xl">check_circle</span></div>' : '<p class="text-gray-900 dark:text-white text-lg font-bold leading-normal">' + studio.name + '</p>'}
                <p class="text-gray-700 dark:text-gray-300 text-sm font-normal leading-normal">
                    ${studio.cost === 0 ? 'Free but noisy!' : studio.qualityBonus > 20 ? 'Top-tier sound for a future hit!' : 'Decent quality for a fair price.'}
                </p>
                <p class="text-gray-800 dark:text-white text-base font-bold leading-normal">
                    $${studio.cost.toLocaleString()}
                    ${!canAfford ? ' <span class="text-red-400 text-xs">(Cannot afford)</span>' : ''}
                </p>
            </div>
        `;
    }).join('');

    // Add click listeners
    document.querySelectorAll('.studio-option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.dataset.disabled) {
                alert('Not enough money for this studio!');
                return;
            }

            selectedStudio = option.dataset.studio;
            loadStudioOptions(); // Refresh to show selection
        });
    });

    // Pre-select the first affordable option
    if (!selectedStudio) {
        for (const [key, studio] of Object.entries(studios)) {
            if (gameManager.gameState.money >= studio.cost) {
                selectedStudio = key;
                break;
            }
        }
        loadStudioOptions();
    }
}

function handleSubmit(e) {
    e.preventDefault();

    const albumName = document.getElementById('albumName').value.trim();
    const genre = document.getElementById('albumGenre').value;

    if (!albumName || !genre || !selectedStudio) {
        alert('Please fill in all fields and select a studio!');
        return;
    }

    const studio = CONFIG.game.studioLevels[selectedStudio];

    // Check if can afford
    if (gameManager.gameState.money < studio.cost) {
        alert(`Not enough money! This studio costs $${studio.cost} but you only have $${gameManager.gameState.money}.`);
        return;
    }

    // Confirm
    const confirmed = confirm(
        `Record "${albumName}"?\n\n` +
        `Genre: ${genre}\n` +
        `Studio: ${studio.name}\n` +
        `Cost: $${studio.cost}\n\n` +
        `This action will be queued for your next turn.`
    );

    if (!confirmed) return;

    // Queue the action
    gameManager.queueAction({
        actionType: 'RECORD_ALBUM',
        albumName: albumName,
        genre: genre,
        studioLevel: selectedStudio
    });

    // Show success message
    const successMsg = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = `Recording for "${albumName}" is booked! Click "END TURN" on the dashboard to start the session.`;
    successMsg.classList.remove('hidden');

    // Reset form
    document.getElementById('albumForm').reset();
    selectedStudio = null;
    loadStudioOptions();

    // Scroll to success message
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Redirect after a delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}
