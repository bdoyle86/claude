// Band Members page logic

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
    await loadPage();
});

async function loadPage() {
    updateHeader();
    await loadCurrentRoster();
    await loadRecruits();
}

function updateHeader() {
    const { money, fame } = gameManager.gameState;
    document.getElementById('moneyHeader').textContent = `Money: $${money.toLocaleString()}`;
    document.getElementById('fameHeader').textContent = `Fame: ${fame}`;
}

async function loadCurrentRoster() {
    const container = document.getElementById('rosterContainer');

    if (gameManager.bandMembers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <span class="material-symbols-outlined text-6xl text-gray-600 mb-4 block">person_off</span>
                <p class="text-gray-400 text-lg font-semibold">No band members yet!</p>
                <p class="text-gray-500 text-sm mt-2">Recruit some talented musicians to get started.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = gameManager.bandMembers.map(member => `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border dark:border-border-dark dark:bg-surface-dark">
            <div class="flex-1 space-y-3">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary">person</span>
                    <p class="text-white text-lg font-bold">${escapeHtml(member.name)}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p class="text-white/60">Instrument</p>
                        <p class="text-white font-medium">${escapeHtml(member.instrument)}</p>
                    </div>
                    <div>
                        <p class="text-white/60">Genre</p>
                        <p class="text-white font-medium">${escapeHtml(member.genre)}</p>
                    </div>
                    <div>
                        <p class="text-white/60">Salary</p>
                        <p class="text-white font-medium">$${member.salary_per_turn || 0}/turn</p>
                    </div>
                    <div>
                        <p class="text-white/60">Skill</p>
                        <div class="flex items-center gap-2">
                            <div class="w-20 overflow-hidden rounded-full bg-border-dark h-1.5">
                                <div class="h-full rounded-full bg-primary" style="width: ${member.skill_level}%;"></div>
                            </div>
                            <p class="text-white text-xs font-medium">${member.skill_level}</p>
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="fireMember('${member.id}')" class="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 font-bold text-sm">
                <span class="material-symbols-outlined !text-base">cancel</span>
                <span>Fire</span>
            </button>
        </div>
    `).join('');
}

async function loadRecruits() {
    const container = document.getElementById('recruitsContainer');
    const recruits = gameManager.getAvailableRecruits();

    container.innerHTML = recruits.map(recruit => `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border dark:border-border-dark dark:bg-surface-dark">
            <div class="flex-1 space-y-3">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-white/60">person</span>
                    <p class="text-white text-lg font-bold">${escapeHtml(recruit.name)}</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p class="text-white/60">Instrument</p>
                        <p class="text-white font-medium">${escapeHtml(recruit.instrument)}</p>
                    </div>
                    <div>
                        <p class="text-white/60">Genre</p>
                        <p class="text-white font-medium">${escapeHtml(recruit.genre)}</p>
                    </div>
                    <div>
                        <p class="text-white/60">Signing Bonus</p>
                        <p class="text-white font-medium">$${recruit.signing_bonus}</p>
                    </div>
                    <div>
                        <p class="text-white/60">Skill</p>
                        <div class="flex items-center gap-2">
                            <div class="w-20 overflow-hidden rounded-full bg-border-dark h-1.5">
                                <div class="h-full rounded-full bg-white/80" style="width: ${recruit.skill_level}%;"></div>
                            </div>
                            <p class="text-white text-xs font-medium">${recruit.skill_level}</p>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-gray-400">Salary: $${recruit.salary_per_turn}/turn</p>
            </div>
            <button onclick='hireMember(${JSON.stringify(recruit)})' class="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 font-bold text-sm">
                <span class="material-symbols-outlined !text-base">add_circle</span>
                <span>Hire</span>
            </button>
        </div>
    `).join('');
}

async function hireMember(recruit) {
    try {
        // Check if user can afford
        if (gameManager.gameState.money < recruit.signing_bonus) {
            alert(`Not enough money! You need $${recruit.signing_bonus} but only have $${gameManager.gameState.money}.`);
            return;
        }

        // Confirm
        const confirmed = confirm(
            `Hire ${recruit.name}?\n\n` +
            `Signing Bonus: $${recruit.signing_bonus}\n` +
            `Salary: $${recruit.salary_per_turn}/turn\n` +
            `Skill: ${recruit.skill_level}\n\n` +
            `This will deduct $${recruit.signing_bonus} from your money.`
        );

        if (!confirmed) return;

        // Hire the member
        await gameManager.hireBandMember(recruit);

        // Reload page
        await loadPage();

        alert(`${recruit.name} has joined your band!`);
    } catch (error) {
        console.error('Error hiring member:', error);
        alert('Failed to hire member: ' + error.message);
    }
}

async function fireMember(memberId) {
    const member = gameManager.bandMembers.find(m => m.id === memberId);
    if (!member) return;

    const confirmed = confirm(
        `Fire ${member.name}?\n\n` +
        `This action cannot be undone. They will leave the band immediately.`
    );

    if (!confirmed) return;

    try {
        await gameManager.fireBandMember(memberId);
        await loadPage();
        alert(`${member.name} has left the band.`);
    } catch (error) {
        console.error('Error firing member:', error);
        alert('Failed to fire member: ' + error.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
