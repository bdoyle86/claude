// Biography page logic

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
    loadBiography();
});

function loadBiography() {
    const stats = gameManager.getGameStats();

    // Update title
    document.getElementById('biographyTitle').textContent = stats.bandName;

    // Generate biography text
    const biographyText = generateBiography(stats);
    const container = document.getElementById('biographyText');
    container.innerHTML = biographyText.map(para => `<p>${para}</p>`).join('');

    // Update stats
    document.getElementById('memberCount').textContent = stats.memberCount;
    document.getElementById('albumCount').textContent = stats.albumCount;
    document.getElementById('tourCount').textContent = stats.tourCount;
    document.getElementById('turnCount').textContent = stats.currentTurn;

    document.getElementById('currentMoney').textContent = `$${stats.currentMoney.toLocaleString()}`;
    document.getElementById('currentFame').textContent = stats.currentFame.toLocaleString();

    // Show best album
    if (stats.bestAlbum) {
        const stars = getStars(stats.bestAlbum.quality_score);
        document.getElementById('bestAlbumContent').innerHTML = `
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <p class="text-2xl font-bold text-white mb-2">${escapeHtml(stats.bestAlbum.name)}</p>
                    <p class="text-gray-400 mb-2">Genre: ${escapeHtml(stats.bestAlbum.genre)}</p>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1 text-primary">${stars}</div>
                        <span class="text-sm text-gray-400">${stats.bestAlbum.quality_score}/100</span>
                    </div>
                </div>
                <div class="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-primary text-3xl">album</span>
                </div>
            </div>
        `;
    }
}

function generateBiography(stats) {
    const paragraphs = [];

    // Opening paragraph
    if (stats.currentTurn === 1) {
        paragraphs.push(
            `<strong>${stats.bandName}</strong> was just formed! The journey to stardom is about to begin.`
        );
    } else {
        paragraphs.push(
            `<strong>${stats.bandName}</strong> was formed ${stats.currentTurn} turns ago and has been rocking ever since.`
        );
    }

    // Band members
    if (stats.memberCount === 0) {
        paragraphs.push(
            `The band currently has no members. Time to start recruiting some talent!`
        );
    } else if (stats.memberCount === 1) {
        paragraphs.push(
            `The band is a solo act with just one talented musician holding down the fort.`
        );
    } else {
        paragraphs.push(
            `The band has grown to ${stats.memberCount} talented members, each bringing their unique sound and style to the group.`
        );
    }

    // Albums
    if (stats.albumCount === 0) {
        paragraphs.push(
            `They haven't recorded any albums yet, but great things are on the horizon!`
        );
    } else if (stats.albumCount === 1) {
        paragraphs.push(
            `They've recorded their first album${stats.bestAlbum ? `, <em>"${stats.bestAlbum.name}"</em>` : ''}, marking the beginning of their discography.`
        );
    } else {
        paragraphs.push(
            `They have recorded ${stats.albumCount} albums so far${stats.bestAlbum ? `, with <em>"${stats.bestAlbum.name}"</em> being their highest-rated work with a quality score of ${stats.bestAlbum.quality_score}/100` : ''}.`
        );
    }

    // Tours
    if (stats.tourCount === 0) {
        paragraphs.push(
            `The band hasn't hit the road yet. Perhaps it's time to book a tour and connect with the fans!`
        );
    } else if (stats.tourCount === 1) {
        paragraphs.push(
            `They've completed their first tour, gaining valuable experience performing live.`
        );
    } else {
        paragraphs.push(
            `The band has completed ${stats.tourCount} tours, earning a total of $${stats.totalEarnings.toLocaleString()} from their live performances.`
        );
    }

    // Current status
    if (stats.currentMoney < 0) {
        paragraphs.push(
            `Currently, the band is struggling financially with $${Math.abs(stats.currentMoney).toLocaleString()} in debt. They need to make money fast or risk breaking up!`
        );
    } else if (stats.currentMoney < CONFIG.game.initialMoney) {
        paragraphs.push(
            `The band has $${stats.currentMoney.toLocaleString()} in the bank. Things are tight, but they're managing.`
        );
    } else if (stats.currentMoney >= CONFIG.game.initialMoney * 5) {
        paragraphs.push(
            `With $${stats.currentMoney.toLocaleString()} in the bank, the band is doing incredibly well financially!`
        );
    } else {
        paragraphs.push(
            `The band has $${stats.currentMoney.toLocaleString()} saved up and is growing steadily.`
        );
    }

    // Fame status
    if (stats.currentFame === 0) {
        paragraphs.push(
            `They're just getting started with no fame yet, but every legend has to start somewhere!`
        );
    } else if (stats.currentFame < 100) {
        paragraphs.push(
            `With ${stats.currentFame} fame points, they're starting to get noticed in the local scene.`
        );
    } else if (stats.currentFame < 500) {
        paragraphs.push(
            `At ${stats.currentFame} fame points, the band is gaining recognition regionally and building a solid fanbase.`
        );
    } else if (stats.currentFame < CONFIG.game.winFameTarget) {
        paragraphs.push(
            `With ${stats.currentFame} fame points, they're well-known and getting close to legendary status!`
        );
    } else {
        paragraphs.push(
            `<strong>LEGENDARY!</strong> With ${stats.currentFame} fame points, <strong>${stats.bandName}</strong> has achieved immortality in the Band Manager Hall of Fame!`
        );
    }

    return paragraphs;
}

function getStars(score) {
    const starCount = Math.round((score / 100) * 5);
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < starCount) {
            stars += '<span class="material-symbols-outlined !text-lg">star</span>';
        } else {
            stars += '<span class="material-symbols-outlined !text-lg text-slate-600">star</span>';
        }
    }
    return stars;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
