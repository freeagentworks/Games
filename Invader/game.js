// ゲームの設定
const config = {
    invaderRows: 5,
    invaderCols: 6,
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
    bulletCooldown: 250, // ミリ秒 - 発射速度を上げるために短縮
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
    },
    isMobile: false,
    touchStartX: 0,
    autoFire: false
};

// ゲームの初期化
function initGame() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.score = 0;
    game.isGameOver = false;
    game.isGameRunning = true;
    game.direction = 1;
    
    // モバイルデバイスの検出
    game.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    game.autoFire = game.isMobile; // モバイルでは自動発射モードをオン
    
    // キャンバスのサイズをウィンドウに合わせる
    resizeCanvas();
    
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
    
    // タッチイベントの設定（モバイル用）
    game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // デフォルトの動作を防止
        const touch = e.touches[0];
        game.touchStartX = touch.clientX;
    }, { passive: false });

    game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // デフォルトの動作を防止
        if (game.isGameRunning && e.touches.length > 0) {
            const touch = e.touches[0];
            const moveX = touch.clientX - game.touchStartX;
            
            // 移動距離に応じてプレイヤーを移動
            if (moveX > 5 && game.player.x < game.canvas.width - config.playerWidth) {
                game.player.x += config.playerSpeed * 1.5;
            } else if (moveX < -5 && game.player.x > 0) {
                game.player.x -= config.playerSpeed * 1.5;
            }
            
            // 新しい位置を記録
            game.touchStartX = touch.clientX;
        }
    }, { passive: false });
    
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

// キャンバスのリサイズ
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    
    // キャンバスの幅を調整（最大600px）
    const canvasWidth = Math.min(600, containerWidth - 20);
    const scale = canvasWidth / 600;
    
    // 高さは幅に合わせて比率を維持
    const canvasHeight = 700 * scale;
    
    game.canvas.width = canvasWidth;
    game.canvas.height = canvasHeight;
    
    // ゲーム要素のサイズも調整
    if (game.isMobile) {
        // モバイル向けに要素を少し大きくする
        config.playerWidth = 50 * scale * 1.2;
        config.playerHeight = 30 * scale * 1.2;
        config.invaderWidth = 40 * scale * 1.2;
        config.invaderHeight = 30 * scale * 1.2;
    } else {
        config.playerWidth = 50 * scale;
        config.playerHeight = 30 * scale;
        config.invaderWidth = 40 * scale;
        config.invaderHeight = 30 * scale;
    }
    
    // プレイヤーの位置を調整
    if (game.player) {
        game.player.width = config.playerWidth;
        game.player.height = config.playerHeight;
        game.player.y = game.canvas.height - config.playerHeight - 20;
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
    
    // 弾の発射（キーボードまたは自動発射）
    if (game.keys.space || game.autoFire) {
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


// ウィンドウリサイズイベントの設定
window.addEventListener('resize', () => {
    if (game.canvas) {
        resizeCanvas();
    }
});

// 初期ロード時にもリサイズを適用
window.addEventListener('load', () => {
    // モバイルデバイスの場合、ゲーム説明を表示
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const controls = document.querySelector('.controls p');
        if (controls) {
            controls.textContent = '操作方法: 画面を左右にスワイプして移動、自動発射モード';
        }
    }
});
