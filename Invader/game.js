// ゲームの設定
const config = {
    invaderRows: 5,
    invaderCols: 10,
    invaderWidth: 40,
    invaderHeight: 30,
    invaderSpeed: 2,
    invaderDropDistance: 20,
    playerWidth: 50,
    playerHeight: 30,
    playerSpeed: 5,
    bulletWidth: 3,
    bulletHeight: 15,
    bulletSpeed: 7,
    bulletCooldown: 500, // ミリ秒
    colors: ['#FF5555', '#50FA7B', '#FFB86C', '#8BE9FD', '#BD93F9']
};

// ゲーム状態
let game = {
    canvas: null,
    ctx: null,
    player: null,
    invaders: [],
    bullets: [],
    enemyBullets: [],
    score: 0,
    isGameOver: false,
    isGameRunning: false,
    lastBulletTime: 0,
    direction: 1,
    keys: {
        left: false,
        right: false,
        space: false
    }
};

// ゲームの初期化
function initGame() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.score = 0;
    game.isGameOver = false;
    game.isGameRunning = true;
    game.direction = 1;
    
    // スコア表示の更新
    document.getElementById('score').textContent = game.score;
    
    // プレイヤーの初期化
    game.player = {
        x: game.canvas.width / 2 - config.playerWidth / 2,
        y: game.canvas.height - config.playerHeight - 20,
        width: config.playerWidth,
        height: config.playerHeight
    };
    
    // インベーダーの初期化
    game.invaders = [];
    for (let row = 0; row < config.invaderRows; row++) {
        for (let col = 0; col < config.invaderCols; col++) {
            game.invaders.push({
                x: col * (config.invaderWidth + 15) + 30,
                y: row * (config.invaderHeight + 15) + 30,
                width: config.invaderWidth,
                height: config.invaderHeight,
                color: config.colors[row % config.colors.length]
            });
        }
    }
    
    // 弾の初期化
    game.bullets = [];
    game.enemyBullets = [];
    
    // ゲームループの開始
    requestAnimationFrame(gameLoop);
}

// ゲームループ
function gameLoop() {
    if (!game.isGameRunning) return;
    
    update();
    render();
    
    if (!game.isGameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        gameOver();
    }
}

