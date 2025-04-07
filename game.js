document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Game variables
    const gridSize = 20;
    const gridWidth = width / gridSize;
    const gridHeight = height / gridSize;
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 150; // milliseconds
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameActive = false;
    
    // DOM elements
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('highScore');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Initialize high score from local storage
    highScoreDisplay.textContent = highScore;
    
    // Initialize game
    function initGame() {
        // Create initial snake (3 segments)
        snake = [
            {x: 8, y: 10},
            {x: 7, y: 10},
            {x: 6, y: 10}
        ];
        
        // Create initial food
        createFood();
        
        // Reset direction and score
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreDisplay.textContent = score;
        
        // Clear any existing game loop
        if (gameLoop) clearInterval(gameLoop);
        
        // Draw initial state
        draw();
    }
    
    // Create food at random position
    function createFood() {
        // Generate random coordinates
        let foodX = Math.floor(Math.random() * gridWidth);
        let foodY = Math.floor(Math.random() * gridHeight);
        
        // Check if food is on snake body
        const isOnSnake = snake.some(segment => {
            return segment.x === foodX && segment.y === foodY;
        });
        
        // If food is on snake, generate new food
        if (isOnSnake) {
            createFood();
        } else {
            food = {x: foodX, y: foodY};
        }
    }
    
    // Update game state
    function update() {
        // Set direction for this update
        direction = nextDirection;
        
        // Create new head based on direction
        const head = {...snake[0]};
        switch(direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for collisions with walls
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOver();
            return;
        }
        
        // Check for collisions with self
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
        
        // Add new head to snake
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreDisplay.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreDisplay.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Create new food
            createFood();
            
            // Speed up game slightly
            if (gameSpeed > 50) {
                gameSpeed -= 2;
                clearInterval(gameLoop);
                gameLoop = setInterval(gameStep, gameSpeed);
            }
        } else {
            // Remove tail if snake didn't eat food
            snake.pop();
        }
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, width, height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize - 1,
                gridSize - 1
            );
        });
        
        // Draw food
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 1,
            gridSize - 1
        );
    }
    
    // Game step function (called by interval)
    function gameStep() {
        update();
        draw();
    }
    
    // Start the game
    function startGame() {
        if (!gameActive) {
            gameActive = true;
            startBtn.textContent = 'Pause';
            gameLoop = setInterval(gameStep, gameSpeed);
        } else {
            gameActive = false;
            startBtn.textContent = 'Resume';
            clearInterval(gameLoop);
        }
    }
    
    // Game over function
    function gameOver() {
        clearInterval(gameLoop);
        gameActive = false;
        startBtn.textContent = 'Start Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', width / 2, height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 40);
    }
    
    // Event listeners
    startBtn.addEventListener('click', () => {
        if (startBtn.textContent === 'Start Game') {
            initGame();
        }
        startGame();
    });
    
    resetBtn.addEventListener('click', () => {
        initGame();
        gameActive = false;
        startBtn.textContent = 'Start Game';
        clearInterval(gameLoop);
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent scrolling with arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        switch(e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                // Space bar to start/pause
                startGame();
                break;
        }
    });
    
    // Touch controls for mobile (swipe detection)
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Check if swipe was horizontal or vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
    }, false);
    
    // Initialize the game at load time
    initGame();
});