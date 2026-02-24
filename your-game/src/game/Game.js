import { Player } from './Player.js';
import { Round } from './Round.js';
import { QuestionsData } from './data/questions.js';
import { Storage } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

/**
 * Основной класс игры
 */
export class Game {
    constructor() {
        this.players = [];
        this.currentRound = null;
        this.roundNumber = 1;
        this.currentPlayerIndex = 0;
        this.gameState = 'setup'; // setup, round1, round2, final, finished
        this.finalParticipants = [];
        this.finalQuestion = null;
        this.finalBets = {};
        this.finalAnswers = {};
        this.winner = null;
        
        // Загрузка сохраненного состояния
        this.loadState();
    }

    /**
     * Инициализация игры
     */
    initialize(playerNames) {
        this.players = [
            new Player(Helpers.generateId(), playerNames[0], 'A'),
            new Player(Helpers.generateId(), playerNames[1], 'L'),
            new Player(Helpers.generateId(), playerNames[2], 'Space')
        ];
        
        this.roundNumber = 1;
        this.currentRound = new Round(1, this.players);
        this.gameState = 'round1';
        this.currentPlayerIndex = 0; // Первый игрок начинает
        
        this.saveState();
    }

    /**
     * Начать второй раунд
     */
    startSecondRound() {
        // Определяем игрока с наименьшим счетом
        let minScore = Infinity;
        let minIndex = 0;
        
        this.players.forEach((player, index) => {
            if (player.score < minScore) {
                minScore = player.score;
                minIndex = index;
            }
        });
        
        this.roundNumber = 2;
        this.currentRound = new Round(2, this.players);
        this.gameState = 'round2';
        this.currentPlayerIndex = minIndex;
        
        this.saveState();
    }

    /**
     * Начать финальный раунд
     */
    startFinalRound() {
        this.finalParticipants = this.players.filter(p => p.score > 0);
        
        if (this.finalParticipants.length === 0) {
            this.gameState = 'finished';
            this.saveState();
            return;
        }
        
        const finalData = QuestionsData.getRandomFinalQuestion();
        this.finalQuestion = finalData;
        this.finalBets = {};
        this.finalAnswers = {};
        this.gameState = 'final';
        
        this.saveState();
    }

    /**
     * Выбрать вопрос
     */
    selectQuestion(themeIndex, valueIndex) {
        const question = this.currentRound.getQuestion(themeIndex, valueIndex);
        
        if (!question || question.played) {
            return null;
        }
        
        return question;
    }

    /**
     * Обработать правильный ответ
     */
    handleCorrectAnswer(playerId, question, betValue = null) {
        const player = this.players.find(p => p.id === playerId);
        
        if (!player) return false;
        
        const points = betValue !== null ? betValue : question.value;
        player.addScore(points);
        
        // Право выбора следующего вопроса остается у ответившего
        this.currentPlayerIndex = this.players.findIndex(p => p.id === playerId);
        
        // Отмечаем вопрос как сыгранный
        question.markAsPlayed();
        
        // Проверяем завершение раунда
        if (this.currentRound.isComplete()) {
            if (this.roundNumber === 1) {
                this.gameState = 'round1Complete';
            } else if (this.roundNumber === 2) {
                this.gameState = 'round2Complete';
            }
        }
        
        this.saveState();
        return true;
    }

    /**
     * Обработать неправильный ответ
     */
    handleWrongAnswer(playerId, question, betValue = null) {
        const player = this.players.find(p => p.id === playerId);
        
        if (!player) return false;
        
        const points = betValue !== null ? betValue : question.value;
        player.addScore(-points);
        
        player.hasAnswered = true;
        
        // Проверяем, все ли игроки уже ответили неправильно
        const allAnswered = this.players.every(p => p.hasAnswered);
        
        if (allAnswered) {
            // Все ответили неправильно - вопрос закрывается
            question.markAsPlayed();
            
            // Право выбора остается у того же игрока
            this.players.forEach(p => p.resetAnswerState());
        }
        
        this.saveState();
        return true;
    }

    /**
     * Сбросить состояние ответов игроков
     */
    resetPlayersAnswerState() {
        this.players.forEach(p => p.resetAnswerState());
    }

    /**
     * Сделать ставку в аукционе
     */
    makeBid(question, playerId, amount) {
        const player = this.players.find(p => p.id === playerId);
        
        if (!player || amount > player.score) {
            return false;
        }
        
        question.addBid(playerId, amount);
        this.saveState();
        return true;
    }