// ゲーム状態の更新
function update() {
    // プレイヤーの移動
    if (game.keys.left && game.player.x > 0) {
        game.player.x -= config.playerSpeed;
    }
    if (game.keys.right && game.player.x < game.canvas.width - config.playerWidth) {
        game.player.x += config.playerSpeed;
    }
    
    // 弾の発射
    if (game.keys.space) {
        const currentTime = Date.now();
        if (currentTime - game.lastBulletTime > config.bulletCooldown) {
            game.bullets.push({
                x: game.player.x + config.playerWidth / 2 - config.bulletWidth / 2,
                y: game.player.y,
                width: config.bulletWidth,
                height: config.bulletHeight
            });
            game.lastBulletTime = currentTime;
        }
    }
    
    // 弾の移動
    game.bullets.forEach((bullet, index) => {
        bullet.y -= config.bulletSpeed;
        
        // 画面外に出た弾を削除
        if (bullet.y < 0) {
            game.bullets.splice(index, 1);
        }
    });
    
    // 敵の弾の移動
    game.enemyBullets.forEach((bullet, index) => {
        bullet.y += config.bulletSpeed;
        
        // 画面外に出た弾を削除
        if (bullet.y > game.canvas.height) {
            game.enemyBullets.splice(index, 1);
        }
        
        // プレイヤーとの衝突判定
        if (
            bullet.x < game.player.x + game.player.width &&
            bullet.x + bullet.width > game.player.x &&
            bullet.y < game.player.y + game.player.height &&
            bullet.y + bullet.height > game.player.y
        ) {
            game.isGameOver = true;
        }
    });
    
    // インベーダーの移動
    let shouldChangeDirection = false;
    let allInvadersDestroyed = true;
    
    game.invaders.forEach(invader => {
        invader.x += config.invaderSpeed * game.direction;
        
        // 画面端に到達したかチェック
        if (
            (invader.x <= 0 && game.direction === -1) ||
            (invader.x + invader.width >= game.canvas.width && game.direction === 1)
        ) {
            shouldChangeDirection = true;
        }
        
        allInvadersDestroyed = false;
        
        // ランダムに弾を発射
        if (Math.random() < 0.001) {
            game.enemyBullets.push({
                x: invader.x + invader.width / 2,
                y: invader.y + invader.height,
                width: config.bulletWidth,
                height: config.bulletHeight
            });
        }
    });
    
    // 全てのインベーダーが破壊されたらゲームクリア
    if (game.invaders.length === 0) {
        game.isGameOver = true;
    }
    
    // 方向転換と下降
    if (shouldChangeDirection) {
        game.direction *= -1;
        game.invaders.forEach(invader => {
            invader.y += config.invaderDropDistance;
            
            // インベーダーがプレイヤーに到達したらゲームオーバー
            if (invader.y + invader.height >= game.player.y) {
                game.isGameOver = true;
            }
        });
    }
    
    // 弾とインベーダーの衝突判定
    game.bullets.forEach((bullet, bulletIndex) => {
        game.invaders.forEach((invader, invaderIndex) => {
            if (
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y
            ) {
                // 衝突した弾とインベーダーを削除
                game.bullets.splice(bulletIndex, 1);
                game.invaders.splice(invaderIndex, 1);
                
                // スコアの更新
                game.score += 10;
                document.getElementById('score').textContent = game.score;
            }
        });
    });
}

// 描画
function render() {
    // キャンバスのクリア
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // プレイヤーの描画
    game.ctx.fillStyle = '#8BE9FD';
    game.ctx.fillRect(
        game.player.x,
        game.player.y,
        game.player.width,
        game.player.height
    );
    
    // インベーダーの描画
    game.invaders.forEach(invader => {
        game.ctx.fillStyle = invader.color;
        game.ctx.fillRect(
            invader.x,
            invader.y,
            invader.width,
            invader.height
        );
    });
    
    // 弾の描画
    game.ctx.fillStyle = '#F8F8F2';
    game.bullets.forEach(bullet => {
        game.ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    });
    
    // 敵の弾の描画
    game.ctx.fillStyle = '#FF5555';
    game.enemyBullets.forEach(bullet => {
        game.ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );
    });
}

// ゲームオーバー処理
function gameOver() {
    game.isGameRunning = false;
    
    game.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    game.ctx.font = '30px Arial';
    game.ctx.fillStyle = '#FF5555';
    game.ctx.textAlign = 'center';
    
    if (game.invaders.length === 0) {
        game.ctx.fillText('ゲームクリア！', game.canvas.width / 2, game.canvas.height / 2 - 15);
    } else {
        game.ctx.fillText('ゲームオーバー', game.canvas.width / 2, game.canvas.height / 2 - 15);
    }
    
    game.ctx.font = '20px Arial';
    game.ctx.fillStyle = '#F8F8F2';
    game.ctx.fillText(`最終スコア: ${game.score}`, game.canvas.width / 2, game.canvas.height / 2 + 20);
    
    document.getElementById('startButton').textContent = 'リトライ';
}

// キーボードイベントの設定
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') game.keys.left = true;
    if (e.key === 'ArrowRight') game.keys.right = true;
    if (e.key === ' ') {
        game.keys.space = true;
        // スペースキーでのスクロール防止
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') game.keys.left = false;
    if (e.key === 'ArrowRight') game.keys.right = false;
    if (e.key === ' ') game.keys.space = false;
});

// スタートボタンのイベント設定
document.getElementById('startButton').addEventListener('click', () => {
    initGame();
});