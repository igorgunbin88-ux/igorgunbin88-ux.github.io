const difficultyLevels = {
    "Легкий": {
        name: "🌱 ЛЕГКИЙ",
        multipliers: {
            playerHp: 1.3, playerDamage: 1.2, enemyHp: 0.7, enemyDamage: 0.7,
            expGain: 1.2, goldGain: 1.3, shopPrices: 0.7, artifactChance: 1.5,
            treasureAmount: 1.5, healAmount: 1.3, enemyAgility: 0.8, playerLuck: 1.2,
            craftCost: 0.7, upgradeCost: 0.7
        }
    },
    "Средний": {
        name: "⚔️ СРЕДНИЙ",
        multipliers: {
            playerHp: 1.0, playerDamage: 1.0, enemyHp: 1.0, enemyDamage: 1.0,
            expGain: 1.0, goldGain: 1.0, shopPrices: 1.0, artifactChance: 1.0,
            treasureAmount: 1.0, healAmount: 1.0, enemyAgility: 1.0, playerLuck: 1.0,
            craftCost: 1.0, upgradeCost: 1.0
        }
    },
    "Сложный": {
        name: "🔥 СЛОЖНЫЙ",
        multipliers: {
            playerHp: 0.85, playerDamage: 0.9, enemyHp: 1.3, enemyDamage: 1.2,
            expGain: 0.9, goldGain: 0.8, shopPrices: 1.3, artifactChance: 0.8,
            treasureAmount: 0.7, healAmount: 0.8, enemyAgility: 1.2, playerLuck: 0.9,
            craftCost: 1.3, upgradeCost: 1.3
        }
    },
    "Эксперт": {
        name: "💀 ЭКСПЕРТ",
        multipliers: {
            playerHp: 0.7, playerDamage: 0.8, enemyHp: 1.6, enemyDamage: 1.4,
            expGain: 0.7, goldGain: 0.6, shopPrices: 1.6, artifactChance: 0.6,
            treasureAmount: 0.5, healAmount: 0.6, enemyAgility: 1.4, playerLuck: 0.8,
            craftCost: 1.6, upgradeCost: 1.6
        }
    },
    "Безумие": {
        name: "😈 БЕЗУМИЕ",
        multipliers: {
            playerHp: 0.5, playerDamage: 0.7, enemyHp: 2.0, enemyDamage: 1.8,
            expGain: 0.5, goldGain: 0.4, shopPrices: 2.0, artifactChance: 0.4,
            treasureAmount: 0.3, healAmount: 0.5, enemyAgility: 1.6, playerLuck: 0.7,
            craftCost: 2.0, upgradeCost: 2.0
        }
    }
};

const races = {
    "Человек": { hp: 110, strength: 12, luck: 10, agility: 10, skill: "Адаптивность (+10% к опыту)", active: "Боевой дух", canBlock: true, blockChance: 15 },
    "Эльф": { hp: 85, strength: 9, luck: 12, agility: 18, skill: "Природная грация (+2% уклонения за ловкость)", active: "Стремительность", canBlock: false, blockChance: 0 },
    "Орк": { hp: 140, strength: 18, luck: 6, agility: 7, skill: "Боевая ярость (+15% урона при HP<40%)", active: "Ярость орка", canBlock: true, blockChance: 20 },
    "Дварф": { hp: 130, strength: 16, luck: 8, agility: 9, skill: "Горная стойкость (-20% к получаемому урону)", active: "Каменная кожа", canBlock: true, blockChance: 25 },
    "Гном": { hp: 95, strength: 11, luck: 15, agility: 14, skill: "Техномагия (+20% к золоту)", active: "Механическая птица", canBlock: true, blockChance: 10 },
    "Драконид": { hp: 120, strength: 15, luck: 10, agility: 12, skill: "Драконья кровь (регенерация 5% HP после боя)", active: "Огненное дыхание", canBlock: true, blockChance: 12 }
};

const baseEnemies = [
    { name: "Слизень", hp: 25, strength: 6, agility: 4, exp: 20, gold: 15 },
    { name: "Гоблин", hp: 35, strength: 8, agility: 10, exp: 30, gold: 25 },
    { name: "Скелет", hp: 45, strength: 11, agility: 7, exp: 45, gold: 35 },
    { name: "Призрак", hp: 30, strength: 13, agility: 18, exp: 60, gold: 50, evasion: true },
    { name: "Тёмный рыцарь", hp: 70, strength: 16, agility: 11, exp: 90, gold: 70 },
    { name: "Огненный элементаль", hp: 55, strength: 19, agility: 14, exp: 120, gold: 90 },
    { name: "Ледяной дракон", hp: 85, strength: 22, agility: 15, exp: 180, gold: 140 },
    { name: "Демон", hp: 100, strength: 24, agility: 17, exp: 220, gold: 180 }
];

const roomsList = {
    обычные: ["Тёмный коридор", "Зал статуй", "Комната с трещинами", "Библиотека", "Алтарь", "Тронный зал", "Логово", "Башня", "Река", "Грибной лес", "Сокровищница", "Лаборатория", "Склад", "Камера", "Кладбище", "Храм"],
    особые: ["Магический портал", "Комната зеркал", "Фонтан желаний", "Пентаграмма", "Ледяной зал", "Вулкан", "Сад духов", "Кузница"],
    редкие: ["Комната сокровищ", "Алтарь удачи", "Оружейная", "Зал славы", "Хранилище"]
};

const artifactsList = {
    common: [
        { name: "Амулет здоровья", effect: "hp", value: 15, desc: "+15 к HP" },
        { name: "Кольцо силы", effect: "strength", value: 2, desc: "+2 к силе" },
        { name: "Подкова удачи", effect: "luck", value: 3, desc: "+3 к удаче" },
        { name: "Перо ветра", effect: "agility", value: 2, desc: "+2 к ловкости" }
    ],
    rare: [
        { name: "Сердце дракона", effect: "hp", value: 30, desc: "+30 к HP" },
        { name: "Клинок короля", effect: "strength", value: 5, desc: "+5 к силе" },
        { name: "Плащ невидимости", effect: "evasion", value: 15, desc: "+15% к уклонению" }
    ],
    legendary: [
        { name: "Проклятый амулет", effect: "cursed", value: 50, desc: "+50 HP, -10% уклонения" },
        { name: "Меч возмездия", effect: "cursed", value: 10, desc: "+10 силы, -15% точности" }
    ]
};

// Глобальное состояние
let gameState = {
    initialized: false,
    player: null,
    currentEnemy: null,
    inCombat: false,
    currentFloor: 1,
    lastRooms: [],
    quests: {},
    enemiesKilled: 0,
    chestsFound: 0,
    artifacts: [],
    modalCallback: null,
    waitingForChoice: false
};

// Флаги для защиты от двойного нажатия
let actionInProgress = false;
let lastActionTime = 0;
const ACTION_DELAY = 500;
let isModalOpen = false;
let isChoiceInProgress = false;
let isNextFloorInProgress = false;

// -------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --------------------
function addLog(message, type = "info") {
    const logDiv = document.getElementById("gameLog");
    if (!logDiv) return;
    const entry = document.createElement("div");
    entry.className = `log-entry`;
    entry.innerHTML = message;
    logDiv.appendChild(entry);
    entry.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "none";
    isModalOpen = false;
    
    if (window.pendingStatUpgrade) {
        window.pendingStatUpgrade = null;
    }
    
    if (gameState.modalCallback && gameState.waitingForChoice) {
        const callback = gameState.modalCallback;
        gameState.modalCallback = null;
        gameState.waitingForChoice = false;
        if (callback) callback(true);
    } else {
        gameState.modalCallback = null;
        gameState.waitingForChoice = false;
    }
}

function showModal(title, content, onClose = null) {
  
    
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `<div style="font-size: 24px; color: #05d9e8; margin-bottom: 15px;">${title}</div>${content}`;
    modal.style.display = "flex";
    gameState.modalCallback = onClose;
    gameState.waitingForChoice = true;
    isModalOpen = true;
}

// Обработчик закрытия модального окна по клику на фон
const modalElement = document.getElementById("modal");
if (modalElement) {
    modalElement.addEventListener("click", function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Обрабатываем клавишу Escape для закрытия
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        const modal = document.getElementById("modal");
        if (modal && modal.style.display === "flex") {
            closeModal();
        }
    }
});

function updateStatsUI() {
    if (!gameState.player) return;
    const p = gameState.player;
    const nameEl = document.getElementById("playerName");
    const diffEl = document.getElementById("playerDifficult");
    const raceEl = document.getElementById("playerRace");
    const levelEl = document.getElementById("playerLevel");
    const hpEl = document.getElementById("playerHp");
    const strengthEl = document.getElementById("playerStrength");
    const agilityEl = document.getElementById("playerAgility");
    const luckEl = document.getElementById("playerLuck");
    const goldEl = document.getElementById("playerGold");
    const weaponEl = document.getElementById("playerWeapon");
    const armorEl = document.getElementById("playerArmor");
    const floorEl = document.getElementById("currentFloor");
    const hpFill = document.getElementById("playerHpFill");
    
    if (nameEl) nameEl.innerText = p.name;
    if (diffEl) diffEl.innerHTML = `<small>${difficultyLevels[p.difficulty].name}</small>`;
    if (raceEl) raceEl.innerHTML = p.race;
    if (levelEl) levelEl.innerText = p.level;
    if (hpEl) hpEl.innerHTML = `${p.hp}/${p.maxHp}`;
    if (strengthEl) strengthEl.innerText = p.strength;
    if (agilityEl) agilityEl.innerText = p.agility;
    if (luckEl) luckEl.innerText = p.luck;
    if (goldEl) goldEl.innerText = p.gold;
    if (weaponEl) weaponEl.innerText = p.weapon || "Нет";
    if (armorEl) armorEl.innerText = p.armor || "Нет";
    if (floorEl) floorEl.innerText = gameState.currentFloor;
    
    if (hpFill) {
        const hpPercent = (p.hp / p.maxHp) * 100;
        hpFill.style.width = `${hpPercent}%`;
        hpFill.innerText = `${Math.floor(hpPercent)}%`;
        hpFill.style.background = "linear-gradient(90deg, rgb(71 255 0 / 82%), rgb(23 174 23 / 84%))";
        hpFill.style.borderRadius = "20px";
    }
}

