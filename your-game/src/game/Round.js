import { Question } from './Question.js';
import { QuestionsData } from './data/questions.js';
import { Helpers } from '../utils/helpers.js';

/**
 * Класс раунда
 */
export class Round {
    constructor(number, players, specialCount = 2) {
        this.number = number;
        this.players = players;
        this.questions = [];
        this.currentQuestion = null;
        this.completed = false;
        
        // Стоимости вопросов в зависимости от раунда
        this.values = number === 1 
            ? [100, 200, 300, 400, 500] 
            : [200, 400, 600, 800, 1000];
        
        // Количество специальных вопросов
        this.specialCount = specialCount;
        
        this.initializeQuestions();
    }

    /**
     * Инициализация вопросов
     */
    initializeQuestions() {
        const themes = this.number === 1 
            ? QuestionsData.round1Themes 
            : QuestionsData.round2Themes;
        
        // Создаем обычные вопросы
        themes.forEach(theme => {
            theme.questions.forEach(q => {
                this.questions.push(new Question('regular', {
                    theme: theme.name,
                    text: q.text,
                    answer: q.answer,
                    value: q.value
                }));
            });
        });
        
        // Добавляем специальные вопросы
        this.addSpecialQuestions();
        
        // Перемешиваем, чтобы специальные вопросы были в случайных местах
        this.questions = Helpers.shuffleArray(this.questions);
    }

    /**
     * Добавить специальные вопросы
     */
    addSpecialQuestions() {
        // Вопросы кота
        for (let i = 0; i < this.specialCount; i++) {
            const catTheme = Helpers.randomElement(QuestionsData.catThemes);
            const catQuestion = Helpers.randomElement(catTheme.questions);
            this.questions.push(new Question('cat', {
                theme: catTheme.name,
                text: catQuestion.text,
                answer: catQuestion.answer,
                value: Helpers.randomElement(this.values),
                specialData: { type: 'cat' }
            }));
        }
        
        // Вопросы аукциона
        for (let i = 0; i < this.specialCount; i++) {
            const regularTheme = Helpers.randomElement(
                this.number === 1 ? QuestionsData.round1Themes : QuestionsData.round2Themes
            );
            const question = Helpers.randomElement(regularTheme.questions);
            this.questions.push(new Question('auction', {
                theme: regularTheme.name,
                text: question.text,
                answer: question.answer,
                value: question.value,
                specialData: { type: 'auction' }
            }));
        }
    }

    /**
     * Получить вопрос по позиции
     */
    getQuestion(themeIndex, valueIndex) {
        const index = themeIndex * 5 + valueIndex;
        return this.questions[index];
    }

    /**
     * Отметить вопрос как сыгранный
     */
    markQuestionAsPlayed(question) {
        question.markAsPlayed();
    }

    /**
     * Проверить, все ли вопросы сыграны
     */
    isComplete() {
        return this.questions.every(q => q.played);
    }

    /**
     * Получить статистику раунда
     */
    getStatistics() {
        const regularQuestions = this.questions.filter(q => q.type === 'regular');
        const specialQuestions = this.questions.filter(q => q.type !== 'regular');
        
        return {
            totalQuestions: this.questions.length,
            playedQuestions: this.questions.filter(q => q.played).length,
            regularPlayed: regularQuestions.filter(q => q.played).length,
            specialPlayed: specialQuestions.filter(q => q.played).length,
            remainingQuestions: this.questions.filter(q => !q.played).length
        };
    }

    /**
     * Сериализация для сохранения
     */
    toJSON() {
        return {
            number: this.number,
            questions: this.questions.map(q => q.toJSON()),
            values: this.values,
            completed: this.completed
        };
    }

    /**
     * Создать из сохраненных данных
     */
    static fromJSON(data, players) {
        const round = new Round(data.number, players);
        round.questions = data.questions.map(qData => Question.fromJSON(qData));
        round.completed = data.completed;
        return round;
    }
}