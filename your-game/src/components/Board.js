/**
 * Компонент игрового табло
 */
export class BoardComponent {
    constructor(container, game, onQuestionSelect, onNextRound) {
        this.container = container;
        this.game = game;
        this.onQuestionSelect = onQuestionSelect;
        this.onNextRound = onNextRound;
        this.template = document.getElementById('game-board');
    }

    /**
     * Отрисовать табло
     */
    render() {
        const boardElement = this.template.content.cloneNode(true);
        
        // Обновляем информацию о раунде
        boardElement.querySelector('#round-number').textContent = this.game.roundNumber;
        
        const currentPlayer = this.game.getCurrentPlayer();
        boardElement.querySelector('#current-player-name').textContent = currentPlayer.name;
        
        // Отрисовываем игроков
        this.renderPlayers(boardElement);
        
        // Отрисовываем вопросы
        this.renderQuestions(boardElement);
        
        // Кнопка следующего раунда
        const nextRoundBtn = boardElement.querySelector('#next-round-btn');
        if (this.game.gameState === 'round1Complete' || this.game.gameState === 'round2Complete') {
            nextRoundBtn.classList.remove('hidden');
            nextRoundBtn.textContent = this.game.gameState === 'round1Complete' 
                ? 'Второй раунд' 
                : 'Финальный раунд';
        } else {
            nextRoundBtn.classList.add('hidden');
        }
        
        // Обработчики
        nextRoundBtn.addEventListener('click', () => {
            if (this.onNextRound) {
                this.onNextRound();
            }
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(boardElement);
    }

    /**
     * Отрисовать игроков
     */
    renderPlayers(boardElement) {
        const playersSection = boardElement.querySelector('.players-section');
        const currentPlayer = this.game.getCurrentPlayer();
        
        this.game.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            if (player.id === currentPlayer.id) {
                playerCard.classList.add('current');
            }
            
            playerCard.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score}</div>
                <div class="player-key">Клавиша: ${player.key}</div>
            `;
            
            // Добавляем кнопку изменения счета в dev mode
            if (window.devMode) {
                const editBtn = document.createElement('button');
                editBtn.className = 'dev-score-edit';
                editBtn.textContent = '✏️';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newScore = prompt('Новый счет:', player.score);
                    if (newScore !== null && !isNaN(newScore)) {
                        this.game.setPlayerScore(player.id, parseInt(newScore));
                        this.render();
                    }
                });
                playerCard.appendChild(editBtn);
            }
            
            playersSection.appendChild(playerCard);
        });
    }

    /**
     * Отрисовать вопросы
     */
    renderQuestions(boardElement) {
        const headerRow = boardElement.querySelector('#board-header');
        const body = boardElement.querySelector('#board-body');
        
        // Заголовки (стоимости)
        headerRow.innerHTML = '<th>Темы</th>';
        this.game.currentRound.values.forEach(value => {
            headerRow.innerHTML += `<th>${value}</th>`;
        });
        
        // Темы и вопросы
        for (let themeIndex = 0; themeIndex < 6; themeIndex++) {
            const row = document.createElement('tr');
            
            // Название темы
            const themeCell = document.createElement('td');
            themeCell.textContent = this.getThemeName(themeIndex);
            row.appendChild(themeCell);
            
            // Ячейки с вопросами
            for (let valueIndex = 0; valueIndex < 5; valueIndex++) {
                const cell = document.createElement('td');
                const question = this.game.currentRound.getQuestion(themeIndex, valueIndex);
                
                if (question && !question.played) {
                    cell.textContent = question.value;
                    
                    // Добавляем классы для специальных вопросов
                    if (question.type === 'cat') {
                        cell.classList.add('special-cat');
                    } else if (question.type === 'auction') {
                        cell.classList.add('special-auction');
                    }
                    
                    // Подсветка в dev mode
                    if (window.devMode) {
                        if (question.type === 'cat') {
                            cell.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
                        } else if (question.type === 'auction') {
                            cell.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                        }
                    }
                    
                    cell.addEventListener('click', () => {
                        if (this.onQuestionSelect) {
                            this.onQuestionSelect(themeIndex, valueIndex);
                        }
                    });
                } else {
                    cell.textContent = '';
                    cell.classList.add('played');
                }
                
                row.appendChild(cell);
            }
            
            body.appendChild(row);
        }
    }

    /**
     * Получить название темы
     */
    getThemeName(index) {
        const themes = this.game.roundNumber === 1 
            ? ['Стартапы', 'Языки программирования', 'Мемы', 'Боги Древнего Египта', 'Художники', 'Математика']
            : ['Космос', 'Кино', 'Музыка', 'География', 'История', 'Наука'];
        
        return themes[index];
    }
}