"use strict";
// Simple Tetris implementation in TypeScript using HTML Canvas
// This file can be compiled with `tsc tetris.ts` and run in a browser.
Object.defineProperty(exports, "__esModule", { value: true });
const canvas = document.createElement('canvas');
canvas.width = 240; // 10 columns * 24px
canvas.height = 480; // 20 rows * 24px
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
// Tetromino shapes (4x4 matrices)
const SHAPES = [
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // O
    [
        [1, 1],
        [1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
];
const COLORS = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];
function createPiece() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[idx];
    return {
        shape,
        x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
        y: 0,
        color: COLORS[idx]
    };
}
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let current = createPiece();
let dropCounter = 0;
let dropInterval = 1000; // ms
let lastTime = 0;
let gameOver = false;
function drawMatrix(matrix, offsetX, offsetY, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = color;
                ctx.fillRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });
}
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw board
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });
    // draw current piece
    drawMatrix(current.shape, current.x, current.y, current.color);
}
function collide(board, piece) {
    const m = piece.shape;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x]) {
                const boardX = x + piece.x;
                const boardY = y + piece.y;
                if (boardY >= ROWS || boardX < 0 || boardX >= COLS || board[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}
function merge(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + piece.y][x + piece.x] = COLORS.indexOf(piece.color) + 1;
            }
        });
    });
}
function sweep() {
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) {
            if (!board[y][x])
                continue outer;
        }
        // line full
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        ++y; // recheck same row
    }
}
function playerDrop() {
    current.y++;
    if (collide(board, current)) {
        current.y--;
        merge(board, current);
        sweep();
        current = createPiece();
        if (collide(board, current)) {
            gameOver = true;
        }
    }
    dropCounter = 0;
}
function playerMove(dir) {
    current.x += dir;
    if (collide(board, current)) {
        current.x -= dir;
    }
}
function rotate(matrix) {
    const N = matrix.length;
    const result = matrix.map(row => row.slice());
    for (let y = 0; y < N; ++y) {
        for (let x = 0; x < N; ++x) {
            result[x][N - 1 - y] = matrix[y][x];
        }
    }
    return result;
}
function playerRotate() {
    const oldShape = current.shape;
    const newShape = rotate(oldShape);
    current.shape = newShape;
    if (collide(board, current)) {
        current.shape = oldShape; // revert
    }
}
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    if (!gameOver) {
        requestAnimationFrame(update);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Game Over', 50, canvas.height / 2);
    }
}
// Input handling
document.addEventListener('keydown', e => {
    if (gameOver)
        return;
    if (e.key === 'ArrowLeft')
        playerMove(-1);
    else if (e.key === 'ArrowRight')
        playerMove(1);
    else if (e.key === 'ArrowDown')
        playerDrop();
    else if (e.key === 'ArrowUp')
        playerRotate();
});
requestAnimationFrame(update);
