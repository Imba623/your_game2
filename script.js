// Игроки
let players = [];

// Назначенные клавиши для игроков
const playerKeys = ['a', 'l', ' ']; // пробел обозначается как ' '

// Вопросы по категориям для двух раундов (6 тем в каждом раунде)
// Вопросы по категориям для двух раундов (6 уникальных тем в каждом раунде)
const questionsData = {
    round1: {
        'Животный мир': [
            { value: 100, question: 'Самое большое животное на Земле?', answer: 'синий кит' },
            { value: 200, question: 'Какое животное славится своей медлительностью?', answer: 'ленивец' },
            { value: 300, question: 'Какая птица не умеет летать, но отлично плавает?', answer: 'пингвин' },
            { value: 400, question: 'Какое животное имеет самый длинный язык?', answer: 'муравьед' },
            { value: 500, question: 'Какое животное спит 22 часа в сутки?', answer: 'коала' }
        ],
        'Кулинария': [
            { value: 100, question: 'Какой суп называется "рыбным"?', answer: 'уха' },
            { value: 200, question: 'Из какой муки пекут черный хлеб?', answer: 'ржаная' },
            { value: 300, question: 'Какой овощ бывает и сладким, и горьким?', answer: 'перец' },
            { value: 400, question: 'Как называется итальянский хлеб с помидорами?', answer: 'пицца' },
            { value: 500, question: 'Какой фрукт используют для приготовления мармелада?', answer: 'айва' }
        ],
        'Одежда и мода': [
            { value: 100, question: 'Головной убор для защиты от солнца?', answer: 'панама' },
            { value: 200, question: 'Что носят на шее?', answer: 'галстук' },
            { value: 300, question: 'Обувь для спорта?', answer: 'кеды' },
            { value: 400, question: 'Как называется шотландская юбка?', answer: 'килт' },
            { value: 500, question: 'Какой предмет одежды назван в честь английского генерала?', answer: 'реглан' }
        ],
        'Транспорт': [
            { value: 100, question: 'Какой транспорт передвигается по рельсам?', answer: 'поезд' },
            { value: 200, question: 'Сколько колес у легкового автомобиля?', answer: '4' },
            { value: 300, question: 'Какой транспорт летает?', answer: 'самолет' },
            { value: 400, question: 'Как называется подземный поезд?', answer: 'метро' },
            { value: 500, question: 'Какое судно может плавать под водой?', answer: 'подводная лодка' }
        ],
        'Профессии': [
            { value: 100, question: 'Кто лечит людей?', answer: 'врач' },
            { value: 200, question: 'Кто учит детей в школе?', answer: 'учитель' },
            { value: 300, question: 'Кто готовит еду в ресторане?', answer: 'повар' },
            { value: 400, question: 'Кто рисует картины?', answer: 'художник' },
            { value: 500, question: 'Кто проектирует здания?', answer: 'архитектор' }
        ],
        'Музыка': [
            { value: 100, question: 'Какой музыкальный инструмент имеет клавиши?', answer: 'пианино' },
            { value: 200, question: 'Сколько струн у скрипки?', answer: '4' },
            { value: 300, question: 'Какой инструмент считается "королем оркестра"?', answer: 'скрипка' },
            { value: 400, question: 'Какой русский народный инструмент имеет треугольную форму?', answer: 'балалайка' },
            { value: 500, question: 'Какой духовой инструмент самый длинный?', answer: 'туба' }
        ]
    },
    round2: {
        'Кино и мультфильмы': [
            { value: 200, question: 'Как звали друга Шрека?', answer: 'осел' },
            { value: 400, question: 'Какой мультфильм рассказывает о жизни сурикатов?', answer: 'Король Лев' },
            { value: 600, question: 'Кто озвучил Волка в "Ну, погоди!"?', answer: 'Папанов' },
            { value: 800, question: 'Какой актер сыграл Железного человека?', answer: 'Роберт Дауни мл' },
            { value: 1000, question: 'Какой фильм получил "Оскар" в 2020 году за лучший фильм?', answer: 'Паразиты' }
        ],
        'Растения': [
            { value: 200, question: 'Какое растение имеет колючки?', answer: 'кактус' },
            { value: 400, question: 'Какой цветок считается символом Голландии?', answer: 'тюльпан' },
            { value: 600, question: 'Какое дерево является самым высоким в мире?', answer: 'секвойя' },
            { value: 800, question: 'Какое растение "питается" насекомыми?', answer: 'венерина мухоловка' },
            { value: 1000, question: 'Какой цветок называют "слезой Богородицы"?', answer: 'ландыш' }
        ],
        'Изобретения': [
            { value: 200, question: 'Кто изобрел лампочку?', answer: 'Эдисон' },
            { value: 400, question: 'Что изобрели братья Люмьер?', answer: 'кинематограф' },
            { value: 600, question: 'В каком году появился первый компьютер?', answer: '1941' },
            { value: 800, question: 'Кто изобрел телефон?', answer: 'Белл' },
            { value: 1000, question: 'Что изобрел Карл Бенц?', answer: 'автомобиль' }
        ],
        'Праздники': [
            { value: 200, question: 'Какой праздник отмечают 1 января?', answer: 'Новый год' },
            { value: 400, question: 'В какой праздник красят яйца?', answer: 'Пасха' },
            { value: 600, question: 'Какой праздник отмечают 8 марта?', answer: 'Международный женский день' },
            { value: 800, question: 'В какой стране придумали Хэллоуин?', answer: 'Ирландия' },
            { value: 1000, question: 'Какой праздник отмечается 4 июля в США?', answer: 'День независимости' }
        ],
        'Писатели и книги': [
            { value: 200, question: 'Кто написал "Колобка"?', answer: 'народ' },
            { value: 400, question: 'Какой писатель создал Шерлока Холмса?', answer: 'Конан Дойл' },
            { value: 600, question: 'Кто написал "Гарри Поттера"?', answer: 'Роулинг' },
            { value: 800, question: 'Какой русский поэт написал "Руслан и Людмила"?', answer: 'Пушкин' },
            { value: 1000, question: 'Кто автор "Трех мушкетеров"?', answer: 'Дюма' }
        ],
        'Космос': [
            { value: 200, question: 'Как называется наша галактика?', answer: 'Млечный путь' },
            { value: 400, question: 'Сколько планет в солнечной системе?', answer: '8' },
            { value: 600, question: 'Кто был первым человеком в космосе?', answer: 'Гагарин' },
            { value: 800, question: 'Какая планета самая большая?', answer: 'Юпитер' },
            { value: 1000, question: 'Что такое "черная дыра"?', answer: 'область с сильным притяжением' }
        ]
    }
};

