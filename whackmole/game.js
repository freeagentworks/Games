// モグラたたきゲーム - game.js
document.addEventListener('DOMContentLoaded', () => {
    // キャンバスの設定
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    
    // デバイスチェック
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 480;
    
    // キャンバスのサイズ調整
    function resizeCanvas() {
        const containerWidth = canvas.parentElement.clientWidth;
        const aspectRatio = canvas.width / canvas.height;
        const newWidth = Math.min(containerWidth, 600);
        const newHeight = newWidth / aspectRatio;
        
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
        
        // キャンバスのスケーリングファクター
        canvas.scaleX = canvas.width / newWidth;
        canvas.scaleY = canvas.height / newHeight;
    }
    
    // 初回リサイズ
    resizeCanvas();
    
    // ウィンドウサイズ変更時のリサイズ
    window.addEventListener('resize', resizeCanvas);
    
    // ゲーム変数
    let gameRunning = false;
    let score = 0;
    let timeLeft = 30;
    let timer;
    let holes = [];
    let moles = [];
    
    // 穴とモグラの設定
    const holeCount = 9; // 3x3のグリッド
    // スマホの場合は穴とモグラを少し大きくして押しやすくする
    const holeRadius = isSmallScreen ? 45 : 40;
    const moleRadius = isSmallScreen ? 35 : 30;
    
    // モグラの状態
    const MOLE_HIDDEN = 0;
    const MOLE_SHOWING = 1;
    const MOLE_WHACKED = 2;
    
    // 穴の初期化
    function initHoles() {
        holes = [];
        moles = [];
        
        const rows = 3;
        const cols = 3;
        const holeSpacingX = canvas.width / (cols + 1);
        const holeSpacingY = canvas.height / (rows + 1);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col + 1) * holeSpacingX;
                const y = (row + 1) * holeSpacingY;
                
                holes.push({ x, y, radius: holeRadius });
                moles.push({ 
                    x, 
                    y, 
                    radius: moleRadius, 
                    state: MOLE_HIDDEN, 
                    showTime: 0,
                    hideTime: 0
                });
            }
        }
    }
    
    // モグラを表示する
    function showRandomMole() {
        if (!gameRunning) return;
        
        // ランダムなモグラを選択
        const hiddenMoles = moles.filter(mole => mole.state === MOLE_HIDDEN);
        if (hiddenMoles.length === 0) return;
        
        const randomMole = hiddenMoles[Math.floor(Math.random() * hiddenMoles.length)];
        randomMole.state = MOLE_SHOWING;
        randomMole.showTime = Date.now();
        randomMole.hideTime = randomMole.showTime + (Math.random() * 1000) + 500; // 0.5〜1.5秒間表示
        
        // 次のモグラを表示するタイミングをランダムに設定
        setTimeout(showRandomMole, Math.random() * 800 + 200); // 0.2〜1秒後
    }
    
    // クリック/タップ処理
    function handleClick(e) {
        if (!gameRunning) return;
        
        // イベントのデフォルト動作を防止
        e.preventDefault();
        
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        
        let clickX, clickY;
        
        if (e.type.startsWith('touch')) {
            clickX = (e.touches[0].clientX - canvasRect.left) * scaleX;
            clickY = (e.touches[0].clientY - canvasRect.top) * scaleY;
        } else {
            clickX = (e.clientX - canvasRect.left) * scaleX;
            clickY = (e.clientY - canvasRect.top) * scaleY;
        }
        
        // モグラとの当たり判定
        for (let i = 0; i < moles.length; i++) {
            const mole = moles[i];
            if (mole.state === MOLE_SHOWING) {
                const distance = Math.sqrt(
                    Math.pow(clickX - mole.x, 2) + 
                    Math.pow(clickY - mole.y, 2)
                );
                
                // スマホの場合は当たり判定を少し広くする
                const hitRadius = isMobile ? mole.radius * 1.2 : mole.radius;
                
                if (distance < hitRadius) {
                    mole.state = MOLE_WHACKED;
                    score += 10;
                    scoreElement.textContent = score;
                    
                    // バイブレーション（対応デバイスのみ）
                    if (isMobile && 'vibrate' in navigator) {
                        navigator.vibrate(50);
                    }
                    
                    // 少し待ってから隠す
                    setTimeout(() => {
                        mole.state = MOLE_HIDDEN;
                    }, 300);
                }
            }
        }
    }
    
    // 穴の描画
    function drawHoles() {
        for (let i = 0; i < holes.length; i++) {
            const hole = holes[i];
            
            // 穴の影
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#3E2723';
            ctx.fill();
            ctx.closePath();
        }
    }
    
    // モグラの描画
    function drawMoles() {
        const now = Date.now();
        
        for (let i = 0; i < moles.length; i++) {
            const mole = moles[i];
            
            // 表示時間が過ぎたら隠す
            if (mole.state === MOLE_SHOWING && now > mole.hideTime) {
                mole.state = MOLE_HIDDEN;
            }
            
            if (mole.state !== MOLE_HIDDEN) {
                // モグラの体
                ctx.beginPath();
                ctx.arc(mole.x, mole.y, mole.radius, 0, Math.PI * 2);
                ctx.fillStyle = mole.state === MOLE_WHACKED ? '#D32F2F' : '#795548';
                ctx.fill();
                ctx.closePath();
                
                // モグラの目
                const eyeRadius = mole.radius / 5;
                const eyeOffsetX = mole.radius / 3;
                const eyeOffsetY = -mole.radius / 3;
                
                // 左目
                ctx.beginPath();
                ctx.arc(mole.x - eyeOffsetX, mole.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.closePath();
                
                // 右目
                ctx.beginPath();
                ctx.arc(mole.x + eyeOffsetX, mole.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.closePath();
                
                // 鼻
                ctx.beginPath();
                ctx.arc(mole.x, mole.y - eyeOffsetY / 2, eyeRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#FF8A65';
                ctx.fill();
                ctx.closePath();
                
                if (mole.state === MOLE_WHACKED) {
                    // バツ目
                    const crossSize = eyeRadius * 1.2;
                    
                    // 左目のバツ
                    ctx.beginPath();
                    ctx.moveTo(mole.x - eyeOffsetX - crossSize, mole.y + eyeOffsetY - crossSize);
                    ctx.lineTo(mole.x - eyeOffsetX + crossSize, mole.y + eyeOffsetY + crossSize);
                    ctx.moveTo(mole.x - eyeOffsetX + crossSize, mole.y + eyeOffsetY - crossSize);
                    ctx.lineTo(mole.x - eyeOffsetX - crossSize, mole.y + eyeOffsetY + crossSize);
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                    
                    // 右目のバツ
                    ctx.beginPath();
                    ctx.moveTo(mole.x + eyeOffsetX - crossSize, mole.y + eyeOffsetY - crossSize);
                    ctx.lineTo(mole.x + eyeOffsetX + crossSize, mole.y + eyeOffsetY + crossSize);
                    ctx.moveTo(mole.x + eyeOffsetX + crossSize, mole.y + eyeOffsetY - crossSize);
                    ctx.lineTo(mole.x + eyeOffsetX - crossSize, mole.y + eyeOffsetY + crossSize);
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                } else {
                    // 瞳
                    ctx.beginPath();
                    ctx.arc(mole.x - eyeOffsetX, mole.y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#000000';
                    ctx.fill();
                    ctx.closePath();
                    
                    ctx.beginPath();
                    ctx.arc(mole.x + eyeOffsetX, mole.y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#000000';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    
    // 背景の描画
    function drawBackground() {
        // 草原
        ctx.fillStyle = '#8BC34A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // メッセージの表示
    function showMessage(message) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'start';
    }
    
    // タイマーの更新
    function updateTimer() {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }
    
    // ゲーム終了
    function endGame() {
        gameRunning = false;
        clearInterval(timer);
        showMessage(`ゲーム終了！スコア: ${score}`);
    }
    
    // ゲームのリセット
    function resetGame() {
        score = 0;
        timeLeft = 30;
        scoreElement.textContent = score;
        timeElement.textContent = timeLeft;
        
        initHoles();
        
        // タイマーの開始
        timer = setInterval(updateTimer, 1000);
        
        // 最初のモグラを表示
        setTimeout(showRandomMole, 1000);
    }
    
    // ゲームの描画
    function draw() {
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 背景の描画
        drawBackground();
        
        // 穴の描画
        drawHoles();
        
        // モグラの描画
        drawMoles();
        
        if (!gameRunning && timeLeft === 30) {
            showMessage('「ゲームスタート」を押してプレイ！');
        }
        
        requestAnimationFrame(draw);
    }
    
    // イベントリスナー
    canvas.addEventListener('mousedown', handleClick);
    canvas.addEventListener('touchstart', handleClick, { passive: false });
    
    // スマホでのスワイプ操作を防止
    canvas.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
        }
    }, { passive: false });
    
    startButton.addEventListener('click', () => {
        if (!gameRunning) {
            gameRunning = true;
            resetGame();
        }
    });
    
    // モバイルでのダブルタップによるズームを防止
    document.addEventListener('touchend', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 画面の向きが変わった時にキャンバスをリサイズ
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 300); // 向きが変わった後に少し待ってからリサイズ
    });
    
    // ゲームの初期化と開始
    initHoles();
    draw();
});