function updateEnemyUI() {
    if (!gameState.currentEnemy) return;
    const e = gameState.currentEnemy;
    const nameEl = document.getElementById("enemyName");
    const fill = document.getElementById("enemyHpFill");
    
    if (nameEl) nameEl.innerText = e.name;
    if (fill) {
        const hpPercent = (e.currentHp / e.maxHp) * 100;
        fill.style.width = `${hpPercent}%`;
        fill.innerText = `${Math.floor(hpPercent)}%`;
    }
}

function getEnemyForFloor(floor) {
    let enemyIdx;
    if (floor <= 10) enemyIdx = Math.floor(Math.random() * 3);
    else if (floor <= 20) enemyIdx = 2 + Math.floor(Math.random() * 3);
    else if (floor <= 35) enemyIdx = 3 + Math.floor(Math.random() * 3);
    else if (floor <= 50) enemyIdx = 4 + Math.floor(Math.random() * 3);
    else if (floor <= 70) enemyIdx = 5 + Math.floor(Math.random() * 3);
    else enemyIdx = 6 + Math.floor(Math.random() * 2);

    const enemy = { ...baseEnemies[enemyIdx] };
    const mult = gameState.player.diffMult;
    enemy.maxHp = Math.floor(enemy.hp * mult.enemyHp);
    enemy.currentHp = enemy.maxHp;
    enemy.strength = Math.floor(enemy.strength * mult.enemyDamage);
    enemy.agility = Math.floor(enemy.agility * mult.enemyAgility);
    enemy.exp = Math.floor(enemy.exp * mult.expGain);
    enemy.gold = Math.floor(enemy.gold * mult.goldGain);
    return enemy;
}

function generateRoom() {
    let roomType = "обычные";
    if (gameState.currentFloor % 20 === 0) roomType = "редкие";
    else if (gameState.currentFloor % 5 === 0) roomType = "особые";

    let available = [...roomsList[roomType]];
    for (let last of gameState.lastRooms) {
        const idx = available.indexOf(last);
        if (idx !== -1) available.splice(idx, 1);
    }
    if (available.length === 0) available = [...roomsList[roomType]];
    const room = available[Math.floor(Math.random() * available.length)];
    gameState.lastRooms.push(room);
    if (gameState.lastRooms.length > 5) gameState.lastRooms.shift();
    return room;
}

function generateEvent() {
    const floor = gameState.currentFloor;
    if (floor === 100) return "boss";
    if (floor % 15 === 0 && floor > 10) return "cursed";
    if (floor % 10 === 0) return "special";
    const events = ["enemy", "npc", "empty", "treasure", "artifact"];
    const weights = [50, 20, 10, 15, 5];
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < events.length; i++) {
        sum += weights[i];
        if (rand <= sum) return events[i];
    }
    return "enemy";
}

// -------------------- КЛАСС ИГРОКА --------------------
class Player {
    constructor(name, race, difficulty) {
        this.name = name;
        this.race = race;
        this.difficulty = difficulty;
        this.diffMult = difficultyLevels[difficulty].multipliers;
        this.raceData = races[race];

        this.baseMaxHp = Math.floor(this.raceData.hp * this.diffMult.playerHp);
        this.maxHp = this.baseMaxHp;
        this.hp = this.maxHp;
        this.baseStrength = Math.floor(this.raceData.strength * this.diffMult.playerDamage);
        this.strength = this.baseStrength;
        this.luck = Math.floor(this.raceData.luck * this.diffMult.playerLuck);
        this.baseAgility = this.raceData.agility;
        this.agility = this.raceData.agility;

        this.level = 1;
        this.exp = 0;
        this.gold = Math.floor(150 * (this.difficulty === "Легкий" ? 1.3 : this.difficulty === "Средний" ? 1 : this.difficulty === "Сложный" ? 0.8 : this.difficulty === "Эксперт" ? 0.6 : 0.4));

        this.weapon = null;
        this.armor = null;
        this.weaponBonus = 0;
        this.armorReduction = 0;

        this.inventory = [];
        this.activeSkillCooldown = 0;
        this.old_weapons = [];
        this.old_armors = [];

        const startFood = { "Человек": "Хлеб", "Эльф": "Ягоды", "Орк": "Мясо", "Дварф": "Хлеб", "Гном": "Суп", "Драконид": "Мясо" };
        const heals = { "Хлеб": 20, "Ягоды": 15, "Мясо": 25, "Суп": 20 };
        this.inventory.push(`${startFood[race]} (лечит ${Math.floor(heals[startFood[race]] * this.diffMult.healAmount)} HP)`);
    }

    getEvasionChance() {
        let base = this.race === "Эльф" ? this.agility * 2 : Math.floor(this.agility / 2);
        return Math.min(60, Math.max(5, base));
    }

    getBlockChance() {
        if (!this.raceData.canBlock) return 0;
        let base = this.raceData.blockChance;
        if (this.race === "Дварф") base += 5;
        return Math.min(40, base);
    }

    heal(amount) {
        amount = Math.floor(amount * this.diffMult.healAmount);
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return amount;
    }

    takeDamage(dmg) {
        let reduced = Math.max(1, dmg - this.armorReduction);
        if (this.race === "Дварф") reduced = Math.floor(reduced * 0.8);
        this.hp -= reduced;
        if (this.hp < 0) this.hp = 0;
        return reduced;
    }

    isAlive() { return this.hp > 0; }

    attack(enemyAgility) {
        let hitChance = 80 + Math.floor((this.luck - enemyAgility) / 2);
        hitChance = Math.min(95, Math.max(30, hitChance));
        if (Math.random() * 100 > hitChance) return { damage: 0, crit: false, miss: true };

        let damage = Math.floor(Math.random() * 5) + 4 + Math.floor(this.strength / 3) + this.weaponBonus;
        let crit = Math.random() * 100 <= (this.luck + (this.race === "Эльф" ? 10 : 0));
        if (crit) damage *= 2;
        if (this.race === "Орк" && this.hp < this.maxHp * 0.4) damage = Math.floor(damage * 1.15);
        if (this.race === "Драконид") damage = Math.floor(damage * 1.1);
        return { damage, crit, miss: false };
    }

    gainExp(amount) {
        amount = Math.floor(amount * this.diffMult.expGain);
        if (this.race === "Человек") amount = Math.floor(amount * 1.1);
        this.exp += amount;
        this.checkLevelUp();
    }

    gainGold(amount) {
        amount = Math.floor(amount * this.diffMult.goldGain);
        if (this.race === "Человек") amount = Math.floor(amount * 1.05);
        if (this.race === "Гном") amount = Math.floor(amount * 1.2);
        this.gold += amount;
        return amount;
    }

    checkLevelUp() {
        let expNeeded = this.level * 60;
        let levelsGained = 0;
        
        while (this.exp >= expNeeded) {
            this.level++;
            this.exp -= expNeeded;
            levelsGained++;
            expNeeded = this.level * 60;
        }
        
        if (levelsGained > 0) {
            this.baseMaxHp += Math.floor(15 * this.diffMult.playerHp) * levelsGained;
            this.maxHp = this.baseMaxHp;
            this.hp = this.maxHp;
            this.baseStrength += Math.floor(2 * this.diffMult.playerDamage) * levelsGained;
            this.strength = this.baseStrength;
            
            addLog(`🎉 УРОВЕНЬ ПОВЫШЕН! Теперь ${this.level} уровень! 🎉`, "victory");
            
            for (let i = 0; i < levelsGained; i++) {
                this.showStatUpgradeModal();
            }
        }
    }
    
    showStatUpgradeModal() {
        const player = this;
        
        let content = `
            <div style="text-align: center;">
                <div style="font-size: 18px; margin-bottom: 20px;">📊 Выберите характеристику для улучшения!</div>
                <div style="margin-bottom: 10px;">У вас есть 1 очко характеристик</div>
                <div class="choice-buttons" style="flex-direction: column; gap: 10px;">
                    <button class="choice-btn" onclick="window.upgradeStat('strength')">💪 Сила (+2 к урону)</button>
                    <button class="choice-btn" onclick="window.upgradeStat('agility')">🏃 Ловкость (+1 к уклонению)</button>
                    <button class="choice-btn" onclick="window.upgradeStat('luck')">🍀 Удача (+1% к криту и точности)</button>
                    <button class="choice-btn" onclick="window.upgradeStat('hp')">❤️ HP (+15 к максимуму)</button>
                </div>
            </div>
        `;
        
        window.pendingStatUpgrade = player;
        showModal("📈 ПОВЫШЕНИЕ УРОВНЯ!", content);
    }
    
