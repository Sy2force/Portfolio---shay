// Game configuration
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Game speeds in milliseconds (smaller = faster)
const SPEEDS = {
  1: 800,
  2: 720,
  3: 630,
  4: 550,
  5: 470,
  6: 380,
  7: 300,
  8: 220,
  9: 130,
  10: 100
};

// Tetris pieces definitions
const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    type: 'I'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'J'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'L'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    type: 'O'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    type: 'S'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    type: 'T'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    type: 'Z'
  }
};

// Main game class
class Tetris {
  constructor() {
    // Initialize game properties
    this.board = document.getElementById('board');
    this.nextPieceDisplay = document.querySelector('.next-piece');
    this.scoreElement = document.querySelector('.score-value');
    this.levelElement = document.querySelector('.level-value');
    this.linesElement = document.querySelector('.lines-value');
    this.startButton = document.getElementById('start-button');
    this.restartButton = document.getElementById('restart-button');
    this.pauseOverlay = document.querySelector('.pause-overlay');
    this.gameOverOverlay = document.querySelector('.game-over-overlay');
    this.finalScoreElement = document.querySelector('.final-score');
    
    // Game state
    this.grid = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.gameInterval = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    
    // Initialize game board
    this.initBoard();
    
    // Set up controls
    this.setupControls();
    
    // Add event listeners for buttons
    this.startButton.addEventListener('click', () => this.startGame());
    this.restartButton.addEventListener('click', () => this.restartGame());
    
    // Set up touch controls
    this.setupTouchControls();
  }
  
