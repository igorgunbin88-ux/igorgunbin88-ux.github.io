// ========== ОБЛАЧНАЯ АВТОРИЗАЦИЯ С HASH-ПАРОЛЯМИ ==========
// Подключение к Supabase
const SUPABASE_URL = 'https://uvzhkkoweeaqrkvhpnlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emhra293ZWVhcXJrdmhwbmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTQ4MDIsImV4cCI6MjA5MDQ5MDgwMn0.RCGiNEs0TaB1JulYmgeknhPH__NjmqTXqFioAPKJwWY';

// Инициализация клиента
const supabaseClient = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.url}/rest/v1${endpoint}`, {
            ...options,
            headers: {
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    },
    
    async query(table, params = {}) {
        let url = `/${table}?select=*`;
        if (params.username) url += `&username=eq.${encodeURIComponent(params.username)}`;
        return this.request(url);
    },
    
    async insert(table, data) {
        return this.request(`/${table}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async update(table, data, username) {
        return this.request(`/${table}?username=eq.${encodeURIComponent(username)}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
};

// Хеширование пароля (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'NEON_SALT_2026');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Загрузка пользователя из облака
async function loadUserFromCloud(username) {
    try {
        const users = await supabaseClient.query('users', { username });
        if (users && users.length > 0) {
            const user = users[0];
            return {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin,
                registered: user.registered,
                gamesPlayed: user.games_played,
                snakeScore: user.snake_score,
                tetrisScore: user.tetris_score,
                dinoScore: user.dino_score,
                flappyScore: user.flappy_score,
                memoryScore: user.memory_score,
                casinoBalance: user.casino_balance
            };
        }
        return null;
    } catch (e) {
        console.error('Ошибка загрузки пользователя:', e);
        return null;
    }
}

// Регистрация в облаке
async function registerUserCloud(username, password) {
    try {
        const existing = await loadUserFromCloud(username);
        if (existing) return { success: false, error: 'Пользователь уже существует' };
        
        const passwordHash = await hashPassword(password);
        await supabaseClient.insert('users', {
            username: username,
            password_hash: passwordHash,
            is_admin: false,
            registered: new Date().toISOString()
        });
        
        return { success: true };
    } catch (e) {
        console.error('Ошибка регистрации:', e);
        return { success: false, error: 'Ошибка сервера' };
    }
}

// Логин в облаке
async function loginUserCloud(username, password) {
    try {
        const user = await loadUserFromCloud(username);
        if (!user) return { success: false, error: 'Пользователь не найден' };
        
        const passwordHash = await hashPassword(password);
        const users = await supabaseClient.query('users', { username });
        
        if (users[0] && users[0].password_hash === passwordHash) {
            const userData = {
                id: users[0].id,
                username: users[0].username,
                isAdmin: users[0].is_admin,
                registered: users[0].registered,
                gamesPlayed: users[0].games_played || 0,
                snakeScore: users[0].snake_score || 0,
                tetrisScore: users[0].tetris_score || 0,
                dinoScore: users[0].dino_score || 0,
                flappyScore: users[0].flappy_score || 0,
                memoryScore: users[0].memory_score || 0,
                casinoBalance: users[0].casino_balance || 5000
            };
            
            // Сохраняем сессию в localStorage (только ID пользователя)
            localStorage.setItem('neon_user_id', userData.id);
            localStorage.setItem('neon_username', userData.username);
            
            return { success: true, user: userData };
        }
        
        return { success: false, error: 'Неверный пароль' };
    } catch (e) {
        console.error('Ошибка логина:', e);
        return { success: false, error: 'Ошибка сервера' };
    }
}

// Восстановление сессии
async function restoreSession() {
    const userId = localStorage.getItem('neon_user_id');
    const username = localStorage.getItem('neon_username');
    if (!userId || !username) return null;
    
    try {
        const users = await supabaseClient.query('users', { username });
        if (users && users.length > 0 && users[0].id == userId) {
            return {
                id: users[0].id,
                username: users[0].username,
                isAdmin: users[0].is_admin,
                registered: users[0].registered,
                gamesPlayed: users[0].games_played || 0,
                snakeScore: users[0].snake_score || 0,
                tetrisScore: users[0].tetris_score || 0,
                dinoScore: users[0].dino_score || 0,
                flappyScore: users[0].flappy_score || 0,
                memoryScore: users[0].memory_score || 0,
                casinoBalance: users[0].casino_balance || 5000
            };
        }
    } catch (e) {
        console.error('Ошибка восстановления сессии:', e);
    }
    return null;
}

// Обновление статистики в облаке
async function updateUserStatsCloud(username, stats) {
    try {
        await supabaseClient.update('users', stats, username);
        return true;
    } catch (e) {
        console.error('Ошибка обновления статистики:', e);
        return false;
    }
}

// Выход
function logoutCloud() {
    localStorage.removeItem('neon_user_id');
    localStorage.removeItem('neon_username');
}

// Получение всех пользователей (только для админа)
async function getAllUsersCloud() {
    try {
        const users = await supabaseClient.query('users');
        return users.map(u => ({
            id: u.id,
            username: u.username,
            isAdmin: u.is_admin,
            gamesPlayed: u.games_played || 0,
            snakeScore: u.snake_score || 0,
            tetrisScore: u.tetris_score || 0,
            casinoBalance: u.casino_balance || 5000
        }));
    } catch (e) {
        console.error('Ошибка загрузки пользователей:', e);
        return [];
    }
}

// Начисление очков казино
async function addCasinoBalanceCloud(username, amount) {
    try {
        const user = await loadUserFromCloud(username);
        if (user) {
            const newBalance = (user.casinoBalance || 5000) + amount;
            await supabaseClient.update('users', { casino_balance: newBalance }, username);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Ошибка начисления:', e);
        return false;
    }
}