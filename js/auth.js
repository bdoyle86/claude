// Authentication page logic

let currentTab = 'login';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();

    // Check if already logged in
    const user = await db.getCurrentUser();
    if (user) {
        // Check if they have a game state
        const gameState = await db.getGameState();
        if (gameState) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'create-band.html';
        }
        return;
    }

    setupEventListeners();
});

function setupEventListeners() {
    // Tab switching
    document.getElementById('loginTab').addEventListener('click', () => switchTab('login'));
    document.getElementById('signupTab').addEventListener('click', () => switchTab('signup'));

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

function switchTab(tab) {
    currentTab = tab;

    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (tab === 'login') {
        loginTab.classList.add('bg-primary', 'text-white');
        loginTab.classList.remove('text-gray-400');
        signupTab.classList.remove('bg-primary', 'text-white');
        signupTab.classList.add('text-gray-400');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.classList.add('bg-primary', 'text-white');
        signupTab.classList.remove('text-gray-400');
        loginTab.classList.remove('bg-primary', 'text-white');
        loginTab.classList.add('text-gray-400');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }

    hideMessages();
}

async function handleLogin(e) {
    e.preventDefault();
    hideMessages();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await db.signIn(email, password);

        // Check if they have a game state
        const gameState = await db.getGameState();
        if (gameState) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'create-band.html';
        }
    } catch (error) {
        showError(error.message || 'Failed to login. Please check your credentials.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    hideMessages();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupPasswordConfirm').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long!');
        return;
    }

    try {
        await db.signUp(email, password);
        showSuccess('Account created! Please check your email to verify your account, then login.');

        // Switch to login tab after a delay
        setTimeout(() => {
            switchTab('login');
        }, 3000);
    } catch (error) {
        showError(error.message || 'Failed to create account. Email may already be in use.');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = message;
    successDiv.classList.remove('hidden');
}

function hideMessages() {
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('successMessage').classList.add('hidden');
}