  // Initialize the game board
  initBoard() {
    // Clear the game board
    this.board.innerHTML = '';
    
    // Add overlays
    this.board.appendChild(this.pauseOverlay);
    this.board.appendChild(this.gameOverOverlay);
    
    // Create empty grid
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    // Create visual cells
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-row', row);
        cell.setAttribute('data-col', col);
        this.board.appendChild(cell);
      }
    }
  }
  
  // Set up keyboard controls
  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (this.isGameOver) return;
      
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
        return;
      }
      
      if (e.key === 'r' || e.key === 'R') {
        this.restartGame();
        return;
      }
      
      if (this.isPaused) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          this.movePiece(-1, 0);
          break;
        case 'ArrowRight':
          this.movePiece(1, 0);
          break;
        case 'ArrowDown':
          this.movePiece(0, 1);
          break;
        case 'ArrowUp':
          this.rotatePiece();
          break;
        case ' ':
          this.hardDrop();
          break;
      }
    });
  }
  
  // Set up touch controls for mobile
  setupTouchControls() {
    const leftButton = document.querySelector('.left-button');
    const rightButton = document.querySelector('.right-button');
    const downButton = document.querySelector('.down-button');
    const rotateButton = document.querySelector('.rotate-button');
    const dropButton = document.querySelector('.drop-button');
    
    leftButton.addEventListener('click', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.movePiece(-1, 0);
      }
    });
    
    rightButton.addEventListener('click', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.movePiece(1, 0);
      }
    });
    
    downButton.addEventListener('click', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.movePiece(0, 1);
      }
    });
    
    rotateButton.addEventListener('click', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.rotatePiece();
      }
    });
    
    dropButton.addEventListener('click', () => {
      if (!this.isPaused && !this.isGameOver) {
        this.hardDrop();
      }
    });
  }
  
  // Start the game
  startGame() {
    if (this.gameInterval) return;
    
    this.resetGame();
    this.generateNewPiece();
    this.startGameLoop();
    this.startButton.textContent = 'RESTART';
    this.startButton.removeEventListener('click', () => this.startGame());
    this.startButton.addEventListener('click', () => this.restartGame());
  }
  
  // Restart the game
  restartGame() {
    this.clearGameInterval();
    this.resetGame();
    this.generateNewPiece();
    this.startGameLoop();
    this.hideGameOverOverlay();
  }
  
  // Reset game state
  resetGame() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isPaused = false;
    this.isGameOver = false;
    
    this.updateScore();
    this.updateLevel();
    this.updateLines();
    this.clearBoard();
  }
  
  // Clear the visual board display
  clearBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.className = 'cell';
    });
  }
  
  // Start the game loop
  startGameLoop() {
    const speed = SPEEDS[this.level];
    this.gameInterval = setInterval(() => {
      if (!this.movePiece(0, 1)) {
        this.lockPiece();
        this.checkLines();
        if (!this.generateNewPiece()) {
          this.gameOver();
        }
      }
    }, speed);
  }
  
  // Stop the game loop
  clearGameInterval() {
    clearInterval(this.gameInterval);
    this.gameInterval = null;
  }
  
  // Generate a new random piece
  generateNewPiece() {
    // If it's the first piece, also generate the next one
    if (!this.nextPiece) {
      this.nextPiece = this.getRandomPiece();
    }
    
    // Next piece becomes the current piece
    this.currentPiece = this.nextPiece;
    
    // Generate a new next piece
    this.nextPiece = this.getRandomPiece();
    
    // Display the next piece
    this.displayNextPiece();
    
    // Position the piece at the top of the board
    this.currentPiece.row = 0;
    this.currentPiece.col = Math.floor(COLS / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    
    // Check if the new piece can be placed
    if (!this.isValidMove(0, 0)) {
      // If the piece can't be placed, the game is over
      return false;
    }
    
    // Draw the piece on the board
    this.drawPiece();
    return true;
  }
  
  // Get a random piece
  getRandomPiece() {
    const types = Object.keys(PIECES);
    const type = types[Math.floor(Math.random() * types.length)];
    const piece = PIECES[type];
    
    return {
      shape: JSON.parse(JSON.stringify(piece.shape)), // Deep copy
      type: piece.type,
      row: 0,
      col: 0
    };
  }
  
  // Display the next piece
  displayNextPiece() {
    // Clear previous display
    this.nextPieceDisplay.innerHTML = '';
    
    // Create a grid for the next piece
    const shape = this.nextPiece.shape;
    const type = this.nextPiece.type;
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = document.createElement('div');
        
        // Check if this cell is part of the piece
        if (shape[row] && shape[row][col]) {
          cell.classList.add('piece', type);
        }
        
        this.nextPieceDisplay.appendChild(cell);
      }
    }
  }
  
  // Draw the current piece on the board
  drawPiece() {
    this.clearPiece();
    
    const { shape, row, col, type } = this.currentPiece;
    
    shape.forEach((rowArray, rowIndex) => {
      rowArray.forEach((value, colIndex) => {
        if (value) {
          const currentRow = row + rowIndex;
          const currentCol = col + colIndex;
          
          if (this.isInBounds(currentRow, currentCol)) {
            const cell = this.getCell(currentRow, currentCol);
            cell.classList.add('piece', type);
          }
        }
      });
    });
  }
  
  // Clear the current piece from the board
  clearPiece() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      if (cell.classList.contains('piece') && !cell.classList.contains('locked')) {
        cell.className = 'cell';
      }
    });
  }
  
  // Move the current piece
  movePiece(deltaCol, deltaRow) {
    if (this.isValidMove(deltaCol, deltaRow)) {
      this.clearPiece();
      this.currentPiece.col += deltaCol;
      this.currentPiece.row += deltaRow;
      this.drawPiece();
      
      // Sound effect for horizontal movements
      if (deltaCol !== 0 && deltaRow === 0) {
        this.playSound('move', 200, 0.05);
      }
      
      return true;
    }
    return false;
  }
  
  // Drop the piece all the way down
  hardDrop() {
    let dropDistance = 0;
    while (this.isValidMove(0, dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      this.clearPiece();
      this.currentPiece.row += dropDistance;
      this.drawPiece();
      
      // Add points for hard drop
      this.addScore(dropDistance * 2);
      
      // Add class for vibration effect
      this.board.classList.add('hard-drop');
      setTimeout(() => {
        this.board.classList.remove('hard-drop');
      }, 100);
      
      // Sound effect for hard drop
      this.playSound('hardDrop', 400, 0.1);
      
      // Lock the piece immediately
      this.lockPiece();
      this.checkLines();
      if (!this.generateNewPiece()) {
        this.gameOver();
      }
    }
  }
  
  // Rotate the piece
  rotatePiece() {
    // O piece doesn't rotate
    if (this.currentPiece.type === 'O') return;
    
    // Save the current shape
    const originalShape = this.currentPiece.shape;
    
    // Create a copy of the shape for rotation
    const shape = JSON.parse(JSON.stringify(originalShape));
    const size = shape.length;
    
    // Perform matrix rotation
    const rotatedShape = Array.from({ length: size }, () => Array(size).fill(0));
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        rotatedShape[col][size - 1 - row] = shape[row][col];
      }
    }
    
    // Save the original piece
    const originalCurrentPiece = JSON.parse(JSON.stringify(this.currentPiece));
    
    // Apply rotation
    this.clearPiece();
    this.currentPiece.shape = rotatedShape;
    
    // Check if rotation is valid
    if (!this.isValidMove(0, 0)) {
      // Try to shift the piece if it's against a wall (wall kick)
      const kicks = [-1, 1, -2, 2];
      let validKick = false;
      
      for (const kick of kicks) {
        if (this.isValidMove(kick, 0)) {
          this.currentPiece.col += kick;
          validKick = true;
          break;
        }
      }
      
      // If no shift works, cancel the rotation
      if (!validKick) {
        this.currentPiece = originalCurrentPiece;
      } else {
        // Sound effect for successful rotation
        this.playSound('rotate', 300, 0.05);
      }
    } else {
      // Sound effect for successful rotation
      this.playSound('rotate', 300, 0.05);
    }
    
    this.drawPiece();
  }
  
  // Lock the current piece into the grid
  lockPiece() {
    const { shape, row, col, type } = this.currentPiece;
    
    shape.forEach((rowArray, rowIndex) => {
      rowArray.forEach((value, colIndex) => {
        if (value) {
          const currentRow = row + rowIndex;
          const currentCol = col + colIndex;
          
          if (this.isInBounds(currentRow, currentCol)) {
            this.grid[currentRow][currentCol] = type;
            
            const cell = this.getCell(currentRow, currentCol);
            cell.classList.add('locked');
          }
        }
      });
    });
    
    // Sound effect for locking
    this.playSound('lock', 400, 0.08);
  }
  
  // Check if a move is valid
  isValidMove(deltaCol, deltaRow) {
    const { shape, row, col } = this.currentPiece;
    
    for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
      for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const newRow = row + rowIndex + deltaRow;
          const newCol = col + colIndex + deltaCol;
          
          // Check if the new position is within bounds
          if (!this.isInBounds(newRow, newCol)) {
            return false;
          }
          
          // Check if the new position is already occupied
          if (this.isOccupied(newRow, newCol)) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
  
  // Check if a position is within board boundaries
  isInBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }
  
  // Check if a position is occupied
  isOccupied(row, col) {
    return this.grid[row][col] !== 0;
  }
  
  // Get a cell element from its coordinates
  getCell(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  }
  
  // Check and clear complete lines
  checkLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (this.grid[row].every(cell => cell !== 0)) {
        // The line is complete
        this.animateClearLine(row);
        linesCleared++;
        
        // Shift all lines above downward
        for (let r = row; r > 0; r--) {
          this.grid[r] = [...this.grid[r - 1]];
        }
        
        // Create a new empty line at the top
        this.grid[0] = Array(COLS).fill(0);
        
        // Since lines are shifted, we stay on the same index
        row++;
      }
    }
    
    // Award points based on number of lines cleared
    if (linesCleared > 0) {
      // Classic Tetris scoring system
      const points = [0, 100, 300, 500, 800];
      this.addScore(points[linesCleared] * this.level);
      
      // Update line count
      this.lines += linesCleared;
      this.updateLines();
      
      // Sound effect for clearing lines
      this.playSound('lineClear', 600, 0.1, 0.3);
      
      // Update level
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = Math.min(newLevel, 10); // Max level 10
        this.updateLevel();
        
        // Update speed
        this.updateSpeed();
      }
      
      // Update visual display after a delay for animation
      setTimeout(() => {
        this.updateVisualGrid();
      }, 300);
    } else {
      // If no line is cleared, update immediately
      this.updateVisualGrid();
    }
  }
  
  // Animate line clearing
  animateClearLine(row) {
    for (let col = 0; col < COLS; col++) {
      const cell = this.getCell(row, col);
      cell.classList.add('clearing');
    }
  }
  
  // Update the visual grid display
  updateVisualGrid() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const value = this.grid[row][col];
        const cell = this.getCell(row, col);
        
        cell.className = 'cell';
        
        if (value !== 0) {
          cell.classList.add('piece', value, 'locked');
        }
      }
    }
  }
  
  // Add points to score
  addScore(points) {
    this.score += points;
    this.updateScore();
    
    // Add score animation
    this.scoreElement.classList.add('highlight');
    setTimeout(() => {
      this.scoreElement.classList.remove('highlight');
    }, 300);
  }
  
  // Update score display
  updateScore() {
    this.scoreElement.textContent = this.score;
  }
  
  // Update level display
  updateLevel() {
    this.levelElement.textContent = this.level;
  }
  
  // Update lines display
  updateLines() {
    this.linesElement.textContent = this.lines;
  }
  
  // Update game speed
  updateSpeed() {
    clearInterval(this.gameInterval);
    const speed = SPEEDS[this.level];
    this.gameInterval = setInterval(() => {
      if (!this.movePiece(0, 1)) {
        this.lockPiece();
        this.checkLines();
        if (!this.generateNewPiece()) {
          this.gameOver();
        }
      }
    }, speed);
  }
  
  // Handle game pausing
  togglePause() {
    if (this.isGameOver) return;
    
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Pause the game
      clearInterval(this.gameInterval);
      this.pauseOverlay.style.display = 'flex';
    } else {
      // Resume the game
      this.pauseOverlay.style.display = 'none';
      this.startGameLoop();
    }
  }
  
  // Display game over screen
  gameOver() {
    this.isGameOver = true;
    clearInterval(this.gameInterval);
    this.gameInterval = null;
    
    // Update and display final score
    this.finalScoreElement.textContent = this.score;
    this.gameOverOverlay.style.display = 'flex';
    
    // Game over sound effect
    this.playGameOverSound();
  }
  
  // Hide game over overlay
  hideGameOverOverlay() {
    this.gameOverOverlay.style.display = 'none';
  }
  
  // Play a simple sound using Web Audio API
  playSound(type, frequency, volume, duration = 0.1) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      let oscillatorType = 'sine';
      
      switch(type) {
        case 'move':
          oscillatorType = 'sine';
          break;
        case 'rotate':
          oscillatorType = 'sine';
          break;
        case 'lock':
          oscillatorType = 'square';
          break;
        case 'lineClear':
          oscillatorType = 'sawtooth';
          break;
        case 'hardDrop':
          oscillatorType = 'square';
          break;
      }
      
      oscillator.type = oscillatorType;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      // Fade out the sound gradually
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      // Stop the oscillator after duration
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, duration * 1000);
    } catch (e) {
      console.warn('Web Audio API not supported by this browser');
    }
  }
  
  // Play game over sound
  playGameOverSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Descending sequence
      const notes = [600, 500, 400, 300, 200];
      let delay = 0;
      
      notes.forEach(freq => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = freq;
          gainNode.gain.value = 0.1;
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          
          // Fade out the sound gradually
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
          
          // Stop the oscillator after duration
          setTimeout(() => {
            oscillator.stop();
          }, 200);
        }, delay);
        delay += 150;
      });
      
      // Close audio context after sequence
      setTimeout(() => {
        audioContext.close();
      }, delay + 200);
    } catch (e) {
      console.warn('Web Audio API not supported by this browser');
    }
  }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  const tetris = new Tetris();
  
  // Add flicker effect to title
  const title = document.querySelector('h1');
  setInterval(() => {
    const randomValue = Math.random();
    if (randomValue < 0.1) {
      title.style.opacity = '0.7';
      setTimeout(() => {
        title.style.opacity = '1';
      }, 100);
    }
  }, 500);
  
  // Grid effects (optional)
  const gridEffect = () => {
    const cells = document.querySelectorAll('.cell:not(.piece)');
    const randomCells = Array.from(cells).filter(() => Math.random() < 0.01);
    
    randomCells.forEach(cell => {
      cell.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      setTimeout(() => {
        cell.style.backgroundColor = '';
      }, 300);
    });
  };
  
  // Apply grid effect periodically
  setInterval(gridEffect, 500);
});