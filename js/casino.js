// ========== ОБЛАЧНАЯ СИСТЕМА ДЛЯ КАЗИНО ==========
let currentUser = null;
let clickCounter = 0;
let gameHistory = [];
let crashInterval = null;
let crashActive = false;
let currentMultiplier = 1.0;

// ========== ПРОВЕРКА ЗАГРУЗКИ AUTH.JS ==========
function waitForAuth() {
    return new Promise((resolve) => {
        if (typeof window.restoreSession !== 'undefined') {
            resolve(true);
        } else {
            console.log('⏳ Casino: Ожидание загрузки auth.js...');
            const checkInterval = setInterval(() => {
                if (typeof window.restoreSession !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('❌ Casino: auth.js не загружен!');
                resolve(false);
            }, 5000);
        }
    });
}

// ========== ФУНКЦИИ UI ДЛЯ КАЗИНО ==========
async function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userDisplay.textContent = `👋 ${currentUser.username}${currentUser.isAdmin ? ' (Admin)' : ''} | 💰 ${currentUser.casinoBalance || 5000}`;
        userDisplay.style.display = 'inline';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        userDisplay.style.display = 'none';
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

async function updateUserBalance(changeAmount) {
    if (!currentUser) return false;
    
    const newBalance = (currentUser.casinoBalance || 5000) + changeAmount;
    if (newBalance < 0) return false;
    
    try {
        if (typeof window.supabaseClient === 'undefined') {
            console.error('supabaseClient не определён');
            return false;
        }
        
        await window.supabaseClient.update('users', { casino_balance: newBalance }, currentUser.username);
        currentUser.casinoBalance = newBalance;
        updateBalanceUI();
        
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay && currentUser) {
            userDisplay.textContent = `👋 ${currentUser.username}${currentUser.isAdmin ? ' (Admin)' : ''} | 💰 ${currentUser.casinoBalance}`;
        }
        
        return true;
    } catch (e) {
        console.error('Ошибка обновления баланса:', e);
        showToast('Ошибка обновления баланса! Попробуйте ещё раз', '#ff2a6d');
        return false;
    }
}

