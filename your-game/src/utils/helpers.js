/**
 * Вспомогательные утилиты
 */
export const Helpers = {
    /**
     * Перемешать массив
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    /**
     * Получить случайный элемент из массива
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Форматировать время
     */
    formatTime(seconds) {
        return seconds.toString().padStart(2, '0');
    },

    /**
     * Валидация имени игрока
     */
    validatePlayerName(name, index) {
        if (!name || name.trim().length === 0) {
            return `Игрок ${index + 1}: имя не может быть пустым`;
        }
        if (name.length > 20) {
            return `Игрок ${index + 1}: имя не может быть длиннее 20 символов`;
        }
        if (name.trim().length < 2) {
            return `Игрок ${index + 1}: имя должно содержать минимум 2 символа`;
        }
        return null;
    },

    /**
     * Создать уникальный ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Проверка ответа с учетом неточностей
     */
    checkAnswer(userAnswer, correctAnswer, options = {}) {
        const {
            ignoreCase = true,
            ignoreSpaces = true,
            ignorePunctuation = true,
            fuzzyMatch = false
        } = options;

        let processedUser = userAnswer || '';
        let processedCorrect = correctAnswer || '';

        if (ignoreCase) {
            processedUser = processedUser.toLowerCase();
            processedCorrect = processedCorrect.toLowerCase();
        }

        if (ignoreSpaces) {
            processedUser = processedUser.replace(/\s+/g, ' ').trim();
            processedCorrect = processedCorrect.replace(/\s+/g, ' ').trim();
        }

        if (ignorePunctuation) {
            processedUser = processedUser.replace(/[.,!?;:'"\-()]/g, '');
            processedCorrect = processedCorrect.replace(/[.,!?;:'"\-()]/g, '');
        }

        if (fuzzyMatch) {
            // Простое нечеткое сравнение (можно улучшить)
            return this.fuzzyMatch(processedUser, processedCorrect);
        }

        return processedUser === processedCorrect;
    },

    /**
     * Простое нечеткое сравнение
     */
    fuzzyMatch(str1, str2) {
        if (Math.abs(str1.length - str2.length) > 3) return false;
        
        // Левенштейн расстояние (упрощенно)
        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return distance / maxLength < 0.3; // Допускаем 30% различий
    },

    /**
     * Расстояние Левенштейна
     */
    levenshteinDistance(a, b) {
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    },

    /**
     * Дебаунс
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Получить клавишу по коду
     */
    getKeyFromCode(code) {
        const keyMap = {
            'KeyA': 'A',
            'KeyL': 'L',
            'Space': 'ПРОБЕЛ'
        };
        return keyMap[code] || code;
    }
};