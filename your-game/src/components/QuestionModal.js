import { Helpers } from '../utils/helpers.js';

/**
 * Компонент модального окна вопроса
 */
export class QuestionModal {
    constructor(container, game, onAnswer, onClose) {
        this.container = container;
        this.game = game;
        this.onAnswer = onAnswer;
        this.onClose = onClose;
        this.template = document.getElementById('question-modal');
        this.modal = null;
        this.timer = null;
        this.timeLeft = 30;
        this.currentQuestion = null;
        this.currentAnswerer = null;
        this.playersAttempted = new Set();
    }

    /**
     * Показать вопрос
     */
    show(question, theme) {
        this.currentQuestion = question;
        this.timeLeft = 30;
        this.playersAttempted.clear();
        
        const modalContent = this.template.content.cloneNode(true);
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.appendChild(modalContent);
        
        this.container.appendChild(this.modal);
        
        // Заполняем данные
        this.updateQuestionInfo(question, theme);
        
        // Настраиваем специальный вопрос
        if (question.type === 'cat') {
            this.setupCatQuestion(question);
        } else if (question.type === 'auction') {
            this.setupAuctionQuestion(question);
        } else {
            this.setupRegularQuestion();
        }
        
        // Запускаем таймер
        this.startTimer();
        
        // Добавляем обработчики клавиш
        this.setupKeyHandlers();
        
        // Добавляем правильный ответ в dev mode
        if (window.devMode) {
            this.showDevAnswer(question.answer);
        }
    }

    /**
     * Обновить информацию о вопросе
     */
    updateQuestionInfo(question, theme) {
        this.modal.querySelector('.question-theme').textContent = theme;
        this.modal.querySelector('.question-value').textContent = question.value;
        this.modal.querySelector('.question-text').textContent = question.text;
        
        const typeBadge = this.modal.querySelector('.question-type-badge');
        if (question.type !== 'regular') {
            typeBadge.classList.add(question.type);
            typeBadge.textContent = question.type === 'cat' ? 'Кот в мешке' : 'Аукцион';
        }
    }

    /**
     * Настройка обычного вопроса
     */
    setupRegularQuestion() {
        const answerInput = this.modal.querySelector('#answer-input');
        const submitBtn = this.modal.querySelector('#submit-answer');
        
        answerInput.disabled = true;
        submitBtn.disabled = true;
        
        // Показываем статус игроков
        this.updatePlayersStatus();
    }