async function safeUpdateBalance(changeAmount, retries = 2) {
    for (let i = 0; i < retries; i++) {
        const success = await updateUserBalance(changeAmount);
        if (success) return true;
        if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    return false;
}

async function addToHistory(gameName, bet, winAmount, result) {
    if (!currentUser) return;
    const historyItem = {
        time: new Date().toLocaleTimeString(),
        game: gameName,
        bet: bet,
        winAmount: winAmount,
        result: result,
        balanceAfter: currentUser.casinoBalance
    };
    gameHistory.unshift(historyItem);
    if (gameHistory.length > 20) gameHistory.pop();
    localStorage.setItem(`casino_history_${currentUser.username}`, JSON.stringify(gameHistory));
    displayGameHistory();
}

function loadGameHistory() {
    if (!currentUser) return;
    const saved = localStorage.getItem(`casino_history_${currentUser.username}`);
    if (saved) {
        gameHistory = JSON.parse(saved);
    } else {
        gameHistory = [];
    }
    displayGameHistory();
}

function displayGameHistory() {
    const historyDiv = document.getElementById('gameHistory');
    if (!historyDiv) return;
    if (gameHistory.length === 0) {
        historyDiv.innerHTML = '<p style="opacity: 0.7;">Сыграйте в любую игру, чтобы увидеть историю</p>';
        return;
    }
    historyDiv.innerHTML = gameHistory.map(item => `
        <div style="padding: 8px; border-bottom: 1px solid #05d9e830; font-size: 0.85rem;">
            <span style="color: #05d9e8;">${item.time}</span> | 
            <strong>${item.game}</strong> | 
            Ставка: ${item.bet} | 
            ${item.winAmount > 0 ? `<span style="color: #0f0;">+${item.winAmount}</span>` : `<span style="color: #ff2a6d;">${item.winAmount}</span>`}
        </div>
    `).join('');
}

function showToast(message, color = '#05d9e8') {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:${color}; padding:12px 28px; border-radius:60px; font-weight:bold; z-index:1100; animation:fadeOut 2s forwards; pointer-events:none;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function incrementCounter() {
    clickCounter++;
    const clickDisplay = document.getElementById('clickCountDisplay');
    if (clickDisplay) {
        clickDisplay.innerText = clickCounter;
        clickDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => { if(clickDisplay) clickDisplay.style.transform = 'scale(1)'; }, 150);
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ ИГР ==========
function switchCasinoGame(gameId) {
    document.querySelectorAll('.casino-game-container').forEach(container => {
        container.classList.remove('active');
    });
    const selectedGame = document.getElementById(`game${gameId.charAt(0).toUpperCase() + gameId.slice(1)}`);
    if (selectedGame) {
        selectedGame.classList.add('active');
    }
    document.querySelectorAll('.casino-game-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.game === gameId) btn.classList.add('active');
    });
}

// ========== ИГРА 1: СЛОТЫ ==========
const slotSymbols = ['🍒', '🍊', '🍋', '🍉', '🔔', '💎', '7️⃣', '⭐'];
const slotMultipliers = {
    '🍒🍒🍒': 3, '🍊🍊🍊': 4, '🍋🍋🍋': 5, '🍉🍉🍉': 6,
    '🔔🔔🔔': 8, '💎💎💎': 12, '7️⃣7️⃣7️⃣': 15, '⭐⭐⭐': 20,
    '🍒🍒🍊': 2, '🍒🍒🍋': 2, '🍊🍊🍒': 2, '🍋🍋🍒': 2
};

function spinSlot() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('slotBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    
    let spins = 0;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => { reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; });
        spins++;
        if (spins > 12) {
            clearInterval(spinInterval);
            finishSpin();
        }
    }, 50);
    
    function finishSpin() {
        const results = reels.map(reel => reel.textContent);
        const combo = results.join('');
        let multiplier = slotMultipliers[combo] || 0;
        if (multiplier === 0 && Math.random() < 0.25) multiplier = 2;
        
        const winAmount = multiplier * bet;
        const resultDiv = document.getElementById('slotResult');
        
        if (winAmount > 0) {
            safeUpdateBalance(winAmount - bet).then(() => {
                resultDiv.className = 'result-message result-win';
                resultDiv.innerHTML = `🎉 ПОБЕДА! ${results.join(' ')} | Выигрыш: ${winAmount} (x${multiplier}) 🎉`;
                addToHistory('Слоты', bet, winAmount - bet, 'win');
                showToast(`🍀 Вы выиграли ${winAmount} очков!`, '#0f0');
            });
        } else {
            safeUpdateBalance(-bet).then(() => {
                resultDiv.className = 'result-message result-lose';
                resultDiv.innerHTML = `😔 ПРОИГРЫШ! ${results.join(' ')} | Потеряно: ${bet} 😔`;
                addToHistory('Слоты', bet, -bet, 'lose');
                showToast(`😢 Вы проиграли ${bet} очков...`, '#ff2a6d');
            });
        }
        setTimeout(() => { resultDiv.innerHTML = ''; resultDiv.className = 'result-message'; }, 3000);
    }
}

// ========== ИГРА 2: КОСТИ ==========
function rollDice() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('diceBet').value);
    const guess = parseInt(document.getElementById('diceGuess').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const roll = Math.floor(Math.random() * 6) + 1;
    const resultDiv = document.getElementById('diceResult');
    
    if (roll === guess) {
        const winAmount = bet * 5;
        updateUserBalance(winAmount - bet);
        resultDiv.className = 'result-message result-win';
        resultDiv.innerHTML = `🎲 ПОБЕДА! Выпало: ${roll} | Выигрыш: ${winAmount} 🎲`;
        addToHistory('Кости', bet, winAmount - bet, 'win');
        showToast(`🍀 Вы угадали! +${winAmount} очков!`, '#0f0');
    } else {
        updateUserBalance(-bet);
        resultDiv.className = 'result-message result-lose';
        resultDiv.innerHTML = `😔 ПРОИГРЫШ! Выпало: ${roll} | Потеряно: ${bet} 😔`;
        addToHistory('Кости', bet, -bet, 'lose');
        showToast(`😢 Выпало ${roll}`, '#ff2a6d');
    }
    setTimeout(() => { resultDiv.innerHTML = ''; resultDiv.className = 'result-message'; }, 3000);
}