    upgradeStat(stat) {
        switch(stat) {
            case 'strength':
                this.baseStrength += 2;
                this.strength = this.baseStrength;
                addLog(`💪 Сила увеличена до ${this.strength}!`, "item");
                break;
            case 'agility':
                this.baseAgility += 1;
                this.agility = this.baseAgility;
                addLog(`🏃 Ловкость увеличена до ${this.agility}!`, "item");
                break;
            case 'luck':
                this.luck += 1;
                addLog(`🍀 Удача увеличена до ${this.luck}!`, "item");
                break;
            case 'hp':
                this.baseMaxHp += 15;
                this.maxHp = this.baseMaxHp;
                this.hp = this.maxHp;
                addLog(`❤️ Максимальное HP увеличено до ${this.maxHp}!`, "item");
                break;
        }
        updateStatsUI();
        closeModal();
    }

    afterBattle() {
        if (this.race === "Драконид") {
            let regen = Math.floor(this.maxHp * 0.05);
            this.hp = Math.min(this.maxHp, this.hp + regen);
            addLog(`🐉 Драконья кровь восстановила ${regen} HP!`, "item");
        }
        if (this.activeSkillCooldown > 0) this.activeSkillCooldown--;
    }

    useActiveSkill() {
        if (this.activeSkillCooldown > 0) {
            addLog(`❌ Способность перезаряжается! Осталось: ${this.activeSkillCooldown} этажей`, "error");
            return null;
        }
        let result = null;
        if (this.race === "Драконид") {
            let damage = Math.floor(Math.random() * 51) + 50;
            damage = Math.floor(damage * this.diffMult.playerDamage);
            addLog(`🐉 ОГНЕННОЕ ДЫХАНИЕ! ${damage} урона!`, "combat");
            result = { type: "damage", value: damage };
        } else {
            addLog(`⚡ АКТИВНАЯ СПОСОБНОСТЬ: ${this.raceData.active}!`, "combat");
            result = { type: "buff", value: 1.3 };
        }
        this.activeSkillCooldown = (this.race === "Эльф" || this.race === "Драконид") ? 3 : 4;
        return result;
    }
    
    equip_weapon(weaponName, bonus) {
        if (this.weapon) {
            this.old_weapons = this.old_weapons || [];
            this.old_weapons.push(this.weapon);
        }
        this.weapon = weaponName;
        this.weaponBonus = bonus;
        addLog(`⚔️ Вы экипировали ${weaponName} (+${bonus} урона)!`, "item");
    }

    equip_armor(armorName, reduction) {
        if (this.armor) {
            this.old_armors = this.old_armors || [];
            this.old_armors.push(this.armor);
        }
        this.armor = armorName;
        this.armorReduction = reduction;
        addLog(`🛡️ Вы надели ${armorName} (-${reduction} к урону)!`, "item");
    }
}

function upgradeStat(stat) {
    if (window.pendingStatUpgrade) {
        window.pendingStatUpgrade.upgradeStat(stat);
        window.pendingStatUpgrade = null;
    }
}
window.upgradeStat = upgradeStat;

// -------------------- СИСТЕМА СОХРАНЕНИЯ ПРОГРЕССА --------------------
function saveGameProgress() {
    if (!gameState.initialized || !gameState.player) {
        console.log("Нет активной игры для сохранения");
        return false;
    }
    
    const saveData = {
        version: "1.0",
        timestamp: Date.now(),
        player: {
            name: gameState.player.name,
            race: gameState.player.race,
            difficulty: gameState.player.difficulty,
            level: gameState.player.level,
            exp: gameState.player.exp,
            gold: gameState.player.gold,
            hp: gameState.player.hp,
            maxHp: gameState.player.maxHp,
            strength: gameState.player.strength,
            baseStrength: gameState.player.baseStrength,
            agility: gameState.player.agility,
            baseAgility: gameState.player.baseAgility,
            luck: gameState.player.luck,
            weapon: gameState.player.weapon,
            armor: gameState.player.armor,
            weaponBonus: gameState.player.weaponBonus,
            armorReduction: gameState.player.armorReduction,
            inventory: gameState.player.inventory,
            activeSkillCooldown: gameState.player.activeSkillCooldown
        },
        gameState: {
            currentFloor: gameState.currentFloor,
            lastRooms: gameState.lastRooms,
            quests: gameState.quests,
            enemiesKilled: gameState.enemiesKilled,
            chestsFound: gameState.chestsFound,
            artifacts: gameState.artifacts
        }
    };
    
    localStorage.setItem('roguelike_save', JSON.stringify(saveData));
    
    const userId = localStorage.getItem('neon_user_id');
    const username = localStorage.getItem('neon_username');
    
    if (userId && username && typeof window.updateGameProgressCloud === 'function') {
        window.updateGameProgressCloud(username, saveData).catch(e => console.error("Ошибка облачного сохранения:", e));
    }
    
    addLog(`💾 Прогресс сохранён! (Этаж ${gameState.currentFloor})`, "info");
    return true;
}

async function loadGameProgress() {
    let saveData = null;
    
    const userId = localStorage.getItem('neon_user_id');
    const username = localStorage.getItem('neon_username');
    
    if (userId && username && typeof window.loadGameProgressCloud === 'function') {
        try {
            saveData = await window.loadGameProgressCloud(username);
            if (saveData) {
                addLog(`☁️ Загружено облачное сохранение для ${username}`, "info");
            }
        } catch (e) {
            console.error("Ошибка загрузки облачного сохранения:", e);
        }
    }
    
    if (!saveData) {
        const localSave = localStorage.getItem('roguelike_save');
        if (localSave) {
            try {
                saveData = JSON.parse(localSave);
                addLog(`💾 Загружено локальное сохранение`, "info");
            } catch (e) {
                console.error("Ошибка загрузки локального сохранения:", e);
            }
        }
    }
    
    if (saveData && saveData.player) {
        restoreGameFromSave(saveData);
        return true;
    }
    
    return false;
}

function restoreGameFromSave(saveData) {
    const pData = saveData.player;
    const player = new Player(pData.name, pData.race, pData.difficulty);
    
    player.level = pData.level;
    player.exp = pData.exp;
    player.gold = pData.gold;
    player.hp = pData.hp;
    player.maxHp = pData.maxHp;
    player.strength = pData.strength;
    player.baseStrength = pData.baseStrength;
    player.agility = pData.agility;
    player.baseAgility = pData.baseAgility;
    player.luck = pData.luck;
    player.weapon = pData.weapon;
    player.armor = pData.armor;
    player.weaponBonus = pData.weaponBonus;
    player.armorReduction = pData.armorReduction;
    player.inventory = pData.inventory || [];
    player.activeSkillCooldown = pData.activeSkillCooldown || 0;
    
    gameState = {
        initialized: true,
        player: player,
        currentEnemy: null,
        inCombat: false,
        currentFloor: saveData.gameState.currentFloor,
        lastRooms: saveData.gameState.lastRooms || [],
        quests: saveData.gameState.quests || {},
        enemiesKilled: saveData.gameState.enemiesKilled || 0,
        chestsFound: saveData.gameState.chestsFound || 0,
        artifacts: saveData.gameState.artifacts || [],
        modalCallback: null,
        waitingForChoice: false
    };
    
    updateStatsUI();
    const initialPanel = document.getElementById("initialPanel");
    const statsPanel = document.getElementById("statsPanel");
    const gameLog = document.getElementById("gameLog");
    const combatPanel = document.getElementById("combatPanel");
    
    if (initialPanel) initialPanel.style.display = "none";
    if (statsPanel) statsPanel.style.display = "block";
    if (gameLog) gameLog.style.display = "block";
    if (combatPanel) combatPanel.style.display = "none";
    
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) {
        userDisplay.innerHTML = `${pData.name} (${pData.race})`;
    }
    
    addLog(`✨ Добро пожаловать обратно, ${pData.name}!`, "info");
    addLog(`📊 Продолжаем с ${gameState.currentFloor} этажа`, "info");
    addLog(`💰 У вас ${player.gold} монет`, "info");
    
    showResumeGameModal();
}

function showResumeGameModal() {
    let content = `
        <div style="text-align: center;">
            <div style="font-size: 18px; margin-bottom: 20px;">📀 Найдено сохранение!</div>
            <div style="margin-bottom: 10px;">Этаж: ${gameState.currentFloor}</div>
            <div style="margin-bottom: 10px;">Уровень: ${gameState.player.level}</div>
            <div style="margin-bottom: 10px;">Монет: ${gameState.player.gold}</div>
            <div class="choice-buttons" style="margin-top: 20px;">
                <button class="choice-btn" onclick="window.continueGame()">▶️ Продолжить игру</button>
                <button class="choice-btn" onclick="window.startNewGameFromSave()">🔄 Начать новую игру</button>
            </div>
        </div>
    `;
    showModal("💾 ЗАГРУЗКА СОХРАНЕНИЯ", content);
}

function continueGame() {
    closeModal();
    addLog(`🎮 Продолжаем исследование подземелья...`, "info");
    if (!gameState.inCombat) {
        nextFloor();
    }
}

function startNewGameFromSave() {
    closeModal();
    setTimeout(() => {
        if (confirm("Начать новую игру? Текущее сохранение будет потеряно!")) {
            localStorage.removeItem('roguelike_save');
            window.showNewGameMenu();
        }
    }, 100);
}

function manualSave() {
    if (gameState.initialized && gameState.player) {
        saveGameProgress();
        addLog(`💾 Игра сохранена!`, "item");
    } else {
        addLog(`❌ Нет активной игры для сохранения!`, "error");
    }
}

