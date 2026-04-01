// ========== СИСТЕМА ПОЛЬЗОВАТЕЛЕЙ (ОБЛАЧНАЯ) ==========
let currentUser = null;
let clickCounter = 0;

// ========== ПРОВЕРКА ЗАГРУЗКИ AUTH.JS ==========
function waitForAuth() {
    return new Promise((resolve) => {
        if (typeof window.restoreSession !== 'undefined') {
            resolve(true);
        } else {
            console.log('⏳ Ожидание загрузки auth.js...');
            const checkInterval = setInterval(() => {
                if (typeof window.restoreSession !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('❌ auth.js не загружен!');
                resolve(false);
            }, 5000);
        }
    });
}

// ========== ТОСТЫ ==========
function showToast(message, color = '#05d9e8') {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:${color}; padding:12px 28px; border-radius:60px; font-weight:bold; z-index:1100; animation:fadeOut 2s forwards; pointer-events:none;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ========== СЧЁТЧИК КЛИКОВ ==========
function updateCounterUI() {
    const clickDisplay = document.getElementById('clickCountDisplay');
    if (clickDisplay) {
        clickDisplay.innerText = clickCounter;
        clickDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => { if(clickDisplay) clickDisplay.style.transform = 'scale(1)'; }, 150);
    }
}
function incrementCounter() {
    clickCounter++;
    updateCounterUI();
}

// ========== ПЕРЕКЛЮЧЕНИЕ ИГР ==========
function switchGame(gameId) {
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
        container.classList.add('hidden');
    });
    const selectedGame = document.getElementById(`game${gameId.charAt(0).toUpperCase() + gameId.slice(1)}`);
    if (selectedGame) {
        selectedGame.classList.remove('hidden');
        selectedGame.classList.add('active');
    }
    document.querySelectorAll('.game-select-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.game === gameId) btn.classList.add('active');
    });
}

// ========== UI ОБНОВЛЕНИЕ ==========
async function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    const statsPanel = document.getElementById('userStatsPanel');
    const adminPanel = document.getElementById('adminPanel');
    const adminFooterBtn = document.getElementById('adminFooterBtn');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userDisplay.textContent = `👋 ${currentUser.username}${currentUser.isAdmin ? ' (Admin)' : ''} | 💰 ${currentUser.casinoBalance || 5000}`;
        userDisplay.style.display = 'inline';
        statsPanel.classList.remove('hidden');
        document.getElementById('userGamesPlayed').textContent = currentUser.gamesPlayed || 0;
        document.getElementById('userSnakeScore').textContent = currentUser.snakeScore || 0;
        document.getElementById('userTetrisScore').textContent = currentUser.tetrisScore || 0;
        document.getElementById('userDinoScore').textContent = currentUser.dinoScore || 0;
        document.getElementById('userFlappyScore').textContent = currentUser.flappyScore || 0;
        document.getElementById('userMemoryScore').textContent = currentUser.memoryScore || 0;
        document.getElementById('userRegDate').textContent = new Date(currentUser.registered).toLocaleDateString();
        
        if (currentUser.isAdmin) {
            adminPanel.classList.remove('hidden');
            adminFooterBtn.style.display = 'inline-block';
            if (typeof loadAdminUsersList === 'function') await loadAdminUsersList();
        } else {
            adminPanel.classList.add('hidden');
            adminFooterBtn.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        userDisplay.style.display = 'none';
        statsPanel.classList.add('hidden');
        adminPanel.classList.add('hidden');
        if (adminFooterBtn) adminFooterBtn.style.display = 'none';
    }
}

function updateBalanceUI() {
    const balanceSpan = document.getElementById('balanceAmount');
    const userDisplay = document.getElementById('userDisplay');
    if (balanceSpan && currentUser) {
        balanceSpan.textContent = currentUser.casinoBalance || 5000;
    }
    if (userDisplay && currentUser) {
        userDisplay.textContent = `👋 ${currentUser.username}${currentUser.isAdmin ? ' (Admin)' : ''} | 💰 ${currentUser.casinoBalance || 5000}`;
    }
}

async function updateUserStats(game, score) {
    if (!currentUser) return;
    const stats = {};
    stats.games_played = (currentUser.gamesPlayed || 0) + 1;
    
    const scoreKey = `${game}_score`;
    if (score > (currentUser[`${game}Score`] || 0)) {
        stats[`${game}_score`] = score;
        currentUser[`${game}Score`] = score;
    }
    
    if (typeof updateUserStatsCloud !== 'undefined') {
        await updateUserStatsCloud(currentUser.username, stats);
    }
    currentUser.gamesPlayed = stats.games_played;
    updateUIForUser();
}