// ========== ИГРА 3: КАРТЫ ==========
function playCard(choice) {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('cardBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const cardValue = Math.floor(Math.random() * 13) + 1;
    const cardNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardName = cardNames[cardValue - 1];
    const resultDiv = document.getElementById('cardResult');
    
    const isWin = (choice === 'higher' && cardValue > 7) || (choice === 'lower' && cardValue < 7);
    const isSeven = cardValue === 7;
    
    if (isSeven) {
        updateUserBalance(-bet);
        resultDiv.className = 'result-message result-lose';
        resultDiv.innerHTML = `🎴 ВЫПАЛО 7! ${cardName} | Потеряно: ${bet} 🎴`;
        addToHistory('Карты', bet, -bet, 'lose');
    } else if (isWin) {
        const winAmount = bet * 2;
        updateUserBalance(winAmount - bet);
        resultDiv.className = 'result-message result-win';
        resultDiv.innerHTML = `🎴 ПОБЕДА! Выпало: ${cardName} | Выигрыш: ${winAmount} 🎴`;
        addToHistory('Карты', bet, winAmount - bet, 'win');
    } else {
        updateUserBalance(-bet);
        resultDiv.className = 'result-message result-lose';
        resultDiv.innerHTML = `😔 ПРОИГРЫШ! Выпало: ${cardName} | Потеряно: ${bet} 😔`;
        addToHistory('Карты', bet, -bet, 'lose');
    }
    setTimeout(() => { resultDiv.innerHTML = ''; resultDiv.className = 'result-message'; }, 3000);
}

// ========== ИГРА 4: КОЛЕСО ФОРТУНЫ ==========
function spinWheel() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('wheelBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const wheel = document.getElementById('wheel');
    wheel.classList.add('spinning');
    
    const multipliers = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const winAmount = Math.floor(multiplier * bet);
    const resultDiv = document.getElementById('wheelResult');
    
    setTimeout(() => {
        wheel.classList.remove('spinning');
        if (winAmount > bet) {
            updateUserBalance(winAmount - bet);
            resultDiv.className = 'result-message result-win';
            resultDiv.innerHTML = `🎡 ПОБЕДА! x${multiplier} | Выигрыш: ${winAmount} 🎡`;
            addToHistory('Колесо', bet, winAmount - bet, 'win');
            showToast(`🍀 Множитель x${multiplier}! +${winAmount - bet} очков!`, '#0f0');
        } else if (winAmount === bet) {
            resultDiv.className = 'result-message';
            resultDiv.innerHTML = `🎡 НИЧЬЯ! x${multiplier} | Ставка возвращена 🎡`;
            addToHistory('Колесо', bet, 0, 'draw');
        } else {
            updateUserBalance(-bet);
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `😔 ПРОИГРЫШ! x${multiplier} | Потеряно: ${bet} 😔`;
            addToHistory('Колесо', bet, -bet, 'lose');
        }
        setTimeout(() => { resultDiv.innerHTML = ''; resultDiv.className = 'result-message'; }, 3000);
    }, 300);
}

// ========== ИГРА 5: ГОНКИ ==========
function startRace() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('raceBet').value);
    const choice = parseInt(document.getElementById('raceChoice').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const positions = [0, 0, 0];
    const speeds = [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1];
    const raceInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            positions[i] += speeds[i];
            const bar = document.getElementById(`racer${i}Bar`);
            if (bar) bar.style.width = Math.min(100, positions[i]) + '%';
        }
        if (Math.max(...positions) >= 100) {
            clearInterval(raceInterval);
            const winner = positions.indexOf(Math.max(...positions));
            const resultDiv = document.getElementById('raceResult');
            
            if (winner === choice) {
                const winAmount = bet * 3;
                updateUserBalance(winAmount - bet);
                resultDiv.className = 'result-message result-win';
                resultDiv.innerHTML = `🏁 ПОБЕДА! Выигрыш: ${winAmount} 🏁`;
                addToHistory('Гонки', bet, winAmount - bet, 'win');
            } else {
                updateUserBalance(-bet);
                resultDiv.className = 'result-message result-lose';
                resultDiv.innerHTML = `😔 ПРОИГРЫШ! Потеряно: ${bet} 😔`;
                addToHistory('Гонки', bet, -bet, 'lose');
            }
            setTimeout(() => {
                resultDiv.innerHTML = '';
                for (let i = 0; i < 3; i++) {
                    positions[i] = 0;
                    const bar = document.getElementById(`racer${i}Bar`);
                    if (bar) bar.style.width = '0%';
                }
            }, 3000);
        }
    }, 50);
}

// ========== ИГРА 6: САПЁР ==========
let minesActive = false;
let minesRevealed = 0;
let minesBet = 0;

function initMines() {
    const grid = document.getElementById('minesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'background: #010103; border: 2px solid #ffd700; border-radius: 10px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer;';
        cell.textContent = '?';
        cell.dataset.index = i;
        cell.onclick = () => revealMine(i);
        grid.appendChild(cell);
    }
}

function playMines() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('minesBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    minesBet = bet;
    minesActive = true;
    minesRevealed = 0;
    initMines();
    showToast('💣 Выбери 3 безопасные ячейки!', '#ffd700');
}