    /**
     * Получить победителя аукциона
     */
    getAuctionWinner(question) {
        return question.getAuctionWinner();
    }

    /**
     * Передать кота игроку
     */
    transferCat(question, fromPlayerId, toPlayerId) {
        question.setCatRecipient(toPlayerId);
        this.currentPlayerIndex = this.players.findIndex(p => p.id === toPlayerId);
        this.saveState();
    }

    /**
     * Установить ставку для кота
     */
    setCatBet(question, playerId, betValue) {
        question.setCatBet(betValue);
        this.saveState();
    }

    /**
     * Сделать ставку в финале
     */
    makeFinalBet(playerId, bet) {
        if (bet < 1 || bet > this.getPlayerScore(playerId)) {
            return false;
        }
        
        this.finalBets[playerId] = bet;
        this.saveState();
        return true;
    }

    /**
     * Сохранить ответ в финале
     */
    saveFinalAnswer(playerId, answer) {
        this.finalAnswers[playerId] = answer;
        this.saveState();
    }

    /**
     * Завершить финал
     */
    finishFinal() {
        const correctAnswer = this.finalQuestion.answer;
        
        this.finalParticipants.forEach(player => {
            const bet = this.finalBets[player.id] || 0;
            const answer = this.finalAnswers[player.id] || '';
            
            const isCorrect = Helpers.checkAnswer(answer, correctAnswer);
            
            if (isCorrect) {
                player.addScore(bet);
            } else {
                player.addScore(-bet);
            }
        });
        
        // Определяем победителя
        this.winner = this.players.reduce((max, player) => 
            player.score > max.score ? player : max
        , this.players[0]);
        
        this.gameState = 'finished';
        
        // Сохраняем статистику
        Storage.addGameStatistics({
            players: this.players.map(p => ({ name: p.name, score: p.score })),
            winner: this.winner.name,
            rounds: this.roundNumber
        });
        
        this.saveState();
    }

    /**
     * Получить счет игрока
     */
    getPlayerScore(playerId) {
        const player = this.players.find(p => p.id === playerId);
        return player ? player.score : 0;
    }

    /**
     * Изменить счет игрока (dev mode)
     */
    setPlayerScore(playerId, newScore) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.score = Math.max(0, newScore);
            this.saveState();
            return true;
        }
        return false;
    }

    /**
     * Сохранить состояние игры
     */
    saveState() {
        const state = {
            players: this.players.map(p => p.toJSON()),
            roundNumber: this.roundNumber,
            currentRound: this.currentRound ? this.currentRound.toJSON() : null,
            gameState: this.gameState,
            currentPlayerIndex: this.currentPlayerIndex,
            finalQuestion: this.finalQuestion,
            finalBets: this.finalBets,
            finalAnswers: this.finalAnswers,
            winner: this.winner ? this.winner.toJSON() : null
        };
        
        Storage.saveGameState(state);
    }

    /**
     * Загрузить состояние игры
     */
    loadState() {
        const state = Storage.loadGameState();
        
        if (state) {
            this.players = state.players.map(p => Player.fromJSON(p));
            this.roundNumber = state.roundNumber;
            
            if (state.currentRound) {
                this.currentRound = Round.fromJSON(state.currentRound, this.players);
            }
            
            this.gameState = state.gameState;
            this.currentPlayerIndex = state.currentPlayerIndex;
            this.finalQuestion = state.finalQuestion;
            this.finalBets = state.finalBets || {};
            this.finalAnswers = state.finalAnswers || {};
            
            if (state.winner) {
                this.winner = Player.fromJSON(state.winner);
            }
        }
    }

    /**
     * Сбросить игру
     */
    reset() {
        Storage.clearGameState();
        this.players = [];
        this.currentRound = null;
        this.roundNumber = 1;
        this.gameState = 'setup';
        this.finalParticipants = [];
        this.finalQuestion = null;
        this.finalBets = {};
        this.finalAnswers = {};
        this.winner = null;
    }

    /**
     * Получить текущего игрока
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Получить игроков для финала
     */
    getFinalParticipants() {
        return this.finalParticipants;
    }

    /**
     * Проверить, готов ли финал
     */
    isFinalReady() {
        if (this.finalParticipants.length === 0) return false;
        
        // Проверяем, все ли сделали ставки
        const allBetsPlaced = this.finalParticipants.every(
            p => this.finalBets[p.id] !== undefined
        );
        
        // Проверяем, все ли ответили
        const allAnswered = this.finalParticipants.every(
            p => this.finalAnswers[p.id] !== undefined
        );
        
        return allBetsPlaced && allAnswered;
    }
}