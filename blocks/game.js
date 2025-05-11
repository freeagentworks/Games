// ブロック崩しゲーム - game.js
document.addEventListener('DOMContentLoaded', () => {
    // キャンバスの設定
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    
    // ゲーム変数
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    
    // ボールの設定
    const ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: 10,
        dx: 4,
        dy: -4,
        color: '#FFFFFF'
    };
    
    // パドルの設定
    const paddle = {
        width: 100,
        height: 15,
        x: (canvas.width - 100) / 2,
        color: '#4CAF50'
    };
    
    // ブロックの設定
    const blockConfig = {
        rows: 5,
        columns: 8,
        width: 80,
        height: 25,
        padding: 10,
        offsetTop: 60,
        offsetLeft: 40
    };
    
    // カラフルな色の配列
    const colors = [
        '#FF5252', // 赤
        '#FF9800', // オレンジ
        '#FFEB3B', // 黄色
        '#66BB6A', // 緑
        '#42A5F5', // 青
        '#7E57C2', // 紫
        '#EC407A', // ピンク
        '#26A69A'  // ティール
    ];
    
    // ブロックの初期化
    let blocks = [];
    
    function initBlocks() {
        blocks = [];
        for (let row = 0; row < blockConfig.rows; row++) {
            blocks[row] = [];
            for (let col = 0; col < blockConfig.columns; col++) {
                blocks[row][col] = { 
                    x: 0, 
                    y: 0, 
                    status: 1, 
                    color: colors[Math.floor(Math.random() * colors.length)] 
                };
            }
        }
    }
    
    // マウスの動きを追跡
    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
            
            // パドルがキャンバスからはみ出さないようにする
            if (paddle.x < 0) {
                paddle.x = 0;
            } else if (paddle.x + paddle.width > canvas.width) {
                paddle.x = canvas.width - paddle.width;
            }
        }
    }
    
    // 衝突検出
    function collisionDetection() {
        for (let row = 0; row < blockConfig.rows; row++) {
            for (let col = 0; col < blockConfig.columns; col++) {
                const block = blocks[row][col];
                if (block.status === 1) {
                    if (
                        ball.x > block.x && 
                        ball.x < block.x + blockConfig.width && 
                        ball.y > block.y && 
                        ball.y < block.y + blockConfig.height
                    ) {
                        ball.dy = -ball.dy;
                        block.status = 0;
                        score++;
                        
                        // 全てのブロックを壊したかチェック
                        if (score === blockConfig.rows * blockConfig.columns) {
                            showMessage('おめでとう！クリアしました！');
                            gameRunning = false;
                        }
                    }
                }
            }
        }
    }
    
    // ボールの描画
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }
    
    // パドルの描画
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
        ctx.fillStyle = paddle.color;
        ctx.fill();
        ctx.closePath();
    }
    
    // ブロックの描画
    function drawBlocks() {
        for (let row = 0; row < blockConfig.rows; row++) {
            for (let col = 0; col < blockConfig.columns; col++) {
                if (blocks[row][col].status === 1) {
                    const blockX = col * (blockConfig.width + blockConfig.padding) + blockConfig.offsetLeft;
                    const blockY = row * (blockConfig.height + blockConfig.padding) + blockConfig.offsetTop;
                    blocks[row][col].x = blockX;
                    blocks[row][col].y = blockY;
                    
                    ctx.beginPath();
                    ctx.rect(blockX, blockY, blockConfig.width, blockConfig.height);
                    ctx.fillStyle = blocks[row][col].color;
                    ctx.fill();
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.strokeRect(blockX, blockY, blockConfig.width, blockConfig.height);
                    ctx.closePath();
                }
            }
        }
    }
    
    // スコアの描画
    function drawScore() {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`スコア: ${score}`, 20, 30);
    }
    
    // 残りライフの描画
    function drawLives() {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`ライフ: ${lives}`, canvas.width - 100, 30);
    }
    
    // メッセージの表示
    function showMessage(message) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'start';
    }
    
    // ゲームのリセット
    function resetGame() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 30;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -4;
        paddle.x = (canvas.width - paddle.width) / 2;
    }
    
    // ゲームの描画
    function draw() {
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 要素の描画
        drawBlocks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        
        // 衝突検出
        collisionDetection();
        
        // ボールの位置更新
        if (gameRunning) {
            // 左右の壁との衝突
            if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                ball.dx = -ball.dx;
            }
            
            // 上の壁との衝突
            if (ball.y + ball.dy < ball.radius) {
                ball.dy = -ball.dy;
            } 
            // パドルとの衝突
            else if (ball.y + ball.dy > canvas.height - ball.radius - paddle.height) {
                if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                    // パドルのどこに当たったかで跳ね返り角度を変える
                    const hitPosition = (ball.x - paddle.x) / paddle.width;
                    const angle = hitPosition * Math.PI - Math.PI / 2; // -π/2 から π/2 の範囲
                    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    ball.dx = speed * Math.cos(angle);
                    ball.dy = -speed * Math.sin(angle);
                } 
                // パドルを逃した場合
                else if (ball.y + ball.dy > canvas.height - ball.radius) {
                    lives--;
                    if (lives === 0) {
                        showMessage('ゲームオーバー！もう一度プレイするには「ゲームスタート」を押してください');
                        gameRunning = false;
                    } else {
                        resetGame();
                    }
                }
            }
            
            // ボールの移動
            ball.x += ball.dx;
            ball.y += ball.dy;
        } else {
            showMessage('「ゲームスタート」を押してプレイ！');
        }
        
        requestAnimationFrame(draw);
    }
    
    // イベントリスナー
    canvas.addEventListener('mousemove', mouseMoveHandler);
    
    startButton.addEventListener('click', () => {
        if (!gameRunning) {
            score = 0;
            lives = 3;
            initBlocks();
            resetGame();
            gameRunning = true;
        }
    });
    
    // ゲームの初期化と開始
    initBlocks();
    draw();
});