    /**
     * Настройка вопроса кота
     */
    setupCatQuestion(question) {
        const specialSection = this.modal.querySelector('.special-question-section');
        
        if (!question.transferredTo) {
            // Этап выбора получателя
            specialSection.innerHTML = `
                <div class="player-select-section">
                    <h3>Кот в мешке!</h3>
                    <p>Выберите игрока, который будет отвечать:</p>
                    <div class="select-player-buttons">
                        ${this.game.players.map(p => `
                            <button class="player-select-btn" data-player-id="${p.id}">
                                ${p.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            specialSection.querySelectorAll('.player-select-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const playerId = btn.dataset.playerId;
                    this.game.transferCat(question, this.game.getCurrentPlayer().id, playerId);
                    this.showBetSelection(question);
                });
            });
        } else if (!question.betValue) {
            // Этап выбора ставки
            this.showBetSelection(question);
        } else {
            // Этап ответа
            this.showAnswerStage();
        }
    }

    /**
     * Показать выбор ставки для кота
     */
    showBetSelection(question) {
        const specialSection = this.modal.querySelector('.special-question-section');
        const betOptions = this.game.roundNumber === 1 ? [100, 500] : [200, 1000];
        
        specialSection.innerHTML = `
            <div class="player-select-section">
                <h3>Выберите ставку</h3>
                <div class="select-player-buttons">
                    ${betOptions.map(bet => `
                        <button class="player-select-btn" data-bet="${bet}">
                            ${bet} баллов
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        specialSection.querySelectorAll('.player-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bet = parseInt(btn.dataset.bet);
                this.game.setCatBet(question, question.transferredTo, bet);
                this.showAnswerStage();
            });
        });
    }

    /**
     * Настройка вопроса аукциона
     */
    setupAuctionQuestion(question) {
        const specialSection = this.modal.querySelector('.special-question-section');
        
        if (!question.currentBidder) {
            // Этап торгов
            this.showAuctionBidding(question);
        } else {
            // Этап ответа
            this.showAnswerStage();
        }
    }

    /**
     * Показать торги аукциона
     */
    showAuctionBidding(question) {
        const specialSection = this.modal.querySelector('.special-question-section');
        const minBid = question.value;
        
        specialSection.innerHTML = `
            <div class="bidding-section">
                <h3>Аукцион! Начальная ставка: ${minBid}</h3>
                <div class="bidding-players">
                    ${this.game.players.map(p => `
                        <div class="bidding-player" data-player-id="${p.id}">
                            <span>${p.name} (${p.score} баллов)</span>
                            <div class="bid-controls">
                                <input type="number" 
                                    class="bid-input" 
                                    data-player="${p.id}"
                                    min="${minBid}" 
                                    max="${p.score}"
                                    value="${Math.min(minBid + 100, p.score)}"
                                    ${p.score < minBid ? 'disabled' : ''}>
                                <button class="btn-primary make-bid-btn" 
                                    data-player="${p.id}"
                                    ${p.score < minBid ? 'disabled' : ''}>
                                    Ставка
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="current-bids">
                    <h4>Текущие ставки:</h4>
                    <div id="bids-list"></div>
                </div>
                <button id="end-auction" class="btn-primary">Завершить торги</button>
            </div>
        `;
        
        // Обновляем список ставок
        this.updateBidsList(question);
        
        // Обработчики ставок
        specialSection.querySelectorAll('.make-bid-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const playerId = btn.dataset.player;
                const input = specialSection.querySelector(`.bid-input[data-player="${playerId}"]`);
                const amount = parseInt(input.value);
                
                if (this.game.makeBid(question, playerId, amount)) {
                    this.updateBidsList(question);
                    
                    // Деактивируем игрока, если у него больше нет денег
                    const player = this.game.players.find(p => p.id === playerId);
                    if (player.score <= amount) {
                        input.disabled = true;
                        btn.disabled = true;
                    }
                }
            });
        });
        
        // Завершение торгов
        specialSection.querySelector('#end-auction').addEventListener('click', () => {
            const winner = this.game.getAuctionWinner(question);
            if (winner) {
                // Устанавливаем победителя как отвечающего
                this.currentAnswerer = winner.playerId;
                this.showAnswerStage();
            } else {
                alert('Нет ставок!');
            }
        });
    }

    /**
     * Обновить список ставок
     */
    updateBidsList(question) {
        const bidsList = this.modal.querySelector('#bids-list');
        if (!bidsList) return;
        
        if (question.bids.length === 0) {
            bidsList.innerHTML = '<p>Пока нет ставок</p>';
            return;
        }
        
        bidsList.innerHTML = question.bids
            .map(bid => {
                const player = this.game.players.find(p => p.id === bid.playerId);
                return `<div>${player ? player.name : 'Игрок'}: ${bid.amount}</div>`;
            })
            .join('');
    }

    /**
     * Показать этап ответа
     */
    showAnswerStage() {
        const specialSection = this.modal.querySelector('.special-question-section');
        specialSection.innerHTML = '';
        
        const answerInput = this.modal.querySelector('#answer-input');
        const submitBtn = this.modal.querySelector('#submit-answer');
        
        answerInput.disabled = false;
        submitBtn.disabled = false;
        
        // Определяем, кто отвечает
        let answererId = null;
        let answererName = '';
        
        if (this.currentQuestion.type === 'cat') {
            answererId = this.currentQuestion.transferredTo;
        } else if (this.currentQuestion.type === 'auction') {
            const winner = this.game.getAuctionWinner(this.currentQuestion);
            answererId = winner ? winner.playerId : null;
        } else if (this.currentAnswerer) {
            answererId = this.currentAnswerer;
        }
        
        if (answererId) {
            const answerer = this.game.players.find(p => p.id === answererId);
            answererName = answerer ? answerer.name : 'Игрок';
            this.modal.querySelector('.current-answerer').textContent = 
                `Отвечает: ${answererName}`;
        }
        
        // Удаляем старые обработчики, если есть
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        const newAnswerInput = answerInput.cloneNode(true);
        answerInput.parentNode.replaceChild(newAnswerInput, answerInput);
        
        // Обработчик отправки ответа
        newSubmitBtn.addEventListener('click', () => {
            this.submitAnswer();
        });
        
        newAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Фокусируемся на поле ввода
        setTimeout(() => newAnswerInput.focus(), 100);
    }

    /**
     * Отправить ответ
     */
    submitAnswer() {
        const answerInput = this.modal.querySelector('#answer-input');
        const answer = answerInput.value.trim();
        
        if (!answer) {
            // Можно показать предупреждение, но не обязательно
            // Просто игнорируем пустой ответ
            return;
        }
        
        let betValue = null;
        let answererId = null;
        
        if (this.currentQuestion.type === 'cat') {
            betValue = this.currentQuestion.betValue;
            answererId = this.currentQuestion.transferredTo;
        } else if (this.currentQuestion.type === 'auction') {
            const winner = this.game.getAuctionWinner(this.currentQuestion);
            betValue = winner ? winner.amount : this.currentQuestion.value;
            answererId = winner ? winner.playerId : null;
        } else {
            answererId = this.currentAnswerer;
        }
        
        // Проверяем ответ
        const isCorrect = Helpers.checkAnswer(answer, this.currentQuestion.answer);
        
        if (this.onAnswer) {
            this.onAnswer(isCorrect, betValue, this.currentQuestion, answererId);
        }
        
        this.close();
    }

    /**
     * Обновить статус игроков
     */
    updatePlayersStatus() {
        const statusContainer = this.modal.querySelector('.players-status');
        if (!statusContainer) return;
        
        statusContainer.innerHTML = this.game.players.map(player => `
            <div class="player-attempt ${this.playersAttempted.has(player.id) ? 'attempted' : ''} 
                ${this.currentAnswerer === player.id ? 'answering' : ''}">
                <div>${player.name}</div>
                <div>Клавиша: ${player.key}</div>
            </div>
        `).join('');
    }

    /**
     * Захват права ответа
     */
    captureAnswer(playerId) {
        if (this.playersAttempted.has(playerId)) {
            return false; // Игрок уже пытался ответить
        }
        
        if (this.currentQuestion.type !== 'regular') {
            return false; // Только для обычных вопросов
        }
        
        this.playersAttempted.add(playerId);
        this.currentAnswerer = playerId;
        
        // Активируем поле ввода для этого игрока
        const answerInput = this.modal.querySelector('#answer-input');
        const submitBtn = this.modal.querySelector('#submit-answer');
        
        answerInput.disabled = false;
        submitBtn.disabled = false;
        
        const answerer = this.game.players.find(p => p.id === playerId);
        this.modal.querySelector('.current-answerer').textContent = 
            `Отвечает: ${answerer ? answerer.name : 'Игрок'}`;
        
        this.updatePlayersStatus();
        
        // Фокусируемся на поле ввода
        setTimeout(() => answerInput.focus(), 100);
        
        return true;
    }

    /**
     * Настройка обработчиков клавиш
     */
    setupKeyHandlers() {
        const handleKeyPress = (e) => {
            // Проверяем, что это обычный вопрос и поле ввода не активно
            if (this.currentQuestion.type !== 'regular') return;
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
            
            // Определяем игрока по клавише
            let playerId = null;
            if (e.code === 'KeyA') {
                playerId = this.game.players[0]?.id;
            } else if (e.code === 'KeyL') {
                playerId = this.game.players[1]?.id;
            } else if (e.code === 'Space') {
                playerId = this.game.players[2]?.id;
                e.preventDefault(); // Предотвращаем скролл страницы
            }
            
            if (playerId && !this.currentAnswerer) {
                this.captureAnswer(playerId);
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Сохраняем обработчик для удаления
        this.keyHandler = handleKeyPress;
    }

    /**
     * Запустить таймер
     */
    startTimer() {
        const timerElement = this.modal.querySelector('.timer');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                timerElement.classList.add('warning');
            }
            
            if (this.timeLeft <= 0) {
                this.timerExpired();
            }
        }, 1000);
    }

    /**
     * Таймер истек
     */
    timerExpired() {
        clearInterval(this.timer);
        
        // Проверяем, есть ли поле ввода и введен ли ответ
        const answerInput = this.modal.querySelector('#answer-input');
        
        if (this.currentQuestion.type === 'regular' && !this.currentAnswerer) {
            // Никто не ответил - закрываем вопрос
            this.close();
        } else if (answerInput && answerInput.value.trim()) {
            // Если есть введенный ответ, отправляем его
            this.submitAnswer();
        } else {
            // Время вышло, но ответа нет
            this.close();
        }
    }

    /**
     * Показать правильный ответ в dev mode
     */
    showDevAnswer(answer) {
        const devAnswer = this.modal.querySelector('.dev-answer');
        if (devAnswer) {
            devAnswer.classList.remove('hidden');
            devAnswer.innerHTML = `<strong>Правильный ответ:</strong> ${answer}`;
        }
    }

    /**
     * Закрыть модальное окно
     */
    close() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        if (this.modal) {
            this.modal.remove();
        }
        
        if (this.onClose) {
            this.onClose();
        }
    }
}