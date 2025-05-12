// ポーカーゲームの実装
document.addEventListener('DOMContentLoaded', () => {
    // カードのスートとランクの定義
    const SUITS = ['S', 'H', 'D', 'C'];
    const SUIT_SYMBOLS = {
        'S': '♠',
        'H': '♥',
        'D': '♦',
        'C': '♣'
    };
    const SUIT_COLORS = {
        'S': 'black',
        'H': 'red',
        'D': 'red',
        'C': 'black'
    };
    const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const RANK_NAMES = {
        'T': '10',
        'J': 'J',
        'Q': 'Q',
        'K': 'K',
        'A': 'A'
    };
    const RANK_VALUES = {};
    RANKS.forEach((rank, index) => {
        RANK_VALUES[rank] = index;
    });

    // ゲーム状態
    let deck = [];
    let playerHand = [];
    let cpuHand = [];
    let gamePhase = 'initial'; // 'initial', 'selection', 'result'
    let selectedCards = new Set();

    // DOM要素
    const dealButton = document.getElementById('deal-btn');
    const drawButton = document.getElementById('draw-btn');
    const newGameButton = document.getElementById('new-game-btn');
    const playerHandElement = document.getElementById('player-hand');
    const cpuHandElement = document.getElementById('cpu-hand');
    const playerRankElement = document.getElementById('player-rank');
    const cpuRankElement = document.getElementById('cpu-rank');
    const gameMessageElement = document.getElementById('game-message');

    // イベントリスナー
    dealButton.addEventListener('click', startGame);
    drawButton.addEventListener('click', drawCards);
    newGameButton.addEventListener('click', resetGame);

    // カードクラス
    class Card {
        constructor(suit, rank) {
            this.suit = suit;
            this.rank = rank;
            this.value = RANK_VALUES[rank];
        }

        toString() {
            return this.rank + this.suit;
        }

        getDisplayRank() {
            return RANK_NAMES[this.rank] || this.rank;
        }

        getColor() {
            return SUIT_COLORS[this.suit];
        }

        getSymbol() {
            return SUIT_SYMBOLS[this.suit];
        }
    }

    // デッキの作成
    function createDeck() {
        const newDeck = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                newDeck.push(new Card(suit, rank));
            }
        }
        return newDeck;
    }

    // デッキのシャッフル
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // カードを引く
    function drawFromDeck(count) {
        if (deck.length < count) {
            throw new Error("デッキにカードが足りません！");
        }
        const cards = deck.splice(0, count);
        return cards;
    }

    // カードの表示
    function renderCard(card, faceDown = false) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (faceDown) {
            cardElement.classList.add('back');
            return cardElement;
        }

        const cardTopElement = document.createElement('div');
        cardTopElement.className = 'card-top';
        
        const cardBottomElement = document.createElement('div');
        cardBottomElement.className = 'card-bottom';

        const rankTopElement = document.createElement('span');
        rankTopElement.textContent = card.getDisplayRank();
        rankTopElement.className = card.getColor();

        const suitTopElement = document.createElement('span');
        suitTopElement.textContent = card.getSymbol();
        suitTopElement.className = `suit ${card.getColor()}`;

        const rankBottomElement = document.createElement('span');
        rankBottomElement.textContent = card.getDisplayRank();
        rankBottomElement.className = card.getColor();

        const suitBottomElement = document.createElement('span');
        suitBottomElement.textContent = card.getSymbol();
        suitBottomElement.className = `suit ${card.getColor()}`;

        cardTopElement.appendChild(rankTopElement);
        cardTopElement.appendChild(suitTopElement);
        
        cardBottomElement.appendChild(rankBottomElement);
        cardBottomElement.appendChild(suitBottomElement);

        cardElement.appendChild(cardTopElement);
        cardElement.appendChild(cardBottomElement);

        return cardElement;
    }

    // 手札の表示
    function renderHand(hand, element, faceDown = false) {
        element.innerHTML = '';
        hand.forEach((card, index) => {
            const cardElement = renderCard(card, faceDown);
            cardElement.dataset.index = index;
            element.appendChild(cardElement);
        });
    }

    // ゲーム開始
    function startGame() {
        // デッキの作成とシャッフル
        deck = createDeck();
        shuffleDeck(deck);
        
        // 手札の配布
        playerHand = drawFromDeck(5);
        cpuHand = drawFromDeck(5);
        
        // 手札の表示
        renderHand(playerHand, playerHandElement);
        renderHand(cpuHand, cpuHandElement, true);
        
        // 役の評価
        updateHandRanks();
        
        // ゲーム状態の更新
        gamePhase = 'selection';
        
        // ボタンの更新
        dealButton.disabled = true;
        drawButton.disabled = false;
        newGameButton.disabled = true;
        
        // カード選択のイベントリスナーを追加
        addCardSelectionListeners();
        
        gameMessageElement.textContent = 'カードを選択して交換してください（0〜5枚）';
    }

    // カード選択のイベントリスナーを追加
    function addCardSelectionListeners() {
        const cards = playerHandElement.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', toggleCardSelection);
        });
    }

    // カード選択の切り替え
    function toggleCardSelection(event) {
        const cardElement = event.currentTarget;
        const index = parseInt(cardElement.dataset.index);
        
        if (selectedCards.has(index)) {
            selectedCards.delete(index);
            cardElement.classList.remove('selected');
        } else {
            selectedCards.add(index);
            cardElement.classList.add('selected');
        }
    }

    // カードの交換
    function drawCards() {
        // 選択されたカードのインデックスを取得
        const indices = Array.from(selectedCards).sort((a, b) => b - a);
        
        // 選択されたカードを捨てて新しいカードを引く
        for (const index of indices) {
            playerHand.splice(index, 1);
        }
        
        // 新しいカードを引く
        const newCards = drawFromDeck(indices.length);
        playerHand.push(...newCards);
        
        // CPUの手札交換（簡易AI）
        const cpuHandRank = getHandRank(cpuHand);
        let cpuDiscardIndices = [];
        
        if (cpuHandRank.rank < 1) { // ワンペア未満
            // 最も高いカードを2枚残し、残りを交換
            const sortedIndices = [...cpuHand.keys()].sort((a, b) => cpuHand[b].value - cpuHand[a].value);
            const keepIndices = sortedIndices.slice(0, 2);
            cpuDiscardIndices = [...cpuHand.keys()].filter(i => !keepIndices.includes(i)).sort((a, b) => b - a);
        } else if (cpuHandRank.rank === 1) { // ワンペア
            // ペアを保持し、残りを交換
            const pairRank = cpuHandRank.values[0];
            cpuDiscardIndices = [...cpuHand.keys()]
                .filter(i => RANK_VALUES[cpuHand[i].rank] !== pairRank)
                .sort((a, b) => b - a);
        } else if (cpuHandRank.rank === 2) { // ツーペア
            // ツーペアを保持し、残りを交換
            const pairRanks = [cpuHandRank.values[0], cpuHandRank.values[1]];
            cpuDiscardIndices = [...cpuHand.keys()]
                .filter(i => !pairRanks.includes(RANK_VALUES[cpuHand[i].rank]))
                .sort((a, b) => b - a);
        } else if (cpuHandRank.rank === 3) { // スリーカード
            // スリーカードを保持し、残りを交換
            const threeRank = cpuHandRank.values[0];
            cpuDiscardIndices = [...cpuHand.keys()]
                .filter(i => RANK_VALUES[cpuHand[i].rank] !== threeRank)
                .sort((a, b) => b - a);
        }
        
        // CPUのカードを交換
        for (const index of cpuDiscardIndices) {
            cpuHand.splice(index, 1);
        }
        
        // 新しいカードを引く
        const newCpuCards = drawFromDeck(cpuDiscardIndices.length);
        cpuHand.push(...newCpuCards);
        
        // 手札の表示を更新
        renderHand(playerHand, playerHandElement);
        renderHand(cpuHand, cpuHandElement);
        
        // 役の評価を更新
        updateHandRanks();
        
        // ゲーム状態の更新
        gamePhase = 'result';
        
        // ボタンの更新
        drawButton.disabled = true;
        newGameButton.disabled = false;
        
        // 勝敗判定
        determineWinner();
    }

    // 役の評価
    function getHandRank(hand) {
        // 手札をランク順にソート（降順）
        const sortedHand = [...hand].sort((a, b) => b.value - a.value);
        const ranks = sortedHand.map(card => card.rank);
        const values = sortedHand.map(card => card.value);
        const suits = sortedHand.map(card => card.suit);
        
        // フラッシュのチェック（同じスート）
        const isFlush = new Set(suits).size === 1;
        
        // ストレートのチェック
        let isStraight = true;
        for (let i = 1; i < 5; i++) {
            if (values[i] !== values[i-1] - 1) {
                isStraight = false;
                break;
            }
        }
        
        // A-5のストレート（A,5,4,3,2）のチェック
        if (!isStraight && 
            new Set(values).size === 5 && 
            values.includes(12) && // A
            values.includes(3) &&  // 5
            values.includes(2) &&  // 4
            values.includes(1) &&  // 3
            values.includes(0)) {  // 2
            isStraight = true;
            // A-5ストレートの場合、Aを最低値として扱う
            sortedHand.push(sortedHand.shift());
            values.push(values.shift() - 13);
        }
        
        // 同じランクのカードをカウント
        const rankCounts = {};
        for (const value of values) {
            rankCounts[value] = (rankCounts[value] || 0) + 1;
        }
        
        // 頻度とランクでソート
        const sortedRanks = Object.entries(rankCounts)
            .sort(([rankA, countA], [rankB, countB]) => {
                if (countA !== countB) return countB - countA;
                return rankB - rankA;
            })
            .map(([rank, count]) => ({ rank: parseInt(rank), count }));
        
        // 役の判定
        // ロイヤルフラッシュ
        if (isFlush && isStraight && values[0] === 12) {
            return { rank: 9, name: 'ロイヤルフラッシュ', values };
        }
        
        // ストレートフラッシュ
        if (isFlush && isStraight) {
            return { rank: 8, name: 'ストレートフラッシュ', values };
        }
        
        // フォーカード
        if (sortedRanks[0].count === 4) {
            return { 
                rank: 7, 
                name: 'フォーカード', 
                values: [sortedRanks[0].rank, ...values.filter(v => v !== sortedRanks[0].rank)]
            };
        }
        
        // フルハウス
        if (sortedRanks[0].count === 3 && sortedRanks[1].count === 2) {
            return { 
                rank: 6, 
                name: 'フルハウス', 
                values: [sortedRanks[0].rank, sortedRanks[1].rank]
            };
        }
        
        // フラッシュ
        if (isFlush) {
            return { rank: 5, name: 'フラッシュ', values };
        }
        
        // ストレート
        if (isStraight) {
            return { rank: 4, name: 'ストレート', values };
        }
        
        // スリーカード
        if (sortedRanks[0].count === 3) {
            return { 
                rank: 3, 
                name: 'スリーカード', 
                values: [sortedRanks[0].rank, ...values.filter(v => v !== sortedRanks[0].rank)]
            };
        }
        
        // ツーペア
        if (sortedRanks[0].count === 2 && sortedRanks[1].count === 2) {
            return { 
                rank: 2, 
                name: 'ツーペア', 
                values: [
                    sortedRanks[0].rank, 
                    sortedRanks[1].rank, 
                    ...values.filter(v => v !== sortedRanks[0].rank && v !== sortedRanks[1].rank)
                ]
            };
        }
        
        // ワンペア
        if (sortedRanks[0].count === 2) {
            return { 
                rank: 1, 
                name: 'ワンペア', 
                values: [sortedRanks[0].rank, ...values.filter(v => v !== sortedRanks[0].rank)]
            };
        }
        
        // ハイカード
        return { rank: 0, name: 'ハイカード', values };
    }

    // 役の表示を更新
    function updateHandRanks() {
        const playerRank = getHandRank(playerHand);
        const cpuRank = getHandRank(cpuHand);
        
        playerRankElement.textContent = playerRank.name;
        
        if (gamePhase === 'result') {
            cpuRankElement.textContent = cpuRank.name;
        } else {
            cpuRankElement.textContent = '';
        }
    }

    // 勝敗判定
    function determineWinner() {
        const playerRank = getHandRank(playerHand);
        const cpuRank = getHandRank(cpuHand);
        
        let result;
        
        // 役の強さを比較
        if (playerRank.rank > cpuRank.rank) {
            result = 'あなたの勝ちです！';
        } else if (playerRank.rank < cpuRank.rank) {
            result = 'CPUの勝ちです！';
        } else {
            // 同じ役の場合、カードの強さを比較
            for (let i = 0; i < playerRank.values.length; i++) {
                if (playerRank.values[i] > cpuRank.values[i]) {
                    result = 'あなたの勝ちです！';
                    break;
                } else if (playerRank.values[i] < cpuRank.values[i]) {
                    result = 'CPUの勝ちです！';
                    break;
                }
            }
            
            // 完全に同じ場合は引き分け
            if (!result) {
                result = '引き分けです！';
            }
        }
        
        gameMessageElement.textContent = result;
    }

    // ゲームのリセット
    function resetGame() {
        selectedCards.clear();
        gamePhase = 'initial';
        
        dealButton.disabled = false;
        drawButton.disabled = true;
        newGameButton.disabled = true;
        
        playerHandElement.innerHTML = '';
        cpuHandElement.innerHTML = '';
        playerRankElement.textContent = '';
        cpuRankElement.textContent = '';
        gameMessageElement.textContent = 'ディールボタンを押してゲームを開始してください';
    }

    // 初期状態の設定
    resetGame();
});