function revealMine(index) {
    if (!minesActive) return;
    const cell = document.querySelector(`#minesGrid div[data-index='${index}']`);
    if (!cell || cell.textContent !== '?') return;
    
    const isBomb = Math.random() < 0.3;
    
    if (isBomb) {
        cell.textContent = '💣';
        cell.style.borderColor = '#ff2a6d';
        updateUserBalance(-minesBet);
        const resultDiv = document.getElementById('minesResult');
        if (resultDiv) {
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `💣 ВЗРЫВ! Вы проиграли ${minesBet} очков 💣`;
            addToHistory('Сапёр', minesBet, -minesBet, 'lose');
        }
        minesActive = false;
        setTimeout(() => {
            if (resultDiv) resultDiv.innerHTML = '';
            initMines();
        }, 3000);
    } else {
        minesRevealed++;
        cell.textContent = '💎';
        cell.style.borderColor = '#0f0';
        
        if (minesRevealed >= 3) {
            const winAmount = minesBet * 5;
            updateUserBalance(winAmount - minesBet);
            const resultDiv = document.getElementById('minesResult');
            if (resultDiv) {
                resultDiv.className = 'result-message result-win';
                resultDiv.innerHTML = `💎 ПОБЕДА! Вы нашли 3 сокровища! Выигрыш: ${winAmount} 💎`;
                addToHistory('Сапёр', minesBet, winAmount - minesBet, 'win');
            }
            minesActive = false;
            setTimeout(() => {
                if (resultDiv) resultDiv.innerHTML = '';
                initMines();
            }, 3000);
        }
    }
}

// ========== ИГРА 7: БЛЭКДЖЕК ==========
let playerCards = [];
let dealerCards = [];
let bjActive = false;
let bjBet = 0;

function getCardValue(card) {
    if (card === 'J' || card === 'Q' || card === 'K') return 10;
    if (card === 'A') return 11;
    return parseInt(card);
}

