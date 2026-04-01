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

// ========== СЕНСОРНОЕ УПРАВЛЕНИЕ ==========
function setupSnakeTouchControls() {
    const buttons = document.querySelectorAll('.snake-controls .control-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!snakeGame || !snakeGame.gameRunning) return;
            
            const dir = btn.dataset.dir;
            switch(dir) {
                case 'up': snakeGame.setDirection(0, -1); break;
                case 'down': snakeGame.setDirection(0, 1); break;
                case 'left': snakeGame.setDirection(-1, 0); break;
                case 'right': snakeGame.setDirection(1, 0); break;
            }
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 100);
        });
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.click(); });
    });
}

function setupTetrisTouchControls() {
    const buttons = document.querySelectorAll('.tetris-controls .tetris-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!tetrisGame || !tetrisGame.gameRunning) return;
            
            const action = btn.dataset.action;
            switch(action) {
                case 'left': tetrisGame.moveLeft(); break;
                case 'right': tetrisGame.moveRight(); break;
                case 'rotate': tetrisGame.rotate(); break;
                case 'down': tetrisGame.update(); break;
                case 'harddrop': tetrisGame.hardDrop(); break;
            }
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => { btn.style.transform = ''; }, 100);
        });
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.click(); });
    });
}

// ========== ИГРА 1: ЗМЕЙКА ==========
class NeonSnake {
    constructor(canvasId, scoreId, highScoreId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.scoreSpan = document.getElementById(scoreId);
        this.highScoreSpan = document.getElementById(highScoreId);
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.resetGame();
        this.loadHighScore();
        this.setupKeyboardControls();
    }
    
    resetGame() {
        const centerX = Math.floor(this.tileCount / 2);
        const centerY = Math.floor(this.tileCount / 2);
        this.snake = [
            {x: centerX, y: centerY},
            {x: centerX - 1, y: centerY},
            {x: centerX - 2, y: centerY}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        if (this.scoreSpan) this.scoreSpan.textContent = '0';
        this.generateValidFood();
    }
    
    generateValidFood() {
        let newFood;
        let isValid = false;
        let attempts = 0;
        while (!isValid && attempts < 1000) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            isValid = !this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            attempts++;
        }
        this.food = newFood;
    }
    
