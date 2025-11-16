// Hall of Fame page logic

document.addEventListener('DOMContentLoaded', async () => {
    await db.init();

    // Check authentication (optional for this page)
    await db.getCurrentUser();

    // Load hall of fame
    await loadHallOfFame();
});

async function loadHallOfFame() {
    try {
        const entries = await db.getHallOfFame(10);

        const container = document.getElementById('hallOfFameList');
        const emptyState = document.getElementById('emptyState');

        if (entries.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        container.innerHTML = entries.map((entry, index) => {
            const rank = index + 1;
            const trophy = getTrophy(rank);
            const date = new Date(entry.date_achieved).toLocaleDateString();

            return `
                <div class="rounded-xl bg-white/5 border ${rank <= 3 ? 'border-primary/50' : 'border-white/10'} p-6 transition-all hover:bg-white/10">
                    <div class="flex items-center gap-4">
                        <!-- Rank -->
                        <div class="flex-shrink-0">
                            <div class="w-16 h-16 rounded-full ${rank <= 3 ? 'bg-primary/20' : 'bg-white/5'} flex items-center justify-center">
                                ${trophy}
                            </div>
                        </div>

                        <!-- Band Info -->
                        <div class="flex-1">
                            <div class="flex items-baseline gap-2 mb-1">
                                <h3 class="text-2xl font-black text-white">${escapeHtml(entry.band_name)}</h3>
                                ${rank <= 3 ? `<span class="text-xs font-bold text-primary uppercase tracking-wider">Legend</span>` : ''}
                            </div>
                            <p class="text-sm text-gray-400">Inducted: ${date}</p>
                        </div>

                        <!-- Fame Score -->
                        <div class="text-right flex-shrink-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="material-symbols-outlined text-primary">star</span>
                                <p class="text-3xl font-black text-primary">${entry.final_fame_score.toLocaleString()}</p>
                            </div>
                            <p class="text-xs text-gray-400 uppercase tracking-wider">Fame</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading hall of fame:', error);
        document.getElementById('hallOfFameList').innerHTML = `
            <div class="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
                <span class="material-symbols-outlined text-red-400 text-4xl mb-2 block">error</span>
                <p class="text-red-300">Failed to load Hall of Fame. Please try again later.</p>
            </div>
        `;
    }
}

function getTrophy(rank) {
    if (rank === 1) {
        return '<span class="material-symbols-outlined trophy-gold text-4xl" style="font-variation-settings: \'FILL\' 1;">emoji_events</span>';
    } else if (rank === 2) {
        return '<span class="material-symbols-outlined trophy-silver text-4xl" style="font-variation-settings: \'FILL\' 1;">emoji_events</span>';
    } else if (rank === 3) {
        return '<span class="material-symbols-outlined trophy-bronze text-4xl" style="font-variation-settings: \'FILL\' 1;">emoji_events</span>';
    } else {
        return `<span class="text-2xl font-black text-gray-400">#${rank}</span>`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
