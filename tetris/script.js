// Game constants
const ROWS = 20;
const COLS = 10;
const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: 'cyan' },
    O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' }
};

// Game variables
let grid = [];
let currentPiece = null;
let currentRotation = 0;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameInterval = null;

// Get DOM elements
const gameElement = document.getElementById('game');
const scoreElement = document.getElementById('score');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const rotateButton = document.getElementById('rotate-button');
const downButton = document.getElementById('down-button');

// Initialize the game grid
function createGrid() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameElement.appendChild(cell);
        }
    }
}

// Draw the game state
function draw() {
    // Clear all cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell'; // Reset classes
    });

    // Draw filled cells from grid
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col]) {
                const cell = document.querySelector(
                    `.cell[data-row='${row}'][data-col='${col}']`
                );
                if (cell) {
                    cell.classList.add('filled');
                    cell.classList.add(TETROMINOS[grid[row][col]].color); // Add color class
                }
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        const shape = currentPiece.shape;
        const color = currentPiece.color;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const cell = document.querySelector(
                        `.cell[data-row='${currentY + row}'][data-col='${currentX + col}']`
                    );
                    if (cell && currentY + row >= 0) {
                        cell.classList.add('current');
                        cell.classList.add(color); // Add color class
                    }
                }
            }
        }
    }
}

// Start a new game
function startGame() {
    createGrid();
    newPiece();
    gameInterval = setInterval(drop, 500);
    draw();
}

// Create a new piece
function newPiece() {
    // Randomly select a piece type
    const pieceNames = Object.keys(TETROMINOS);
    const randomPieceName = pieceNames[Math.floor(Math.random() * pieceNames.length)];
    currentPiece = { ...TETROMINOS[randomPieceName], name: randomPieceName }; // Store name along with shape and color
    currentRotation = 0;
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    
    // If piece immediately collides, game over
    if (checkCollision(currentX, currentY)) {
        clearInterval(gameInterval);
        alert('Game Over!');
    }
}

// Drop the piece down
function drop() {
    if (!checkCollision(currentX, currentY + 1)) {
        currentY++;
    } else {
        // Lock the piece in place
        lockPiece();
        clearLines();
        newPiece();
    }
    draw();
}

// Lock piece in place
function lockPiece() {
    const shape = currentPiece.shape;
    const pieceName = currentPiece.name;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                if (currentY + row >= 0 && currentY + row < ROWS) {
                    grid[currentY + row][currentX + col] = pieceName; // Store piece name (e.g., 'I', 'O')
                }
            }
        }
    }
}

// Check for collision
function checkCollision(x, y) {
    const shape = currentPiece.shape;
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (
                    newX < 0 || 
                    newX >= COLS || 
                    newY >= ROWS || 
                    (newY >= 0 && grid[newY][newX])
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Move the piece
function move(direction) {
    if (!checkCollision(currentX + direction, currentY)) {
        currentX += direction;
        draw();
    }
}

// Rotate the piece
function rotate() {
    // Create a clone of the current piece's shape and rotate it
    const originalShape = currentPiece.shape;
    const newShape = originalShape[0].map((_, index) =>
        originalShape.map(row => row[index]).reverse()
    );

    // Check collision with new rotated piece
    currentRotation++;
    const oldShape = currentPiece.shape;
    currentPiece.shape = newShape; // Update only the shape

    if (checkCollision(currentX, currentY)) {
        // If collision, revert to old shape
        currentPiece.shape = oldShape;
        currentRotation--;
    }
    
    draw();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    // Check each row from bottom to top
    for (let row = ROWS - 1; row >= 0; row--) {
        // Check if this row is completely filled
        if (grid[row].every(cell => cell !== 0)) { // Check if cell is not empty
            // Remove this row
            grid.splice(row, 1);
            
            // Add a new empty row at the top
            grid.unshift(Array(COLS).fill(0));
            
            linesCleared++;
            // Don't increment row since we removed one
            continue;
        }
    }
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
        score += Math.pow(2, linesCleared) * 100;
        updateScore();
    }
}

// Update score display
function updateScore() {
    scoreElement.textContent = `スコア: ${score}`;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (!gameInterval) return;
    
    if (e.key === 'ArrowLeft') {
        move(-1);
    } else if (e.key === 'ArrowRight') {
        move(1);
    } else if (e.key === 'ArrowDown') {
        drop();
    } else if (e.key === 'ArrowUp') {
        rotate();
    }
});

// Start the game
startGame();

// Add event listeners for buttons
if (leftButton) {
    leftButton.addEventListener('click', () => {
        if (!gameInterval) return;
        move(-1);
    });
}

if (rightButton) {
    rightButton.addEventListener('click', () => {
        if (!gameInterval) return;
        move(1);
    });
}

if (rotateButton) {
    rotateButton.addEventListener('click', () => {
        if (!gameInterval) return;
        rotate();
    });
}

if (downButton) {
    downButton.addEventListener('click', () => {
        if (!gameInterval) return;
        drop();
    });
}
