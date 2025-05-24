const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const goldElement = document.getElementById('gold');
const playPauseBtn = document.getElementById('playPauseBtn');
const restartBtn = document.getElementById('restartBtn');
const jumpBtn = document.getElementById('jumpBtn');

// Game variables
// Game variables
let bird = {
    x: 50,
    y: 150,
    velocity: 0,
    gravity: 0.20,
    jump: -5,
    size: 10
};

let pipes = [];
let golds = [];
let score = 0;
let gold = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let isPlaying = false;
let isPaused = false;
let pipeGap = 150;
let pipeWidth = 50;
let pipeSpacing = 250;
let pipeSpeed = 1.5;
let lastPipe = 0;

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game loop
function gameLoop() {
    if (isPaused || !isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Generate pipes
     if (canvas.width - lastPipe > pipeSpacing || pipes.length === 0) {
        createPipe();
    }

    // Update elements
    updatePipes();
    updateGolds();
    checkCollisions();

    // Draw elements
    drawBird();
    drawPipes();
    drawGolds();

    requestAnimationFrame(gameLoop);
}

function drawBird() {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
    ctx.fill();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: height,
        passed: false
    });

    pipes.push({
        x: canvas.width,
        y: height + pipeGap,
        width: pipeWidth,
        height: canvas.height - height - pipeGap
    });

    // Create gold with 30% chance
    if (Math.random() < 0.3) {
        golds.push({
            x: canvas.width + 25,
            y: height + pipeGap / 2,
            size: 10,
            collected: false
        });
    }

    lastPipe = canvas.width;
}

function updatePipes() {
    pipes = pipes.filter(pipe => {
        pipe.x -= 2;
        return pipe.x + pipe.width > 0;
    });
}

function updateGolds() {
    golds = golds.filter(goldItem => {
        goldItem.x -= 2;
        return !goldItem.collected && goldItem.x + goldItem.size > 0;
    });
}

function drawPipes() {
    ctx.fillStyle = '#2ecc71';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
    });
}

function drawGolds() {
    ctx.fillStyle = '#FFD700';
    golds.forEach(goldItem => {
        if (!goldItem.collected) {
            ctx.beginPath();
            ctx.arc(goldItem.x, goldItem.y, goldItem.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function checkCollisions() {
    // Boundary collision
    if (bird.y < 0 || bird.y > canvas.height) {
        gameOver();
    }

    // Pipe collision
    pipes.forEach(pipe => {
        if (bird.x + bird.size > pipe.x &&
            bird.x - bird.size < pipe.x + pipe.width &&
            bird.y + bird.size > pipe.y &&
            bird.y - bird.size < pipe.y + pipe.height) {
            gameOver();
        }
    });

    // Gold collection
    golds.forEach(goldItem => {
        if (!goldItem.collected &&
            Math.hypot(bird.x - goldItem.x, bird.y - goldItem.y) < bird.size + goldItem.size) {
            goldItem.collected = true;
            gold++;
            goldElement.textContent = gold;
            score += 5;
            scoreElement.textContent = score;
        }
    });

    // Score counting
    pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            if (pipe.y === 0) {
                score++;
                scoreElement.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('flappyHighScore', highScore);
                }
            }
        }
    });
}

function gameOver() {
    isPlaying = false;
    document.querySelector('.game-menu').style.display = 'block';
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    golds = [];
    score = 0;
    lastPipe = 0;  // Added reset for pipe generation
    scoreElement.textContent = '0';
    document.querySelector('.game-menu').style.display = 'none';
}

// Event listeners
playPauseBtn.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        isPaused = false;
        resetGame();
        gameLoop();
        playPauseBtn.textContent = 'Pause';
    } else {
        isPaused = !isPaused;
        playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
        if (!isPaused) gameLoop();
    }
});

restartBtn.addEventListener('click', () => {
    isPlaying = true;
    isPaused = false;
    resetGame();
    gameLoop();
    playPauseBtn.textContent = 'Pause';
});

// Controls
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && isPlaying && !isPaused) {
        bird.velocity = bird.jump;
    }
});

jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isPlaying && !isPaused) {
        bird.velocity = bird.jump;
    }
});

// Initialize game
highScoreElement.textContent = highScore;
goldElement.textContent = gold;

