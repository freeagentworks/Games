class BlackjackGame {
    constructor() {
        this.money = 1000;
        this.betAmount = 100;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.gameState = 'betting'; // betting, playing, dealer, finished
        this.dealerHiddenCard = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.moneyElement = document.getElementById('money');
        this.betAmountElement = document.getElementById('betAmount');
        this.playerCardsElement = document.getElementById('playerCards');
        this.dealerCardsElement = document.getElementById('dealerCards');
        this.playerScoreElement = document.getElementById('playerScore');
        this.dealerScoreElement = document.getElementById('dealerScore');
        this.resultDisplayElement = document.getElementById('resultDisplay');
        this.resultTextElement = document.getElementById('resultText');
        this.bettingSectionElement = document.getElementById('bettingSection');
        
        this.dealButton = document.getElementById('dealButton');
        this.hitButton = document.getElementById('hitButton');
        this.standButton = document.getElementById('standButton');
        this.resetButton = document.getElementById('resetButton');
        
        this.betButtons = document.querySelectorAll('.bet-btn');
    }
    
    setupEventListeners() {
        // 賭け金選択ボタン
        this.betButtons.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.dataset.amount);
                this.selectBetAmount(amount);
            });
        });
        
        // ゲームコントロールボタン
        this.dealButton.addEventListener('click', () => this.startGame());
        this.hitButton.addEventListener('click', () => this.hit());
        this.standButton.addEventListener('click', () => this.stand());
        this.resetButton.addEventListener('click', () => this.resetGame());
    }
    
    selectBetAmount(amount) {
        if (this.gameState !== 'betting' || amount > this.money) return;
        
        this.betAmount = amount;
        
        // ボタンのアクティブ状態を更新
        this.betButtons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.dataset.amount) === amount) {
                button.classList.add('active');
            }
        });
        
        this.updateDisplay();
    }
    
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.getCardValue(rank),
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
                });
            }
        }
        
        // デッキをシャッフル
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    getCardValue(rank) {
        if (rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        return parseInt(rank);
    }
    
    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
            }
            value += card.value;
        }
        
        // エースの値を調整（11から1に変更）
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    dealCard(hand, hidden = false) {
        if (this.deck.length === 0) {
            this.createDeck();
        }
        
        const card = this.deck.pop();
        hand.push(card);
        
        return { card, hidden };
    }
    
    createCardElement(cardData) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${cardData.card.color} dealing`;
        
        if (cardData.hidden) {
            cardElement.classList.add('hidden');
        } else {
            cardElement.innerHTML = `
                <div class="rank">${cardData.card.rank}</div>
                <div class="suit">${cardData.card.suit}</div>
            `;
        }
        
        return cardElement;
    }
    
    updateCardDisplay() {
        // プレイヤーのカード表示
        this.playerCardsElement.innerHTML = '';
        this.playerHand.forEach(card => {
            const cardElement = this.createCardElement({ card, hidden: false });
            this.playerCardsElement.appendChild(cardElement);
        });
        
        // ディーラーのカード表示
        this.dealerCardsElement.innerHTML = '';
        this.dealerHand.forEach((card, index) => {
            const isHidden = this.gameState === 'playing' && index === 1;
            const cardElement = this.createCardElement({ card, hidden: isHidden });
            this.dealerCardsElement.appendChild(cardElement);
        });
        
        // スコア表示
        const playerScore = this.calculateHandValue(this.playerHand);
        this.playerScoreElement.textContent = `(${playerScore})`;
        
        if (this.gameState === 'playing') {
            // ディーラーの最初のカードのみ表示
            const visibleCards = [this.dealerHand[0]];
            const dealerScore = this.calculateHandValue(visibleCards);
            this.dealerScoreElement.textContent = `(${dealerScore})`;
        } else if (this.gameState === 'dealer' || this.gameState === 'finished') {
            const dealerScore = this.calculateHandValue(this.dealerHand);
            this.dealerScoreElement.textContent = `(${dealerScore})`;
        } else {
            this.dealerScoreElement.textContent = '';
        }
    }
    
    startGame() {
        if (this.betAmount > this.money) return;
        
        // 賭け金を差し引く
        this.money -= this.betAmount;
        
        // ゲーム状態を設定
        this.gameState = 'playing';
        
        // デッキを作成
        this.createDeck();
        
        // 手札をクリア
        this.playerHand = [];
        this.dealerHand = [];
        
        // 初期カードを配る
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
        
        this.updateCardDisplay();
        this.updateDisplay();
        this.updateButtons();
        
        // ブラックジャックチェック
        setTimeout(() => {
            this.checkBlackjack();
        }, 1000);
    }
    
    checkBlackjack() {
        const playerScore = this.calculateHandValue(this.playerHand);
        const dealerScore = this.calculateHandValue(this.dealerHand);
        
        if (playerScore === 21) {
            if (dealerScore === 21) {
                this.endGame('push', 'プッシュ（引き分け）');
            } else {
                this.endGame('blackjack', 'ブラックジャック！');
            }
        } else if (dealerScore === 21) {
            this.endGame('lose', 'ディーラーのブラックジャック');
        }
    }
    
    hit() {
        if (this.gameState !== 'playing') return;
        
        this.dealCard(this.playerHand);
        this.updateCardDisplay();
        
        const playerScore = this.calculateHandValue(this.playerHand);
        
        if (playerScore > 21) {
            this.endGame('bust', 'バスト！あなたの負け');
        } else if (playerScore === 21) {
            this.stand();
        }
    }
    
    stand() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'dealer';
        this.updateCardDisplay();
        this.updateButtons();
        
        // ディーラーのターン
        setTimeout(() => {
            this.dealerTurn();
        }, 1000);
    }
    
    async dealerTurn() {
        while (this.calculateHandValue(this.dealerHand) < 17) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.dealCard(this.dealerHand);
            this.updateCardDisplay();
        }
        
        setTimeout(() => {
            this.determineWinner();
        }, 1000);
    }
    
    determineWinner() {
        const playerScore = this.calculateHandValue(this.playerHand);
        const dealerScore = this.calculateHandValue(this.dealerHand);
        
        if (dealerScore > 21) {
            this.endGame('win', 'ディーラーがバスト！あなたの勝ち');
        } else if (playerScore > dealerScore) {
            this.endGame('win', 'あなたの勝ち！');
        } else if (playerScore < dealerScore) {
            this.endGame('lose', 'ディーラーの勝ち');
        } else {
            this.endGame('push', 'プッシュ（引き分け）');
        }
    }
    
    endGame(result, message) {
        this.gameState = 'finished';
        
        // 結果に応じて所持金を更新
        if (result === 'win') {
            this.money += this.betAmount * 2;
        } else if (result === 'blackjack') {
            this.money += Math.floor(this.betAmount * 2.5);
        } else if (result === 'push') {
            this.money += this.betAmount;
        }
        
        // 結果表示
        this.showResult(result, message);
        
        this.updateCardDisplay();
        this.updateDisplay();
        this.updateButtons();
        
        // ゲーム終了チェック
        setTimeout(() => {
            this.checkGameEnd();
        }, 3000);
    }
    
    showResult(result, message) {
        this.resultTextElement.textContent = message;
        this.resultTextElement.className = `result-text ${result === 'win' || result === 'blackjack' ? 'win' : result === 'lose' || result === 'bust' ? 'lose' : 'push'}`;
        this.resultDisplayElement.style.display = 'flex';
        
        // 勝利時のエフェクト
        if (result === 'win' || result === 'blackjack') {
            this.resultDisplayElement.style.animation = 'none';
            setTimeout(() => {
                this.resultDisplayElement.style.animation = 'pulse 0.5s ease-in-out 3';
            }, 10);
        }
    }
    
    checkGameEnd() {
        if (this.money <= 0) {
            alert('ゲームオーバー！所持金がなくなりました。');
            this.resetGame();
        } else {
            this.gameState = 'betting';
            
            // 賭け金が所持金を超える場合は調整
            if (this.betAmount > this.money) {
                const availableBets = [50, 100, 200, 500].filter(bet => bet <= this.money);
                if (availableBets.length > 0) {
                    this.selectBetAmount(availableBets[0]);
                }
            }
            
            this.updateButtons();
        }
    }
    
    resetGame() {
        this.money = 1000;
        this.betAmount = 100;
        this.gameState = 'betting';
        this.playerHand = [];
        this.dealerHand = [];
        
        // 表示をクリア
        this.playerCardsElement.innerHTML = '';
        this.dealerCardsElement.innerHTML = '';
        this.playerScoreElement.textContent = '';
        this.dealerScoreElement.textContent = '';
        this.resultDisplayElement.style.display = 'none';
        
        // ボタンの状態をリセット
        this.betButtons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.dataset.amount) === 100) {
                button.classList.add('active');
            }
        });
        
        this.updateDisplay();
        this.updateButtons();
    }
    
    updateDisplay() {
        this.moneyElement.textContent = this.money;
        this.betAmountElement.textContent = this.betAmount;
        
        // 賭け金ボタンの有効/無効を更新
        this.betButtons.forEach(button => {
            const amount = parseInt(button.dataset.amount);
            button.disabled = amount > this.money || this.gameState !== 'betting';
            
            if (button.disabled) {
                button.style.opacity = '0.5';
            } else {
                button.style.opacity = '1';
            }
        });
        
        // 賭け金セクションの表示/非表示
        if (this.gameState === 'betting') {
            this.bettingSectionElement.style.display = 'block';
        } else {
            this.bettingSectionElement.style.display = 'none';
        }
    }
    
    updateButtons() {
        // ボタンの有効/無効を更新
        this.dealButton.disabled = this.gameState !== 'betting' || this.betAmount > this.money || this.money <= 0;
        this.hitButton.disabled = this.gameState !== 'playing';
        this.standButton.disabled = this.gameState !== 'playing';
        
        // ボタンのテキストを更新
        if (this.gameState === 'betting') {
            this.dealButton.textContent = 'ゲーム開始';
        } else if (this.gameState === 'finished') {
            this.dealButton.textContent = '次のゲーム';
        }
    }
}

// CSS アニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});
