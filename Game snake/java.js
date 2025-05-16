// Main game module
const SnakeGame = (() => {
  // Game configuration
  const GAME_CONFIG = { // Config
    // Difficulty levels - { grid size, speed, number of enemies }
    difficultySettings: {
      debutant: { 
        speed: 180, 
        enemyCount: 0,
        growthFactor: 1, // How much the snake grows per fruit
        label: "Beginner"
      },
      moyen: { 
        speed: 140, 
        enemyCount: 1,
        growthFactor: 1,
        label: "Medium"
      },
      difficile: { 
        speed: 100, 
        enemyCount: 2,
        growthFactor: 2,
        label: "Hard"
      },
      extreme: { 
        speed: 70, 
        enemyCount: 4,
        growthFactor: 3,
        label: "Extreme"
      }
    },
    
    // Initial configuration
    initialSnakeLength: 4,      // Starting length of snake
    speedIncrease: 3,           // Acceleration per fruit
    minSpeed: 35,               // Maximum speed (smaller = faster)
    enemyMoveChance: 0.25,      // Probability of enemy movement (0-1)
    scoreMultiplier: 10,        // Score multiplier per level
    respectBoundaries: true,    // If true, wall collision = game over
                                // If false, snake reappears on opposite side
    fruitTypes: ["normal", "bonus", "speed"], // Fruit types with probabilities
    fruitProbabilities: [0.8, 0.15, 0.05],    // 80%, 15% and 5%
    bonusPoints: 3,             // Bonus points for special fruits
    speedBoost: 5,              // Speed boost for speed fruits
    gameTickInterval: 1000      // Interval in ms to update the game timer
  };

  // Game state variables
  let state = { // State
    snake: [],                  // Snake body
    food: { type: "normal" },   // Position and type of food
    enemies: [],                // Enemy positions
    direction: "RIGHT",         // Current direction
    nextDirection: "RIGHT",     // Next direction
    gameRunning: false,         // Game state
    gamePaused: false,          // Pause state
    gameOver: false,            // Game over state
    gameLoop: null,             // Game loop
    gameTickLoop: null,         // Timer loop
    score: 0,                   // Current score
    highScore: 0,               // High score
    growthLeft: 0,              // Remaining growth after eating
    gridSize: 20,               // Grid size (modifiable)
    startTime: 0,               // Start time
    currentTime: 0,             // Current time
    totalTimePlayed: 0,         // Total time played (in ms)
    foodEaten: 0,               // Number of standard food eaten
    bonusEaten: 0,              // Number of bonuses eaten
    darkMode: false,            // Dark mode enabled
    fastMode: false             // Indicates if in fast mode (speed fruit)
  };

  // Game settings
  let settings = { // Settings
    currentDifficulty: "moyen",
    difficultySettings: null,
    gameSpeed: 0,
    enemyCount: 0,
    growthFactor: 0,
    snakeColor: "#4ECDC4",
    scoreMultiplier: 0
  };

  // DOM elements cache
  const DOM = {}; // Elements

  /**
   * Initialize the game at startup
   */
  function init() { // Init
    // Get and cache DOM elements
    cacheDOM();
    
    // Load preferences and high score
    loadUserPreferences();
    
    // Set up events
    setupEventListeners();
    
    // Initialize the game
    applyDifficulty();
    resetGame();
    showOverlay("Ready to play?", "Use the arrow keys or buttons to control the snake");
    
    // Check system dark mode
    checkSystemDarkMode();
  }

  /**
   * Retrieve and cache all necessary DOM elements
   */
  function cacheDOM() { // Cache
    // Main elements
    DOM.gameBoard = document.getElementById("game-board");
    DOM.gameOverlay = document.getElementById("game-overlay");
    DOM.overlayTitle = document.getElementById("overlay-title");
    DOM.overlayMessage = document.getElementById("overlay-message");
    DOM.overlayButton = document.getElementById("overlay-button");
    
    // Score and info
    DOM.score = document.getElementById("score").querySelector("span");
    DOM.highScore = document.getElementById("high-score").querySelector("span");
    DOM.levelDisplay = document.getElementById("level-display");
    DOM.speedDisplay = document.getElementById("speed-display");
    
    // Controls
    DOM.startButton = document.getElementById("start-button");
    DOM.pauseButton = document.getElementById("pause-button");
    DOM.resetButton = document.getElementById("reset-button");
    DOM.difficultySelect = document.getElementById("difficulty-select");
    DOM.gridSizeSelect = document.getElementById("grid-size-select");
    DOM.colorPicker = document.getElementById("snake-color");
    DOM.randomColorButton = document.getElementById("random-color");
    
    // Directional controls
    DOM.upButton = document.getElementById("up-button");
    DOM.downButton = document.getElementById("down-button");
    DOM.leftButton = document.getElementById("left-button");
    DOM.rightButton = document.getElementById("right-button");
    
    // Statistics
    DOM.foodEaten = document.getElementById("food-eaten");
    DOM.bonusEaten = document.getElementById("bonus-eaten");
    DOM.timePlayed = document.getElementById("time-played");
    
    // Theme
    DOM.themeToggle = document.getElementById("theme-toggle");
    
    // Ensure all elements exist
    if (!DOM.gameBoard || !DOM.score || !DOM.highScore || !DOM.startButton) {
      console.error("Required DOM elements not found. Check HTML IDs.");
    }
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() { // Events
    // Keyboard controls
    document.addEventListener("keydown", handleKeyPress);
    
    // Directional controls
    DOM.upButton.addEventListener("click", () => setDirection("UP"));
    DOM.downButton.addEventListener("click", () => setDirection("DOWN"));
    DOM.leftButton.addEventListener("click", () => setDirection("LEFT"));
    DOM.rightButton.addEventListener("click", () => setDirection("RIGHT"));
    
    // Game buttons
    DOM.startButton.addEventListener("click", startGame);
    DOM.pauseButton.addEventListener("click", togglePause);
    DOM.resetButton.addEventListener("click", resetGame);
    DOM.overlayButton.addEventListener("click", handleOverlayButton);
    
    // Game options
    DOM.difficultySelect.addEventListener("change", changeDifficulty);
    DOM.gridSizeSelect.addEventListener("change", changeGridSize);
    DOM.colorPicker.addEventListener("input", changeColor);
    DOM.randomColorButton.addEventListener("click", randomizeColor);
    
    // Theme
    DOM.themeToggle.addEventListener("click", toggleDarkMode);
    
    // Touch support for game board
    setupTouchControls();
    
    // Keyboard directional controls
    window.addEventListener("keydown", function(e) {
      // Prevent scrolling with arrow keys
      if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(e.code) > -1) {
        e.preventDefault();
      }
    }, false);
  }

  /**
   * Set up touch controls for the game
   */
  function setupTouchControls() { // Touch
    let touchStartX, touchStartY;
    
    DOM.gameBoard.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });
    
    DOM.gameBoard.addEventListener("touchmove", (e) => {
      e.preventDefault(); // Prevent scrolling during game
    });
    
    DOM.gameBoard.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      
      // If movement is large enough (to avoid small taps)
      const swipeThreshold = 30;
      
      if (Math.abs(diffX) > swipeThreshold || Math.abs(diffY) > swipeThreshold) {
        // If movement is more horizontal than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
          setDirection(diffX > 0 ? "RIGHT" : "LEFT");
        } else {
          setDirection(diffY > 0 ? "DOWN" : "UP");
        }
      }
    });
  }

  /**
   * Load saved user preferences
   */
  function loadUserPreferences() { // Prefs
    // Load high score
    const savedScore = localStorage.getItem("snakeMasterHighScore");
    state.highScore = savedScore ? parseInt(savedScore) : 0;
    
    // Load game preferences
    const savedDifficulty = localStorage.getItem("snakeMasterDifficulty");
    if (savedDifficulty && GAME_CONFIG.difficultySettings[savedDifficulty]) {
      settings.currentDifficulty = savedDifficulty;
      DOM.difficultySelect.value = settings.currentDifficulty;
    }
    
    const savedGridSize = localStorage.getItem("snakeMasterGridSize");
    if (savedGridSize) {
      state.gridSize = parseInt(savedGridSize);
      DOM.gridSizeSelect.value = state.gridSize;
    }
    
    const savedColor = localStorage.getItem("snakeMasterColor");
    if (savedColor) {
      settings.snakeColor = savedColor;
      DOM.colorPicker.value = settings.snakeColor;
    }
    
    const savedDarkMode = localStorage.getItem("snakeMasterDarkMode");
    if (savedDarkMode === "true") {
      state.darkMode = true;
      applyDarkMode();
    }
    
    // Update display
    updateScoreDisplay();
  }

  /**
   * Check if the system is in dark mode
   */
  function checkSystemDarkMode() { // Theme
    // If user already set a preference, respect it
    if (localStorage.getItem("snakeMasterDarkMode") !== null) {
      return;
    }
    
    // Otherwise, check system preferences
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.darkMode = true;
      applyDarkMode();
    }
  }

  /**
   * Apply dark or light mode
   */
  function applyDarkMode() { // Visual
    if (state.darkMode) {
      document.body.classList.add("dark-mode");
      DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.body.classList.remove("dark-mode");
      DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  /**
   * Toggle between dark and light modes
   */
  function toggleDarkMode() { // Toggle
    state.darkMode = !state.darkMode;
    applyDarkMode();
    localStorage.setItem("snakeMasterDarkMode", state.darkMode);
  }

  /**
   * Apply current difficulty settings
   */
  function applyDifficulty() { // Level
    settings.difficultySettings = GAME_CONFIG.difficultySettings[settings.currentDifficulty];
    settings.gameSpeed = settings.difficultySettings.speed;
    settings.enemyCount = settings.difficultySettings.enemyCount;
    settings.growthFactor = settings.difficultySettings.growthFactor;
    
    // Update score multiplier based on difficulty
    switch(settings.currentDifficulty) {
      case "debutant": settings.scoreMultiplier = GAME_CONFIG.scoreMultiplier * 1; break;
      case "moyen": settings.scoreMultiplier = GAME_CONFIG.scoreMultiplier * 2; break;
      case "difficile": settings.scoreMultiplier = GAME_CONFIG.scoreMultiplier * 3; break;
      case "extreme": settings.scoreMultiplier = GAME_CONFIG.scoreMultiplier * 5; break;
    }
    
    // Update level display
    DOM.levelDisplay.textContent = settings.difficultySettings.label;
    updateSpeedDisplay();
  }

  /**
   * Update speed display
   */
  function updateSpeedDisplay() { // Speed
    let speedText = "Normal";
    
    if (state.fastMode) {
      speedText = "Fast";
    } else if (settings.gameSpeed < 90) {
      speedText = "Very fast";
    } else if (settings.gameSpeed < 120) {
      speedText = "Fast";
    } else if (settings.gameSpeed > 160) {
      speedText = "Slow";
    }
    
    DOM.speedDisplay.textContent = speedText;
  }

  /**
   * Change difficulty level
   */
  function changeDifficulty() { // Adjust
    if (state.gameRunning && !state.gamePaused) {
      pauseGame();
    }
    
    settings.currentDifficulty = DOM.difficultySelect.value;
    applyDifficulty();
    localStorage.setItem("snakeMasterDifficulty", settings.currentDifficulty);
    
    // Reset game with new settings
    resetGame();
    showOverlay("Difficulty changed", `Level: ${settings.difficultySettings.label}`);
  }

  /**
   * Change grid size
   */
  function changeGridSize() { // Resize
    if (state.gameRunning && !state.gamePaused) {
      pauseGame();
    }
    
    state.gridSize = parseInt(DOM.gridSizeSelect.value);
    document.documentElement.style.setProperty('--grid-size', state.gridSize);
    localStorage.setItem("snakeMasterGridSize", state.gridSize);
    
    // Reset game with new size
    resetGame();
    showOverlay("Grid size changed", `Grid: ${state.gridSize}×${state.gridSize}`);
  }

  /**
   * Change snake color
   */
  function changeColor() { // Color
    settings.snakeColor = DOM.colorPicker.value;
    document.documentElement.style.setProperty('--snake-color', settings.snakeColor);
    localStorage.setItem("snakeMasterColor", settings.snakeColor);
    
    // Calculate darker color for head
    const darkColor = adjustColorBrightness(settings.snakeColor, -30);
    document.documentElement.style.setProperty('--snake-head', darkColor);
    
    if (state.gameRunning) {
      renderGame();
    }
  }

  /**
   * Generate a random color for the snake
   */
  function randomizeColor() { // Random
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    DOM.colorPicker.value = randomColor;
    changeColor();
    
    // Animate button
    DOM.randomColorButton.classList.add("rotate-animation");
    setTimeout(() => {
      DOM.randomColorButton.classList.remove("rotate-animation");
    }, 500);
  }

  /**
   * Adjust brightness of a hex color
   * @param {string} hexColor - Color in #RRGGBB format
   * @param {number} percent - Adjustment percentage (-100 to 100)
   * @return {string} Adjusted color in #RRGGBB format
   */
  function adjustColorBrightness(hexColor, percent) { // Adjust
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    const adjustedR = Math.max(0, Math.min(255, r + percent));
    const adjustedG = Math.max(0, Math.min(255, g + percent));
    const adjustedB = Math.max(0, Math.min(255, b + percent));

    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleKeyPress(e) { // Input
    // Directions
    switch(e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        setDirection("UP");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        setDirection("DOWN");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        setDirection("LEFT");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        setDirection("RIGHT");
        break;
    }
    
    // Game controls
    switch(e.key) {
      case " ":  // Space
        if (state.gameOver) {
          resetGame();
        } else {
          togglePause();
        }
        break;
      case "p":  // P
      case "P":
        togglePause();
        break;
      case "r":  // R
      case "R":
        resetGame();
        break;
      case "Escape": // Escape
        if (DOM.gameOverlay.classList.contains("hidden")) {
          pauseGame();
          showOverlay("Game paused", "Press Enter to continue", "CONTINUE");
        } else {
          hideOverlay();
          if (!state.gameOver) {
            resumeGame();
          }
        }
        break;
      case "Enter": // Enter
        if (!DOM.gameOverlay.classList.contains("hidden")) {
          handleOverlayButton();
        }
        break;
    }
  }

  /**
   * Handle overlay button action
   */
  function handleOverlayButton() { // Action
    hideOverlay();
    
    if (state.gameOver) {
      resetGame();
    } else if (state.gamePaused) {
      resumeGame();
    } else {
      startGame();
    }
  }

  /**
   * Show overlay with a message
   * @param {string} title - Overlay title
   * @param {string} message - Message to display
   * @param {string} buttonText - Button text (optional)
   */
  function showOverlay(title, message, buttonText = "START") { // Modal
    DOM.overlayTitle.textContent = title;
    DOM.overlayMessage.textContent = message;
    DOM.overlayButton.textContent = buttonText;
    DOM.gameOverlay.classList.remove("hidden");
  }

  /**
   * Hide overlay
   */
  function hideOverlay() { // Hide
    DOM.gameOverlay.classList.add("hidden");
  }

  /**
   * Set snake direction
   * @param {string} newDirection - New direction (UP, DOWN, LEFT, RIGHT)
   */
  function setDirection(newDirection) { // Direction
    // Prevent direct reverse
    if (
      (newDirection === "UP" && state.direction !== "DOWN") ||
      (newDirection === "DOWN" && state.direction !== "UP") ||
      (newDirection === "LEFT" && state.direction !== "RIGHT") ||
      (newDirection === "RIGHT" && state.direction !== "LEFT")
    ) {
      state.nextDirection = newDirection;
    }
    
    // Start game automatically if a direction key is pressed
    if (!state.gameRunning && !state.gameOver) {
      startGame();
    }
  }

  /**
   * Start the game
   */
  function startGame() { // Start
    if (state.gameRunning && !state.gamePaused) return;
    
    if (state.gameOver || state.snake.length === 0) {
      resetGame(false);
    }
    
    state.gameRunning = true;
    state.gamePaused = false;
    state.gameOver = false;
    
    hideOverlay();
    updateButtonStates();
    
    // Create enemies if needed
    resetEnemies();
    
    // Start the timer
    state.startTime = Date.now() - state.totalTimePlayed;
    
    // Start game loops
    state.gameLoop = setInterval(updateGame, settings.gameSpeed);
    state.gameTickLoop = setInterval(updateGameTick, GAME_CONFIG.gameTickInterval);
  }

  /**
   * Pause or resume the game
   */
  function togglePause() { // Toggle
    if (!state.gameRunning) {
      startGame();
      return;
    }
    
    if (state.gamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }

  /**
   * Pause the game
   */
  function pauseGame() { // Pause
    if (!state.gameRunning || state.gameOver) return;
    
    state.gamePaused = true;
    clearInterval(state.gameLoop);
    clearInterval(state.gameTickLoop);
    
    // Save play time so far
    state.totalTimePlayed = Date.now() - state.startTime;
    
    showOverlay("Game paused", "Use Space or press the button to continue", "CONTINUE");
    updateButtonStates();
  }

  /**
   * Resume the game after pause
   */
  function resumeGame() { // Resume
    if (!state.gamePaused || state.gameOver) return;
    
    state.gamePaused = false;
    hideOverlay();
    
    // Reset the start time accounting for time already played
    state.startTime = Date.now() - state.totalTimePlayed;
    
    // Restart loops
    state.gameLoop = setInterval(updateGame, settings.gameSpeed);
    state.gameTickLoop = setInterval(updateGameTick, GAME_CONFIG.gameTickInterval);
    
    updateButtonStates();
  }

  /**
   * Update button states based on game state
   */
  function updateButtonStates() { // Update
    if (state.gameOver) {
      DOM.startButton.innerHTML = '<i class="fas fa-play"></i> PLAY AGAIN';
      DOM.pauseButton.disabled = true;
    } else if (state.gamePaused) {
      DOM.startButton.innerHTML = '<i class="fas fa-play"></i> PLAY';
      DOM.pauseButton.innerHTML = '<i class="fas fa-play"></i> CONTINUE';
      DOM.pauseButton.disabled = false;
    } else if (state.gameRunning) {
      DOM.startButton.innerHTML = '<i class="fas fa-play"></i> PLAY';
      DOM.pauseButton.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
      DOM.pauseButton.disabled = false;
    } else {
      DOM.startButton.innerHTML = '<i class="fas fa-play"></i> PLAY';
      DOM.pauseButton.disabled = true;
    }
  }

  /**
   * Completely reset the game
   * @param {boolean} showWelcome - Show welcome screen
   */
  function resetGame(showWelcome = true) { // Reset
    // Stop previous loops
    clearInterval(state.gameLoop);
    clearInterval(state.gameTickLoop);
    
    // Reset game state
    state.score = 0;
    state.direction = "RIGHT";
    state.nextDirection = "RIGHT";
    state.growthLeft = 0;
    state.gameRunning = false;
    state.gamePaused = false;
    state.gameOver = false;
    state.totalTimePlayed = 0;
    state.foodEaten = 0;
    state.bonusEaten = 0;
    state.fastMode = false;
    
    // Update speed display
    updateSpeedDisplay();
    
    // Reset snake
    state.snake = [];
    const middle = Math.floor(state.gridSize / 2);
    
    for (let i = 0; i < GAME_CONFIG.initialSnakeLength; i++) {
      state.snake.push({
        x: middle - i,
        y: middle
      });
    }
    
    // Generate food and enemies
    generateFood();
    resetEnemies();
    
    // Update display
    updateScoreDisplay();
    updateStatsDisplay();
    renderGame();
    
    // Update button states
    updateButtonStates();
    
    // Show welcome screen
    if (showWelcome) {
      showOverlay("Ready to play?", "Use the arrow keys or buttons to control the snake");
    }
  }

  /**
   * Reset enemies
   */
  function resetEnemies() { // Enemies
    state.enemies = [];
    
    for (let i = 0; i < settings.enemyCount; i++) {
      generateEnemy();
    }
  }

  /**
   * Update game statistics every second
   */
  function updateGameTick() { // Timer
    if (!state.gameRunning || state.gamePaused) return;
    
    state.currentTime = Date.now();
    state.totalTimePlayed = state.currentTime - state.startTime;
    
    updateStatsDisplay();
  }

  /**
   * Update game state on each frame
   */
  function updateGame() { // Loop
    // Use the planned next direction
    state.direction = state.nextDirection;
    
    // Move the snake
    moveSnake();
    
    // Check wall collisions
    if (GAME_CONFIG.respectBoundaries && checkWallCollision()) {
      handleGameOver();
      return;
    }
    
    // Check self collisions
    if (checkSelfCollision()) {
      handleGameOver();
      return;
    }
    
    // Check enemy collisions
    if (checkEnemyCollision()) {
      handleGameOver();
      return;
    }
    
    // Check if snake has eaten
    eatFood();
    
    // Move enemies
    moveEnemies();
    
    // Draw updated game
    renderGame();
  }

  /**
   * Move the snake one cell in the current direction
   */
  function moveSnake() { // Move
    const head = {...state.snake[0]};
    
    switch(state.direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }
    
    // If we're crossing walls
    if (!GAME_CONFIG.respectBoundaries) {
      // Wrap around (teleport to the other side)
      if (head.x < 0) head.x = state.gridSize - 1;
      if (head.x >= state.gridSize) head.x = 0;
      if (head.y < 0) head.y = state.gridSize - 1;
      if (head.y >= state.gridSize) head.y = 0;
    }
    
    state.snake.unshift(head);
    
    // If the snake still needs to grow, don't remove the tail
    if (state.growthLeft > 0) {
      state.growthLeft--;
    } else {
      state.snake.pop();
    }
  }

  /**
   * Move enemies randomly on the board
   */
  function moveEnemies() { // Enemies
    state.enemies.forEach(enemy => {
      // Each enemy has a chance to move each turn
      if (Math.random() < GAME_CONFIG.enemyMoveChance) {
        const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        const oldX = enemy.x;
        const oldY = enemy.y;
        
        switch(randomDirection) {
          case "UP":
            enemy.y = Math.max(0, enemy.y - 1);
            break;
          case "DOWN":
            enemy.y = Math.min(state.gridSize - 1, enemy.y + 1);
            break;
          case "LEFT":
            enemy.x = Math.max(0, enemy.x - 1);
            break;
          case "RIGHT":
            enemy.x = Math.min(state.gridSize - 1, enemy.x + 1);
            break;
        }
        
        // Check if enemy is on the snake or food
        const onSnake = state.snake.some(segment => segment.x === enemy.x && segment.y === enemy.y);
        const onFood = state.food.x === enemy.x && state.food.y === enemy.y;
        
        // If enemy is on something, cancel the movement
        if (onSnake || onFood) {
          enemy.x = oldX;
          enemy.y = oldY;
        }
      }
    });
  }

  /**
   * Check if the snake collides with a wall
   * @return {boolean} True if there's a collision
   */
  function checkWallCollision() { // Boundary
    const head = state.snake[0];
    return (
      head.x < 0 || 
      head.x >= state.gridSize || 
      head.y < 0 || 
      head.y >= state.gridSize
    );
  }

  /**
   * Check if the snake collides with itself
   * @return {boolean} True if there's a collision
   */
  function checkSelfCollision() { // Self
    const head = state.snake[0];
    
    // Check each body segment (except the head)
    for (let i = 1; i < state.snake.length; i++) {
      if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if the snake collides with an enemy
   * @return {boolean} True if there's a collision
   */
  function checkEnemyCollision() { // Enemy
    const head = state.snake[0];
    return state.enemies.some(enemy => head.x === enemy.x && head.y === enemy.y);
  }

  /**
   * Handle when the snake eats food
   */
  function eatFood() { // Eating
    const head = state.snake[0];
    
    if (head.x === state.food.x && head.y === state.food.y) {
      // Determine points based on food type
      let points = 1;
      let growth = settings.growthFactor;
      let speedChange = GAME_CONFIG.speedIncrease;
      
      switch(state.food.type) {
        case "normal":
          state.foodEaten++;
          break;
        case "bonus":
          points = GAME_CONFIG.bonusPoints;
          growth = settings.growthFactor * 2;
          state.bonusEaten++;
          break;
        case "speed":
          speedChange = GAME_CONFIG.speedBoost;
          state.fastMode = true;
          setTimeout(() => {
            state.fastMode = false;
            updateSpeedDisplay();
          }, 5000); // Fast mode lasts 5 seconds
          state.bonusEaten++;
          break;
      }
      
      // Apply growth
      state.growthLeft += growth;
      
      // Generate new food
      generateFood();
      
      // Increase score
      state.score += points * settings.scoreMultiplier;
      updateScoreDisplay();
      updateStatsDisplay();
      
      // Flash visual effect
      DOM.gameBoard.classList.add("food-eaten");
      setTimeout(() => {
        DOM.gameBoard.classList.remove("food-eaten");
      }, 300);
      
      // Slightly increase game speed
      if (settings.gameSpeed > GAME_CONFIG.minSpeed) {
        settings.gameSpeed -= speedChange;
        clearInterval(state.gameLoop);
        state.gameLoop = setInterval(updateGame, settings.gameSpeed);
        
        // Update speed display
        updateSpeedDisplay();
      }
    }
  }

  /**
   * Generate new food at a random position
   */
  function generateFood() { // Food
    let newFood;
    let onSnake;
    let onEnemy;
    
    // Find a free position
    do {
      newFood = {
        x: Math.floor(Math.random() * state.gridSize),
        y: Math.floor(Math.random() * state.gridSize)
      };
      
      onSnake = state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      onEnemy = state.enemies.some(enemy => enemy.x === newFood.x && enemy.y === newFood.y);
    } while (onSnake || onEnemy);
    
    // Determine food type based on probabilities
    const rnd = Math.random();
    let typeIndex = 0;
    let sum = 0;
    
    for (let i = 0; i < GAME_CONFIG.fruitProbabilities.length; i++) {
      sum += GAME_CONFIG.fruitProbabilities[i];
      if (rnd <= sum) {
        typeIndex = i;
        break;
      }
    }
    
    // Apply type
    newFood.type = GAME_CONFIG.fruitTypes[typeIndex];
    state.food = newFood;
  }

  /**
   * Generate a new enemy at a random position
   */
  function generateEnemy() { // Enemy
    let newEnemy;
    let onSnake;
    let onFood;
    let onEnemy;
    let tooCloseToSnake;
    
    // Find a free position not too close to the snake
    do {
      newEnemy = {
        x: Math.floor(Math.random() * state.gridSize),
        y: Math.floor(Math.random() * state.gridSize)
      };
      
      onSnake = state.snake.some(segment => segment.x === newEnemy.x && segment.y === newEnemy.y);
      onFood = state.food.x === newEnemy.x && state.food.y === newEnemy.y;
      onEnemy = state.enemies.some(enemy => enemy.x === newEnemy.x && enemy.y === newEnemy.y);
      
      // Check if enemy is too close to snake (safety distance)
      tooCloseToSnake = state.snake.some(segment => {
        const distance = Math.abs(segment.x - newEnemy.x) + Math.abs(segment.y - newEnemy.y);
        return distance < 3; // Minimum Manhattan distance
      });
      
    } while (onSnake || onFood || onEnemy || tooCloseToSnake);
    
    state.enemies.push(newEnemy);
  }

  /**
   * Update score display
   */
  function updateScoreDisplay() { // Score
    DOM.score.textContent = state.score;
    
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("snakeMasterHighScore", state.highScore);
    }
    
    DOM.highScore.textContent = state.highScore;
  }

  /**
   * Update statistics display
   */
  function updateStatsDisplay() { // Stats
    DOM.foodEaten.textContent = state.foodEaten;
    DOM.bonusEaten.textContent = state.bonusEaten;
    
    // Format time (mm:ss)
    const totalSeconds = Math.floor(state.totalTimePlayed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    DOM.timePlayed.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Handle game over
   */
  function handleGameOver() { // GameOver
    clearInterval(state.gameLoop);
    clearInterval(state.gameTickLoop);
    
    state.gameRunning = false;
    state.gamePaused = false;
    state.gameOver = true;
    
    // Game over visual effect
    DOM.gameBoard.classList.add("game-over");
    setTimeout(() => {
      DOM.gameBoard.classList.remove("game-over");
    }, 1000);
    
    showOverlay("Game Over", `Score: ${state.score} - High score: ${state.highScore}`, "PLAY AGAIN");
    updateButtonStates();
  }

  /**
   * Draw the current game state
   */
  function renderGame() { // Render
    // Clear the board
    DOM.gameBoard.innerHTML = '';
    
    // Draw the snake
    state.snake.forEach((segment, index) => {
      const snakeElement = document.createElement("div");
      
      if (index === 0) {
        // Snake head
        snakeElement.classList.add("snake-head");
        snakeElement.classList.add(`head-${state.direction.toLowerCase()}`);
      } else {
        // Snake body
        snakeElement.classList.add("snake");
        
        // Add "tail" class for the last segment
        if (index === state.snake.length - 1) {
          snakeElement.classList.add("snake-tail");
        }
      }
      
      snakeElement.style.gridRowStart = segment.y + 1;
      snakeElement.style.gridColumnStart = segment.x + 1;
      
      DOM.gameBoard.appendChild(snakeElement);
    });
    
    // Draw the food
    const foodElement = document.createElement("div");
    foodElement.classList.add("food");
    
    // Add class based on food type
    foodElement.classList.add(`food-${state.food.type}`);
    
    foodElement.style.gridRowStart = state.food.y + 1;
    foodElement.style.gridColumnStart = state.food.x + 1;
    DOM.gameBoard.appendChild(foodElement);
    
    // Draw enemies
    state.enemies.forEach(enemy => {
      const enemyElement = document.createElement("div");
      enemyElement.classList.add("enemy");
      enemyElement.style.gridRowStart = enemy.y + 1;
      enemyElement.style.gridColumnStart = enemy.x + 1;
      DOM.gameBoard.appendChild(enemyElement);
    });
  }

  // Public API
  return {
    init
  };
})();

// Initialize the game on DOM load
document.addEventListener("DOMContentLoaded", SnakeGame.init);