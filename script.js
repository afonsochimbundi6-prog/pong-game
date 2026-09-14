// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;

let gameRunning = false;

// Player Paddle (Left)
const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: paddleSpeed
};

// Computer Paddle (Right)
const computerPaddle = {
    x: canvas.width - 25,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed,
    radius: ballSize
};

// Score
let playerScore = 0;
let computerScore = 0;

// Keyboard Input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse Input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Update player paddle position based on mouse
    playerPaddle.y = mouseY - playerPaddle.height / 2;
    
    // Keep paddle within bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
});

// Start/Restart Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        resetBall();
    }
}

// Reset Ball Position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed * 2;
}

// Update Player Paddle with Arrow Keys
function updatePlayerPaddleWithKeys() {
    if (keys['ArrowUp']) {
        playerPaddle.y -= playerPaddle.maxSpeed;
    }
    if (keys['ArrowDown']) {
        playerPaddle.y += playerPaddle.maxSpeed;
    }
    
    // Keep paddle within bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update Computer Paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    // AI follows the ball with some predictive behavior
    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    // Keep paddle within bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Collision Detection - Ball with Paddle
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        // Calculate collision point
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint /= paddle.height / 2;
        
        // Calculate angle and speed
        const angleRad = (collidePoint * Math.PI) / 4;
        const direction = ball.x < canvas.width / 2 ? 1 : -1;
        
        ball.dx = direction * ballSpeed * Math.cos(angleRad);
        ball.dy = ballSpeed * Math.sin(angleRad);
        ball.x = paddle === playerPaddle ? paddle.x + paddle.width + ball.radius : paddle.x - ball.radius;
    }
}

// Collision Detection - Ball with Walls
function checkWallCollision() {
    // Top and bottom walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy = -ball.dy;
    }
}

// Check if ball is out of bounds (scoring)
function checkScoring() {
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Update Score Display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Update Game State
function update() {
    if (!gameRunning) return;
    
    updatePlayerPaddleWithKeys();
    updateComputerPaddle();
    
    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collision detection
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
    checkWallCollision();
    checkScoring();
}

// Draw Functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#1a1a2e');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff88');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff006e');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00d4ff');
    
    // Draw game status
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();