/**
 * Класс игрока
 */
export class Player {
    constructor(id, name, key) {
        this.id = id;
        this.name = name;
        this.key = key;
        this.score = 0;
        this.hasAnswered = false; // Для текущего вопроса
        this.isActive = true; // Для финала
    }

    /**
     * Добавить очки
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Сбросить состояние ответа
     */
    resetAnswerState() {
        this.hasAnswered = false;
    }

    /**
     * Сериализация для сохранения
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            key: this.key,
            score: this.score
        };
    }

    /**
     * Создать из сохраненных данных
     */
    static fromJSON(data) {
        const player = new Player(data.id, data.name, data.key);
        player.score = data.score;
        return player;
    }
}