function autoSave() {
    if (gameState.initialized && gameState.player && gameState.player.isAlive()) {
        saveGameProgress();
    }
}

// -------------------- ОСНОВНЫЕ ИГРОВЫЕ ФУНКЦИИ --------------------
function startCombat(enemy) {
    // Проверка, что не в бою
    if (gameState.inCombat) {
        console.log("⚠️ Уже в бою, нельзя начать новый");
        return;
    }
    
    // Проверка, что враг корректен
    if (!enemy || enemy.maxHp <= 0 || !enemy.name) {
        addLog(`⚠️ Ошибка: некорректные данные врага!`, "error");
        // Пропускаем этого врага и идём дальше
        setTimeout(() => {
            if (!gameState.inCombat) {
                nextFloor();
            }
        }, 100);
        return;
    }
    
    gameState.currentEnemy = enemy;
    gameState.inCombat = true;
    const initialPanel = document.getElementById("initialPanel");
    const statsPanel = document.getElementById("statsPanel");
    const combatPanel = document.getElementById("combatPanel");
    const gameLog = document.getElementById("gameLog");
    
    if (initialPanel) initialPanel.style.display = "none";
    if (statsPanel) statsPanel.style.display = "block";
    if (combatPanel) combatPanel.style.display = "block";
    if (gameLog) gameLog.style.display = "block";
    updateEnemyUI();
    updateStatsUI();
}

async function combatAttack() {
    if (actionInProgress) {
        addLog(`⏳ Подождите, действие уже выполняется...`, "error");
        return;
    }
    
    const now = Date.now();
    if (now - lastActionTime < ACTION_DELAY) {
        addLog(`⏳ Не так быстро! Подождите немного...`, "error");
        return;
    }
    
    actionInProgress = true;
    lastActionTime = now;
    
    try {
        const p = gameState.player;
        const e = gameState.currentEnemy;
        
        // Проверка, что враг существует
        if (!e) {
            addLog(`⚠️ Ошибка: враг не найден!`, "error");
            actionInProgress = false;
            nextFloor();
            return;
        }
        
        const attackResult = p.attack(e.agility);

        if (attackResult.miss) {
            addLog(`❌ ПРОМАХ!`, "combat");
        } else {
            e.currentHp -= attackResult.damage;
            addLog(`💥 Вы нанесли ${attackResult.damage} урона! ${attackResult.crit ? "✨ КРИТ! ✨" : ""}`, "combat");
            updateEnemyUI();
        }

        if (e.currentHp <= 0) {
            const gold = p.gainGold(e.gold);
            addLog(`✅ Победа! +${e.exp} опыта, +${gold} монет!`, "victory");
            p.gainExp(e.exp);
            gameState.enemiesKilled++;
            
            // Очищаем текущего врага
            gameState.currentEnemy = null;
            
            // Завершаем бой
            endCombat(true);
            return;
        }

        // Ход врага (только если враг ещё жив)
        let enemyDamage = Math.floor(Math.random() * 6) + 3 + Math.floor(e.strength / 4);
        if (Math.random() * 100 <= p.getEvasionChance()) {
            addLog(`🏃 ВЫ УКЛОНИЛИСЬ ОТ АТАКИ!`, "combat");
            enemyDamage = 0;
        }
        if (enemyDamage > 0 && Math.random() * 100 <= p.getBlockChance()) {
            addLog(`🛡️ ВЫ БЛОКИРОВАЛИ УДАР! Урон снижен на 50%!`, "combat");
            enemyDamage = Math.floor(enemyDamage / 2);
        }
        if (enemyDamage > 0) {
            const actual = p.takeDamage(enemyDamage);
            addLog(`💔 ${e.name} атакует и наносит ${actual} урона! (HP: ${p.hp}/${p.maxHp})`, "combat");
            updateStatsUI();
        }

        if (!p.isAlive()) {
            addLog(`💀 ВЫ ПОГИБЛИ В БОЮ... 💀`, "error");
            endGame(false);
        }
    } catch (error) {
        console.error("Ошибка в combatAttack:", error);
        addLog(`⚠️ Произошла ошибка в бою!`, "error");
        actionInProgress = false;
        // Пытаемся восстановиться
        setTimeout(() => {
            if (gameState.currentEnemy && gameState.currentEnemy.currentHp > 0) {
                // Если враг ещё жив, продолжаем бой
                actionInProgress = false;
            } else {
                // Иначе завершаем бой
                endCombat(true);
            }
        }, 100);
    } finally {
        setTimeout(() => {
            actionInProgress = false;
        }, 200);
    }
}

async function useFood() {
    if (actionInProgress) {
        addLog(`⏳ Подождите, действие уже выполняется...`, "error");
        return;
    }
    
    const now = Date.now();
    if (now - lastActionTime < ACTION_DELAY) {
        addLog(`⏳ Не так быстро! Подождите немного...`, "error");
        return;
    }
    
    actionInProgress = true;
    lastActionTime = now;
    
    try {
        const p = gameState.player;
        const foodItems = p.inventory.filter(i => i.includes("лечит"));
        if (foodItems.length === 0) {
            addLog(`❌ Нет еды в инвентаре!`, "error");
            return;
        }
        let content = `<div>Выберите еду:</div>`;
        for (let i = 0; i < foodItems.length; i++) {
            content += `<div class="modal-item" onclick="window.eatFood(${i})">🍖 ${foodItems[i]}</div>`;
        }
        content += `<div class="modal-button" onclick="closeModal()">Отмена</div>`;
        showModal("🍖 Использовать еду", content);
    } finally {
        setTimeout(() => {
            actionInProgress = false;
        }, 100);
    }
}

function eatFood(index) {
    const p = gameState.player;
    const foodItems = p.inventory.filter(i => i.includes("лечит"));
    if (index >= 0 && index < foodItems.length) {
        const item = foodItems[index];
        const match = item.match(/лечит (\d+)/);
        if (match) {
            const healed = p.heal(parseInt(match[1]));
            p.inventory = p.inventory.filter(i => i !== item);
            addLog(`🍽️ Вы съели ${item}. HP +${healed}!`, "item");
            updateStatsUI();
        }
    }
    closeModal();
    if (gameState.inCombat) updateEnemyUI();
}

async function useActiveSkill() {
    if (actionInProgress) {
        addLog(`⏳ Подождите, действие уже выполняется...`, "error");
        return;
    }
    
    const now = Date.now();
    if (now - lastActionTime < ACTION_DELAY) {
        addLog(`⏳ Не так быстро! Подождите немного...`, "error");
        return;
    }
    
    actionInProgress = true;
    lastActionTime = now;
    
    try {
        const result = gameState.player.useActiveSkill();
        if (result && result.type === "damage" && gameState.currentEnemy) {
            gameState.currentEnemy.currentHp -= result.value;
            updateEnemyUI();
            if (gameState.currentEnemy.currentHp <= 0) {
                const p = gameState.player;
                const gold = p.gainGold(gameState.currentEnemy.gold);
                addLog(`✅ Победа! +${gameState.currentEnemy.exp} опыта, +${gold} монет!`, "victory");
                p.gainExp(gameState.currentEnemy.exp);
                endCombat(true);
            } else {
                enemyTurnAfterSkill();
            }
        }
    } finally {
        setTimeout(() => {
            actionInProgress = false;
        }, 100);
    }
}

function enemyTurnAfterSkill() {
    const p = gameState.player;
    const e = gameState.currentEnemy;
    let enemyDamage = Math.floor(Math.random() * 6) + 3 + Math.floor(e.strength / 4);
    if (Math.random() * 100 <= p.getEvasionChance()) {
        addLog(`🏃 ВЫ УКЛОНИЛИСЬ ОТ АТАКИ!`, "combat");
        enemyDamage = 0;
    }
    if (enemyDamage > 0 && Math.random() * 100 <= p.getBlockChance()) {
        addLog(`🛡️ ВЫ БЛОКИРОВАЛИ УДАР! Урон снижен на 50%!`, "combat");
        enemyDamage = Math.floor(enemyDamage / 2);
    }
    if (enemyDamage > 0) {
        const actual = p.takeDamage(enemyDamage);
        addLog(`💔 ${e.name} атакует и наносит ${actual} урона! (HP: ${p.hp}/${p.maxHp})`, "combat");
        updateStatsUI();
    }
    if (!p.isAlive()) {
        addLog(`💀 ВЫ ПОГИБЛИ В БОЮ... 💀`, "error");
        endGame(false);
    }
}

async function tryEscape() {
    if (actionInProgress) {
        addLog(`⏳ Подождите, действие уже выполняется...`, "error");
        return;
    }
    
    const now = Date.now();
    if (now - lastActionTime < ACTION_DELAY) {
        addLog(`⏳ Не так быстро! Подождите немного...`, "error");
        return;
    }
    
    actionInProgress = true;
    lastActionTime = now;
    
    try {
        if (Math.random() < 0.5) {
            addLog(`🏃 Вы сбежали с этажа!`, "info");
            endCombat(false);
        } else {
            addLog(`😫 Побег не удался!`, "error");
            const p = gameState.player;
            const e = gameState.currentEnemy;
            let enemyDamage = Math.floor(Math.random() * 6) + 3 + Math.floor(e.strength / 4);
            if (Math.random() * 100 <= p.getEvasionChance()) enemyDamage = 0;
            if (enemyDamage > 0 && Math.random() * 100 <= p.getBlockChance()) enemyDamage = Math.floor(enemyDamage / 2);
            if (enemyDamage > 0) {
                const actual = p.takeDamage(enemyDamage);
                addLog(`💔 ${e.name} атакует и наносит ${actual} урона!`, "combat");
                updateStatsUI();
            }
            if (!p.isAlive()) endGame(false);
        }
    } finally {
        setTimeout(() => {
            actionInProgress = false;
        }, 100);
    }
}

