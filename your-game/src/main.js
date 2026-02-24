import { Game } from './game/Game.js';
import { BoardComponent } from './components/Board.js';
import { QuestionModal } from './components/QuestionModal.js';
import { Storage } from './utils/storage.js';
import { Helpers } from './utils/helpers.js';

/**
 * Главный класс приложения
 */
class App {
    constructor() {
        this.game = new Game();
        this.currentScreen = null;
        this.questionModal = null;
        
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        // Загружаем настройки
        const settings = Storage.loadSettings();
        window.devMode = settings.devMode;
        
        // Настраиваем dev mode
        const devModeCheckbox = document.getElementById('devMode');
        devModeCheckbox.checked = window.devMode;
        devModeCheckbox.addEventListener('change', (e) => {
            window.devMode = e.target.checked;
            Storage.saveSettings({ devMode: window.devMode });
            this.renderCurrentScreen();
        });
        
        // Рендерим текущий экран
        this.renderCurrentScreen();
    }

    /**
     * Рендеринг текущего экрана
     */
    renderCurrentScreen() {
        const content = document.getElementById('game-content');
        
        switch (this.game.gameState) {
            case 'setup':
                this.renderSetupScreen(content);
                break;
            case 'round1':
            case 'round2':
                this.renderGameBoard(content);
                break;
            case 'round1Complete':
            case 'round2Complete':
                this.renderRoundComplete(content);
                break;
            case 'final':
                this.renderFinalRound(content);
                break;
            case 'finished':
                this.renderFinished(content);
                break;
        }
    }

    /**
     * Рендеринг экрана настройки
     */
    renderSetupScreen(container) {
        const template = document.getElementById('setup-screen');
        const screen = template.content.cloneNode(true);
        
        const form = screen.querySelector('#player-setup');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const player1 = document.getElementById('player1').value.trim();
            const player2 = document.getElementById('player2').value.trim();
            const player3 = document.getElementById('player3').value.trim();
            
            // Валидация
            const errors = [
                Helpers.validatePlayerName(player1, 0),
                Helpers.validatePlayerName(player2, 1),
                Helpers.validatePlayerName(player3, 2)
            ].filter(error => error !== null);
            
            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }
            
            this.game.initialize([player1, player2, player3]);
            this.renderCurrentScreen();
        });
        
        container.innerHTML = '';
        container.appendChild(screen);
    }

    /**
     * Рендеринг игрового табло
     */
    renderGameBoard(container) {
        const board = new BoardComponent(
            container,
            this.game,
            (themeIndex, valueIndex) => this.onQuestionSelect(themeIndex, valueIndex),
            () => this.onNextRound()
        );
        
        board.render();
        this.currentScreen = board;
    }

    /**
     * Рендеринг экрана завершения раунда
     */
    renderRoundComplete(container) {
        const roundNumber = this.game.roundNumber;
        const nextRoundText = roundNumber === 1 ? 'Второй раунд' : 'Финальный раунд';
        
        container.innerHTML = `
            <div class="setup-screen">
                <h2>Раунд ${roundNumber} завершен!</h2>
                <div class="players-section">
                    ${this.game.players.map(p => `
                        <div class="player-card">
                            <div class="player-name">${p.name}</div>
                            <div class="player-score">${p.score}</div>
                        </div>
                    `).join('')}
                </div>
                <button id="next-round" class="btn-primary">${nextRoundText}</button>
            </div>
        `;
        
        document.getElementById('next-round').addEventListener('click', () => {
            if (roundNumber === 1) {
                this.game.startSecondRound();
            } else {
                this.game.startFinalRound();
            }
            this.renderCurrentScreen();
        });
    }

    /**
     * Обработчик выбора вопроса
     */
    onQuestionSelect(themeIndex, valueIndex) {
        const question = this.game.selectQuestion(themeIndex, valueIndex);
        
        if (!question) return;
        
        const theme = this.currentScreen.getThemeName(themeIndex);
        
        this.questionModal = new QuestionModal(
            document.getElementById('app'),
            this.game,
            (isCorrect, betValue) => this.onAnswer(isCorrect, betValue, question),
            () => this.onQuestionClose()
        );
        
        this.questionModal.show(question, theme);
    }