let currentRound = 1; // Текущий раунд (1 или 2)
let answeredQuestions = new Set(); // Отвеченные вопросы
let currentQuestion = null; // Текущий выбранный вопрос
let gameOver = false;
let timerInterval = null;
let timeLeft = 30;
let waitingForAnswer = false; // Ожидание нажатия клавиши
let answeringPlayer = null; // Игрок, который захватил право ответа

// Функция обновления отображения игроков
function updatePlayersDisplay() {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        let playerClass = 'player';
        if (player.isActive) playerClass += ' active';
        if (answeringPlayer && answeringPlayer.id === player.id) playerClass += ' answering';
        playerDiv.className = playerClass;
        
        const keyNames = ['A', 'L', 'Пробел'];
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <div class="score">💰 ${player.score}</div>
            <div class="player-key">🔑 ${keyNames[index]}</div>
        `;
        playersDiv.appendChild(playerDiv);
    });
}

// Функция обновления отображения вопросов
function updateQuestionsDisplay() {
    const categoriesDiv = document.getElementById('categories');
    categoriesDiv.innerHTML = '';

    // Добавляем индикатор раунда
    const roundIndicator = document.createElement('div');
    roundIndicator.className = 'round-indicator';
    roundIndicator.innerHTML = `<h2>Раунд ${currentRound} ${currentRound === 1 ? '🌱' : '🔥'}</h2>`;
    categoriesDiv.appendChild(roundIndicator);

    const currentQuestions = currentRound === 1 ? questionsData.round1 : questionsData.round2;

    Object.entries(currentQuestions).forEach(([category, questions]) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'category-row';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'category-title';
        titleDiv.textContent = category;
        rowDiv.appendChild(titleDiv);

        const questionsDiv = document.createElement('div');
        questionsDiv.className = 'questions';

        questions.forEach(q => {
            const btn = document.createElement('button');
            btn.className = `question-btn ${currentRound === 2 ? 'round2-btn' : ''} ${answeredQuestions.has(q.question) ? 'answered' : ''}`;
            btn.textContent = q.value;
            btn.onclick = () => selectQuestion(category, q);
            btn.disabled = answeredQuestions.has(q.question) || gameOver || waitingForAnswer;
            questionsDiv.appendChild(btn);
        });

        rowDiv.appendChild(questionsDiv);
        categoriesDiv.appendChild(rowDiv);
    });
}

// Функция запуска таймера
function startTimer() {
    timeLeft = 30;
    const timerDiv = document.getElementById('timer');
    timerDiv.style.display = 'block';
    timerDiv.textContent = `⏱️ Осталось: ${timeLeft} сек.`;
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = `⏱️ Осталось: ${timeLeft} сек.`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDiv.style.display = 'none';
            
            if (waitingForAnswer) {
                // Никто не нажал клавишу
                waitingForAnswer = false;
                document.getElementById('waitingMessage').style.display = 'none';
                alert('⏰ Время вышло! Никто не успел захватить вопрос.');
                
                // Помечаем вопрос как отвеченный (никто не получил очки)
                answeredQuestions.add(currentQuestion.question);
                currentQuestion = null;
                
                // Обновляем отображение
                updateQuestionsDisplay();
                
                // Переходим к следующему игроку для выбора вопроса
                nextTurn();
            }
        }
    }, 1000);
}

// Функция выбора вопроса
function selectQuestion(category, question) {
    if (answeredQuestions.has(question.question) || gameOver || waitingForAnswer) return;
    
    currentQuestion = { category, ...question };
    answeringPlayer = null;
    waitingForAnswer = true;
    
    // Показываем вопрос и сообщение об ожидании
    document.getElementById('currentQuestion').innerHTML = 
        `<strong>Раунд ${currentRound} - ${category} - ${question.value}:</strong> ${question.question}`;
    
    document.getElementById('waitingMessage').style.display = 'block';
    document.getElementById('currentAnswerer').style.display = 'none';
    
    // Отключаем ввод ответа
    document.getElementById('answerInput').disabled = true;
    document.getElementById('checkAnswerBtn').disabled = true;
    
    // Запускаем таймер
    startTimer();
    
    // Обновляем отображение вопросов (блокируем кнопки)
    updateQuestionsDisplay();
    
    // Фокус на окно для захвата клавиш
    window.focus();
}

// Функция захвата вопроса игроком
function captureQuestion(playerIndex) {
    if (!waitingForAnswer || answeringPlayer) return; // Если не ждем ответ или уже кто-то захватил
    
    clearInterval(timerInterval);
    document.getElementById('timer').style.display = 'none';
    
    answeringPlayer = players[playerIndex];
    waitingForAnswer = false;
    
    // Показываем, кто будет отвечать
    document.getElementById('waitingMessage').style.display = 'none';
    const answererDiv = document.getElementById('currentAnswerer');
    answererDiv.style.display = 'block';
    answererDiv.textContent = `🎤 Отвечает: ${answeringPlayer.name}`;
    
    // Активируем поле для ответа
    document.getElementById('answerInput').disabled = false;
    document.getElementById('checkAnswerBtn').disabled = false;
    document.getElementById('answerInput').focus();
    
    // Подсвечиваем отвечающего игрока
    updatePlayersDisplay();
}

// Функция проверки ответа
function checkAnswer() {
    if (!currentQuestion || gameOver || !answeringPlayer) return;

    const answerInput = document.getElementById('answerInput');
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (!userAnswer) {
        alert('Введите ответ!');
        return;
    }

    const correctAnswer = currentQuestion.answer.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        answeringPlayer.score += currentQuestion.value;
        alert(`✅ Правильно! +${currentQuestion.value} очков для ${answeringPlayer.name}`);
    } else {
        alert(`❌ Неправильно! Правильный ответ: ${currentQuestion.answer}`);
    }

    // Помечаем вопрос как отвеченный
    answeredQuestions.add(currentQuestion.question);
    
    // Очищаем поле ввода
    answerInput.value = '';
    answerInput.disabled = true;
    document.getElementById('checkAnswerBtn').disabled = true;
    document.getElementById('currentAnswerer').style.display = 'none';
    
    // Сбрасываем отвечающего
    answeringPlayer = null;
    
    // Обновляем отображение
    updatePlayersDisplay();
    updateQuestionsDisplay();
    
    // Проверяем, не закончился ли раунд
    checkRoundComplete();
    
    if (!gameOver) {
        currentQuestion = null;
        document.getElementById('currentQuestion').innerHTML = 'Выберите следующий вопрос';
    }
}

// Функция проверки завершения раунда
function checkRoundComplete() {
    const currentQuestions = currentRound === 1 ? questionsData.round1 : questionsData.round2;
    const totalQuestionsInRound = Object.values(currentQuestions)
        .reduce((sum, questions) => sum + questions.length, 0);
    
    // Считаем количество отвеченных вопросов в текущем раунде
    const allQuestionsInRound = Object.values(currentQuestions)
        .flatMap(q => q.map(item => item.question));
    const answeredInRound = Array.from(answeredQuestions)
        .filter(q => allQuestionsInRound.includes(q)).length;
    
    if (answeredInRound === totalQuestionsInRound) {
        if (currentRound === 1) {
            // Переходим ко второму раунду
            const proceed = confirm(`🎯 Раунд 1 завершен! Текущие очки:\n\n${getScoresText()}\n\nПерейти ко второму раунду?`);
            if (proceed) {
                currentRound = 2;
                // Сбрасываем отвеченные вопросы для нового раунда
                answeredQuestions.clear();
                // Обновляем отображение
                updateQuestionsDisplay();
                document.getElementById('currentQuestion').innerHTML = 'Выберите вопрос второго раунда';
            } else {
                // Если игроки не хотят продолжать, показываем итоги
                showFinalResults();
            }
        } else {
            // Игра полностью завершена
            showFinalResults();
        }
    }
}

// Функция получения текста с текущими очками
function getScoresText() {
    return players.map(p => `${p.name}: ${p.score} очков`).join('\n');
}

// Функция показа финальных результатов
function showFinalResults() {
    gameOver = true;
    
    // Сортируем игроков по очкам
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    let resultsMessage = '🎮 ИГРА ОКОНЧЕНА!\n\n';
    resultsMessage += 'Финальные результаты:\n';
    sortedPlayers.forEach((player, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        resultsMessage += `${medal} ${player.name}: ${player.score} очков\n`;
    });
    
    alert(resultsMessage);
    
    // Подсвечиваем победителя
    players.forEach(p => p.isActive = false);
    updatePlayersDisplay();
}

// Функция перехода к следующему игроку (для выбора вопроса)
function nextTurn() {
    const currentIndex = players.findIndex(p => p.isActive);
    players[currentIndex].isActive = false;
    
    const nextIndex = (currentIndex + 1) % players.length;
    players[nextIndex].isActive = true;
    
    updatePlayersDisplay();
    
    // Активируем кнопку следующего хода только если не ждем ответ
    document.getElementById('nextTurnBtn').disabled = waitingForAnswer;
}

// Функция сброса игры
function resetGame() {
    // Показываем экран настройки
    document.getElementById('setupScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    
    // Очищаем таймер
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Сбрасываем переменные
    currentRound = 1;
    answeredQuestions.clear();
    currentQuestion = null;
    gameOver = false;
    waitingForAnswer = false;
    answeringPlayer = null;
}

// Функция начала игры
function startGame() {
    // Получаем имена игроков
    const player1Name = document.getElementById('player1Name').value.trim();
    const player2Name = document.getElementById('player2Name').value.trim();
    const player3Name = document.getElementById('player3Name').value.trim();

    // Валидация: имя не должно быть пустым
    if (!player1Name || !player2Name || !player3Name) {
        alert('Все имена игроков должны быть заполнены!');
        return;
    }
    
    // Инициализируем игроков
    players = [
        { id: 1, name: player1Name, score: 0, isActive: true },
        { id: 2, name: player2Name, score: 0, isActive: false },
        { id: 3, name: player3Name, score: 0, isActive: false }
    ];
    
    // Сбрасываем состояние игры
    currentRound = 1;
    answeredQuestions.clear();
    currentQuestion = null;
    gameOver = false;
    waitingForAnswer = false;
    answeringPlayer = null;
    
    // Переключаем экраны
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Обновляем отображение
    updatePlayersDisplay();
    updateQuestionsDisplay();
    
    // Сбрасываем элементы управления
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').disabled = true;
    document.getElementById('checkAnswerBtn').disabled = true;
    document.getElementById('nextTurnBtn').disabled = false;
    document.getElementById('currentQuestion').innerHTML = 'Выберите вопрос, чтобы начать игру';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('waitingMessage').style.display = 'none';
    document.getElementById('currentAnswerer').style.display = 'none';
}

// Обработчик нажатия клавиш
document.addEventListener('keydown', (event) => {
    // Игнорируем, если игра не активна
    if (document.getElementById('gameScreen').style.display !== 'block') return;
    
    // Игнорируем, если ввод в поле ответа
    if (event.target.tagName === 'INPUT') return;
    
    const key = event.key.toLowerCase();
    
    // Определяем, какой игрок нажал клавишу
    let playerIndex = -1;
    if (key === 'a') playerIndex = 0;
    else if (key === 'l') playerIndex = 1;
    else if (key === ' ') playerIndex = 2;
    
    if (playerIndex !== -1) {
        event.preventDefault(); // Предотвращаем действия по умолчанию (например, скролл на пробел)
        captureQuestion(playerIndex);
    }
});

// Инициализация обработчиков событий
document.getElementById('startGameBtn').onclick = startGame;
document.getElementById('checkAnswerBtn').onclick = checkAnswer;
document.getElementById('nextTurnBtn').onclick = nextTurn;
document.getElementById('resetGameBtn').onclick = resetGame;

// Начальное состояние
document.getElementById('setupScreen').style.display = 'block';
document.getElementById('gameScreen').style.display = 'none';