function endCombat(victory) {
    gameState.inCombat = false;
    const combatPanel = document.getElementById("combatPanel");
    if (combatPanel) combatPanel.style.display = "none";
    
    if (victory && gameState.currentFloor === 100) {
        addLog(`🌟 ТЫ ПОБЕДИЛ ХРАНИТЕЛЯ И ЗАБРАЛ АМУЛЕТ СУДЬБЫ! 🌟`, "victory");
        endGame(true);
        return;
    }
    
    if (victory) {
        // Увеличиваем этаж и переходим к следующему
        gameState.currentFloor++;
        // Небольшая задержка перед переходом на следующий этаж
        setTimeout(() => {
            nextFloor();
        }, 100);
    } else if (gameState.player.isAlive()) {
        // Если побег, тоже переходим на следующий этаж
        setTimeout(() => {
            nextFloor();
        }, 100);
    }
}

function nextFloor() {
    // Защита от множественных вызовов
    if (isNextFloorInProgress) {
        console.log("⚠️ nextFloor уже выполняется, пропускаем");
        return;
    }
    
    // Проверка, что игра ещё активна
    if (!gameState.initialized) {
        console.log("⚠️ Игра не инициализирована");
        return;
    }
    
    if (gameState.currentFloor > 100) {
        endGame(true);
        return;
    }
    
    if (!gameState.player || !gameState.player.isAlive()) {
        endGame(false);
        return;
    }
    
    // Проверка, что мы не в бою
    if (gameState.inCombat) {
        console.log("⚠️ Сейчас бой, нельзя переходить на следующий этаж");
        return;
    }

    isNextFloorInProgress = true;
    
    try {
        gameState.player.afterBattle();
        updateStatsUI();
        autoSave();

        const room = generateRoom();
        const event = generateEvent();
        addLog(`🏰 ЭТАЖ ${gameState.currentFloor}: ${room}`, "info");

        if (event === "enemy") {
            const enemy = getEnemyForFloor(gameState.currentFloor);
            if (enemy && enemy.maxHp > 0) {
                startCombat(enemy);
            } else {
                addLog(`⚠️ Ошибка генерации врага, пробуем снова...`, "error");
                setTimeout(() => {
                    isNextFloorInProgress = false;
                    nextFloor();
                }, 100);
            }
        } else if (event === "boss") {
            const boss = { name: "Хранитель Амулета", maxHp: 350, currentHp: 350, strength: 50, agility: 25, exp: 2500, gold: 2000 };
            const mult = gameState.player.diffMult;
            boss.maxHp = Math.floor(boss.maxHp * mult.enemyHp);
            boss.currentHp = boss.maxHp;
            boss.strength = Math.floor(boss.strength * mult.enemyDamage);
            addLog(`👑 ФИНАЛЬНЫЙ БОСС: ХРАНИТЕЛЬ АМУЛЕТА! 👑`, "combat");
            startCombat(boss);
        } else if (event === "npc") {
            // Для NPC не сбрасываем флаг сразу, показываем модалку
            showNPCModal();
            // Флаг сбросится после закрытия модалки через skipNPC или healFromNPC и т.д.
        } else if (event === "treasure") {
            let gold = Math.floor(Math.random() * 251) + 50;
            gold = Math.floor(gold * gameState.player.diffMult.treasureAmount);
            gold = gameState.player.gainGold(gold);
            addLog(`💰 Ты нашёл сундук с сокровищами! +${gold} монет! 💰`, "item");
            gameState.chestsFound++;
            // Переходим на следующий этаж
            setTimeout(() => {
                isNextFloorInProgress = false;
                gameState.currentFloor++;
                nextFloor();
            }, 100);
        } else if (event === "artifact") {
            if (Math.random() < gameState.player.diffMult.artifactChance) {
                const types = ["common", "rare", "legendary"];
                const weights = [70, 25, 5];
                const rand = Math.random() * 100;
                let type = "common";
                if (rand < weights[1]) type = "rare";
                else if (rand < weights[0] + weights[1]) type = "legendary";
                const art = artifactsList[type][Math.floor(Math.random() * artifactsList[type].length)];
                addLog(`✨ Ты находишь артефакт: ${art.name}! ${art.desc} ✨`, "item");
                showArtifactModal(art);
            } else {
                addLog(`📦 Пустой сундук...`, "info");
                setTimeout(() => {
                    isNextFloorInProgress = false;
                    gameState.currentFloor++;
                    nextFloor();
                }, 100);
            }
        } else if (event === "cursed") {
            showCursedRoomModal();
        } else if (event === "special") {
            // Особый этаж (10, 20, 30...)
            let bonusGold = Math.floor(Math.random() * 150) + 50;
            bonusGold = gameState.player.gainGold(bonusGold);
            addLog(`✨ Особый этаж! Ты находишь волшебный сундук с +${bonusGold} монетами! ✨`, "item");
            // Переходим на следующий этаж
            setTimeout(() => {
                isNextFloorInProgress = false;
                gameState.currentFloor++;
                nextFloor();
            }, 100);
        } else {
            // Пустая комната - переходим на следующий этаж
            setTimeout(() => {
                isNextFloorInProgress = false;
                gameState.currentFloor++;
                nextFloor();
            }, 100);
        }
    } catch (error) {
        console.error("Ошибка в nextFloor:", error);
        addLog(`⚠️ Произошла ошибка при переходе на этаж!`, "error");
        isNextFloorInProgress = false;
        setTimeout(() => {
            if (gameState.initialized && gameState.player && gameState.player.isAlive()) {
                gameState.currentFloor++;
                nextFloor();
            }
        }, 1000);
    }
}

// Функция для принудительного продолжения игры (если что-то зависло)
function forceContinue() {
    if (gameState.initialized && gameState.player && gameState.player.isAlive()) {
        if (gameState.inCombat && gameState.currentEnemy) {
            addLog(`⚠️ Продолжаем бой...`, "info");
            // Бой уже идёт, ничего не делаем
        } else if (!gameState.inCombat) {
            addLog(`⚠️ Принудительный переход на следующий этаж...`, "info");
            isNextFloorInProgress = false;
            actionInProgress = false;
            nextFloor();
        } else {
            addLog(`⚠️ Странное состояние игры, попробуйте перезагрузить страницу`, "error");
        }
    } else {
        addLog(`⚠️ Нет активной игры`, "error");
    }
}

// Добавляем кнопку для принудительного продолжения (можно добавить в панель управления)
window.forceContinue = forceContinue;

function showArtifactModal(artifact) {
    let content = `<div>Вы нашли артефакт!</div>`;
    content += `<div class="modal-item"><strong>${artifact.name}</strong><br>${artifact.desc}</div>`;
    content += `<div class="choice-buttons">
                <button class="choice-btn" onclick="window.takeArtifact(${JSON.stringify(artifact).replace(/"/g, '&quot;')})">🏺 Взять</button>
                <button class="choice-btn" onclick="window.skipArtifact()">🚫 Оставить</button>
            </div>`;
    showModal("🏺 Артефакт!", content);
}

function takeArtifact(artifact) {
    if (isChoiceInProgress) return;
    isChoiceInProgress = true;
    
    try {
        gameState.artifacts.push(artifact);
        if (artifact.effect === "hp") gameState.player.maxHp += artifact.value;
        else if (artifact.effect === "strength") gameState.player.strength += artifact.value;
        else if (artifact.effect === "luck") gameState.player.luck += artifact.value;
        else if (artifact.effect === "agility") gameState.player.agility += artifact.value;
        addLog(`🏺 Вы взяли артефакт: ${artifact.name}!`, "item");
        updateStatsUI();
        closeModal();
        setTimeout(() => {
            isChoiceInProgress = false;
            isNextFloorInProgress = false;
            gameState.currentFloor++;
            nextFloor();
        }, 100);
    } finally {
        setTimeout(() => {
            isChoiceInProgress = false;
        }, 200);
    }
}

function skipArtifact() {
    if (isChoiceInProgress) return;
    isChoiceInProgress = true;
    
    try {
        addLog(`🚫 Вы оставили артефакт...`, "info");
        closeModal();
        setTimeout(() => {
            isChoiceInProgress = false;
            isNextFloorInProgress = false;
            gameState.currentFloor++;
            nextFloor();
        }, 100);
    } finally {
        setTimeout(() => {
            isChoiceInProgress = false;
        }, 200);
    }
}

function showCursedRoomModal() {
    let content = `<div>💀 ПРОКЛЯТАЯ КОМНАТА 💀</div>
            <div class="modal-item">Выберите действие:</div>
            <div class="choice-buttons">
                <button class="choice-btn" onclick="window.cursedChoice(1)">💰 Жертва (100 монет)</button>
                <button class="choice-btn" onclick="window.cursedChoice(2)">😈 Принять проклятие</button>
                <button class="choice-btn" onclick="window.cursedChoice(3)">⚔️ Сразиться с духами</button>
            </div>`;
    showModal("💀 Проклятая комната", content);
}

