// Dashboard page logic

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

    // Check if user has a game state
    if (!gameManager.gameState) {
        window.location.href = 'create-band.html';
        return;
    }

    // Load and display data
    await loadDashboard();

    // Setup event listeners
    setupEventListeners();
});

async function loadDashboard() {
    // Update band name
    document.getElementById('bandNameSidebar').textContent = gameManager.gameState.band_name;

    // Update stats
    updateStats();

    // Load inbox messages
    await loadInboxMessages();
}

function updateStats() {
    const { money, fame, current_turn } = gameManager.gameState;

    // Update turn
    document.getElementById('currentTurn').textContent = `Turn ${current_turn}`;

    // Update money
    const moneyDisplay = document.getElementById('moneyDisplay');
    moneyDisplay.textContent = `$${money.toLocaleString()}`;
    moneyDisplay.classList.toggle('text-red-400', money < 0);
    moneyDisplay.classList.toggle('text-white', money >= 0);

    // Update money bar (show progress to initial money * 2)
    const moneyTarget = CONFIG.game.initialMoney * 2;
    const moneyPercent = Math.max(0, Math.min(100, (money / moneyTarget) * 100));
    document.getElementById('moneyBar').style.width = `${moneyPercent}%`;

    // Update fame
    document.getElementById('fameDisplay').textContent = fame.toLocaleString();

    // Update fame bar (progress to win condition)
    const famePercent = Math.min(100, (fame / CONFIG.game.winFameTarget) * 100);
    document.getElementById('fameBar').style.width = `${famePercent}%`;

    // Update counts
    document.getElementById('albumCount').textContent = gameManager.albums.length;
    document.getElementById('tourCount').textContent = gameManager.tours.length;
}

async function loadInboxMessages() {
    const container = document.getElementById('inboxContainer');

    if (gameManager.messages.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center">
                <span class="material-symbols-outlined text-6xl text-gray-600 mb-4 block">inbox</span>
                <p class="text-gray-400 text-lg font-semibold">No messages yet!</p>
                <p class="text-gray-500 text-sm mt-2">Take some actions and click "END TURN" to see results.</p>
            </div>
        `;
        return;
    }

    // Sort messages by turn (newest first)
    const sortedMessages = [...gameManager.messages].sort((a, b) => b.turn_received - a.turn_received);

    container.innerHTML = sortedMessages.map(message => `
        <div class="flex items-center gap-4 py-4 justify-between hover:bg-white/5 -mx-4 px-4 rounded-lg cursor-pointer message-item" data-message-id="${message.id}">
            <div class="flex items-start gap-4 flex-1">
                <div class="relative shrink-0 size-12 flex items-center justify-center">
                    ${!message.is_read ? '<div class="absolute top-1 left-1 size-2 rounded-full bg-primary unread-dot"></div>' : ''}
                    <div class="text-primary flex items-center justify-center rounded-lg ${message.is_read ? 'bg-white/10' : 'bg-primary/20'} size-12">
                        <span class="material-symbols-outlined text-2xl">${getMessageIcon(message.subject)}</span>
                    </div>
                </div>
                <div class="flex flex-1 flex-col justify-center gap-1">
                    <p class="text-white text-base ${!message.is_read ? 'font-semibold' : 'font-medium'} leading-normal">${escapeHtml(message.subject)}</p>
                    <p class="text-gray-400 text-sm font-normal leading-normal truncate">${escapeHtml(message.body)}</p>
                    <p class="text-gray-500 text-xs font-normal leading-normal">Turn ${message.turn_received}</p>
                </div>
            </div>
            <button class="shrink-0 text-primary text-sm font-semibold leading-normal px-4 py-2 rounded-md hover:bg-primary/20">Read</button>
        </div>
    `).join('');

    // Add click listeners to message items
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const messageId = item.dataset.messageId;
            const message = gameManager.messages.find(m => m.id === messageId);
            if (message) {
                openMessageModal(message);
            }
        });
    });
}

function getMessageIcon(subject) {
    const lower = subject.toLowerCase();
    if (lower.includes('album') || lower.includes('recording')) return 'album';
    if (lower.includes('tour') || lower.includes('gig')) return 'music_note';
    if (lower.includes('welcome')) return 'celebration';
    if (lower.includes('payroll') || lower.includes('money')) return 'paid';
    if (lower.includes('fame') || lower.includes('magazine') || lower.includes('radio')) return 'star';
    if (lower.includes('problem') || lower.includes('broke')) return 'error';
    return 'mail';
}

function openMessageModal(message) {
    document.getElementById('modalSubject').textContent = message.subject;
    document.getElementById('modalBody').textContent = message.body;
    document.getElementById('messageModal').classList.remove('hidden');
    document.getElementById('messageModal').classList.add('flex');

    // Mark as read
    if (!message.is_read) {
        db.markMessageAsRead(message.id);
        message.is_read = true;
        loadInboxMessages(); // Refresh to remove unread indicator
    }
}

function closeMessageModal() {
    document.getElementById('messageModal').classList.add('hidden');
    document.getElementById('messageModal').classList.remove('flex');
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await db.signOut();
    });

    // End turn button
    document.getElementById('endTurnBtn').addEventListener('click', handleEndTurn);

    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeMessageModal);
    document.getElementById('modalOkBtn').addEventListener('click', closeMessageModal);

    // Close modal on backdrop click
    document.getElementById('messageModal').addEventListener('click', (e) => {
        if (e.target.id === 'messageModal') {
            closeMessageModal();
        }
    });
}

async function handleEndTurn() {
    const btn = document.getElementById('endTurnBtn');

    // Disable button
    btn.disabled = true;
    btn.textContent = 'Processing...';

    // Show loading overlay
    document.getElementById('loadingOverlay').classList.remove('hidden');
    document.getElementById('loadingOverlay').classList.add('flex');

    try {
        // Process the turn
        const success = await gameManager.endTurn();

        if (success) {
            // Reload dashboard
            await loadDashboard();

            // Hide loading overlay
            document.getElementById('loadingOverlay').classList.add('hidden');
            document.getElementById('loadingOverlay').classList.remove('flex');

            // Check for game end conditions
            const result = gameManager.checkGameEndConditions();
            if (result) {
                // Game ended - modal will be shown by game manager
                return;
            }
        } else {
            alert('Failed to process turn. Please try again.');
        }
    } catch (error) {
        console.error('Error processing turn:', error);
        alert('An error occurred. Please try again.');
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'END TURN';

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('loadingOverlay').classList.remove('flex');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