    loadHighScore() {
        if (currentUser) {
            this.highScore = currentUser.snakeScore || 0;
        } else {
            this.highScore = parseInt(localStorage.getItem('neon_snake_highscore')) || 0;
        }
        if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
    }
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
            if (currentUser) {
                updateUserStats('snake', this.highScore);
            } else {
                localStorage.setItem('neon_snake_highscore', this.highScore);
            }
        }
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#010103';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize, segment.y * this.gridSize,
                segment.x * this.gridSize + this.gridSize, segment.y * this.gridSize + this.gridSize
            );
            if (index === 0) {
                gradient.addColorStop(0, '#ff2a6d');
                gradient.addColorStop(1, '#ff6a9d');
            } else {
                gradient.addColorStop(0, '#8a2be2');
                gradient.addColorStop(1, '#ff2a6d');
            }
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        this.ctx.fillStyle = '#05d9e8';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        this.ctx.shadowBlur = 0;
    }
    
    update() {
        if (!this.gameRunning) return;
        this.direction = {...this.nextDirection};
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};
        
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            if (this.scoreSpan) this.scoreSpan.textContent = this.score;
            this.generateValidFood();
        } else {
            this.snake.pop();
        }
        this.draw();
    }
    
    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.resetGame();
        this.gameRunning = true;
        this.gameLoop = setInterval(() => this.update(), 120);
        this.draw();
        showToast('🐍 Змейка началась!', '#05d9e8');
    }
    
    gameOver() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.saveHighScore();
        showToast(`💀 Игра окончена! Счёт: ${this.score}`, '#ff2a6d');
        if (this.ctx) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff2a6d';
            this.ctx.font = 'bold 20px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = '#05d9e8';
            this.ctx.font = '16px monospace';
            this.ctx.fillText(`Счёт: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    setDirection(x, y) {
        if (!this.gameRunning) return;
        if ((this.direction.x === 0 && x !== 0) || (this.direction.y === 0 && y !== 0)) {
            if (!(this.direction.x === -x && this.direction.y === -y)) {
                this.nextDirection = {x, y};
            }
        }
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            switch(e.key) {
                case 'ArrowUp': e.preventDefault(); this.setDirection(0, -1); break;
                case 'ArrowDown': e.preventDefault(); this.setDirection(0, 1); break;
                case 'ArrowLeft': e.preventDefault(); this.setDirection(-1, 0); break;
                case 'ArrowRight': e.preventDefault(); this.setDirection(1, 0); break;
            }
        });
    }
}

// ========== ИГРА 2: ТЕТРИС ==========
class NeonTetris {
    constructor(canvasId, scoreId, highScoreId, levelId, linesId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.scoreSpan = document.getElementById(scoreId);
        this.highScoreSpan = document.getElementById(highScoreId);
        this.levelSpan = document.getElementById(levelId);
        this.linesSpan = document.getElementById(linesId);
        
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 30;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gameLoop = null;
        
        this.pieces = [
            { shape: [[1,1,1,1]], color: '#05d9e8' },
            { shape: [[1,1],[1,1]], color: '#ff2a6d' },
            { shape: [[0,1,0],[1,1,1]], color: '#f0b27a' },
            { shape: [[1,0,0],[1,1,1]], color: '#0f0' },
            { shape: [[0,0,1],[1,1,1]], color: '#ff69b4' },
            { shape: [[1,1,0],[0,1,1]], color: '#ffa500' },
            { shape: [[0,1,1],[1,1,0]], color: '#9b59b6' }
        ];
        
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        this.loadHighScore();
        this.setupKeyboardControls();
    }
    
    loadHighScore() {
        if (currentUser) {
            this.highScore = currentUser.tetrisScore || 0;
        } else {
            this.highScore = parseInt(localStorage.getItem('neon_tetris_highscore')) || 0;
        }
        if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
    }
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
            if (currentUser) {
                updateUserStats('tetris', this.highScore);
            } else {
                localStorage.setItem('neon_tetris_highscore', this.highScore);
            }
        }
    }
    
    spawnPiece() {
        const randomIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = JSON.parse(JSON.stringify(this.pieces[randomIndex]));
        this.currentX = Math.floor((this.cols - this.currentPiece.shape[0].length) / 2);
        this.currentY = 0;
        if (this.collision()) {
            this.gameOver();
        }
    }
    
    collision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardX = this.currentX + x;
                    const boardY = this.currentY + y;
                    if (boardX < 0 || boardX >= this.cols || boardY >= this.rows || boardY < 0) return true;
                    if (boardY >= 0 && this.board[boardY][boardX] !== 0) return true;
                }
            }
        }
        return false;
    }
    
    mergePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardX = this.currentX + x;
                    const boardY = this.currentY + y;
                    if (boardY >= 0 && boardY < this.rows) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            let full = true;
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x] === 0) {
                    full = false;
                    break;
                }
            }
            if (full) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = 1 + Math.floor(this.lines / 10);
            if (this.scoreSpan) this.scoreSpan.textContent = this.score;
            if (this.linesSpan) this.linesSpan.textContent = this.lines;
            if (this.levelSpan) this.levelSpan.textContent = this.level;
            this.saveHighScore();
        }
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#010103';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x] !== 0) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
        
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] !== 0) {
                        this.ctx.fillStyle = this.currentPiece.color;
                        this.ctx.fillRect((this.currentX + x) * this.cellSize, (this.currentY + y) * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                    }
                }
            }
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        this.currentY++;
        if (this.collision()) {
            this.currentY--;
            this.mergePiece();
        }
        this.draw();
    }
    
    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        if (this.scoreSpan) this.scoreSpan.textContent = '0';
        if (this.linesSpan) this.linesSpan.textContent = '0';
        if (this.levelSpan) this.levelSpan.textContent = '1';
        this.gameRunning = true;
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), 500 / this.level);
        this.draw();
        showToast('🧩 Тетрис начался!', '#05d9e8');
    }
    
    gameOver() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.saveHighScore();
        showToast(`💀 Тетрис окончен! Счёт: ${this.score}`, '#ff2a6d');
    }
    
    moveLeft() { if (!this.gameRunning) return; this.currentX--; if (this.collision()) this.currentX++; this.draw(); }
    moveRight() { if (!this.gameRunning) return; this.currentX++; if (this.collision()) this.currentX--; this.draw(); }
    rotate() { if (!this.gameRunning) return; const rotated = this.currentPiece.shape[0].map((_, idx) => this.currentPiece.shape.map(row => row[idx]).reverse()); const originalShape = this.currentPiece.shape; this.currentPiece.shape = rotated; if (this.collision()) this.currentPiece.shape = originalShape; this.draw(); }
    hardDrop() { if (!this.gameRunning) return; while (!this.collision()) this.currentY++; this.currentY--; this.mergePiece(); }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            switch(e.key) {
                case 'ArrowLeft': e.preventDefault(); this.moveLeft(); break;
                case 'ArrowRight': e.preventDefault(); this.moveRight(); break;
                case 'ArrowUp': e.preventDefault(); this.rotate(); break;
                case 'ArrowDown': e.preventDefault(); this.update(); break;
                case ' ': e.preventDefault(); this.hardDrop(); break;
            }
        });
    }
}

// ========== ИГРА 3: ДИНОЗАВРИК (сокращён) ==========
class NeonDino {
    constructor(canvasId, scoreId, highScoreId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.scoreSpan = document.getElementById(scoreId);
        this.highScoreSpan = document.getElementById(highScoreId);
        this.dino = { x: 50, y: 150, width: 20, height: 20, jumping: false, velocity: 0, gravity: 0.8, jumpPower: -12 };
        this.obstacles = [];
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.obstacleTimer = null;
        this.groundY = 170;
        this.loadHighScore();
        this.setupControls();
    }
    
    loadHighScore() {
        if (currentUser) this.highScore = currentUser.dinoScore || 0;
        else this.highScore = parseInt(localStorage.getItem('neon_dino_highscore')) || 0;
        if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
    }
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
            if (currentUser) updateUserStats('dino', this.highScore);
            else localStorage.setItem('neon_dino_highscore', this.highScore);
        }
    }
    
    jump() { if (!this.gameRunning) return; if (!this.dino.jumping && this.dino.y >= this.groundY - this.dino.height) { this.dino.velocity = this.dino.jumpPower; this.dino.jumping = true; } }
    
    update() {
        if (!this.gameRunning) return;
        this.dino.velocity += this.dino.gravity;
        this.dino.y += this.dino.velocity;
        if (this.dino.y >= this.groundY - this.dino.height) { this.dino.y = this.groundY - this.dino.height; this.dino.jumping = false; }
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].x -= 5;
            if (this.obstacles[i].x + this.obstacles[i].width < 0) { this.obstacles.splice(i, 1); this.score++; if (this.scoreSpan) this.scoreSpan.textContent = this.score; this.saveHighScore(); i--; }
            else if (this.dino.x < this.obstacles[i].x + this.obstacles[i].width && this.dino.x + this.dino.width > this.obstacles[i].x && this.dino.y < this.obstacles[i].y + this.obstacles[i].height && this.dino.y + this.dino.height > this.obstacles[i].y) this.gameOver();
        }
        this.draw();
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#010103';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#05d9e8';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 3);
        this.ctx.fillStyle = '#ff2a6d';
        this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.dino.x + 15, this.dino.y + 5, 3, 3);
        this.ctx.fillStyle = '#0f0';
        for (let obs of this.obstacles) this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.fillStyle = '#05d9e8';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 120, 30);
    }
    
    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.obstacleTimer) clearInterval(this.obstacleTimer);
        this.dino.y = this.groundY - this.dino.height;
        this.dino.jumping = false;
        this.dino.velocity = 0;
        this.obstacles = [];
        this.score = 0;
        if (this.scoreSpan) this.scoreSpan.textContent = '0';
        this.gameRunning = true;
        this.gameLoop = setInterval(() => this.update(), 20);
        this.obstacleTimer = setInterval(() => { if (this.gameRunning) this.obstacles.push({ x: this.canvas.width, y: this.groundY - 20, width: 15, height: 20 }); }, 2000);
        this.draw();
        showToast('🦖 Динозаврик побежал!', '#05d9e8');
    }
    
    gameOver() { clearInterval(this.gameLoop); clearInterval(this.obstacleTimer); this.gameRunning = false; this.saveHighScore(); showToast(`💀 Игра окончена! Счёт: ${this.score}`, '#ff2a6d'); }
    setupControls() { document.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); this.jump(); } }); this.canvas.addEventListener('click', () => this.jump()); }
}

// ========== ИГРА 4: ФЛЭППИ БЁРД (сокращён) ==========
class NeonFlappy {
    constructor(canvasId, scoreId, highScoreId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.scoreSpan = document.getElementById(scoreId);
        this.highScoreSpan = document.getElementById(highScoreId);
        this.bird = { x: 50, y: 250, velocity: 0, gravity: 0.2, jumpPower: -5, size: 15 };
        this.pipes = [];
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.pipeTimer = null;
        this.pipeGap = 120;
        this.pipeWidth = 50;
        this.loadHighScore();
        this.setupControls();
    }
    
    loadHighScore() {
        if (currentUser) this.highScore = currentUser.flappyScore || 0;
        else this.highScore = parseInt(localStorage.getItem('neon_flappy_highscore')) || 0;
        if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
    }
    
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (this.highScoreSpan) this.highScoreSpan.textContent = this.highScore;
            if (currentUser) updateUserStats('flappy', this.highScore);
            else localStorage.setItem('neon_flappy_highscore', this.highScore);
        }
    }
    
    jump() { if (!this.gameRunning) return; this.bird.velocity = this.bird.jumpPower; }
    
    update() {
        if (!this.gameRunning) return;
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        if (this.bird.y + this.bird.size > this.canvas.height || this.bird.y < 0) { this.gameOver(); return; }
        for (let i = 0; i < this.pipes.length; i++) {
            this.pipes[i].x -= 2;
            if (this.pipes[i].x + this.pipeWidth < 0) { this.pipes.splice(i, 1); i--; }
            else if (this.bird.x + this.bird.size > this.pipes[i].x && this.bird.x < this.pipes[i].x + this.pipeWidth) {
                if (this.bird.y < this.pipes[i].topHeight || this.bird.y + this.bird.size > this.pipes[i].topHeight + this.pipeGap) { this.gameOver(); return; }
                else if (!this.pipes[i].passed) { this.pipes[i].passed = true; this.score++; if (this.scoreSpan) this.scoreSpan.textContent = this.score; this.saveHighScore(); }
            }
        }
        this.draw();
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#010103';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff2a6d';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.size, this.bird.size);
        this.ctx.fillStyle = '#05d9e8';
        for (let pipe of this.pipes) {
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.topHeight + this.pipeGap, this.pipeWidth, this.canvas.height - pipe.topHeight - this.pipeGap);
        }
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
    
    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.pipeTimer) clearInterval(this.pipeTimer);
        this.bird.y = 250;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        if (this.scoreSpan) this.scoreSpan.textContent = '0';
        this.gameRunning = true;
        this.gameLoop = setInterval(() => this.update(), 20);
        this.pipeTimer = setInterval(() => { if (this.gameRunning) this.pipes.push({ x: this.canvas.width, topHeight: Math.random() * (this.canvas.height - this.pipeGap - 100) + 50, passed: false }); }, 2000);
        this.draw();
        showToast('🐦 Флэппи бёрд началась!', '#05d9e8');
    }
    
    gameOver() { clearInterval(this.gameLoop); clearInterval(this.pipeTimer); this.gameRunning = false; this.saveHighScore(); showToast(`💀 Игра окончена! Счёт: ${this.score}`, '#ff2a6d'); }
    setupControls() { document.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); this.jump(); } }); this.canvas.addEventListener('click', () => this.jump()); }
}

// ========== ИГРА 5: МЕМОРИ ==========
class NeonMemory {
    constructor(boardId, pairsId, bestTimeId) {
        this.board = document.getElementById(boardId);
        this.pairsSpan = document.getElementById(pairsId);
        this.bestTimeSpan = document.getElementById(bestTimeId);
        this.icons = ['🐍', '🧩', '🦖', '🐦', '🎮', '🎵', '🌧', '👑'];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.locked = false;
        this.startTime = null;
        this.timer = null;
        this.gameRunning = false;
        this.loadBestTime();
    }
    
    loadBestTime() {
        if (currentUser) this.bestTime = currentUser.memoryScore || 0;
        else this.bestTime = parseInt(localStorage.getItem('neon_memory_besttime')) || 0;
        if (this.bestTimeSpan && this.bestTime > 0) this.bestTimeSpan.textContent = `${this.bestTime} сек`;
    }
    
    saveBestTime() {
        if (this.endTime && (this.bestTime === 0 || this.endTime < this.bestTime)) {
            this.bestTime = this.endTime;
            if (this.bestTimeSpan) this.bestTimeSpan.textContent = `${this.bestTime} сек`;
            if (currentUser) updateUserStats('memory', this.bestTime);
            else localStorage.setItem('neon_memory_besttime', this.bestTime);
        }
    }
    
    shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
    
    initGame() {
        let cards = [];
        for (let icon of this.icons) { cards.push({ icon: icon, matched: false, flipped: false }); cards.push({ icon: icon, matched: false, flipped: false }); }
        this.cards = this.shuffleArray(cards);
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.locked = false;
        if (this.pairsSpan) this.pairsSpan.textContent = '0';
        this.render();
    }
    
    render() {
        if (!this.board) return;
        this.board.innerHTML = '';
        this.cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'memory-card';
            if (card.flipped || card.matched) cardDiv.classList.add('flipped');
            if (card.matched) cardDiv.classList.add('matched');
            cardDiv.textContent = (card.flipped || card.matched) ? card.icon : '?';
            cardDiv.onclick = () => this.flipCard(index);
            this.board.appendChild(cardDiv);
        });
    }
    
    flipCard(index) {
        if (this.locked || this.cards[index].matched || this.cards[index].flipped || this.flippedCards.length === 2) return;
        if (!this.gameRunning) this.startGame();
        this.cards[index].flipped = true;
        this.flippedCards.push(index);
        this.render();
        if (this.flippedCards.length === 2) this.checkMatch();
    }
    
    checkMatch() {
        const card1 = this.cards[this.flippedCards[0]];
        const card2 = this.cards[this.flippedCards[1]];
        if (card1.icon === card2.icon) {
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            if (this.pairsSpan) this.pairsSpan.textContent = this.matchedPairs;
            this.flippedCards = [];
            this.render();
            if (this.matchedPairs === this.icons.length) this.endGame();
        } else {
            this.locked = true;
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                this.flippedCards = [];
                this.locked = false;
                this.render();
            }, 1000);
        }
    }
    
    startGame() {
        this.initGame();
        this.gameRunning = true;
        this.startTime = Date.now();
        this.timer = setInterval(() => { if (this.gameRunning) { const elapsed = Math.floor((Date.now() - this.startTime) / 1000); const timeDisplay = document.getElementById('memoryCurrentTime'); if (timeDisplay) timeDisplay.textContent = `${elapsed} сек`; } }, 1000);
        showToast('🧠 Мемори началась! Найди все пары', '#05d9e8');
    }
    
    endGame() { clearInterval(this.timer); this.gameRunning = false; this.endTime = Math.floor((Date.now() - this.startTime) / 1000); this.saveBestTime(); showToast(`🎉 Победа! Время: ${this.endTime} секунд`, '#0f0'); }
    start() { this.initGame(); this.gameRunning = false; this.startTime = null; if (this.timer) clearInterval(this.timer); showToast('🧠 Нажми на любую карточку, чтобы начать', '#05d9e8'); }
}

// ========== ИНИЦИАЛИЗАЦИЯ ИГР И ЭФФЕКТОВ ==========
let snakeGame, tetrisGame, dinoGame, flappyGame, memoryGame;
let audioContext = null, oscillator = null, gainNode = null;
let matrixInterval = null, matrixActive = false;

function initTheremin() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    gainNode.gain.value = 0;
    oscillator.start();
}

function startMatrixRain() {
    const matrixCanvas = document.getElementById('matrixCanvas');
    if (!matrixCanvas) return;
    matrixCanvas.classList.remove('hidden');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const ctx = matrixCanvas.getContext('2d');
    const chars = "01アイウエオカキクケコ";
    const fontSize = 16;
    const columns = matrixCanvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(() => {
        if (!matrixCanvas || !ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 35);
}

function stopMatrixRain() { if (matrixInterval) clearInterval(matrixInterval); const matrixCanvas = document.getElementById('matrixCanvas'); if (matrixCanvas) matrixCanvas.classList.add('hidden'); }

// ========== ЗАПУСК ВСЕГО ==========
window.addEventListener('load', async () => {
    // Инициализация игр
    snakeGame = new NeonSnake('snakeCanvas', 'snakeScore', 'snakeHighScore');
    tetrisGame = new NeonTetris('tetrisCanvas', 'tetrisScore', 'tetrisHighScore', 'tetrisLevel', 'tetrisLines');
    dinoGame = new NeonDino('dinoCanvas', 'dinoScore', 'dinoHighScore');
    flappyGame = new NeonFlappy('flappyCanvas', 'flappyScore', 'flappyHighScore');
    memoryGame = new NeonMemory('memoryBoard', 'memoryPairs', 'memoryBestTime');
    
    // Кнопки старта игр
    document.querySelectorAll('.game-start-btn').forEach(btn => {
        btn.onclick = () => {
            const game = btn.dataset.game;
            if (game === 'snake' && snakeGame) snakeGame.start();
            if (game === 'tetris' && tetrisGame) tetrisGame.start();
            if (game === 'dino' && dinoGame) dinoGame.start();
            if (game === 'flappy' && flappyGame) flappyGame.start();
            if (game === 'memory' && memoryGame) memoryGame.start();
        };
    });
    
    // Переключение игр
    document.querySelectorAll('.game-select-btn').forEach(btn => {
        btn.onclick = () => switchGame(btn.dataset.game);
    });
    
    // Сенсорное управление
    setTimeout(() => { setupSnakeTouchControls(); setupTetrisTouchControls(); }, 500);
    
    // Восстановление сессии
    if (typeof restoreSession !== 'undefined') {
        const user = await restoreSession();
        if (user) { currentUser = user; updateUIForUser(); updateAllHighScores(); }
    }
    
    // Авторизация
    document.getElementById('loginBtn').onclick = openAuthModal;
    document.getElementById('logoutBtn').onclick = () => { if (typeof logoutCloud === 'function') logoutCloud(); currentUser = null; updateUIForUser(); showToast('Вы вышли из аккаунта', '#05d9e8'); };
    document.getElementById('closeAuthModal').onclick = () => authModal.classList.add('hidden');
    document.getElementById('switchAuthMode').onclick = (e) => {
        e.preventDefault(); isLoginMode = !isLoginMode;
        const title = document.getElementById('authModalTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        if (isLoginMode) { if(title) title.textContent = '🔐 Авторизация'; if(submitBtn) submitBtn.textContent = 'Войти'; }
        else { if(title) title.textContent = '📝 Регистрация'; if(submitBtn) submitBtn.textContent = 'Зарегистрироваться'; }
    };
    document.getElementById('authSubmitBtn').onclick = async () => {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value.trim();
        const authError = document.getElementById('authError');
        if (!username || !password) { if(authError) authError.textContent = 'Заполните все поля'; return; }
        
        if (isLoginMode && typeof loginUserCloud !== 'undefined') {
            const res = await loginUserCloud(username, password);
            if (res.success) { currentUser = res.user; authModal.classList.add('hidden'); updateUIForUser(); updateAllHighScores(); showToast(`Добро пожаловать, ${username}!`, '#05d9e8'); }
            else if(authError) authError.textContent = res.error;
        } else if (typeof registerUserCloud !== 'undefined') {
            const res = await registerUserCloud(username, password);
            if (res.success) {
                showToast('Регистрация успешна! Теперь войдите.', '#0f0');
                isLoginMode = true;
                const title = document.getElementById('authModalTitle');
                const submitBtn = document.getElementById('authSubmitBtn');
                if(title) title.textContent = '🔐 Авторизация';
                if(submitBtn) submitBtn.textContent = 'Войти';
                if(authError) authError.textContent = '';
            } else if(authError) authError.textContent = res.error;
        }
    };
    
    // Терменвокс
    const thereminZone = document.getElementById('thereminZone');
    const freqSpan = document.getElementById('freqValue');
    if (thereminZone) {
        thereminZone.addEventListener('mouseenter', () => { if (!audioContext) initTheremin(); if (audioContext && audioContext.state === 'suspended') audioContext.resume(); if (gainNode) gainNode.gain.value = 0.2; });
        thereminZone.addEventListener('mouseleave', () => { if (gainNode) gainNode.gain.value = 0; });
        thereminZone.addEventListener('mousemove', (e) => { if (!oscillator) return; const rect = thereminZone.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width; const y = (e.clientY - rect.top) / rect.height; const freq = 200 + x * 800 + y * 400; oscillator.frequency.value = Math.min(1200, Math.max(200, freq)); if (freqSpan) freqSpan.textContent = Math.floor(oscillator.frequency.value); });
    }
    
    // Matrix Rain
    document.getElementById('toggleMatrixBtn').onclick = () => { if (matrixActive) { stopMatrixRain(); document.getElementById('toggleMatrixBtn').textContent = '🌧 Включить Matrix Rain'; } else { startMatrixRain(); document.getElementById('toggleMatrixBtn').textContent = '🌧 Выключить Matrix Rain'; } matrixActive = !matrixActive; };
    
    // Факты и счётчик
    document.getElementById('newFactBtn').onclick = () => { const randomIndex = Math.floor(Math.random() * factsArray.length); document.getElementById('randomFact').textContent = factsArray[randomIndex]; incrementCounter(); };
    document.getElementById('resetCounterBtn').onclick = () => { clickCounter = 0; updateCounterUI(); showToast('Счётчик обнулён', '#ff2a6d'); };
    document.getElementById('magicGlowBtn').onclick = () => { incrementCounter(); document.body.style.background = "radial-gradient(circle at 30% 40%, #0f0f2a, #010104)"; setTimeout(() => document.body.style.background = "", 800); showToast('✨ Неоновая волна активирована!', '#ff2a6d'); };
    
    // Модалки
    document.getElementById('contactFooterBtn').onclick = () => document.getElementById('contactModal').classList.remove('hidden');
    document.getElementById('aboutFooterBtn').onclick = () => document.getElementById('aboutModal').classList.remove('hidden');
    document.getElementById('closeContactModal').onclick = () => document.getElementById('contactModal').classList.add('hidden');
    document.getElementById('closeAboutModal').onclick = () => document.getElementById('aboutModal').classList.add('hidden');
    document.getElementById('sendMsgBtn').onclick = () => { const msg = document.getElementById('messageInput').value.trim(); if(msg) { showToast(`✅ Спасибо! "${msg.substring(0,30)}..."`, '#ff2a6d'); document.getElementById('messageInput').value = ''; document.getElementById('contactModal').classList.add('hidden'); } else showToast('✏️ Напишите сообщение', '#ffaa44'); };
    document.getElementById('docsFooterBtn').onclick = () => showToast('📄 Документация: версия 5.0 - облачная авторизация!', '#05d9e8');
    document.getElementById('adminFooterBtn').onclick = () => { if(currentUser?.isAdmin) document.getElementById('adminPanel').scrollIntoView({behavior:'smooth'}); };
    
    // Админ-панель вкладки
    const adminUsersTab = document.getElementById('adminUsersTab');
    const adminContentTab = document.getElementById('adminContentTab');
    const adminCasinoTab = document.getElementById('adminCasinoTab');
    const adminUsersList = document.getElementById('adminUsersList');
    const adminContentEditor = document.getElementById('adminContentEditor');
    const adminCasinoPanel = document.getElementById('adminCasinoPanel');
    
    if (adminUsersTab) {
        adminUsersTab.onclick = async () => {
            adminUsersTab.classList.add('active');
            if (adminContentTab) adminContentTab.classList.remove('active');
            if (adminCasinoTab) adminCasinoTab.classList.remove('active');
            if (adminUsersList) adminUsersList.classList.remove('hidden');
            if (adminContentEditor) adminContentEditor.classList.add('hidden');
            if (adminCasinoPanel) adminCasinoPanel.classList.add('hidden');
            await loadAdminUsersList();
        };
    }
    
    if (adminContentTab) {
        adminContentTab.onclick = () => {
            adminContentTab.classList.add('active');
            if (adminUsersTab) adminUsersTab.classList.remove('active');
            if (adminCasinoTab) adminCasinoTab.classList.remove('active');
            if (adminUsersList) adminUsersList.classList.add('hidden');
            if (adminContentEditor) adminContentEditor.classList.remove('hidden');
            if (adminCasinoPanel) adminCasinoPanel.classList.add('hidden');
            const heroP = document.querySelector('.hero p');
            const heroTextarea = document.getElementById('adminHeroText');
            if (heroTextarea && heroP) heroTextarea.value = heroP.innerHTML;
            const factsContainer = document.getElementById('factsListAdmin');
            if (factsContainer) {
                factsContainer.innerHTML = '';
                factsArray.forEach((fact, idx) => {
                    const div = document.createElement('div');
                    div.style.cssText = 'display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; background: rgba(5,217,232,0.1); border-radius: 12px;';
                    div.innerHTML = `<span style="flex:1">${fact}</span><button class="tiny-btn" onclick="window.deleteFact(${idx})">🗑 Удалить</button>`;
                    factsContainer.appendChild(div);
                });
            }
        };
    }
    
    if (adminCasinoTab) {
        adminCasinoTab.onclick = async () => {
            adminCasinoTab.classList.add('active');
            if (adminUsersTab) adminUsersTab.classList.remove('active');
            if (adminContentTab) adminContentTab.classList.remove('active');
            if (adminUsersList) adminUsersList.classList.add('hidden');
            if (adminContentEditor) adminContentEditor.classList.add('hidden');
            if (adminCasinoPanel) adminCasinoPanel.classList.remove('hidden');
            await updateCasinoUserSelect();
            await updateCasinoStats();
        };
    }
    
    document.getElementById('addBalanceBtn')?.addEventListener('click', addCasinoBalanceToUser);
    document.getElementById('clearAllUsersBtn')?.addEventListener('click', async () => {
        if (confirm('Удалить ВСЕХ пользователей (кроме админа)?')) {
            const users = await getAllUsersCloud();
            for (const user of users) { if (!user.isAdmin) await supabaseClient.request(`/users?username=eq.${encodeURIComponent(user.username)}`, { method: 'DELETE' }); }
            showToast('Все пользователи удалены', '#ff2a6d');
            if (currentUser && !currentUser.isAdmin) { logoutCloud(); currentUser = null; updateUIForUser(); }
            await loadAdminUsersList(); await updateCasinoUserSelect(); await updateCasinoStats();
        }
    });
    document.getElementById('saveHeroTextBtn')?.addEventListener('click', () => { const newText = document.getElementById('adminHeroText').value; const heroP = document.querySelector('.hero p'); if (heroP && newText) { heroP.innerHTML = newText; showToast('Приветственный текст обновлён!', '#0f0'); } });
    document.getElementById('addFactBtn')?.addEventListener('click', () => { const newFact = document.getElementById('newFactInput')?.value.trim(); if (newFact) { factsArray.push(newFact); saveFacts(); document.getElementById('newFactInput').value = ''; showToast('Факт добавлен!', '#0f0'); if (adminContentTab) adminContentTab.click(); } else showToast('Введите текст факта!', '#ff2a6d'); });
    
    // Карточки
    document.querySelectorAll('.card, .card-2').forEach(card => { card.addEventListener('click', () => { showToast(`🔍 Карточка "${card.getAttribute('data-tech')}"`, '#05d9e8'); incrementCounter(); }); });
    
    loadFactsFromStorage();
    updateCounterUI();
    
    const style = document.createElement('style');
    style.textContent = `.success-toast { font-family: 'Segoe UI', sans-serif; box-shadow: 0 0 20px rgba(0,0,0,0.3); } @keyframes fadeOut { 0% { opacity: 1; transform: translateX(-50%) translateY(0); } 70% { opacity: 1; } 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); visibility: hidden; } }`;
    document.head.appendChild(style);
});

console.log('🔥 Облачная авторизация активна! Все 5 игр загружены!');