function cursedChoice(choice) {
    closeModal();
    if (choice === 1) {
        const cost = Math.floor(100 * gameState.player.diffMult.shopPrices);
        if (gameState.player.gold >= cost) {
            gameState.player.gold -= cost;
            addLog(`💰 Ты принёс жертву в ${cost} монет. Духи удовлетворены!`, "info");
            updateStatsUI();
            setTimeout(() => {
                isNextFloorInProgress = false;
                gameState.currentFloor++;
                nextFloor();
            }, 100);
        } else {
            addLog(`❌ Недостаточно монет! Духи разгневаны!`, "error");
            gameState.player.takeDamage(30);
            updateStatsUI();
            if (gameState.player.isAlive()) {
                setTimeout(() => {
                    isNextFloorInProgress = false;
                    gameState.currentFloor++;
                    nextFloor();
                }, 100);
            } else endGame(false);
        }
    } else if (choice === 2) {
        addLog(`😈 Ты принял проклятие! Характеристики снижены на 10% на 5 этажей.`, "error");
        setTimeout(() => {
            isNextFloorInProgress = false;
            gameState.currentFloor++;
            nextFloor();
        }, 100);
    } else if (choice === 3) {
        const spirit = { name: "Разгневанный дух", maxHp: 80, currentHp: 80, strength: 20, agility: 20, exp: 200, gold: 150 };
        const mult = gameState.player.diffMult;
        spirit.maxHp = Math.floor(spirit.maxHp * mult.enemyHp);
        spirit.currentHp = spirit.maxHp;
        spirit.strength = Math.floor(spirit.strength * mult.enemyDamage);
        startCombat(spirit);
        // Флаг сбросится после боя
    }
}

function showNPCModal() {
    const npcs = ["Торговец", "Лекарь", "Странник", "Кузнец", "Мастер брони"];
    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    let content = `<div>Вы встретили: <strong>${npc}</strong></div>`;

    if (npc === "Лекарь") {
        const cost = Math.floor(50 * gameState.player.diffMult.shopPrices);
        content += `<div class="modal-item">Лекарь может исцелить вас за ${cost} монет</div>`;
        content += `<div class="choice-buttons">
                    <button class="choice-btn" onclick="window.healFromNPC(${cost})">💊 Лечиться (${cost} монет)</button>
                    <button class="choice-btn" onclick="window.skipNPC()">🚫 Уйти</button>
                </div>`;
    } else if (npc === "Торговец") {
        content += `<div class="modal-item">Торговец предлагает свои товары</div>`;
        content += `<div class="choice-buttons">
                    <button class="choice-btn" onclick="window.openShop()">🏪 Открыть магазин</button>
                    <button class="choice-btn" onclick="window.skipNPC()">🚫 Уйти</button>
                </div>`;
    } else if (npc === "Странник") {
        content += `<div class="modal-item">"Найди Амулет Судьбы на 100-м этаже..."</div>`;
        content += `<button class="choice-btn" onclick="window.skipNPC()">Продолжить</button>`;
        if (!gameState.quests.boss) {
            gameState.quests.boss = { desc: "Найди Амулет Судьбы на 100-м этаже" };
            addLog(`📜 Получен квест: Найди Амулет Судьбы на 100-м этаже!`, "quest");
        }
    } else if (npc === "Кузнец") {
        const cost = Math.floor(200 * gameState.player.diffMult.upgradeCost);
        content += `<div class="modal-item">Кузнец может улучшить оружие за ${cost} монет</div>`;
        content += `<div class="choice-buttons">
                    <button class="choice-btn" onclick="window.upgradeWeapon(${cost})">⚔️ Улучшить (${cost} монет)</button>
                    <button class="choice-btn" onclick="window.skipNPC()">🚫 Уйти</button>
                </div>`;
    } else if (npc === "Мастер брони") {
        const cost = Math.floor(200 * gameState.player.diffMult.upgradeCost);
        content += `<div class="modal-item">Мастер брони может улучшить броню за ${cost} монет</div>`;
        content += `<div class="choice-buttons">
                    <button class="choice-btn" onclick="window.upgradeArmor(${cost})">🛡️ Улучшить (${cost} монет)</button>
                    <button class="choice-btn" onclick="window.skipNPC()">🚫 Уйти</button>
                </div>`;
    }

    showModal(`📖 ${npc}`, content);
}

function healFromNPC(cost) {
    if (gameState.player.gold >= cost) {
        gameState.player.gold -= cost;
        gameState.player.hp = gameState.player.maxHp;
        addLog(`✨ Лекарь полностью исцелил вас!`, "item");
        updateStatsUI();
    } else {
        addLog(`❌ Недостаточно монет!`, "error");
    }
    closeModal();
    // Переходим на следующий этаж
    setTimeout(() => {
        isNextFloorInProgress = false;
        gameState.currentFloor++;
        nextFloor();
    }, 100);
}

function openShop() {
    closeModal();
    const p = gameState.player;
    
    const foods = { 
        "Человек": ["Хлеб", "Суп", "Пирог"], 
        "Эльф": ["Ягоды", "Эльфийский хлеб", "Нектар"], 
        "Орк": ["Мясо", "Кабан", "Пир"], 
        "Дварф": ["Каменный хлеб", "Пивная похлёбка", "Горный пирог"], 
        "Гном": ["Механический суп", "Шестерёнки", "Техномагия"], 
        "Драконид": ["Жареное мясо", "Печёный уголь", "Драконье сердце"] 
    };
    
    const weapons = {
        "Человек": ["Меч", "Длинный меч", "Двуручный меч"],
        "Эльф": ["Эльфийский лук", "Лунный клинок", "Древнее копьё"],
        "Орк": ["Топор", "Двуручный топор", "Секира"],
        "Дварф": ["Боевой молот", "Двуручный топор", "Копьё гномов"],
        "Гном": ["Пистолет", "Механический арбалет", "Ракетница"],
        "Драконид": ["Коготь дракона", "Огненный меч", "Дыхание дракона"]
    };
    
    const armors = {
        "Человек": ["Кожаная броня", "Кольчуга", "Латы"],
        "Эльф": ["Лиственный доспех", "Серебряная кольчуга", "Звёздная броня"],
        "Орк": ["Звериная шкура", "Костяной доспех", "Чёрная броня"],
        "Дварф": ["Каменная броня", "Мифриловая кольчуга", "Глубинная броня"],
        "Гном": ["Кожаный жилет", "Механическая броня", "Броня из сплава"],
        "Драконид": ["Чешуйчатая броня", "Драконья кольчуга", "Броня из драконьей чешуи"]
    };
    
    const heals = { 
        "Хлеб": 20, "Суп": 35, "Пирог": 50,
        "Ягоды": 15, "Эльфийский хлеб": 30, "Нектар": 55,
        "Мясо": 25, "Кабан": 40, "Пир": 60,
        "Каменный хлеб": 25, "Пивная похлёбка": 40, "Горный пирог": 55,
        "Механический суп": 20, "Шестерёнки": 35, "Техномагия": 50,
        "Жареное мясо": 30, "Печёный уголь": 45, "Драконье сердце": 65
    };
    
    const weaponBonuses = {
        "Меч": 3, "Длинный меч": 6, "Двуручный меч": 10,
        "Эльфийский лук": 4, "Лунный клинок": 7, "Древнее копьё": 11,
        "Топор": 5, "Двуручный топор": 9, "Секира": 13,
        "Боевой молот": 6, "Копьё гномов": 12,
        "Пистолет": 5, "Механический арбалет": 8, "Ракетница": 12,
        "Коготь дракона": 7, "Огненный меч": 10, "Дыхание дракона": 14
    };
    
    const armorReductions = {
        "Кожаная броня": 2, "Кольчуга": 5, "Латы": 8,
        "Лиственный доспех": 2, "Серебряная кольчуга": 5, "Звёздная броня": 9,
        "Звериная шкура": 3, "Костяной доспех": 6, "Чёрная броня": 10,
        "Каменная броня": 4, "Мифриловая кольчуга": 7, "Глубинная броня": 11,
        "Кожаный жилет": 2, "Механическая броня": 5, "Броня из сплава": 9,
        "Чешуйчатая броня": 4, "Драконья кольчуга": 8, "Броня из драконьей чешуи": 12
    };

    let content = `<div>💰 У вас: ${p.gold} монет</div><br>`;
    
    content += `<div><strong>🍖 ЕДА:</strong></div>`;
    for (let food of foods[p.race]) {
        let heal = heals[food];
        let price = Math.floor(heal * p.diffMult.shopPrices);
        let actualHeal = Math.floor(heal * p.diffMult.healAmount);
        content += `<div class="modal-item" onclick="window.buyItem('${food}', 'food', ${price}, ${actualHeal})">🍖 ${food} (лечит ${actualHeal} HP) - ${price} монет</div>`;
    }
    
    content += `<div style="margin-top: 15px;"><strong>⚔️ ОРУЖИЕ:</strong></div>`;
    for (let weapon of weapons[p.race]) {
        let bonus = weaponBonuses[weapon];
        let price = Math.floor(bonus * 30 * p.diffMult.shopPrices);
        content += `<div class="modal-item" onclick="window.buyItem('${weapon}', 'weapon', ${price}, ${bonus})">⚔️ ${weapon} (+${bonus} к урону) - ${price} монет</div>`;
    }
    
    content += `<div style="margin-top: 15px;"><strong>🛡️ БРОНЯ:</strong></div>`;
    for (let armor of armors[p.race]) {
        let reduction = armorReductions[armor];
        let price = Math.floor(reduction * 35 * p.diffMult.shopPrices);
        content += `<div class="modal-item" onclick="window.buyItem('${armor}', 'armor', ${price}, ${reduction})">🛡️ ${armor} (-${reduction} к урону) - ${price} монет</div>`;
    }
    
    content += `<div class="modal-button" onclick="window.closeModalAndContinue()">Выйти</div>`;
    showModal("🏪 Торговец", content);
}

