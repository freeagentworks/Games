document.addEventListener('DOMContentLoaded', () => {
    // ゲームの状態
    const gameState = {
        difficulty: 3,
        theme: 'daysky',
        music: 'piano',
        moves: 0,
        startTime: null,
        elapsedTime: 0,
        timer: null,
        isMuted: false,
        puzzle: [],
        emptyCell: { row: 0, col: 0 },
        solved: false,
        album: []
    };

    // DOM要素
    const sections = {
        menu: document.getElementById('game-menu'),
        game: document.getElementById('puzzle-game'),
        complete: document.getElementById('puzzle-complete'),
        album: document.getElementById('album-view')
    };

    const elements = {
        puzzleBoard: document.getElementById('puzzle-board'),
        moves: document.getElementById('moves'),
        time: document.getElementById('time'),
        finalMoves: document.getElementById('final-moves'),
        finalTime: document.getElementById('final-time'),
        earnedPoints: document.getElementById('earned-points'),
        completeImage: document.getElementById('complete-image'),
        completionMessage: document.getElementById('completion-message'),
        albumGrid: document.getElementById('album-grid'),
        backgroundMusic: document.getElementById('background-music')
    };

    // ボタン要素
    const buttons = {
        difficultyBtns: document.querySelectorAll('.difficulty-btn'),
        themeBtns: document.querySelectorAll('.theme-btn'),
        musicBtns: document.querySelectorAll('.music-btn'),
        startGame: document.getElementById('start-game'),
        hint: document.getElementById('hint-btn'),
        shuffle: document.getElementById('shuffle-btn'),
        returnMenu: document.getElementById('return-menu'),
        mute: document.getElementById('mute-btn'),
        playAgain: document.getElementById('play-again'),
        saveAlbum: document.getElementById('save-album'),
        closeAlbum: document.getElementById('close-album')
    };

    // テーマと音楽の設定
    const themes = {
        daysky: {
            url: 'images/daysky.jpg',
            name: '昼の空',
            messages: [
                '素晴らしい！青空のように心が晴れましたね。',
                '雲の上から見る景色は格別ですね。',
                '澄み渡る青空のような清々しさを感じませんか？'
            ]
        },
        sunset: {
            url: 'images/sunset.jpg',
            name: '夕暮れ',
            messages: [
                '素晴らしい！夕日のような温かさを感じますね。',
                '美しい夕焼けをお楽しみください。',
                '夕暮れの輝きがあなたを包みます。'
            ]
        },
        nightsky: {
            url: 'images/nightsky.jpg',
            name: '夜空',
            messages: [
                '素晴らしい！星空のように心が輝いていますね。',
                '静かな夜空があなたを包み込みます。',
                '満天の星があなたの旅を見守っています。'
            ]
        }
    };

    const music = {
        piano: {
            url: 'sounds/piano.mp3',
            name: '穏やかなピアノ'
        },
        nature: {
            url: 'sounds/nature.mp3',
            name: '自然の風音'
        },
        cabin: {
            url: 'sounds/cabin.mp3',
            name: '機内の環境音'
        },
        none: {
            url: '',
            name: 'なし'
        }
    };

    // 仮の画像データを設定（実際にはサーバーから取得するか、別の方法で準備します）
    const defaultImages = [
        { id: 'img1', theme: 'daysky', url: 'images/daysky.jpg' },
        { id: 'img2', theme: 'sunset', url: 'images/sunset.jpg' },
        { id: 'img3', theme: 'nightsky', url: 'images/nightsky.jpg' }
    ];

    // ローカルストレージからアルバムデータを取得
    function loadAlbumFromStorage() {
        const storedAlbum = localStorage.getItem('relaxPuzzleAlbum');
        if (storedAlbum) {
            gameState.album = JSON.parse(storedAlbum);
        } else {
            gameState.album = [];
        }
    }

    // アルバムをローカルストレージに保存
    function saveAlbumToStorage() {
        localStorage.setItem('relaxPuzzleAlbum', JSON.stringify(gameState.album));
    }

    // ボタンのイベントリスナー設定
    function setupEventListeners() {
        // 難易度選択ボタン
        buttons.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gameState.difficulty = parseInt(btn.dataset.size);
                updateActiveButton(buttons.difficultyBtns, btn);
            });
        });

        // テーマ選択ボタン
        buttons.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gameState.theme = btn.dataset.theme;
                updateActiveButton(buttons.themeBtns, btn);
            });
        });

        // 音楽選択ボタン
        buttons.musicBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gameState.music = btn.dataset.music;
                updateActiveButton(buttons.musicBtns, btn);
            });
        });

        // ゲーム開始ボタン
        buttons.startGame.addEventListener('click', () => {
            startGame();
        });

        // ヒントボタン
        buttons.hint.addEventListener('click', () => {
            showHint();
        });

        // シャッフルボタン
        buttons.shuffle.addEventListener('click', () => {
            shufflePuzzle();
        });

        // メニューに戻るボタン
        buttons.returnMenu.addEventListener('click', () => {
            stopTimer();
            switchSection('menu');
        });

        // ミュートボタン
        buttons.mute.addEventListener('click', () => {
            toggleMute();
        });

        // もう一度遊ぶボタン
        buttons.playAgain.addEventListener('click', () => {
            switchSection('menu');
        });

        // アルバムに保存ボタン
        buttons.saveAlbum.addEventListener('click', () => {
            saveToAlbum();
            switchSection('album');
        });

        // アルバムを閉じるボタン
        buttons.closeAlbum.addEventListener('click', () => {
            switchSection('menu');
        });
        
        // タッチデバイスのサポート強化
        // パズルボードにタッチイベントを追加
        elements.puzzleBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // タッチされた要素がピースなら
            if (e.target.classList.contains('puzzle-piece')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                movePiece(row, col);
            }
        }, { passive: false });
    }

    // アクティブなボタンを更新
    function updateActiveButton(buttonList, activeButton) {
        buttonList.forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // セクションを切り替え
    function switchSection(sectionName) {
        // すべてのセクションを非表示
        Object.values(sections).forEach(section => {
            section.classList.remove('active');
        });

        // 指定したセクションを表示
        sections[sectionName].classList.add('active');

        // アルバムを表示する場合は更新
        if (sectionName === 'album') {
            renderAlbum();
        }
    }

    // ゲームを開始
    function startGame() {
        resetGameState();
        shufflePuzzle(true);
        startTimer();
        playBackgroundMusic();
        switchSection('game');
    }

    // ゲーム状態をリセット
    function resetGameState() {
        gameState.moves = 0;
        gameState.elapsedTime = 0;
        gameState.solved = false;
        elements.moves.textContent = '0';
        elements.time.textContent = '00:00';
    }

    // パズルを作成
    function createPuzzle() {
        const size = gameState.difficulty;
        elements.puzzleBoard.innerHTML = '';
        
        const pieceWidth = 100 / size;
        const pieceHeight = 100 / size;
        
        // パズルの状態を初期化
        gameState.puzzle = [];
        
        // 右下を空きマスに設定（一般的なスライドパズルの初期状態）
        const emptyRow = size - 1;
        const emptyCol = size - 1;
        gameState.emptyCell = { row: emptyRow, col: emptyCol };
        
        // 全てのピースを作成（空きマスを含む）
        for (let row = 0; row < size; row++) {
            gameState.puzzle[row] = [];
            for (let col = 0; col < size; col++) {
                const pieceNumber = row * size + col;
                const isEmpty = (row === emptyRow && col === emptyCol);
                
                // 論理的な状態を設定
                if (isEmpty) {
                    gameState.puzzle[row][col] = -1; // 空きマスは-1で表現
                } else {
                    gameState.puzzle[row][col] = pieceNumber;
                }
                
                // 全てのセルに対してDOM要素を作成（空きマスも含む）
                const piece = document.createElement('div');
                piece.className = isEmpty ? 'puzzle-piece empty' : 'puzzle-piece';
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                // ピースのサイズと位置を設定
                piece.style.width = `calc(${pieceWidth}% - 4px)`;
                piece.style.height = `calc(${pieceHeight}% - 4px)`;
                piece.style.left = `${col * pieceWidth}%`;
                piece.style.top = `${row * pieceHeight}%`;
                piece.style.margin = '2px';
                
                if (!isEmpty) {
                    piece.style.cursor = 'pointer';
                    piece.style.touchAction = 'none'; // タッチデバイス用
                    
                    // 背景画像の位置を設定
                    piece.style.backgroundImage = `url(${themes[gameState.theme].url})`;
                    piece.style.backgroundSize = `${size * 100}% ${size * 100}%`;
                    piece.style.backgroundPosition = `-${col * 100}% -${row * 100}%`;
                    
                    // クリックイベントを追加
                    piece.addEventListener('click', () => {
                        movePiece(row, col);
                    });
                    
                    // タッチイベントを追加
                    piece.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        movePiece(row, col);
                    }, { passive: false });
                } else {
                    // 空きマスは背景を透明に
                    piece.style.backgroundColor = 'transparent';
                    piece.style.border = 'none';
                    piece.style.boxShadow = 'none';
                }
                
                elements.puzzleBoard.appendChild(piece);
            }
        }
        
        // 動かせるピースをハイライト
        updateMovablePieces();
    }

    // パズルをシャッフル
    function shufflePuzzle(isInitialShuffle = false) {
        const size = gameState.difficulty;
        
        // 最初に正解の状態を作成
        if (isInitialShuffle || elements.puzzleBoard.innerHTML === '') {
            createPuzzle();
        }
        
        // シャッフル方法を改善
        // ランダムな移動を多数回行うことで自然なシャッフルを実現
        const moveCount = size * size * 20; // 十分な回数のランダム移動
        
        for (let i = 0; i < moveCount; i++) {
            // 現在の空きマスの隣接セルからランダムに選択
            const { row, col } = gameState.emptyCell;
            const possibleMoves = [];
            
            // 上下左右の隣接セルをチェック
            if (row > 0) possibleMoves.push({ row: row - 1, col });
            if (row < size - 1) possibleMoves.push({ row: row + 1, col });
            if (col > 0) possibleMoves.push({ row, col: col - 1 });
            if (col < size - 1) possibleMoves.push({ row, col: col + 1 });
            
            // ランダムな隣接セルを選択して移動
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                
                // ピースの値を交換（実際の移動）
                const temp = gameState.puzzle[row][col];
                gameState.puzzle[row][col] = gameState.puzzle[randomMove.row][randomMove.col];
                gameState.puzzle[randomMove.row][randomMove.col] = temp;
                
                // 空きマスの位置を更新
                gameState.emptyCell = { row: randomMove.row, col: randomMove.col };
            }
        }
        
        // 現在の配置からピースの位置を再計算する
        updatePuzzleArrangement();
        
        // シャッフル後にゲーム状態をリセット
        gameState.moves = 0;
        elements.moves.textContent = '0';
        
        // 動かせるピースをハイライト
        updateMovablePieces();
    }

    // パズルが解決可能かどうかを判定する関数
    function isSolvable(puzzle, size) {
        // 空きマスを除外してインバージョンをカウント
        const puzzleWithoutEmpty = puzzle.filter(p => p !== -1);
        let inversions = 0;
        
        for (let i = 0; i < puzzleWithoutEmpty.length; i++) {
            for (let j = i + 1; j < puzzleWithoutEmpty.length; j++) {
                if (puzzleWithoutEmpty[i] > puzzleWithoutEmpty[j]) {
                    inversions++;
                }
            }
        }
        
        // 空きマスの行位置（0-indexed）
        const emptyRow = Math.floor(puzzle.indexOf(-1) / size);
        
        if (size % 2 === 1) {
            // サイズが奇数の場合、インバージョンが偶数なら解決可能
            return inversions % 2 === 0;
        } else {
            // サイズが偶数の場合
            // 空きマスが下から数えて偶数行にあるとき、インバージョンが奇数なら解決可能
            // 空きマスが下から数えて奇数行にあるとき、インバージョンが偶数なら解決可能
            const emptyRowFromBottom = size - emptyRow - 1;
            return (emptyRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
                   (emptyRowFromBottom % 2 === 1 && inversions % 2 === 0);
        }
    }

    // パズルの表示配置を更新
    function updatePuzzleArrangement() {
        const size = gameState.difficulty;
        const pieceWidth = 100 / size;
        const pieceHeight = 100 / size;
        
        // 全てのピースを一度削除
        elements.puzzleBoard.innerHTML = '';
        
        // 現在の状態に基づいて再配置
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const pieceNumber = gameState.puzzle[row][col];
                const isEmpty = (pieceNumber === -1);
                
                // ピース要素を作成
                const piece = document.createElement('div');
                piece.className = isEmpty ? 'puzzle-piece empty' : 'puzzle-piece';
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                // ピースのサイズと位置を設定
                piece.style.width = `calc(${pieceWidth}% - 4px)`;
                piece.style.height = `calc(${pieceHeight}% - 4px)`;
                piece.style.left = `${col * pieceWidth}%`;
                piece.style.top = `${row * pieceHeight}%`;
                piece.style.margin = '2px';
                
                if (!isEmpty) {
                    piece.style.cursor = 'pointer';
                    piece.style.touchAction = 'none';
                    
                    // 背景画像の位置を設定
                    const originalRow = Math.floor(pieceNumber / size);
                    const originalCol = pieceNumber % size;
                    piece.style.backgroundImage = `url(${themes[gameState.theme].url})`;
                    piece.style.backgroundSize = `${size * 100}% ${size * 100}%`;
                    piece.style.backgroundPosition = `-${originalCol * 100}% -${originalRow * 100}%`;
                    
                    // クリックイベントを追加
                    piece.addEventListener('click', () => {
                        movePiece(row, col);
                    });
                    
                    // タッチイベントを追加
                    piece.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        movePiece(row, col);
                    }, { passive: false });
                } else {
                    // 空きマスは背景を透明に
                    piece.style.backgroundColor = 'transparent';
                    piece.style.border = 'none';
                    piece.style.boxShadow = 'none';
                }
                
                elements.puzzleBoard.appendChild(piece);
            }
        }
        
        // 動かせるピースをハイライト
        updateMovablePieces();
    }

    // パズルの表示を更新
    function updatePuzzleDisplay() {
        updatePuzzleArrangement();
    }

    // 動かせるピースをハイライト
    function updateMovablePieces() {
        // すべてのピースからmovableクラスを削除
        const pieces = document.querySelectorAll('.puzzle-piece:not(.empty)');
        pieces.forEach(piece => {
            piece.classList.remove('movable');
        });
        
        const { row, col } = gameState.emptyCell;
        const size = gameState.difficulty;
        
        // 隣接するピースにmovableクラスを追加
        if (row > 0) {
            const piece = getPieceAt(row - 1, col);
            if (piece && !piece.classList.contains('empty')) piece.classList.add('movable');
        }
        if (row < size - 1) {
            const piece = getPieceAt(row + 1, col);
            if (piece && !piece.classList.contains('empty')) piece.classList.add('movable');
        }
        if (col > 0) {
            const piece = getPieceAt(row, col - 1);
            if (piece && !piece.classList.contains('empty')) piece.classList.add('movable');
        }
        if (col < size - 1) {
            const piece = getPieceAt(row, col + 1);
            if (piece && !piece.classList.contains('empty')) piece.classList.add('movable');
        }
    }

    // ピースを動かす処理
    function movePiece(row, col) {
        const { row: emptyRow, col: emptyCol } = gameState.emptyCell;
        
        // 隣接するピースかどうかを確認（上下左右のいずれか）
        const isAdjacent = (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) || 
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        );
        
        if (isAdjacent) {
            // ピースの値を交換
            const temp = gameState.puzzle[row][col];
            gameState.puzzle[row][col] = gameState.puzzle[emptyRow][emptyCol];
            gameState.puzzle[emptyRow][emptyCol] = temp;
            
            // 空きマスの位置を更新
            gameState.emptyCell = { row, col };
            
            // 移動回数を増やす
            gameState.moves++;
            elements.moves.textContent = gameState.moves;
            
            // パズルの表示を更新
            updatePuzzleArrangement();
            
            // 動かせるピースを更新
            updateMovablePieces();
            
            // 完成したかチェック
            if (checkPuzzleSolved()) {
                gameState.solved = true;
                completePuzzle();
            }
        }
    }

    // 指定位置のピース要素を取得
    function getPieceAt(row, col) {
        return document.querySelector(`.puzzle-piece[data-row="${row}"][data-col="${col}"]`);
    }

    // パズルが解けたかチェック
    function checkPuzzleSolved() {
        const size = gameState.difficulty;
        
        // すべてのピースが正しい位置にあるかチェック（空きマスの位置は問わない）
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const pieceNumber = gameState.puzzle[row][col];
                
                // 空きマスはスキップ
                if (pieceNumber === -1) continue;
                
                // 正しい位置にあるかチェック
                if (pieceNumber !== row * size + col) {
                    return false;
                }
            }
        }
        return true;
    }

    // パズル完成時の処理
    function completePuzzle() {
        stopTimer();
        
        // 完成画面の表示を更新
        elements.finalMoves.textContent = gameState.moves;
        elements.finalTime.textContent = formatTime(gameState.elapsedTime);
        
        // 獲得ポイントを計算（難易度、移動回数、時間から算出）
        const pointBase = gameState.difficulty * 100;
        const timeBonus = Math.max(0, 1000 - gameState.elapsedTime);
        const movesBonus = Math.max(0, (gameState.difficulty * gameState.difficulty * 2) - gameState.moves) * 10;
        const points = pointBase + timeBonus + movesBonus;
        elements.earnedPoints.textContent = points;
        
        // 完成画像を設定
        elements.completeImage.style.backgroundImage = `url(${themes[gameState.theme].url})`;
        
        // ランダムなメッセージを表示
        const messages = themes[gameState.theme].messages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        elements.completionMessage.textContent = randomMessage;
        
        // 完成セクションに切り替え
        setTimeout(() => {
            switchSection('complete');
        }, 1000);
    }

    // ヒントを表示
    function showHint() {
        const size = gameState.difficulty;
        const hintOverlay = document.createElement('div');
        hintOverlay.className = 'hint-overlay';
        hintOverlay.style.position = 'absolute';
        hintOverlay.style.top = '0';
        hintOverlay.style.left = '0';
        hintOverlay.style.width = '100%';
        hintOverlay.style.height = '100%';
        hintOverlay.style.backgroundImage = `url(${themes[gameState.theme].url})`;
        hintOverlay.style.backgroundSize = 'cover';
        hintOverlay.style.opacity = '0.8';
        hintOverlay.style.zIndex = '100';
        hintOverlay.style.animation = 'fadeIn 0.5s ease-in, fadeOut 0.5s ease-out 2s forwards';
        
        elements.puzzleBoard.appendChild(hintOverlay);
        
        // 3秒後にヒント表示を削除
        setTimeout(() => {
            hintOverlay.remove();
        }, 3000);
    }

    // タイマーを開始
    function startTimer() {
        stopTimer(); // 既存のタイマーがあれば停止
        
        gameState.startTime = Date.now() - gameState.elapsedTime * 1000;
        
        gameState.timer = setInterval(() => {
            const now = Date.now();
            gameState.elapsedTime = Math.floor((now - gameState.startTime) / 1000);
            elements.time.textContent = formatTime(gameState.elapsedTime);
        }, 1000);
    }

    // タイマーを停止
    function stopTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
    }

    // 時間をフォーマット（秒→MM:SS）
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 背景音楽を再生
    function playBackgroundMusic() {
        if (gameState.music === 'none') {
            elements.backgroundMusic.pause();
            return;
        }
        
        elements.backgroundMusic.src = music[gameState.music].url;
        elements.backgroundMusic.volume = 0.5;
        
        if (!gameState.isMuted) {
            elements.backgroundMusic.play().catch(e => {
                console.log('音楽の自動再生ができませんでした:', e);
            });
        }
    }

    // ミュート切り替え
    function toggleMute() {
        gameState.isMuted = !gameState.isMuted;
        
        if (gameState.isMuted) {
            elements.backgroundMusic.pause();
            buttons.mute.textContent = '音楽: オフ';
        } else {
            if (gameState.music !== 'none') {
                elements.backgroundMusic.play().catch(e => {
                    console.log('音楽の再生ができませんでした:', e);
                });
            }
            buttons.mute.textContent = '音楽: オン';
        }
    }

    // アルバムに保存
    function saveToAlbum() {
        const newEntry = {
            id: Date.now().toString(),
            theme: gameState.theme,
            themeName: themes[gameState.theme].name,
            difficulty: gameState.difficulty,
            moves: gameState.moves,
            time: gameState.elapsedTime,
            date: new Date().toLocaleDateString(),
            points: parseInt(elements.earnedPoints.textContent)
        };
        
        gameState.album.push(newEntry);
        saveAlbumToStorage();
    }

    // アルバムを表示
    function renderAlbum() {
        elements.albumGrid.innerHTML = '';
        
        // アルバムにまだ何も保存していない場合は代わりのメッセージを表示
        if (gameState.album.length === 0) {
            const defaultImages = Object.keys(themes).map(key => themes[key]);
            
            for (const theme of defaultImages) {
                const albumItem = document.createElement('div');
                albumItem.className = 'album-item';
                
                const albumImage = document.createElement('div');
                albumImage.className = 'album-image';
                albumImage.style.backgroundImage = `url(${theme.url})`;
                
                const albumInfo = document.createElement('div');
                albumInfo.className = 'album-info';
                albumInfo.innerHTML = `
                    <p><strong>${theme.name}</strong></p>
                    <p>サンプル画像</p>
                `;
                
                albumItem.appendChild(albumImage);
                albumItem.appendChild(albumInfo);
                elements.albumGrid.appendChild(albumItem);
            }
            
            const message = document.createElement('p');
            message.textContent = 'パズルを完成させて、アルバムに画像を追加しましょう！';
            message.style.gridColumn = '1 / -1';
            message.style.textAlign = 'center';
            message.style.marginTop = '20px';
            elements.albumGrid.appendChild(message);
            
            return;
        }
        
        // アルバム内容を表示
        for (const entry of gameState.album) {
            const albumItem = document.createElement('div');
            albumItem.className = 'album-item';
            
            const albumImage = document.createElement('div');
            albumImage.className = 'album-image';
            albumImage.style.backgroundImage = `url(${themes[entry.theme].url})`;
            
            const albumInfo = document.createElement('div');
            albumInfo.className = 'album-info';
            albumInfo.innerHTML = `
                <p><strong>${entry.themeName}</strong></p>
                <p>${entry.difficulty}x${entry.difficulty} • ${entry.points}pts</p>
                <p>${formatTime(entry.time)} • ${entry.moves}手</p>
                <p>${entry.date}</p>
            `;
            
            albumItem.appendChild(albumImage);
            albumItem.appendChild(albumInfo);
            elements.albumGrid.appendChild(albumItem);
        }
    }

    // ダミー画像とBGMファイルをローカルに用意する関数（実際にはサーバーから取得）
    function setupDummyFiles() {
        console.log('テーマや音楽の素材をセットアップします。実際のアプリでは適切な画像や音声を用意してください。');
    }

    // 初期化
    function init() {
        setupDummyFiles();
        loadAlbumFromStorage();
        setupEventListeners();
        switchSection('menu');
    }

    // アプリケーションの初期化
    init();
});
