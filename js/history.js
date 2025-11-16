// History page logic

let currentTab = 'albums';

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

    // Setup tabs
    document.getElementById('albumsTab').addEventListener('click', () => switchTab('albums'));
    document.getElementById('toursTab').addEventListener('click', () => switchTab('tours'));
});

function loadPage() {
    // Update header
    document.getElementById('bandNameHeader').textContent = `Band: ${gameManager.gameState.band_name}`;
    document.getElementById('moneyHeader').textContent = `Cash: $${gameManager.gameState.money.toLocaleString()}`;

    // Load data
    loadAlbums();
    loadTours();
}

function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    const albumsTab = document.getElementById('albumsTab');
    const toursTab = document.getElementById('toursTab');
    const albumsContent = document.getElementById('albumsContent');
    const toursContent = document.getElementById('toursContent');

    if (tab === 'albums') {
        albumsTab.classList.add('border-primary', 'text-primary');
        albumsTab.classList.remove('border-transparent', 'text-gray-400');
        toursTab.classList.remove('border-primary', 'text-primary');
        toursTab.classList.add('border-transparent', 'text-gray-400');
        albumsContent.classList.remove('hidden');
        toursContent.classList.add('hidden');
    } else {
        toursTab.classList.add('border-primary', 'text-primary');
        toursTab.classList.remove('border-transparent', 'text-gray-400');
        albumsTab.classList.remove('border-primary', 'text-primary');
        albumsTab.classList.add('border-transparent', 'text-gray-400');
        toursContent.classList.remove('hidden');
        albumsContent.classList.add('hidden');
    }
}

function loadAlbums() {
    const tbody = document.getElementById('albumsTableBody');

    if (gameManager.albums.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-4 py-12 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-600 mb-4 block">album</span>
                    <p class="text-gray-400 text-lg font-semibold">No Albums Recorded Yet!</p>
                    <p class="text-gray-500 text-sm mt-2">Get back to the studio and make some hits!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = gameManager.albums.map(album => {
        const stars = getStars(album.quality_score);
        return `
            <tr class="border-t border-t-black/10 dark:border-t-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td class="h-[72px] px-4 py-2 w-[45%] text-slate-900 dark:text-white text-sm font-normal leading-normal">
                    ${escapeHtml(album.name)}
                </td>
                <td class="h-[72px] px-4 py-2 w-[30%] text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">
                    <div class="flex items-center gap-1 text-primary">
                        ${stars}
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${album.quality_score}/100</p>
                </td>
                <td class="h-[72px] px-4 py-2 w-[25%] text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">
                    ${escapeHtml(album.genre)}
                </td>
            </tr>
        `;
    }).join('');
}

function loadTours() {
    const tbody = document.getElementById('toursTableBody');

    if (gameManager.tours.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="px-4 py-12 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-600 mb-4 block">music_note</span>
                    <p class="text-gray-400 text-lg font-semibold">No Tours Yet!</p>
                    <p class="text-gray-500 text-sm mt-2">Hit the road and spread your music!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = gameManager.tours.map(tour => `
        <tr class="border-t border-t-black/10 dark:border-t-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td class="h-[72px] px-4 py-2 w-[40%] text-slate-900 dark:text-white text-sm font-normal leading-normal">
                ${escapeHtml(tour.name)}
            </td>
            <td class="h-[72px] px-4 py-2 w-[30%] text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">
                <span class="${tour.money_made >= 0 ? 'text-green-400' : 'text-red-400'} font-semibold">
                    ${tour.money_made >= 0 ? '+' : ''}$${tour.money_made.toLocaleString()}
                </span>
            </td>
            <td class="h-[72px] px-4 py-2 w-[30%] text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">
                <span class="text-primary font-semibold">+${tour.fame_gained}</span>
            </td>
        </tr>
    `).join('');
}

function getStars(score) {
    const starCount = Math.round((score / 100) * 5);
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < starCount) {
            stars += '<span class="material-symbols-outlined !text-lg">star</span>';
        } else {
            stars += '<span class="material-symbols-outlined !text-lg text-slate-300 dark:text-slate-600">star</span>';
        }
    }
    return stars;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