function closeModalAndContinue() {
    closeModal();
    // Переходим на следующий этаж
    setTimeout(() => {
        isNextFloorInProgress = false;
        gameState.currentFloor++;
        nextFloor();
    }, 100);
}

function buyItem(itemName, type, price, value) {
    const p = gameState.player;
    if (p.gold >= price) {
        if (confirm(`Купить ${itemName} за ${price} монет?`)) {
            p.gold -= price;
            
            if (type === 'food') {
                p.inventory.push(`${itemName} (лечит ${Math.floor(value * p.diffMult.healAmount)} HP)`);
                addLog(`✅ Вы купили ${itemName}!`, "item");
            } else if (type === 'weapon') {
                p.equip_weapon(itemName, value);
                addLog(`⚔️ Вы экипировали ${itemName} (+${value} урона)!`, "item");
            } else if (type === 'armor') {
                p.equip_armor(itemName, value);
                addLog(`🛡️ Вы надели ${itemName} (-${value} к урону)!`, "item");
            }
            
            updateStatsUI();
            openShop();
        }
    } else {
        addLog(`❌ Недостаточно монет! Нужно ${price} монет.`, "error");
    }
}

function upgradeWeapon(cost) {
    if (gameState.player.weaponBonus > 0 || gameState.player.weapon) {
        if (gameState.player.gold >= cost) {
            gameState.player.gold -= cost;
            gameState.player.weaponBonus += Math.floor(3 * gameState.player.diffMult.playerDamage);
            addLog(`⚔️ Оружие улучшено! Бонус +${gameState.player.weaponBonus}!`, "item");
            updateStatsUI();
        } else {
            addLog(`❌ Недостаточно монет!`, "error");
        }
    } else {
        addLog(`❌ У вас нет оружия для улучшения!`, "error");
    }
    closeModal();
    // Переходим на следующий этаж
    setTimeout(() => {
        isNextFloorInProgress = false;
        gameState.currentFloor++;
        nextFloor();
    }, 100);
}

function upgradeArmor(cost) {
    if (gameState.player.armorReduction > 0 || gameState.player.armor) {
        if (gameState.player.gold >= cost) {
            gameState.player.gold -= cost;
            gameState.player.armorReduction += 2;
            addLog(`🛡️ Броня улучшена! Снижение -${gameState.player.armorReduction}!`, "item");
            updateStatsUI();
        } else {
            addLog(`❌ Недостаточно монет!`, "error");
        }
    } else {
        addLog(`❌ У вас нет брони для улучшения!`, "error");
    }
    closeModal();
    // Переходим на следующий этаж
    setTimeout(() => {
        isNextFloorInProgress = false;
        gameState.currentFloor++;
        nextFloor();
    }, 100);
}

function skipNPC() {
    closeModal();
    // Переходим на следующий этаж
    setTimeout(() => {
        isNextFloorInProgress = false;
        gameState.currentFloor++;
        nextFloor();
    }, 100);
}

function endGame(victory) {
    gameState.initialized = false;
    const combatPanel = document.getElementById("combatPanel");
    const statsPanel = document.getElementById("statsPanel");
    const gameLog = document.getElementById("gameLog");
    const initialPanel = document.getElementById("initialPanel");
    
    if (combatPanel) combatPanel.style.display = "none";
    if (statsPanel) statsPanel.style.display = "none";
    if (gameLog) gameLog.style.display = "none";
    if (initialPanel) initialPanel.style.display = "block";
    closeModal();

    if (victory) {
        addLog(`🎉 ПОЗДРАВЛЯЮ! ВЫ ПРОШЛИ ВСЕ 100 ЭТАЖЕЙ! 🎉`, "victory");
        addLog(`📊 Этажей пройдено: ${gameState.currentFloor}`, "info");
        addLog(`👥 Врагов убито: ${gameState.enemiesKilled}`, "info");
        addLog(`🏺 Артефактов собрано: ${gameState.artifacts.length}`, "info");
    } else {
        addLog(`💀 ВЫ ПОГИБЛИ НА ${gameState.currentFloor} ЭТАЖЕ 💀`, "error");
    }
}

// -------------------- МЕНЮ НОВОЙ ИГРЫ --------------------
function newGame() {
    if (gameState.initialized) {
        if (confirm("Начать новую игру? Весь прогресс будет потерян!")) {
            localStorage.removeItem('roguelike_save');
            showNewGameMenu();
        }
    } else {
        showNewGameMenu();
    }
}

function showNewGameMenu() {
    let content = `<div><strong>Выберите сложность:</strong></div>`;
    const diffs = Object.keys(difficultyLevels);
    for (let i = 0; i < diffs.length; i++) {
        const d = difficultyLevels[diffs[i]];
        content += `<div class="modal-item" onclick="window.selectDifficulty('${diffs[i]}')">${d.name}<br><small>❤️ ${d.multipliers.playerHp * 100}% | 💪 ${d.multipliers.playerDamage * 100}% | 👹 ${d.multipliers.enemyHp * 100}%</small></div>`;
    }
    showModal("🎮 НОВАЯ ИГРА", content);
}

function selectDifficulty(difficulty) {
    let content = `<div><strong>Выберите расу:</strong></div>`;
    const racesList = Object.keys(races);
    for (let i = 0; i < racesList.length; i++) {
        const r = races[racesList[i]];
        content += `<div class="modal-item" onclick="window.selectRace('${racesList[i]}', '${difficulty}')">${racesList[i]}<br><small>❤️ ${r.hp} | 💪 ${r.strength} | 🏃 ${r.agility} | 🍀 ${r.luck}</small></div>`;
    }
    showModal("🎮 ВЫБОР РАСЫ", content);
}

function selectRace(race, difficulty) {
    closeModal();
    const name = prompt("Как зовут вашего героя?", "Герой") || "Герой";
    startGame(name, race, difficulty);
}

function startGame(name, race, difficulty) {
    localStorage.removeItem('roguelike_save');

    gameState = {
        initialized: true,
        player: new Player(name, race, difficulty),
        currentEnemy: null,
        inCombat: false,
        currentFloor: 1,
        lastRooms: [],
        quests: {},
        enemiesKilled: 0,
        chestsFound: 0,
        artifacts: [],
        modalCallback: null,
        waitingForChoice: false
    };

    updateStatsUI();
    
    const initialPanel = document.getElementById("initialPanel");
    const statsPanel = document.getElementById("statsPanel");
    const gameLog = document.getElementById("gameLog");
    const combatPanel = document.getElementById("combatPanel");
    
    if (initialPanel) initialPanel.style.display = "none";
    if (statsPanel) statsPanel.style.display = "block";
    if (gameLog) gameLog.style.display = "block";
    if (combatPanel) combatPanel.style.display = "none";
    
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) {
        userDisplay.innerHTML = `${name} (${race})`;
    }
    
    addLog(`✨ Привет, ${name} (${race})!`, "info");
    addLog(`Сложность: ${difficultyLevels[difficulty].name}`, "info");
    addLog(`💰 Начальный капитал: ${gameState.player.gold} монет`, "info");
    addLog(`📜 Пассивная способность: ${races[race].skill}`, "info");

    nextFloor();
}

// -------------------- МОДАЛЬНЫЕ ОКНА СТАТУСА --------------------
function showStatusModal() {
    if (!gameState.player) return;
    const p = gameState.player;
    let content = `
        <div class="stat-item">Имя: ${p.name}</div>
        <div class="stat-item">Раса: ${p.race}</div>
        <div class="stat-item">Сложность: ${difficultyLevels[p.difficulty].name}</div>
        <div class="stat-item">Уровень: ${p.level}</div>
        <div class="stat-item">Опыт: ${p.exp}/${p.level * 60}</div>
        <div class="stat-item">❤️ HP: ${p.hp}/${p.maxHp}</div>
        <div class="stat-item">💪 Сила: ${p.strength}</div>
        <div class="stat-item">🏃 Ловкость: ${p.agility} (уклонение: ${p.getEvasionChance()}%)</div>
        <div class="stat-item">🛡️ Блок: ${p.getBlockChance()}%</div>
        <div class="stat-item">🍀 Удача: ${p.luck}</div>
        <div class="stat-item">💰 Монеты: ${p.gold}</div>
        <div class="stat-item">⚔️ Оружие: ${p.weapon || "Нет"} (+${p.weaponBonus})</div>
        <div class="stat-item">🛡️ Броня: ${p.armor || "Нет"} (-${p.armorReduction})</div>
        <div class="stat-item">📊 Этаж: ${gameState.currentFloor}/100</div>
        <div class="stat-item">👥 Убито врагов: ${gameState.enemiesKilled}</div>
        <div class="stat-item">🏺 Артефактов: ${gameState.artifacts.length}</div>
        <center><div class="modal-button" onclick="closeModal()">Закрыть</div></center>
    `;
    showModal("📊 СТАТУС ПЕРСОНАЖА", content);
}