function updateAllHighScores() {
    if (!currentUser) return;
    if (snakeGame) snakeGame.loadHighScore();
    if (tetrisGame) tetrisGame.loadHighScore();
    if (dinoGame) dinoGame.loadHighScore();
    if (flappyGame) flappyGame.loadHighScore();
}

// ========== АДМИН-ПАНЕЛЬ ==========
async function loadAdminUsersList() {
    if (typeof getAllUsersCloud === 'undefined') {
        console.error('getAllUsersCloud не определена');
        return;
    }
    
    const users = await getAllUsersCloud();
    const container = document.getElementById('usersListContainer');
    if (!container) return;
    container.innerHTML = '';
    for (const user of users) {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 10px; border-bottom: 1px solid #05d9e8; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;';
        div.innerHTML = `
            <span><b>${user.username}</b> ${user.isAdmin ? '👑' : ''} | Игр: ${user.gamesPlayed || 0} | 🎰 Баланс: ${user.casinoBalance || 5000}</span>
            <div style="display: flex; gap: 8px;">
                ${!user.isAdmin ? `<button class="tiny-btn" onclick="window.deleteUserCloud('${user.username}')">🗑 Удалить</button>` : ''}
                <button class="tiny-btn" onclick="window.quickAddBalanceCloud('${user.username}')">💰 +100</button>
            </div>
        `;
        container.appendChild(div);
    }
}

window.deleteUserCloud = async function(username) {
    if (confirm(`Удалить пользователя ${username}?`)) {
        try {
            await supabaseClient.request(`/users?username=eq.${encodeURIComponent(username)}`, { method: 'DELETE' });
            showToast(`Пользователь ${username} удалён`, '#ff2a6d');
            
            if (currentUser && currentUser.username === username) {
                if (typeof logoutCloud === 'function') logoutCloud();
                currentUser = null;
                updateUIForUser();
                updateBalanceUI();
            }
            
            if (typeof loadAdminUsersList === 'function') await loadAdminUsersList();
            if (typeof updateCasinoUserSelect === 'function') await updateCasinoUserSelect();
            if (typeof updateCasinoStats === 'function') await updateCasinoStats();
        } catch (e) {
            console.error('Ошибка удаления:', e);
            showToast('Ошибка удаления', '#ff2a6d');
        }
    }
};

window.quickAddBalanceCloud = async function(username) {
    if (typeof addCasinoBalanceCloud === 'undefined') {
        showToast('Система не готова', '#ff2a6d');
        return;
    }
    
    const success = await addCasinoBalanceCloud(username, 100);
    if (success) {
        showToast(`💰 ${username} +100 очков!`, '#ffd700');
        
        if (currentUser && currentUser.username === username) {
            currentUser.casinoBalance = (currentUser.casinoBalance || 5000) + 100;
            updateBalanceUI();
            updateUIForUser();
        }
        
        if (typeof loadAdminUsersList === 'function') await loadAdminUsersList();
        if (typeof updateCasinoUserSelect === 'function') await updateCasinoUserSelect();
        if (typeof updateCasinoStats === 'function') await updateCasinoStats();
    } else {
        showToast('❌ Ошибка начисления!', '#ff2a6d');
    }
};

// ========== ГЕНЕРАТОР ФАКТОВ ==========
let factsArray = [
    "🌌 Первый компьютерный вирус назывался Creeper (1971).",
    "⚡ Неон используется в вывесках с 1910 года.",
    "🎮 Тетрис создал Алексей Пажитнов в 1984 году.",
    "🧬 Цвет #ff2a6d — символ киберпанк-эстетики.",
    "📡 JavaScript был создан за 10 дней в 1995 году.",
    "🦖 Динозаврик в Chrome появился в 2014 году.",
    "🐦 Flappy Bird приносил $50 000 в день рекламы.",
    "🧠 Игры на память улучшают когнитивные способности."
];

function loadFactsFromStorage() {
    const saved = localStorage.getItem('neon_facts');
    if (saved) factsArray = JSON.parse(saved);
    const factTextElem = document.getElementById('randomFact');
    if (factTextElem) factTextElem.textContent = factsArray[Math.floor(Math.random() * factsArray.length)];
}

function saveFacts() {
    localStorage.setItem('neon_facts', JSON.stringify(factsArray));
}

window.deleteFact = function(idx) {
    factsArray.splice(idx, 1);
    saveFacts();
    const adminContentTab = document.getElementById('adminContentTab');
    if (adminContentTab) adminContentTab.click();
    showToast('Факт удалён', '#05d9e8');
};

// ========== МОДАЛКИ АВТОРИЗАЦИИ ==========
let isLoginMode = true;
const authModal = document.getElementById('authModal');

function openAuthModal() {
    authModal.classList.remove('hidden');
}
