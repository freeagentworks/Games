document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let pairsFound = 0;
    let totalPairs = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;

    // Card symbols and suits
    const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardSuits = [
        { name: 'hearts', symbol: '♥' },
        { name: 'diamonds', symbol: '♦' },
        { name: 'clubs', symbol: '♣' },
        { name: 'spades', symbol: '♠' }
    ];

    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const pairsFoundElement = document.getElementById('pairs-found');
    const timerElement = document.getElementById('timer');
    const restartButton = document.getElementById('restart-btn');
    const gameMessage = document.getElementById('game-message');

    // Initialize the game
    initGame();

    // Event listeners
    restartButton.addEventListener('click', restartGame);

    // Functions
    function initGame() {
        createDeck();
        shuffleDeck();
        renderCards();
        totalPairs = cards.length / 2;
    }

    function createDeck() {
        cards = [];
        // Create a deck with pairs of cards (we'll use a subset for the game)
        for (const suit of cardSuits) {
            for (const value of cardValues) {
                cards.push({
                    value: value,
                    suit: suit.name,
                    symbol: suit.symbol,
                    display: `${value}${suit.symbol}`
                });
            }
        }
        
        // Shuffle and take only a subset of cards for the game (12 pairs = 24 cards)
        cards = cards.sort(() => 0.5 - Math.random()).slice(0, 12);
        
        // Duplicate the cards to create pairs
        cards = [...cards, ...cards.map(card => ({...card}))];
    }

    function shuffleDeck() {
        cards = cards.sort(() => 0.5 - Math.random());
    }

    function renderCards() {
        gameBoard.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back ${card.suit}">${card.display}</div>
                </div>
            `;
            
            cardElement.addEventListener('click', flipCard);
            cardElement.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Prevent scrolling when touching cards
                flipCard.call(this);
            }, { passive: false });
            gameBoard.appendChild(cardElement);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        // Start the timer on first card flip
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        this.classList.add('flipped');
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        const firstCardIndex = parseInt(firstCard.dataset.index);
        const secondCardIndex = parseInt(secondCard.dataset.index);
        
        // Check if the cards match (same value and suit)
        const isMatch = cards[firstCardIndex].value === cards[secondCardIndex].value && 
                        cards[firstCardIndex].suit === cards[secondCardIndex].suit;
        
        if (isMatch) {
            disableCards();
            pairsFound++;
            pairsFoundElement.textContent = pairsFound;
            
            if (pairsFound === totalPairs) {
                endGame();
            }
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // Remove touch event listeners as well
        const removeTouch = (card) => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            newCard.classList.add('matched');
            newCard.classList.add('flipped');
        };
        
        removeTouch(firstCard);
        removeTouch(secondCard);
        
        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = timer;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function endGame() {
        stopTimer();
        gameMessage.textContent = `おめでとう！${timer}秒でクリアしました！`;
    }

    function restartGame() {
        // Reset game state
        stopTimer();
        timer = 0;
        timerElement.textContent = timer;
        pairsFound = 0;
        pairsFoundElement.textContent = pairsFound;
        gameStarted = false;
        gameMessage.textContent = '';
        
        // Reset board
        resetBoard();
        
        // Reinitialize game
        initGame();
    }
});
