/**
 * Утилиты для работы с локальным хранилищем
 */
export const Storage = {
    // Ключи для хранения
    KEYS: {
        GAME_STATE: 'yourGame_gameState',
        PLAYER_PROFILES: 'yourGame_playerProfiles',
        GAME_STATISTICS: 'yourGame_statistics',
        SETTINGS: 'yourGame_settings'
    },

    /**
     * Сохранить состояние игры
     */
    saveGameState(state) {
        try {
            localStorage.setItem(this.KEYS.GAME_STATE, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Failed to save game state:', e);
            return false;
        }
    },

    /**
     * Загрузить состояние игры
     */
    loadGameState() {
        try {
            const state = localStorage.getItem(this.KEYS.GAME_STATE);
            return state ? JSON.parse(state) : null;
        } catch (e) {
            console.error('Failed to load game state:', e);
            return null;
        }
    },

    /**
     * Очистить состояние игры
     */
    clearGameState() {
        localStorage.removeItem(this.KEYS.GAME_STATE);
    },

    /**
     * Сохранить профили игроков
     */
    savePlayerProfiles(profiles) {
        try {
            localStorage.setItem(this.KEYS.PLAYER_PROFILES, JSON.stringify(profiles));
            return true;
        } catch (e) {
            console.error('Failed to save player profiles:', e);
            return false;
        }
    },

    /**
     * Загрузить профили игроков
     */
    loadPlayerProfiles() {
        try {
            const profiles = localStorage.getItem(this.KEYS.PLAYER_PROFILES);
            return profiles ? JSON.parse(profiles) : [];
        } catch (e) {
            console.error('Failed to load player profiles:', e);
            return [];
        }
    },

    /**
     * Добавить статистику игры
     */
    addGameStatistics(gameData) {
        try {
            const stats = this.loadGameStatistics();
            stats.push({
                ...gameData,
                date: new Date().toISOString()
            });
            // Храним только последние 50 игр
            if (stats.length > 50) stats.shift();
            localStorage.setItem(this.KEYS.GAME_STATISTICS, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Failed to save statistics:', e);
            return false;
        }
    },

    /**
     * Загрузить статистику игр
     */
    loadGameStatistics() {
        try {
            const stats = localStorage.getItem(this.KEYS.GAME_STATISTICS);
            return stats ? JSON.parse(stats) : [];
        } catch (e) {
            console.error('Failed to load statistics:', e);
            return [];
        }
    },

    /**
     * Сохранить настройки
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    },

    /**
     * Загрузить настройки
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : { devMode: false };
        } catch (e) {
            console.error('Failed to load settings:', e);
            return { devMode: false };
        }
    }
};