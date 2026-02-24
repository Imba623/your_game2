/**
 * Класс вопроса
 */
export class Question {
    constructor(type, data) {
        this.type = type; // 'regular', 'cat', 'auction'
        this.theme = data.theme;
        this.text = data.text;
        this.answer = data.answer;
        this.value = data.value || 0;
        this.played = false;
        this.specialData = data.specialData || null;
        
        // Для аукциона
        this.bids = [];
        this.currentBidder = null;
        this.currentBid = 0;
        
        // Для кота
        this.transferredTo = null;
        this.betValue = 0;
    }

    /**
     * Пометить как сыгранный
     */
    markAsPlayed() {
        this.played = true;
    }

    /**
     * Добавить ставку (для аукциона)
     */
    addBid(playerId, amount) {
        this.bids.push({ playerId, amount });
        this.currentBidder = playerId;
        this.currentBid = amount;
    }

    /**
     * Получить победителя аукциона
     */
    getAuctionWinner() {
        if (this.bids.length === 0) return null;
        return this.bids.reduce((max, bid) => 
            bid.amount > max.amount ? bid : max
        );
    }

    /**
     * Установить получателя кота
     */
    setCatRecipient(playerId) {
        this.transferredTo = playerId;
    }

    /**
     * Установить ставку для кота
     */
    setCatBet(betValue) {
        this.betValue = betValue;
    }

    /**
     * Сериализация для сохранения
     */
    toJSON() {
        return {
            type: this.type,
            theme: this.theme,
            text: this.text,
            answer: this.answer,
            value: this.value,
            played: this.played,
            specialData: this.specialData,
            bids: this.bids,
            currentBidder: this.currentBidder,
            currentBid: this.currentBid,
            transferredTo: this.transferredTo,
            betValue: this.betValue
        };
    }

    /**
     * Создать из сохраненных данных
     */
    static fromJSON(data) {
        const question = new Question(data.type, data);
        question.played = data.played;
        question.bids = data.bids || [];
        question.currentBidder = data.currentBidder;
        question.currentBid = data.currentBid || 0;
        question.transferredTo = data.transferredTo;
        question.betValue = data.betValue || 0;
        return question;
    }
}