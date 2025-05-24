class ChouhanGame {
    constructor() {
        this.money = 1000;
        this.betAmount = 100;
        this.selectedChoice = null;
        this.isRolling = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.moneyElement = document.getElementById('money');
        this.betAmountElement = document.getElementById('betAmount');
        this.dice1Element = document.getElementById('dice1');
        this.dice2Element = document.getElementById('dice2');
        this.sumDisplayElement = document.getElementById('sumDisplay');
        this.resultTextElement = document.getElementById('resultText');
        this.resultDisplayElement = document.getElementById('resultDisplay');
        this.rollButton = document.getElementById('rollButton');
        this.resetButton = document.getElementById('resetButton');
        this.choBtn = document.getElementById('choBtn');
        this.hanBtn = document.getElementById('hanBtn');
        
        this.betButtons = document.querySelectorAll('.bet-btn');
        this.choiceButtons = document.querySelectorAll('.choice-btn');
    }
    
    setupEventListeners() {
        // 賭け金選択ボタン
        this.betButtons.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.dataset.amount);
                this.selectBetAmount(amount);
            });
        });
        
        // 丁半選択ボタン
        this.choiceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const choice = button.dataset.choice;
                this.selectChoice(choice);
            });
        });
        
        // サイコロを振るボタン
        this.rollButton.addEventListener('click', () => {
            this.rollDice();
        });
        
        // リセットボタン
        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    selectBetAmount(amount) {
        if (this.isRolling || amount > this.money) return;
        
        this.betAmount = amount;
        
        // ボタンのアクティブ状態を更新
        this.betButtons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.dataset.amount) === amount) {
                button.classList.add('active');
            }
        });
        
        this.updateDisplay();
        this.updateRollButton();
    }
    
    selectChoice(choice) {
        if (this.isRolling) return;
        
        this.selectedChoice = choice;
        
        // ボタンのアクティブ状態を更新
        this.choiceButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.choice === choice) {
                button.classList.add('active');
            }
        });
        
        this.updateRollButton();
    }
    
    updateRollButton() {
        const canRoll = this.selectedChoice !== null && 
                       this.betAmount <= this.money && 
                       this.money > 0 && 
                       !this.isRolling;
        
        this.rollButton.disabled = !canRoll;
    }
    
    async rollDice() {
        if (this.isRolling || !this.selectedChoice || this.betAmount > this.money) return;
        
        this.isRolling = true;
        this.rollButton.disabled = true;
        
        // 賭け金を差し引く
        this.money -= this.betAmount;
        this.updateDisplay();
        
        // サイコロのアニメーション開始
        this.dice1Element.classList.add('rolling');
        this.dice2Element.classList.add('rolling');
        
        // 結果表示をクリア
        this.resultDisplayElement.style.display = 'none';
        
        // アニメーション中にランダムな数字を表示
        const animationDuration = 1000;
        const intervalTime = 100;
        let animationTimer = 0;
        
        const animationInterval = setInterval(() => {
            const randomNum1 = Math.floor(Math.random() * 6) + 1;
            const randomNum2 = Math.floor(Math.random() * 6) + 1;
            
            this.dice1Element.querySelector('.dice-face').textContent = randomNum1;
            this.dice2Element.querySelector('.dice-face').textContent = randomNum2;
            
            animationTimer += intervalTime;
            
            if (animationTimer >= animationDuration) {
                clearInterval(animationInterval);
                this.finalizeDiceRoll();
            }
        }, intervalTime);
    }
    
    finalizeDiceRoll() {
        // 最終的なサイコロの値を決定
        const dice1Value = Math.floor(Math.random() * 6) + 1;
        const dice2Value = Math.floor(Math.random() * 6) + 1;
        const sum = dice1Value + dice2Value;
        
        // サイコロの表示を更新
        this.dice1Element.querySelector('.dice-face').textContent = dice1Value;
        this.dice2Element.querySelector('.dice-face').textContent = dice2Value;
        
        // アニメーションクラスを削除
        this.dice1Element.classList.remove('rolling');
        this.dice2Element.classList.remove('rolling');
        
        // 結果を判定
        const isEven = sum % 2 === 0;
        const playerWon = (this.selectedChoice === 'cho' && isEven) || 
                         (this.selectedChoice === 'han' && !isEven);
        
        // 結果を表示
        this.showResult(sum, isEven, playerWon);
        
        // 勝利時の処理
        if (playerWon) {
            this.money += this.betAmount * 2; // 賭け金の2倍を獲得
        }
        
        // 表示を更新
        this.updateDisplay();
        
        // ゲーム終了チェック
        setTimeout(() => {
            this.checkGameEnd();
        }, 2000);
    }
    
    showResult(sum, isEven, playerWon) {
        this.sumDisplayElement.textContent = `合計: ${sum}`;
        
        const resultType = isEven ? '丁（偶数）' : '半（奇数）';
        const resultMessage = playerWon ? 
            `${resultType} - あなたの勝ち！` : 
            `${resultType} - あなたの負け`;
        
        this.resultTextElement.textContent = resultMessage;
        this.resultTextElement.className = `result-text ${playerWon ? 'win' : 'lose'}`;
        
        this.resultDisplayElement.style.display = 'flex';
        
        // 勝利時のエフェクト
        if (playerWon) {
            this.resultDisplayElement.style.animation = 'none';
            setTimeout(() => {
                this.resultDisplayElement.style.animation = 'pulse 0.5s ease-in-out 3';
            }, 10);
        }
    }
    
    checkGameEnd() {
        this.isRolling = false;
        
        if (this.money <= 0) {
            alert('ゲームオーバー！所持金がなくなりました。');
            this.resetGame();
        } else {
            // 選択をリセット
            this.selectedChoice = null;
            this.choiceButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // 賭け金が所持金を超える場合は調整
            if (this.betAmount > this.money) {
                const availableBets = [50, 100, 200, 500].filter(bet => bet <= this.money);
                if (availableBets.length > 0) {
                    this.selectBetAmount(availableBets[0]);
                }
            }
            
            this.updateRollButton();
        }
    }
    
    resetGame() {
        this.money = 1000;
        this.betAmount = 100;
        this.selectedChoice = null;
        this.isRolling = false;
        
        // サイコロをリセット
        this.dice1Element.querySelector('.dice-face').textContent = '?';
        this.dice2Element.querySelector('.dice-face').textContent = '?';
        this.dice1Element.classList.remove('rolling');
        this.dice2Element.classList.remove('rolling');
        
        // 結果表示をクリア
        this.resultDisplayElement.style.display = 'none';
        this.sumDisplayElement.textContent = '';
        this.resultTextElement.textContent = '';
        
        // ボタンの状態をリセット
        this.betButtons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.dataset.amount) === 100) {
                button.classList.add('active');
            }
        });
        
        this.choiceButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        this.updateDisplay();
        this.updateRollButton();
    }
    
    updateDisplay() {
        this.moneyElement.textContent = this.money;
        this.betAmountElement.textContent = this.betAmount;
        
        // 賭け金ボタンの有効/無効を更新
        this.betButtons.forEach(button => {
            const amount = parseInt(button.dataset.amount);
            button.disabled = amount > this.money || this.isRolling;
            
            if (button.disabled) {
                button.style.opacity = '0.5';
            } else {
                button.style.opacity = '1';
            }
        });
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
    new ChouhanGame();
});