function showInventoryModal() {
    if (!gameState.player) return;
    const inv = gameState.player.inventory;
    if (inv.length === 0) {
        showModal("🎒 ИНВЕНТАРЬ", "<div>Инвентарь пуст!</div><center><div class='modal-button' onclick='closeModal()'>Закрыть</div></center>");
        return;
    }
    let content = `<div>🎒 Всего предметов: ${inv.length}</div><br>`;
    for (let i = 0; i < inv.length; i++) {
        content += `<div class="modal-item">📦 ${inv[i]}</div>`;
    }
    content += `<center><div class="modal-button" onclick="closeModal()">Закрыть</div></center>`;
    showModal("🎒 ИНВЕНТАРЬ", content);
}

function showQuestsModal() {
    const q = gameState.quests;
    if (Object.keys(q).length === 0) {
        showModal("📜 КВЕСТЫ", "<div>Нет активных квестов!</div><center><div class='modal-button' onclick='closeModal()'>Закрыть</div></center>");
        return;
    }
    let content = `<div>📜 Активные квесты:</div><br>`;
    for (let key in q) {
        content += `<div class="modal-item">• ${q[key].desc}</div>`;
    }
    content += `<center><div class="modal-button" onclick="closeModal()">Закрыть</div></center>`;
    showModal("📜 КВЕСТЫ", content);
}

function showArtifactsModal() {
    const arts = gameState.artifacts;
    if (arts.length === 0) {
        showModal("🏺 АРТЕФАКТЫ", "<center><div>Нет артефактов!</div><div class='modal-button' onclick='closeModal()'>Закрыть</div></center>");
        return;
    }
    let content = `<div>🏺 Коллекция артефактов (${arts.length}):</div><br>`;
    for (let art of arts) {
        content += `<div class="modal-item"><strong>${art.name}</strong><br>${art.desc}</div>`;
    }
    content += `<center><div class="modal-button" onclick="closeModal()">Закрыть</div></center>`;
    showModal("🏺 АРТЕФАКТЫ", content);
}

// ========== ФУНКЦИИ АВТОРИЗАЦИИ ==========
let currentUser = null;

function showToast(message, color = '#05d9e8') {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:${color}; padding:12px 28px; border-radius:60px; font-weight:bold; z-index:1100; animation:fadeOut 2s forwards; pointer-events:none;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function openAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('hidden');
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.add('hidden');
}

async function loginUser(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`Добро пожаловать, ${username}!`, '#05d9e8');
            return { success: true, user: currentUser };
        } else {
            showToast(result.error || 'Ошибка входа', '#ff2a6d');
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showToast('Ошибка соединения', '#ff2a6d');
        return { success: false, error: 'Ошибка соединения' };
    }
}

async function registerUser(username, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Регистрация успешна! Теперь войдите.', '#0f0');
            return { success: true };
        } else {
            showToast(result.error || 'Ошибка регистрации', '#ff2a6d');
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showToast('Ошибка соединения', '#ff2a6d');
        return { success: false, error: 'Ошибка соединения' };
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Вы вышли из аккаунта', '#05d9e8');
    updateUIForUser();
}

function restoreSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForUser();
            return currentUser;
        } catch (e) {
            console.error('Ошибка восстановления сессии:', e);
        }
    }
    return null;
}

function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userDisplay) {
            userDisplay.textContent = `👋 ${currentUser.username}`;
            userDisplay.style.display = 'inline';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.style.display = 'none';
    }
}

async function updateUserStats(game, score) {
    if (!currentUser) return;
    
    const scoreKey = `${game}Score`;
    if (score > (currentUser[scoreKey] || 0)) {
        currentUser[scoreKey] = score;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        try {
            await fetch('/api/update-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser.username,
                    game: game,
                    score: score
                })
            });
        } catch (error) {
            console.error('Ошибка сохранения статистики:', error);
        }
    }
    
    currentUser.gamesPlayed = (currentUser.gamesPlayed || 0) + 1;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

async function updateCasinoBalance(amount) {
    if (!currentUser) return false;
    
    currentUser.casinoBalance = (currentUser.casinoBalance || 5000) + amount;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    try {
        await fetch('/api/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser.username,
                balance: currentUser.casinoBalance
            })
        });
        return true;
    } catch (error) {
        console.error('Ошибка обновления баланса:', error);
        return false;
    }
}

function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    
    const userId = localStorage.getItem('neon_user_id');
    const username = localStorage.getItem('neon_username');
    
    if (userId && username) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userDisplay) {
            userDisplay.textContent = `👋 ${username}`;
            userDisplay.style.display = 'inline';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.style.display = 'none';
    }
}

async function handleLogin() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const authError = document.getElementById('authError');
    
    if (!username || !password) {
        if (authError) authError.textContent = 'Заполните все поля';
        return;
    }
    
    const result = await window.loginUserCloud(username, password);
    if (result.success) {
        document.getElementById('authModal').classList.add('hidden');
        updateUIForUser();
        if (typeof showToast === 'function') {
            showToast(`Добро пожаловать, ${username}!`, '#05d9e8');
        }
    } else {
        if (authError) authError.textContent = result.error;
    }
}

async function handleRegister() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const authError = document.getElementById('authError');
    
    if (!username || !password) {
        if (authError) authError.textContent = 'Заполните все поля';
        return;
    }
    
    if (password.length < 4) {
        if (authError) authError.textContent = 'Пароль должен быть не менее 4 символов';
        return;
    }
    
    const result = await window.registerUserCloud(username, password);
    if (result.success) {
        if (typeof showToast === 'function') {
            showToast('Регистрация успешна! Теперь войдите.', '#0f0');
        }
        document.getElementById('authModalTitle').textContent = '🔐 Авторизация';
        document.getElementById('authSubmitBtn').textContent = 'Войти';
        document.getElementById('switchAuthMode').innerHTML = 'Нет аккаунта? Зарегистрироваться';
        if (authError) authError.textContent = '';
    } else {
        if (authError) authError.textContent = result.error;
    }
}

function handleLogout() {
    window.logoutCloud();
    updateUIForUser();
    if (typeof showToast === 'function') {
        showToast('Вы вышли из аккаунта', '#05d9e8');
    }
}

async function restoreGameSession() {
    if (typeof window.restoreSession === 'function') {
        const user = await window.restoreSession();
        if (user) {
            console.log('✅ Сессия восстановлена:', user.username);
        }
    }
    updateUIForUser();
}

document.addEventListener('DOMContentLoaded', async () => {
    const hasSave = await loadGameProgress();
    
    if (!hasSave) {
        console.log("Нет сохранений, ждём начала новой игры");
    }

    restoreGameSession();
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const switchAuthMode = document.getElementById('switchAuthMode');
    
    let isLoginMode = true;
    
    if (loginBtn) {
        loginBtn.onclick = () => {
            const authModal = document.getElementById('authModal');
            if (authModal) authModal.classList.remove('hidden');
        };
    }
    
    if (logoutBtn) {
        logoutBtn.onclick = handleLogout;
    }
    
    if (closeAuthModal) {
        closeAuthModal.onclick = () => {
            document.getElementById('authModal').classList.add('hidden');
        };
    }
    
    if (authSubmitBtn) {
        authSubmitBtn.onclick = async () => {
            if (isLoginMode) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        };
    }
    
    if (switchAuthMode) {
        switchAuthMode.onclick = (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            const title = document.getElementById('authModalTitle');
            const submitBtn = document.getElementById('authSubmitBtn');
            if (isLoginMode) {
                if (title) title.textContent = '🔐 Авторизация';
                if (submitBtn) submitBtn.textContent = 'Войти';
                switchAuthMode.innerHTML = 'Нет аккаунта? Зарегистрироваться';
            } else {
                if (title) title.textContent = '📝 Регистрация';
                if (submitBtn) submitBtn.textContent = 'Зарегистрироваться';
                switchAuthMode.innerHTML = 'Уже есть аккаунт? Войти';
            }
            const authError = document.getElementById('authError');
            if (authError) authError.textContent = '';
        };
    }
    
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.add('hidden');
            }
        });
    }
});

console.log('✅ game.js загружен');

// ========== ЭКСПОРТ ВСЕХ ФУНКЦИЙ В ГЛОБАЛЬНЫЙ ОБЪЕКТ ==========
window.currentUser = currentUser;
window.showToast = showToast;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.restoreSession = restoreSession;
window.updateUIForUser = updateUIForUser;
window.updateUserStats = updateUserStats;
window.updateCasinoBalance = updateCasinoBalance;
window.manualSave = manualSave;
window.continueGame = continueGame;
window.startNewGameFromSave = startNewGameFromSave;
window.newGame = newGame;
window.showNewGameMenu = showNewGameMenu;
window.selectDifficulty = selectDifficulty;
window.selectRace = selectRace;
window.startGame = startGame;
window.combatAttack = combatAttack;
window.useFood = useFood;
window.useActiveSkill = useActiveSkill;
window.tryEscape = tryEscape;
window.eatFood = eatFood;
window.showStatusModal = showStatusModal;
window.showInventoryModal = showInventoryModal;
window.showQuestsModal = showQuestsModal;
window.showArtifactsModal = showArtifactsModal;
window.takeArtifact = takeArtifact;
window.skipArtifact = skipArtifact;
window.cursedChoice = cursedChoice;
window.healFromNPC = healFromNPC;
window.openShop = openShop;
window.upgradeWeapon = upgradeWeapon;
window.upgradeArmor = upgradeArmor;
window.skipNPC = skipNPC;
window.buyItem = buyItem;
window.closeModalAndContinue = closeModalAndContinue;
window.upgradeStat = upgradeStat;
