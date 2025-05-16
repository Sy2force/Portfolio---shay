document.addEventListener('DOMContentLoaded', () => {
    // CONSTANTS
    const ROWS = 6;
    const COLS = 7;
    const WIN_LENGTH = 4;
    const TIMER_SECONDS = 10;
    const RED = 'red';
    const YELLOW = 'yellow';
    
    // ELEMENTS
    const elements = {
        gameBoard: document.getElementById('game-board'),
        columnIndicators: document.getElementById('column-indicators'),
        gameMessage: document.getElementById('game-message'),
        timer: document.getElementById('timer'),
        scorePlayer1: document.getElementById('score-player1'),
        scorePlayer2: document.getElementById('score-player2'),
        historyPlayer1: document.getElementById('history-player1'),
        historyPlayer2: document.getElementById('history-player2'),
        totalGames: document.getElementById('total-games'),
        avgMoves: document.getElementById('avg-moves'),
        bestTime: document.getElementById('best-time'),
        totalDraws: document.getElementById('total-draws'),
        sessionGames: document.getElementById('session-games'),
        newGameBtn: document.getElementById('new-game-btn'),
        resetScoreBtn: document.getElementById('reset-score-btn')
    };
    
    // STATE
    let gameBoard = createEmptyBoard();
    let currentPlayer = RED;
    let gameActive = true;
    let winningCells = [];
    let scores = loadScores();
    let stats = loadStats();
    let timeLeft = TIMER_SECONDS;
    let timerInterval;
    let moveCount = 0;
    let musicPlaying = false;
    let sessionGames = 0;
    
    // INITIALIZATION
    initGame();
    
    /**
     * Initialize the game
     */
    function initGame() {
        createBoard();
        updateScoreDisplay();
        updateStatsDisplay();
        setupEventListeners();
        startTimer();
        updatePlayerIndicator();
    }
    
    /**
     * Create an empty board
     */
    function createEmptyBoard() {
        return Array(COLS).fill().map(() => Array(ROWS).fill(null));
    }
    
    /**
     * Create the game board in the DOM
     */
    function createBoard() {
        elements.gameBoard.innerHTML = '';
        elements.columnIndicators.innerHTML = '';
        
        // INDICATORS
        for (let col = 0; col < COLS; col++) {
            const indicator = document.createElement('div');
            indicator.className = 'column-indicator';
            indicator.dataset.column = col;
            indicator.dataset.key = col + 1;
            elements.columnIndicators.appendChild(indicator);
        }
        
        // CELLS
        for (let row = ROWS - 1; row >= 0; row--) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.column = col;
                elements.gameBoard.appendChild(cell);
            }
        }
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // COLUMNS
        elements.columnIndicators.addEventListener('click', handleColumnClick);
        elements.columnIndicators.addEventListener('mouseover', handleColumnHover);
        elements.columnIndicators.addEventListener('mouseout', handleColumnOut);
        
        // BUTTONS
        elements.newGameBtn.addEventListener('click', () => {
            playSoundEffect('button');
            resetGame();
        });
        
        elements.resetScoreBtn.addEventListener('click', () => {
            playSoundEffect('button');
            resetScores();
        });
        
        // KEYBOARD
        document.addEventListener('keydown', handleKeyPress);
        
        // BOARD
        elements.gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('cell-red') && !e.target.classList.contains('cell-yellow')) {
                const column = parseInt(e.target.dataset.column);
                makeMove(column);
            }
        });
    }
    
    /**
     * Handle keyboard input
     */
    function handleKeyPress(e) {
        // NUMBERS
        if (e.key >= '1' && e.key <= '7' && gameActive) {
            const column = parseInt(e.key) - 1;
            if (column >= 0 && column < COLS) {
                makeMove(column);
            }
        }
        
        // SHORTCUTS
        switch(e.key.toLowerCase()) {
            case 'n':
                playSoundEffect('button');
                resetGame();
                break;
                
            case 'r':
                playSoundEffect('button');
                resetScores();
                break;
                
            case 'm':
                toggleMusic();
                break;
                
            case 'escape':
                showHelp();
                break;
        }
    }
    
    /**
     * Toggle background music
     */
    function toggleMusic() {
        if (musicPlaying) {
            SOUNDS.music.pause();
            musicPlaying = false;
            showNotification('Music Off');
        } else {
            SOUNDS.music.loop = true;
            SOUNDS.music.volume = 0.5;
            SOUNDS.music.play().catch(e => console.log('Music playback prevented: ', e));
            musicPlaying = true;
            showNotification('Music On');
        }
    }
    
    /**
     * Show help overlay
     */
    function showHelp() {
        const helpOverlay = document.createElement('div');
        helpOverlay.className = 'help-overlay';
        helpOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(9, 4, 34, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        const helpContent = document.createElement('div');
        helpContent.className = 'help-content';
        helpContent.style.cssText = `
            background: var(--panel-bg);
            border-radius: 15px;
            border: 2px solid var(--neon-blue);
            box-shadow: 0 0 30px var(--neon-blue);
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        helpContent.innerHTML = `
            <h2 style="text-align: center; color: var(--neon-blue); margin-bottom: 20px; text-shadow: 0 0 10px var(--neon-blue);">HOW TO PLAY</h2>
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--neon-cyan); margin-bottom: 10px;">Game Rules</h3>
                <ul style="padding-left: 20px; line-height: 1.5;">
                    <li>Take turns dropping tokens into the grid</li>
                    <li>Connect 4 of your tokens in a row (horizontal, vertical, or diagonal) to win</li>
                    <li>Each player has 10 seconds to make a move</li>
                </ul>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--neon-cyan); margin-bottom: 10px;">Controls</h3>
                <ul style="padding-left: 20px; line-height: 1.5;">
                    <li><strong>Mouse:</strong> Click on a column to drop your token</li>
                    <li><strong>Keyboard:</strong> Press keys 1-7 to drop in corresponding column</li>
                    <li><strong>N key:</strong> New Game</li>
                    <li><strong>R key:</strong> Reset Scores</li>
                    <li><strong>M key:</strong> Toggle Music</li>
                    <li><strong>ESC key:</strong> Show/Hide Help</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="close-help" style="
                    padding: 8px 20px;
                    background: transparent;
                    border: 2px solid var(--neon-purple);
                    color: var(--neon-purple);
                    border-radius: 5px;
                    font-family: 'Orbitron', sans-serif;
                    cursor: pointer;
                    font-weight: bold;
                    box-shadow: 0 0 10px var(--neon-purple);
                ">CLOSE</button>
            </div>
        `;
        
        helpOverlay.appendChild(helpContent);
        document.body.appendChild(helpOverlay);
        
        // CLOSE
        document.getElementById('close-help').addEventListener('click', () => {
            helpOverlay.style.opacity = '0';
            helpOverlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => helpOverlay.remove(), 300);
        });
        
        // OUTSIDE
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.style.opacity = '0';
                helpOverlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => helpOverlay.remove(), 300);
            }
        });
        
        // ESCAPE
        const escCloseHandler = (e) => {
            if (e.key === 'Escape') {
                helpOverlay.style.opacity = '0';
                helpOverlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    helpOverlay.remove();
                    document.removeEventListener('keydown', escCloseHandler);
                }, 300);
            }
        };
        
        document.addEventListener('keydown', escCloseHandler);
    }
    
    /**
     * Handle column click
     */
    function handleColumnClick(e) {
        if (e.target.classList.contains('column-indicator')) {
            const column = parseInt(e.target.dataset.column);
            makeMove(column);
        }
    }
    
    /**
     * Handle column hover
     */
    function handleColumnHover(e) {
        if (e.target.classList.contains('column-indicator') && gameActive) {
            const column = parseInt(e.target.dataset.column);
            const row = findLowestEmptyRow(column);
            
            // PREVIEW
            if (row !== -1) {
                e.target.classList.add('active');
                showPreview(column, row);
            }
        }
    }
    
    /**
     * Handle column mouseout
     */
    function handleColumnOut(e) {
        if (e.target.classList.contains('column-indicator')) {
            e.target.classList.remove('active');
            removePreview();
        }
    }
    
    /**
     * Show a token preview
     */
    function showPreview(column, row) {
        removePreview();
        
        const cell = document.querySelector(`.cell[data-column="${column}"][data-row="${row}"]`);
        if (cell) {
            cell.classList.add(`cell-${currentPlayer}`, 'preview');
        }
    }
    
    /**
     * Remove preview
     */
    function removePreview() {
        document.querySelectorAll('.cell.preview').forEach(cell => {
            cell.classList.remove(`cell-${currentPlayer}`, 'cell-red', 'cell-yellow', 'preview');
        });
    }
    
    /**
     * Make a move in the specified column
     */
    function makeMove(column) {
        if (!gameActive) return;
        
        const row = findLowestEmptyRow(column);
        if (row === -1) return; // Column is full
        
        // UPDATE
        gameBoard[column][row] = currentPlayer;
        moveCount++;
        
        // CLEANUP
        removePreview();
        
        // PLACE
        placePiece(column, row);
        
        // SOUND
        playSoundEffect('drop');
        
        // CHECK
        if (checkWin(column, row)) {
            endGame(false);
        } else if (checkDraw()) {
            endGame(true);
        } else {
            switchPlayer();
            resetTimer();
        }
    }
    
    /**
     * Find the lowest empty row
     */
    function findLowestEmptyRow(column) {
        for (let row = 0; row < ROWS; row++) {
            if (gameBoard[column][row] === null) {
                return row;
            }
        }
        return -1; // Column is full
    }
    
    /**
     * Place a token with animation
     */
    function placePiece(column, row) {
        const cell = document.querySelector(`.cell[data-column="${column}"][data-row="${row}"]`);
        cell.classList.add(`cell-${currentPlayer}`);
        cell.classList.add('drop-animation');
        
        // ANIMATION
        setTimeout(() => {
            cell.classList.remove('drop-animation');
        }, 700);
    }
    
    /**
     * Check for a win
     */
    function checkWin(column, row) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal /
            [1, -1]  // Diagonal \
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            let cells = [{column, row}];
            
            // POSITIVE
            for (let i = 1; i < WIN_LENGTH; i++) {
                const newCol = column + dx * i;
                const newRow = row + dy * i;
                
                if (isValidCell(newCol, newRow) && gameBoard[newCol][newRow] === currentPlayer) {
                    count++;
                    cells.push({column: newCol, row: newRow});
                } else {
                    break;
                }
            }
            
            // NEGATIVE
            for (let i = 1; i < WIN_LENGTH; i++) {
                const newCol = column - dx * i;
                const newRow = row - dy * i;
                
                if (isValidCell(newCol, newRow) && gameBoard[newCol][newRow] === currentPlayer) {
                    count++;
                    cells.push({column: newCol, row: newRow});
                } else {
                    break;
                }
            }
            
            // WINNER
            if (count >= WIN_LENGTH) {
                winningCells = cells;
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if cell is valid
     */
    function isValidCell(column, row) {
        return column >= 0 && column < COLS && row >= 0 && row < ROWS;
    }
    
    /**
     * Check for a draw
     */
    function checkDraw() {
        return gameBoard.every(column => column[ROWS - 1] !== null);
    }
    
    /**
     * End the game
     */
    function endGame(isDraw) {
        gameActive = false;
        clearInterval(timerInterval);
        sessionGames++;
        
        // STATS
        stats.totalGames++;
        stats.totalMoves += moveCount;
        
        if (isDraw) {
            elements.gameMessage.textContent = 'DRAW!';
            playSoundEffect('lose');
            stats.draws++;
        } else {
            const winner = currentPlayer === RED ? 'PLAYER 1' : 'PLAYER 2';
            elements.gameMessage.textContent = `${winner} WINS!`;
            
            // HIGHLIGHT
            highlightWinningCells();
            
            // SCORES
            if (currentPlayer === RED) {
                scores.player1++;
                
                // FLASH
                flashScore(elements.scorePlayer1, elements.historyPlayer1);
            } else {
                scores.player2++;
                
                // FLASH
                flashScore(elements.scorePlayer2, elements.historyPlayer2);
            }
            
            // VICTORY
            createConfettiEffect();
            playSoundEffect('win');
            
            // BESTTIME
            const moveTime = TIMER_SECONDS - timeLeft;
            if (!stats.bestTime || moveTime < stats.bestTime) {
                stats.bestTime = moveTime;
            }
        }
        
        // UPDATE
        updateScoreDisplay();
        updateStatsDisplay();
        saveScores();
        saveStats();
    }
    
    /**
     * Create a flashy animation for the updated score
     */
    function flashScore(scoreElement, historyElement) {
        // ANIMATION
        const pulseAnimation = [
            { transform: 'scale(1)', textShadow: '0 0 5px currentColor', offset: 0 },
            { transform: 'scale(1.5)', textShadow: '0 0 20px currentColor', offset: 0.5 },
            { transform: 'scale(1)', textShadow: '0 0 5px currentColor', offset: 1 }
        ];
        
        scoreElement.animate(pulseAnimation, {
            duration: 1000,
            iterations: 2
        });
        
        historyElement.animate(pulseAnimation, {
            duration: 1000,
            iterations: 2
        });
    }
    
    /**
     * Highlight winning cells
     */
    function highlightWinningCells() {
        winningCells.forEach(({column, row}, index) => {
            setTimeout(() => {
                const cell = document.querySelector(`.cell[data-column="${column}"][data-row="${row}"]`);
                if (cell) {
                    cell.classList.add('winning');
                }
            }, index * 150);
        });
    }
    
    /**
     * Create confetti effect
     */
    function createConfettiEffect() {
        const colors = currentPlayer === RED ? 
            ['#ff003c', '#ff5b79', '#ff8c9e', '#ffb6c1'] : 
            ['#ffdf00', '#ffeb3b', '#fff176', '#fff9c4'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = Math.random() * 100 + 'vw';
                const size = Math.random() * 8 + 5 + 'px';
                const duration = Math.random() * 3 + 2 + 's';
                
                Object.assign(confetti.style, {
                    backgroundColor: color,
                    left: left,
                    width: size,
                    height: size,
                    animation: `confetti-fall ${duration} linear forwards`,
                    animationDelay: (Math.random() * 1) + 's'
                });
                
                document.body.appendChild(confetti);
                
                // CLEANUP
                setTimeout(() => {
                    confetti.remove();
                }, parseFloat(duration) * 1000 + 1000);
            }, i * 20);
        }
    }
    
    /**
     * Play sound effect
     */
    function playSoundEffect(sound) {
        try {
            SOUNDS[sound].currentTime = 0;
            SOUNDS[sound].play().catch(e => console.log('Sound playback prevented: ', e));
        } catch (e) {
            console.log('Sound not available', e);
        }
    }
    
    /**
     * Switch player
     */
    function switchPlayer() {
        currentPlayer = currentPlayer === RED ? YELLOW : RED;
        updatePlayerIndicator();
    }
    
    /**
     * Update active player indicator
     */
    function updatePlayerIndicator() {
        // RESET
        document.querySelectorAll('.player').forEach(player => {
            player.classList.remove('active');
        });
        
        // ACTIVE
        const players = document.querySelectorAll('.player');
        const activePlayerIndex = currentPlayer === RED ? 0 : 1;
        if (players[activePlayerIndex]) {
            players[activePlayerIndex].classList.add('active');
        }
    }
    
    /**
     * Start timer
     */
    function startTimer() {
        timeLeft = TIMER_SECONDS;
        updateTimerDisplay();
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                // TIMEOUT
                clearInterval(timerInterval);
                elements.gameMessage.textContent = "TIME'S UP!";
                
                // DELAY
                setTimeout(() => {
                    elements.gameMessage.textContent = "";
                    switchPlayer();
                    resetTimer();
                }, 800);
            }
        }, 1000);
    }
    
    /**
     * Reset timer
     */
    function resetTimer() {
        clearInterval(timerInterval);
        startTimer();
    }
    
    /**
     * Update timer display
     */
    function updateTimerDisplay() {
        elements.timer.textContent = timeLeft;
        
        // WARNING
        elements.timer.className = 'neon-timer';
        if (timeLeft <= 5 && timeLeft > 2) {
            elements.timer.classList.add('warning');
        } else if (timeLeft <= 2) {
            elements.timer.classList.add('danger');
        }
    }
    
    /**
     * Reset game
     */
    function resetGame() {
        // STATE
        gameBoard = createEmptyBoard();
        currentPlayer = RED;
        gameActive = true;
        winningCells = [];
        moveCount = 0;
        
        // INTERFACE
        createBoard();
        elements.gameMessage.textContent = '';
        updatePlayerIndicator();
        
        // TIMER
        resetTimer();
    }
    
    /**
     * Reset scores
     */
    function resetScores() {
        // CONFIRM
        if (confirm('Are you sure you want to reset all scores and statistics?')) {
            scores = { player1: 0, player2: 0 };
            stats = {
                totalGames: 0,
                totalMoves: 0,
                bestTime: null,
                draws: 0
            };
            sessionGames = 0;
            
            updateScoreDisplay();
            updateStatsDisplay();
            saveScores();
            saveStats();
            resetGame();
            
            showNotification('Scores and Stats Reset!');
        }
    }
    
    /**
     * Update score display
     */
    function updateScoreDisplay() {
        elements.scorePlayer1.textContent = scores.player1;
        elements.scorePlayer2.textContent = scores.player2;
        elements.historyPlayer1.textContent = scores.player1;
        elements.historyPlayer2.textContent = scores.player2;
        elements.sessionGames.textContent = sessionGames;
    }
    
    /**
     * Update stats display
     */
    function updateStatsDisplay() {
        elements.totalGames.textContent = stats.totalGames;
        elements.totalDraws.textContent = stats.draws;
        
        // AVERAGE
        const avgMoves = stats.totalGames > 0 
            ? Math.round((stats.totalMoves / stats.totalGames) * 10) / 10
            : 0;
        elements.avgMoves.textContent = avgMoves;
        
        // BESTTIME
        elements.bestTime.textContent = stats.bestTime 
            ? `${stats.bestTime}s`
            : '--';
    }
    
    /**
     * Save scores
     */
    function saveScores() {
        localStorage.setItem('connect4Scores', JSON.stringify(scores));
        showSaveNotification();
    }
    
    /**
     * Save game statistics
     */
    function saveStats() {
        localStorage.setItem('connect4Stats', JSON.stringify(stats));
    }
    
    /**
     * Load scores
     */
    function loadScores() {
        const savedScores = localStorage.getItem('connect4Scores');
        const scores = savedScores ? JSON.parse(savedScores) : { player1: 0, player2: 0 };
        
        // WELCOME
        if (savedScores && (scores.player1 > 0 || scores.player2 > 0)) {
            setTimeout(() => {
                showNotification(`Scores Loaded: Player 1 (${scores.player1}) - Player 2 (${scores.player2})`);
            }, 1000);
        }
        
        return scores;
    }
    
    /**
     * Load game statistics
     */
    function loadStats() {
        const savedStats = localStorage.getItem('connect4Stats');
        return savedStats ? JSON.parse(savedStats) : {
            totalGames: 0,
            totalMoves: 0,
            bestTime: null,
            draws: 0
        };
    }
    
    /**
     * Show save notification
     */
    function showSaveNotification() {
        showNotification('Game Saved!');
    }
    
    /**
     * Show a notification
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 184, 255, 0.2);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            border: 1px solid var(--neon-blue);
            box-shadow: 0 0 10px var(--neon-blue);
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.3s forwards, fadeOut 0.5s forwards 1.5s;
        `;
        
        // REMOVE
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
});