function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    for (let card of cards) {
        let value = getCardValue(card);
        if (value === 11) aces++;
        score += value;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function dealCard() {
    const cards = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    return cards[Math.floor(Math.random() * cards.length)];
}

function updateBlackjackUI() {
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');
    const playerScoreSpan = document.getElementById('playerScore');
    const dealerScoreSpan = document.getElementById('dealerScore');
    
    if (playerCardsDiv) {
        playerCardsDiv.innerHTML = playerCards.map(c => {
            if (c === 'A') return '🃑';
            if (c === 'K') return '🃞';
            if (c === 'Q') return '🃝';
            if (c === 'J') return '🃛';
            return `🃏${c}`;
        }).join(' ');
    }
    if (playerScoreSpan) playerScoreSpan.textContent = calculateScore(playerCards);
    
    if (dealerCardsDiv && dealerCards.length > 0) {
        dealerCardsDiv.innerHTML = dealerCards.map((c, i) => {
            if (i === 0 && bjActive) return '🃟';
            if (c === 'A') return '🃑';
            if (c === 'K') return '🃞';
            if (c === 'Q') return '🃝';
            if (c === 'J') return '🃛';
            return `🃏${c}`;
        }).join(' ');
    }
    if (dealerScoreSpan) dealerScoreSpan.textContent = bjActive ? '?' : calculateScore(dealerCards);
}

function startBlackjack() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('bjBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    bjBet = bet;
    bjActive = true;
    playerCards = [dealCard(), dealCard()];
    dealerCards = [dealCard(), dealCard()];
    updateBlackjackUI();
    
    const playerScore = calculateScore(playerCards);
    if (playerScore === 21) {
        endBlackjack(true);
    }
}

function hit() {
    if (!bjActive) return;
    playerCards.push(dealCard());
    updateBlackjackUI();
    if (calculateScore(playerCards) > 21) {
        endBlackjack(false);
    }
}

function stand() {
    if (!bjActive) return;
    bjActive = false;
    while (calculateScore(dealerCards) < 17) {
        dealerCards.push(dealCard());
    }
    updateBlackjackUI();
    endBlackjack(false);
}

function endBlackjack(naturalWin) {
    const playerScore = calculateScore(playerCards);
    const dealerScore = calculateScore(dealerCards);
    const resultDiv = document.getElementById('bjResult');
    
    if (naturalWin || playerScore > 21) {
        updateUserBalance(-bjBet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `😔 ПРОИГРЫШ! ${playerScore}:${dealerScore} | Потеряно: ${bjBet} 😔`;
        }
        addToHistory('Блэкджек', bjBet, -bjBet, 'lose');
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        const winAmount = bjBet * 2;
        updateUserBalance(winAmount - bjBet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-win';
            resultDiv.innerHTML = `🎉 ПОБЕДА! ${playerScore}:${dealerScore} | Выигрыш: ${winAmount} 🎉`;
        }
        addToHistory('Блэкджек', bjBet, winAmount - bjBet, 'win');
    } else if (playerScore === dealerScore) {
        if (resultDiv) {
            resultDiv.className = 'result-message';
            resultDiv.innerHTML = `🎴 НИЧЬЯ! ${playerScore}:${dealerScore} | Ставка возвращена 🎴`;
        }
        addToHistory('Блэкджек', bjBet, 0, 'draw');
    } else {
        updateUserBalance(-bjBet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `😔 ПРОИГРЫШ! ${playerScore}:${dealerScore} | Потеряно: ${bjBet} 😔`;
        }
        addToHistory('Блэкджек', bjBet, -bjBet, 'lose');
    }
    bjActive = false;
    setTimeout(() => { if (resultDiv) resultDiv.innerHTML = ''; }, 3000);
}

function newBlackjack() {
    playerCards = [];
    dealerCards = [];
    bjActive = false;
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');
    const playerScoreSpan = document.getElementById('playerScore');
    const dealerScoreSpan = document.getElementById('dealerScore');
    const resultDiv = document.getElementById('bjResult');
    
    if (playerCardsDiv) playerCardsDiv.innerHTML = '🃟';
    if (dealerCardsDiv) dealerCardsDiv.innerHTML = '🃟';
    if (playerScoreSpan) playerScoreSpan.textContent = '0';
    if (dealerScoreSpan) dealerScoreSpan.textContent = '0';
    if (resultDiv) resultDiv.innerHTML = '';
}

// ========== ИГРА 8: ПОКЕР ==========
function dealPoker() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('pokerBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const suits = ['♠️', '♥️', '♣️', '♦️'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const hand = [];
    for (let i = 0; i < 5; i++) {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        hand.push(`${value}${suit}`);
    }
    
    const pokerCardsDiv = document.getElementById('pokerCards');
    if (pokerCardsDiv) {
        pokerCardsDiv.innerHTML = hand.map(c => `<div style="background:#010103; padding:15px; border-radius:15px; border:1px solid #ffd700;">${c}</div>`).join('');
    }
    
    const valueCount = {};
    hand.forEach(card => {
        const val = card.replace(/[^0-9JQKA]/g, '');
        valueCount[val] = (valueCount[val] || 0) + 1;
    });
    const counts = Object.values(valueCount);
    let multiplier = 0;
    if (counts.includes(5)) multiplier = 50;
    else if (counts.includes(4)) multiplier = 25;
    else if (counts.includes(3) && counts.includes(2)) multiplier = 10;
    else if (counts.includes(3)) multiplier = 5;
    else if (counts.filter(c => c === 2).length === 2) multiplier = 3;
    else if (counts.includes(2)) multiplier = 2;
    
    const winAmount = multiplier * bet;
    const resultDiv = document.getElementById('pokerResult');
    
    if (winAmount > 0) {
        updateUserBalance(winAmount - bet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-win';
            resultDiv.innerHTML = `♠️ ПОБЕДА! x${multiplier}! Выигрыш: ${winAmount} ♠️`;
        }
        addToHistory('Покер', bet, winAmount - bet, 'win');
    } else {
        updateUserBalance(-bet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `😔 ПРОИГРЫШ! Нет комбинации | Потеряно: ${bet} 😔`;
        }
        addToHistory('Покер', bet, -bet, 'lose');
    }
    setTimeout(() => { if (resultDiv) resultDiv.innerHTML = ''; }, 3000);
}

// ========== ИГРА 9: CRASH ==========
function startCrash() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('crashBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    if (crashInterval) clearInterval(crashInterval);
    
    currentMultiplier = 1.0;
    crashActive = true;
    const crashPoint = Math.random() * 8 + 1.2;
    
    const startBtn = document.getElementById('startCrashBtn');
    const cashoutBtn = document.getElementById('cashoutBtn');
    if (startBtn) startBtn.style.display = 'none';
    if (cashoutBtn) cashoutBtn.style.display = 'inline-block';
    
    const resultDiv = document.getElementById('crashResult');
    if (resultDiv) resultDiv.innerHTML = '';
    
    crashInterval = setInterval(() => {
        if (!crashActive) return;
        currentMultiplier += 0.05;
        const multiplierSpan = document.getElementById('crashMultiplier');
        if (multiplierSpan) multiplierSpan.textContent = currentMultiplier.toFixed(2) + 'x';
        
        if (currentMultiplier >= crashPoint) {
            crash();
        }
    }, 100);
    
    window.currentCrashBet = bet;
}

function cashout() {
    if (!crashActive) return;
    crashActive = false;
    clearInterval(crashInterval);
    
    const winAmount = Math.floor(currentMultiplier * window.currentCrashBet);
    updateUserBalance(winAmount - window.currentCrashBet);
    const resultDiv = document.getElementById('crashResult');
    if (resultDiv) {
        resultDiv.className = 'result-message result-win';
        resultDiv.innerHTML = `📈 ВЫ ЗАБРАЛИ! ${currentMultiplier.toFixed(2)}x | Выигрыш: ${winAmount} 📈`;
    }
    addToHistory('Crash', window.currentCrashBet, winAmount - window.currentCrashBet, 'win');
    
    const startBtn = document.getElementById('startCrashBtn');
    const cashoutBtn = document.getElementById('cashoutBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (cashoutBtn) cashoutBtn.style.display = 'none';
    setTimeout(() => { if (resultDiv) resultDiv.innerHTML = ''; }, 3000);
}

function crash() {
    if (!crashActive) return;
    crashActive = false;
    clearInterval(crashInterval);
    
    updateUserBalance(-window.currentCrashBet);
    const resultDiv = document.getElementById('crashResult');
    if (resultDiv) {
        resultDiv.className = 'result-message result-lose';
        resultDiv.innerHTML = `💥 КРАШ! ${currentMultiplier.toFixed(2)}x | Потеряно: ${window.currentCrashBet} 💥`;
    }
    addToHistory('Crash', window.currentCrashBet, -window.currentCrashBet, 'lose');
    
    const startBtn = document.getElementById('startCrashBtn');
    const cashoutBtn = document.getElementById('cashoutBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (cashoutBtn) cashoutBtn.style.display = 'none';
    setTimeout(() => { if (resultDiv) resultDiv.innerHTML = ''; }, 3000);
}

// ========== ИГРА 10: ПЛИНКО ==========
function dropPlinko() {
    if (!currentUser) { showToast('Сначала войдите!', '#ff2a6d'); return; }
    const bet = parseInt(document.getElementById('plinkoBet').value);
    if (isNaN(bet) || bet < 1) { showToast('Введите корректную ставку!', '#ff2a6d'); return; }
    if (bet > currentUser.casinoBalance) { showToast('Недостаточно очков!', '#ff2a6d'); return; }
    
    incrementCounter();
    const multipliers = [0.5, 1, 2, 3, 5, 3, 2, 1, 0.5];
    const position = Math.floor(Math.random() * multipliers.length);
    const multiplier = multipliers[position];
    const winAmount = Math.floor(multiplier * bet);
    const resultDiv = document.getElementById('plinkoResult');
    
    if (winAmount > bet) {
        updateUserBalance(winAmount - bet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-win';
            resultDiv.innerHTML = `🔴 ПОБЕДА! x${multiplier} | Выигрыш: ${winAmount} 🔴`;
        }
        addToHistory('Плинко', bet, winAmount - bet, 'win');
    } else if (winAmount === bet) {
        if (resultDiv) {
            resultDiv.className = 'result-message';
            resultDiv.innerHTML = `🔴 НИЧЬЯ! x${multiplier} | Ставка возвращена 🔴`;
        }
        addToHistory('Плинко', bet, 0, 'draw');
    } else {
        updateUserBalance(-bet);
        if (resultDiv) {
            resultDiv.className = 'result-message result-lose';
            resultDiv.innerHTML = `😔 ПРОИГРЫШ! x${multiplier} | Потеряно: ${bet} 😔`;
        }
        addToHistory('Плинко', bet, -bet, 'lose');
    }
    setTimeout(() => { if (resultDiv) resultDiv.innerHTML = ''; }, 3000);
}

// ========== АДМИН-ПАНЕЛЬ ДЛЯ КАЗИНО ==========
async function updateCasinoUserSelect() {
    const select = document.getElementById('adminUserSelect');
    if (!select) return;
    
    try {
        const users = await getAllUsersCloud();
        select.innerHTML = '<option value="">Выберите пользователя</option>';
        for (const user of users) {
            select.innerHTML += `<option value="${user.username}">${user.username} ${user.isAdmin ? '👑' : '👤'} | 💰 ${user.casinoBalance || 5000}</option>`;
        }
    } catch (e) {
        console.error('Ошибка загрузки пользователей:', e);
        select.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}

async function updateCasinoStats() {
    try {
        const users = await getAllUsersCloud();
        let totalBalance = 0;
        let playerCount = users.length;
        const topPlayers = [];
        
        for (const user of users) {
            const balance = user.casinoBalance || 5000;
            totalBalance += balance;
            topPlayers.push({ username: user.username, balance, isAdmin: user.isAdmin });
        }
        
        const avgBalance = playerCount > 0 ? Math.floor(totalBalance / playerCount) : 0;
        
        const totalPlayersSpan = document.getElementById('casinoTotalPlayers');
        const totalBalanceSpan = document.getElementById('casinoTotalBalance');
        const avgBalanceSpan = document.getElementById('casinoAvgBalance');
        const topPlayersDiv = document.getElementById('casinoTopPlayers');
        
        if (totalPlayersSpan) totalPlayersSpan.textContent = playerCount;
        if (totalBalanceSpan) totalBalanceSpan.textContent = totalBalance;
        if (avgBalanceSpan) avgBalanceSpan.textContent = avgBalance;
        
        if (topPlayersDiv) {
            const sorted = topPlayers.sort((a, b) => b.balance - a.balance).slice(0, 10);
            topPlayersDiv.innerHTML = sorted.map((p, idx) => `
                <div style="padding: 8px; border-bottom: 1px solid #05d9e830; display: flex; justify-content: space-between;">
                    <span>${idx + 1}. ${p.username} ${p.isAdmin ? '👑' : ''}</span>
                    <span style="color: #ffd700;">💰 ${p.balance}</span>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Ошибка обновления статистики:', e);
    }
}

async function addCasinoBalanceToUser() {
    const select = document.getElementById('adminUserSelect');
    const amountInput = document.getElementById('adminBalanceAmount');
    const username = select ? select.value : '';
    const amount = amountInput ? parseInt(amountInput.value) : 0;
    
    if (!username) {
        showToast('❌ Выберите пользователя!', '#ff2a6d');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        showToast('❌ Введите корректную сумму (больше 0)!', '#ff2a6d');
        return;
    }
    
    try {
        const success = await addCasinoBalanceCloud(username, amount);
        if (success) {
            showToast(`💰 ${username} получил ${amount} очков казино!`, '#ffd700');
            
            if (currentUser && currentUser.username === username) {
                currentUser.casinoBalance = (currentUser.casinoBalance || 5000) + amount;
                updateBalanceUI();
            }
            
            await updateCasinoUserSelect();
            await updateCasinoStats();
        } else {
            showToast('❌ Ошибка начисления!', '#ff2a6d');
        }
    } catch (e) {
        console.error('Ошибка:', e);
        showToast('❌ Ошибка начисления!', '#ff2a6d');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
window.addEventListener('load', async () => {
    // Ждём загрузку auth.js
    const authLoaded = await waitForAuth();
    if (!authLoaded) {
        showToast('Ошибка загрузки системы авторизации! Обновите страницу', '#ff2a6d');
        return;
    }
    
    // Восстановление сессии из облака
    if (typeof restoreSession !== 'undefined') {
        const user = await restoreSession();
        if (user) {
            currentUser = user;
            updateUIForUser();
            updateBalanceUI();
            loadGameHistory();
        }
    }
    
    // Переключение игр
    document.querySelectorAll('.casino-game-btn').forEach(btn => {
        btn.onclick = () => switchCasinoGame(btn.dataset.game);
    });
    
    // Кнопки игр
    const spinBtn = document.getElementById('spinBtn');
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const higherBtn = document.getElementById('higherBtn');
    const lowerBtn = document.getElementById('lowerBtn');
    const spinWheelBtn = document.getElementById('spinWheelBtn');
    const startRaceBtn = document.getElementById('startRaceBtn');
    const playMinesBtn = document.getElementById('playMinesBtn');
    const newBjBtn = document.getElementById('newBjBtn');
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const dealPokerBtn = document.getElementById('dealPokerBtn');
    const startCrashBtn = document.getElementById('startCrashBtn');
    const cashoutBtn = document.getElementById('cashoutBtn');
    const dropPlinkoBtn = document.getElementById('dropPlinkoBtn');
    
    if (spinBtn) spinBtn.onclick = spinSlot;
    if (rollDiceBtn) rollDiceBtn.onclick = rollDice;
    if (higherBtn) higherBtn.onclick = () => playCard('higher');
    if (lowerBtn) lowerBtn.onclick = () => playCard('lower');
    if (spinWheelBtn) spinWheelBtn.onclick = spinWheel;
    if (startRaceBtn) startRaceBtn.onclick = startRace;
    if (playMinesBtn) playMinesBtn.onclick = playMines;
    if (newBjBtn) newBjBtn.onclick = startBlackjack;
    if (hitBtn) hitBtn.onclick = hit;
    if (standBtn) standBtn.onclick = stand;
    if (dealPokerBtn) dealPokerBtn.onclick = dealPoker;
    if (startCrashBtn) startCrashBtn.onclick = startCrash;
    if (cashoutBtn) cashoutBtn.onclick = cashout;
    if (dropPlinkoBtn) dropPlinkoBtn.onclick = dropPlinko;
    
    // Авторизация
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const backToGamesBtn = document.getElementById('backToGamesBtn');
    const resetCounterBtn = document.getElementById('resetCounterBtn');
    
    if (loginBtn) loginBtn.onclick = () => document.getElementById('authModal').classList.remove('hidden');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (typeof logoutCloud === 'function') logoutCloud();
            currentUser = null;
            updateUIForUser();
            showToast('Вы вышли из аккаунта', '#05d9e8');
        };
    }
    if (closeAuthModal) closeAuthModal.onclick = () => document.getElementById('authModal').classList.add('hidden');
    if (backToGamesBtn) backToGamesBtn.onclick = () => window.location.href = 'index.html';
    if (resetCounterBtn) resetCounterBtn.onclick = () => { clickCounter = 0; const cd = document.getElementById('clickCountDisplay'); if(cd) cd.innerText = '0'; showToast('Счётчик обнулён', '#ff2a6d'); };
    
    // Регистрация/Логин
    let isLoginMode = true;
    const switchAuthMode = document.getElementById('switchAuthMode');
    const authModalTitle = document.getElementById('authModalTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authError = document.getElementById('authError');
    const authUsername = document.getElementById('authUsername');
    const authPassword = document.getElementById('authPassword');
    
    if (switchAuthMode) {
        switchAuthMode.onclick = (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                if (authModalTitle) authModalTitle.textContent = '🔐 Авторизация';
                if (authSubmitBtn) authSubmitBtn.textContent = 'Войти';
                if (switchAuthMode) switchAuthMode.textContent = 'Нет аккаунта? Зарегистрироваться';
            } else {
                if (authModalTitle) authModalTitle.textContent = '📝 Регистрация';
                if (authSubmitBtn) authSubmitBtn.textContent = 'Зарегистрироваться';
                if (switchAuthMode) switchAuthMode.textContent = 'Уже есть аккаунт? Войти';
            }
            if (authError) authError.textContent = '';
        };
    }
    
    if (authSubmitBtn) {
        authSubmitBtn.onclick = async () => {
            const username = authUsername ? authUsername.value.trim() : '';
            const password = authPassword ? authPassword.value.trim() : '';
            if (!username || !password) {
                if (authError) authError.textContent = 'Заполните все поля';
                return;
            }
            
            if (isLoginMode && typeof loginUserCloud !== 'undefined') {
                const res = await loginUserCloud(username, password);
                if (res.success) {
                    currentUser = res.user;
                    const authModalEl = document.getElementById('authModal');
                    if (authModalEl) authModalEl.classList.add('hidden');
                    updateUIForUser();
                    updateBalanceUI();
                    loadGameHistory();
                    showToast(`Добро пожаловать в казино, ${username}!`, '#ffd700');
                } else {
                    if (authError) authError.textContent = res.error;
                }
            } else if (typeof registerUserCloud !== 'undefined') {
                const res = await registerUserCloud(username, password);
                if (res.success) {
                    showToast('Регистрация успешна! Теперь войдите.', '#05d9e8');
                    isLoginMode = true;
                    if (authModalTitle) authModalTitle.textContent = '🔐 Авторизация';
                    if (authSubmitBtn) authSubmitBtn.textContent = 'Войти';
                    if (authError) authError.textContent = '';
                } else {
                    if (authError) authError.textContent = res.error;
                }
            }
        };
    }
    
    // Админ-панель вкладки для казино
    const adminCasinoTab = document.getElementById('adminCasinoTab');
    const adminCasinoPanel = document.getElementById('adminCasinoPanel');
    const addBalanceBtn = document.getElementById('addBalanceBtn');
    
    if (adminCasinoTab) {
        adminCasinoTab.onclick = async () => {
            adminCasinoTab.classList.add('active');
            if (adminCasinoPanel) adminCasinoPanel.classList.remove('hidden');
            await updateCasinoUserSelect();
            await updateCasinoStats();
        };
    }
    
    if (addBalanceBtn) {
        addBalanceBtn.onclick = addCasinoBalanceToUser;
    }
    
    initMines();
    
    const style = document.createElement('style');
    style.textContent = `.success-toast { font-family: 'Segoe UI', sans-serif; box-shadow: 0 0 20px rgba(0,0,0,0.3); } @keyframes fadeOut { 0% { opacity: 1; transform: translateX(-50%) translateY(0); } 70% { opacity: 1; } 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); visibility: hidden; } }`;
    document.head.appendChild(style);
});

console.log('🎰 Casino loaded! Облачная авторизация активна!');