/**
 * Обработчик ответа на вопрос
 */
    onAnswer(isCorrect, betValue, question, answererId = null) {
    // Определяем, кто отвечал
    let playerId = answererId;
    
    if (!playerId) {
        if (question.type === 'cat') {
            playerId = question.transferredTo;
        } else if (question.type === 'auction') {
            const winner = this.game.getAuctionWinner(question);
            playerId = winner ? winner.playerId : null;
        } else {
            playerId = this.game.getCurrentPlayer().id;
        }
    }
    
    if (!playerId) return;
    
    if (isCorrect) {
        this.game.handleCorrectAnswer(playerId, question, betValue);
    } else {
        this.game.handleWrongAnswer(playerId, question, betValue);
    }
    
    // Сбрасываем состояние ответов игроков
    this.game.resetPlayersAnswerState();
}

    /**
     * Обработчик закрытия вопроса
     */
    onQuestionClose() {
        this.questionModal = null;
        this.renderCurrentScreen();
    }

    /**
     * Обработчик следующего раунда
     */
    onNextRound() {
        if (this.game.gameState === 'round1Complete') {
            this.game.startSecondRound();
        } else if (this.game.gameState === 'round2Complete') {
            this.game.startFinalRound();
        }
        this.renderCurrentScreen();
    }

    /**
     * Рендеринг финального раунда
     */
    renderFinalRound(container) {
        const participants = this.game.getFinalParticipants();
        
        if (participants.length === 0) {
            this.game.gameState = 'finished';
            this.renderCurrentScreen();
            return;
        }
        
        const finalState = this.determineFinalState();
        
        switch (finalState) {
            case 'bets':
                this.renderFinalBets(container, participants);
                break;
            case 'answers':
                this.renderFinalAnswers(container, participants);
                break;
            case 'results':
                this.renderFinalResults(container);
                break;
        }
    }

    /**
     * Определить состояние финала
     */
    determineFinalState() {
        const participants = this.game.getFinalParticipants();
        const allBetsPlaced = participants.every(p => this.game.finalBets[p.id] !== undefined);
        const allAnswered = participants.every(p => this.game.finalAnswers[p.id] !== undefined);
        
        if (!allBetsPlaced) return 'bets';
        if (!allAnswered) return 'answers';
        return 'results';
    }

    /**
     * Рендеринг ставок финала
     */
    renderFinalBets(container, participants) {
        let currentBetIndex = 0;
        
        const renderBetForPlayer = (index) => {
            if (index >= participants.length) {
                this.renderCurrentScreen();
                return;
            }
            
            const player = participants[index];
            
            container.innerHTML = `
                <div class="final-round-screen">
                    <h2>Финальный раунд</h2>
                    <div class="final-theme">Тема: ${this.game.finalQuestion.theme}</div>
                    <div class="final-player-item active">
                        <span>${player.name}</span>
                        <div class="bet-input-section">
                            <input type="number" 
                                id="bet-amount" 
                                class="bet-input" 
                                min="1" 
                                max="${player.score}" 
                                value="${Math.min(100, player.score)}">
                            <button id="submit-bet" class="btn-primary">Подтвердить ставку</button>
                        </div>
                    </div>
                    <p class="hint">Другие игроки, отвернитесь!</p>
                </div>
            `;
            
            document.getElementById('submit-bet').addEventListener('click', () => {
                const bet = parseInt(document.getElementById('bet-amount').value);
                
                if (this.game.makeFinalBet(player.id, bet)) {
                    currentBetIndex++;
                    renderBetForPlayer(currentBetIndex);
                } else {
                    alert('Некорректная ставка!');
                }
            });
        };
        
        renderBetForPlayer(0);
    }

    /**
     * Рендеринг ответов финала
     */
    renderFinalAnswers(container, participants) {
        let currentAnswerIndex = 0;
        
        const renderAnswerForPlayer = (index) => {
            if (index >= participants.length) {
                this.game.finishFinal();
                this.renderCurrentScreen();
                return;
            }
            
            const player = participants[index];
            
            container.innerHTML = `
                <div class="final-round-screen">
                    <h2>Финальный раунд - ${player.name}</h2>
                    <div class="final-theme">${this.game.finalQuestion.theme}</div>
                    <div class="question-text">${this.game.finalQuestion.text}</div>
                    <div class="timer">60</div>
                    <div class="answer-section">
                        <input type="text" id="final-answer" class="bet-input" placeholder="Ваш ответ">
                        <button id="submit-answer" class="btn-primary">Ответить</button>
                    </div>
                    <p class="hint">Другие игроки, отвернитесь!</p>
                </div>
            `;
            
            // Запускаем таймер
            let timeLeft = 60;
            const timerElement = container.querySelector('.timer');
            
            const timer = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    document.getElementById('submit-answer').click();
                }
            }, 1000);
            
            document.getElementById('submit-answer').addEventListener('click', () => {
                clearInterval(timer);
                const answer = document.getElementById('final-answer').value;
                this.game.saveFinalAnswer(player.id, answer);
                currentAnswerIndex++;
                renderAnswerForPlayer(currentAnswerIndex);
            });
        };
        
        renderAnswerForPlayer(0);
    }

    /**
     * Рендеринг результатов финала
     */
    renderFinalResults(container) {
        container.innerHTML = `
            <div class="results-screen">
                <h1>Игра завершена!</h1>
                <div class="winner">
                    🏆 ${this.game.winner.name} 🏆
                </div>
                <div class="final-results">
                    <h3>Итоговые результаты:</h3>
                    ${this.game.players.map(p => `
                        <div>${p.name}: ${p.score} баллов</div>
                    `).join('')}
                </div>
                <button id="new-game" class="btn-primary">Новая игра</button>
            </div>
        `;
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.game.reset();
            this.renderCurrentScreen();
        });
    }

    /**
     * Рендеринг финиша (если нет участников финала)
     */
    renderFinished(container) {
        container.innerHTML = `
            <div class="results-screen">
                <h1>Игра завершена!</h1>
                <p>Нет участников с положительным счетом для финального раунда.</p>
                <button id="new-game" class="btn-primary">Новая игра</button>
            </div>
        `;
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.game.reset();
            this.renderCurrentScreen();
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new App();
});