// Get DOM Elements
const gameContainer = document.getElementById('game-container');
const playerCar = document.getElementById('player-car');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const startMessage = document.getElementById('start-message');
const startButton = document.getElementById('start-button');

// Game State Variables
let score = 0;
let isGameOver = true; // Start with game over until Start is clicked
let playerX = playerCar.offsetLeft; // Initial horizontal position
let gameSpeed = 5; // Initial speed of obstacles and road lines
let animationFrameId = null; // To store the requestAnimationFrame ID
let enemyCars = []; // Array to hold enemy car elements
let enemySpawnTimer = 0; // Timer to control enemy spawning
const keysPressed = {}; // Object to track pressed keys

// Enemy Car Colors and SVG definition
const enemyColors = ['red', 'yellow', 'purple', 'orange', 'cyan'];
function getEnemyCarSVG(color) {
    return `
        <svg width="40" height="70" viewBox="0 0 40 70">
            <rect x="5" y="0" width="30" height="60" rx="5" ry="5" fill="${color}"/>
            <rect x="0" y="10" width="5" height="20" rx="2" ry="2" fill="lightgrey"/>
            <rect x="35" y="10" width="5" height="20" rx="2" ry="2" fill="lightgrey"/>
            <rect x="10" y="50" width="20" height="10" rx="3" ry="3" fill="darkgrey"/>
            <rect x="12" y="5" width="16" height="10" fill="grey" rx="2"/> </svg>
    `;
}


// --- Event Listeners ---

// Listen for key presses to move the player
document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true; // Mark key as pressed
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false; // Mark key as released
});

// Restart game when restart button is clicked
restartButton.addEventListener('click', startGame);

// Start game when start button is clicked
startButton.addEventListener('click', startGame);


// --- Game Functions ---

/**
 * Initializes or resets the game state and starts the game loop.
 */
function startGame() {
    console.log("Starting game...");
    // Reset game state
    score = 0;
    isGameOver = false;
    playerX = gameContainer.offsetWidth / 2 - playerCar.offsetWidth / 2; // Center player
    playerCar.style.left = `${playerX}px`;
    gameSpeed = 5; // Reset speed
    enemySpawnTimer = 0; // Reset spawn timer

    // Clear existing enemy cars from DOM and array
    enemyCars.forEach(car => car.remove());
    enemyCars = [];

    // Hide messages and update score display
    gameOverMessage.classList.add('hidden');
    startMessage.classList.add('hidden');
    scoreDisplay.textContent = `Score: ${score}`;
    scoreDisplay.classList.remove('hidden'); // Ensure score is visible

    // Start the game loop
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Cancel previous loop if any
    }
    gameLoop();
    console.log("Game loop started.");
}

/**
 * Creates a new enemy car element and adds it to the game.
 */
function createEnemyCar() {
    const enemyCar = document.createElement('div');
    enemyCar.classList.add('enemy-car');

    // Set random horizontal position within road boundaries
    const gameWidth = gameContainer.offsetWidth;
    // Ensure car stays within the road visually (consider borders)
    const carWidth = 40;
    const minX = 10; // Left border width
    const maxX = gameWidth - carWidth - 10; // Right border width
    const randomX = Math.random() * (maxX - minX) + minX;

    enemyCar.style.left = `${randomX}px`;
    enemyCar.style.top = '-100px'; // Start above the screen

    // Assign a random color using SVG
    const randomColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];
    enemyCar.innerHTML = getEnemyCarSVG(randomColor);

    // Add to the game container and the enemy array
    gameContainer.appendChild(enemyCar);
    enemyCars.push(enemyCar);
    // console.log("Enemy car created at", randomX);
}

/**
 * Moves existing enemy cars down the screen and removes them if they go off-screen.
 */
function moveEnemyCars() {
    enemyCars.forEach((car, index) => {
        let currentTop = parseInt(car.style.top || -100);
        currentTop += gameSpeed; // Move down based on game speed
        car.style.top = `${currentTop}px`;

        // Remove car if it goes off the bottom of the screen
        if (currentTop > gameContainer.offsetHeight) {
            car.remove(); // Remove from DOM
            enemyCars.splice(index, 1); // Remove from array
            // console.log("Enemy car removed.");
        }
    });
}

/**
 * Checks for collision between the player car and any enemy car.
 * @returns {boolean} True if a collision occurred, false otherwise.
 */
function checkCollision() {
    const playerRect = playerCar.getBoundingClientRect();

    for (let car of enemyCars) {
        const enemyRect = car.getBoundingClientRect();

        // Simple Axis-Aligned Bounding Box (AABB) collision detection
        // Check if rectangles overlap
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

/**
 * Updates the player's horizontal position based on pressed keys.
 */
function movePlayer() {
    const moveAmount = 7; // How many pixels to move per frame
    const gameWidth = gameContainer.offsetWidth;
    const playerWidth = playerCar.offsetWidth;

    // Adjust boundaries to account for road borders visually
    const minX = 10; // Left border width
    const maxX = gameWidth - playerWidth - 10; // Right border width

    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        playerX -= moveAmount;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        playerX += moveAmount;
    }

    // Clamp player position within boundaries
    playerX = Math.max(minX, Math.min(playerX, maxX));

    // Update player car's style
    playerCar.style.left = `${playerX}px`;
}

/**
 * The main game loop, run using requestAnimationFrame.
 */
function gameLoop() {
    if (isGameOver) {
        console.log("Game Over condition met in loop.");
        return; // Stop the loop if game is over
    }

    // --- Update Game State ---
    movePlayer();
    moveEnemyCars();

    // --- Spawn Enemies ---
    // Increase spawn rate slightly with score/speed
    const spawnInterval = Math.max(50, 150 - gameSpeed * 5); // Decrease interval as speed increases
    enemySpawnTimer++;
    if (enemySpawnTimer > spawnInterval) {
        createEnemyCar();
        enemySpawnTimer = 0; // Reset timer
    }

    // --- Check for Collisions ---
    if (checkCollision()) {
        console.log("Collision detected!");
        isGameOver = true;
        finalScoreDisplay.textContent = score;
        gameOverMessage.classList.remove('hidden');
        scoreDisplay.classList.add('hidden'); // Hide score during game over
        cancelAnimationFrame(animationFrameId); // Stop the animation loop
        // Optionally stop road animation
        document.querySelectorAll('.road-line').forEach(line => line.style.animationPlayState = 'paused');
        return; // Exit loop immediately
    }

    // --- Update Score and Difficulty ---
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    // Increase game speed gradually based on score
    if (score % 100 === 0 && gameSpeed < 15) { // Increase speed every 100 points (max speed 15)
        gameSpeed += 0.5;
        console.log("Speed increased to:", gameSpeed);
        // Optional: Adjust road animation speed (more complex)
    }

    // --- Request Next Frame ---
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Initial Setup ---
// Hide score initially, show start message
scoreDisplay.classList.add('hidden');
startMessage.classList.remove('hidden');
gameOverMessage.classList.add('hidden'); // Ensure game over is hidden initially

// Pause road animation until game starts
document.querySelectorAll('.road-line').forEach(line => line.style.animationPlayState = 'paused');

console.log("Game initialized. Waiting for start button.");

