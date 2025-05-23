// シンプルなパックマンゲーム
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// レスポンシブ対応
function resizeCanvas() {
  // 縦長比率に変更
  const w = Math.min(window.innerWidth * 0.9, 480);
  const h = Math.min(window.innerWidth * 1.4, 750);
  canvas.width = w;
  canvas.height = h;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// マップ定義（0:道, 1:壁, 2:ドット）
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,1,2,2,2,1,2,2,1],
  [1,2,1,2,1,2,1,2,1,2,2,1],
  [1,2,1,2,1,2,1,2,1,2,2,1],
  [1,2,1,2,2,2,2,2,1,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,1,2,2,2,1,2,2,1],
  [1,2,1,2,1,1,1,2,1,2,2,1],
  [1,2,1,2,2,2,2,2,1,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
];
const ROWS = map.length;
const COLS = map[0].length;

let pacman = { x: 1, y: 1, dir: {x:1, y:0}, nextDir: {x:1, y:0} };
let score = 0;
let gameActive = false;
let gameOver = false;

function countDots() {
  return map.flat().filter(v => v === 2).length;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cellW = canvas.width / COLS;
  const cellH = canvas.height / ROWS;
  // マップ描画
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      } else if (map[y][x] === 2) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x * cellW + cellW/2, y * cellH + cellH/2, Math.min(cellW, cellH)/8, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
  // パックマン描画
  if (gameActive) {
    ctx.save();
    ctx.translate(pacman.x * cellW + cellW/2, pacman.y * cellH + cellH/2);
    ctx.rotate(Math.atan2(pacman.dir.y, pacman.dir.x));
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,Math.min(cellW,cellH)/2-2,Math.PI/6,Math.PI*2-Math.PI/6,false);
    ctx.closePath();
    ctx.fillStyle = '#ff0';
    ctx.fill();
    ctx.restore();
  }
  // スコア
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.floor(cellH/2)}px sans-serif`;
  ctx.fillText(`Score: ${score}`, 8, canvas.height-8);
  // ゲーム終了メッセージ
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(canvas.height/12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ゲームクリア！', canvas.width/2, canvas.height/2);
    ctx.restore();
  }
}

function canMove(x, y) {
  return map[y] && map[y][x] !== 1;
}

function update() {
  if (!gameActive || gameOver) return;
  // 次の方向が進めるなら切り替え
  if (canMove(pacman.x + pacman.nextDir.x, pacman.y + pacman.nextDir.y)) {
    pacman.dir = {...pacman.nextDir};
  }
  // 進行方向に進めるなら進む
  if (canMove(pacman.x + pacman.dir.x, pacman.y + pacman.dir.y)) {
    pacman.x += pacman.dir.x;
    pacman.y += pacman.dir.y;
  }
  // ドット取得
  if (map[pacman.y][pacman.x] === 2) {
    map[pacman.y][pacman.x] = 0;
    score += 10;
    if (countDots() === 0) {
      gameOver = true;
      gameActive = false;
    }
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// キー操作
window.addEventListener('keydown', e => {
  if (!gameActive) return;
  if (e.key === 'ArrowUp') pacman.nextDir = {x:0, y:-1};
  if (e.key === 'ArrowDown') pacman.nextDir = {x:0, y:1};
  if (e.key === 'ArrowLeft') pacman.nextDir = {x:-1, y:0};
  if (e.key === 'ArrowRight') pacman.nextDir = {x:1, y:0};
});

// モバイル操作
const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
if (upBtn) upBtn.addEventListener('touchstart', () => { if(gameActive) pacman.nextDir = {x:0, y:-1}; });
if (downBtn) downBtn.addEventListener('touchstart', () => { if(gameActive) pacman.nextDir = {x:0, y:1}; });
if (leftBtn) leftBtn.addEventListener('touchstart', () => { if(gameActive) pacman.nextDir = {x:-1, y:0}; });
if (rightBtn) rightBtn.addEventListener('touchstart', () => { if(gameActive) pacman.nextDir = {x:1, y:0}; });

// スタートボタン
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    // マップ初期化
    const newMap = [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,1,2,2,2,1,2,2,1],
      [1,2,1,2,1,2,1,2,1,2,2,1],
      [1,2,1,2,1,2,1,2,1,2,2,1],
      [1,2,1,2,2,2,2,2,1,2,2,1],
      [1,2,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,1,2,2,2,1,2,2,1],
      [1,2,1,2,1,1,1,2,1,2,2,1],
      [1,2,1,2,2,2,2,2,1,2,2,1],
      [1,2,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    for(let y=0; y<ROWS; y++) for(let x=0; x<COLS; x++) map[y][x]=newMap[y][x];
    pacman.x = 1; pacman.y = 1;
    pacman.dir = {x:1, y:0};
    pacman.nextDir = {x:1, y:0};
    score = 0;
    gameOver = false;
    gameActive = true;
  });
}
