// DOM Elements
const gameContainer = document.getElementById('game-container');
const playerCountSelect = document.getElementById('player-count');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-game');
const currentPlayerElement = document.getElementById('current-player');
const playerScoresElement = document.getElementById('player-scores');
const gameMessageElement = document.getElementById('game-message');

// Game Variables
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let isProcessing = false;
let playerCount = 2;
let currentPlayer = 0;
let playerScores = [];
let totalPairs = 10;
let gameStarted = false;

// Card Emojis
const emojis = ['🚀', '🎮', '🎨', '🎸', '🏆', '🌈', '🍕', '🐱', '🚲', '🌮', 
                '🦄', '🎭', '🍦', '🌟', '🦊', '🎪', '🥁', '🏄', '🏀', '🎯'];

// Card Class
class Card {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.element = null;
    }
    
    // Create DOM element
    createCardElement() {
        // Create card structure
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = this.id;
        
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = this.value;
        
        // Assemble structure
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardElement.appendChild(cardInner);
        
        // Add event listener
        cardElement.addEventListener('click', () => this.flip());
        
        this.element = cardElement;
        return cardElement;
    }
    
    // Flip card
    flip() {
        // Check if processing or already flipped
        if (isProcessing || 
            this.element.classList.contains('flipped') || 
            this.element.classList.contains('matched')) {
            return;
        }
        
        // Flip card
        this.element.classList.add('flipped');
        
        // Add to flipped cards list
        flippedCards.push(this);
        
        // Check if two cards are flipped
        if (flippedCards.length === 2) {
            isProcessing = true;
            
            // Check if cards match
            setTimeout(() => {
                checkForMatch();
            }, 600);
        }
    }
}

// Initialize game
function initGame() {
    // Remove victory effects
    removeVictoryEffects();
    
    // Reset variables
    gameContainer.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    isProcessing = false;
    currentPlayer = 0;
    gameStarted = true;
    
    // Get game parameters
    playerCount = parseInt(playerCountSelect.value);
    
    // Set difficulty
    switch(difficultySelect.value) {
        case 'easy':
            totalPairs = 6;
            break;
        case 'medium':
            totalPairs = 10;
            break;
        case 'hard':
            totalPairs = 15;
            break;
    }
    
    // Initialize player scores
    playerScores = Array(playerCount).fill(0);
    updatePlayerScores();
    updateCurrentPlayer();
    
    // Create cards
    createCards();
    
    // Add title animation
    document.querySelector('h1').classList.add('victory-shake');
    setTimeout(() => {
        document.querySelector('h1').classList.remove('victory-shake');
    }, 800);
    
    // Clear previous message
    gameMessageElement.textContent = 'Find the pairs!';
}

// Create cards
function createCards() {
    // Create pairs array
    let cardPairs = [];
    for (let i = 0; i < totalPairs; i++) {
        // Create two cards with same value
        cardPairs.push(new Card(i * 2, emojis[i]));
        cardPairs.push(new Card(i * 2 + 1, emojis[i]));
    }
    
    // Shuffle cards
    shuffleArray(cardPairs);
    
    // Add cards to container
    cardPairs.forEach((card, index) => {
        const cardElement = card.createCardElement();
        gameContainer.appendChild(cardElement);
        cards.push(card);
        
        // Card appearance effect
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8)';
        setTimeout(() => {
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1)';
        }, index * 30);
    });
}

// Check for matching cards
function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    // Check if values match
    if (card1.value === card2.value) {
        // Cards match
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        // Increment current player score
        playerScores[currentPlayer]++;
        
        // Increment pairs counter
        matchedPairs++;
        
        // Display message
        gameMessageElement.textContent = `${card1.value} Pair found!`;
        
        // Check if game is over
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        // Cards don't match
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
        
        // Next player's turn
        currentPlayer = (currentPlayer + 1) % playerCount;
        updateCurrentPlayer();
        
        // Display message
        gameMessageElement.textContent = 'No match. Next player\'s turn!';
    }
    
    // Update scores
    updatePlayerScores();
    
    // Reset flipped cards
    flippedCards = [];
    isProcessing = false;
}

// Update current player display
function updateCurrentPlayer() {
    currentPlayerElement.textContent = `Player ${currentPlayer + 1}'s turn`;
}

// Update player scores display
function updatePlayerScores() {
    playerScoresElement.innerHTML = '';
    
    for (let i = 0; i < playerCount; i++) {
        const playerScoreElement = document.createElement('div');
        playerScoreElement.classList.add('player-score');
        if (i === currentPlayer && gameStarted) {
            playerScoreElement.classList.add('active');
        }
        playerScoreElement.textContent = `Player ${i + 1}: ${playerScores[i]}`;
        playerScoresElement.appendChild(playerScoreElement);
    }
}

// End game
function endGame() {
    gameStarted = false;
    
    // Find winner
    let maxScore = Math.max(...playerScores);
    let winners = [];
    
    for (let i = 0; i < playerCount; i++) {
        if (playerScores[i] === maxScore) {
            winners.push(i + 1);
        }
    }
    
    // Display end message
    if (winners.length === 1) {
        gameMessageElement.innerHTML = `<span class="winner">Player ${winners[0]} won with ${maxScore} pairs!</span>`;
    } else {
        gameMessageElement.innerHTML = `<span class="winner">Tie between Players ${winners.join(', ')} with ${maxScore} pairs each!</span>`;
    }
    
    // Trigger victory effects
    showVictoryEffects(winners, maxScore);
}

// Victory effects
function showVictoryEffects(winners, score) {
    // Create elements for victory effects
    
    // 1. Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);
    
    // 2. Create confetti
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confetti.style.animationDuration = `${3 + Math.random() * 5}s`;
        confettiContainer.appendChild(confetti);
    }
    
    // 3. Create victory overlay
    const victoryOverlay = document.createElement('div');
    victoryOverlay.classList.add('victory-overlay');
    document.body.appendChild(victoryOverlay);
    
    // 4. Create victory modal
    const victoryModal = document.createElement('div');
    victoryModal.classList.add('victory-modal');
    
    // Modal content
    const trophy = document.createElement('div');
    trophy.classList.add('victory-trophy');
    trophy.textContent = '🏆';
    
    const title = document.createElement('h2');
    if (winners.length === 1) {
        title.textContent = `Player ${winners[0]} wins!`;
    } else {
        title.textContent = `It's a tie!`;
    }
    
    const message = document.createElement('p');
    if (winners.length === 1) {
        message.textContent = `Congratulations! You found ${score} pairs!`;
    } else {
        message.textContent = `Players ${winners.join(', ')} all found ${score} pairs!`;
    }
    
    const button = document.createElement('button');
    button.classList.add('victory-button');
    button.textContent = 'New Game';
    button.addEventListener('click', () => {
        removeVictoryEffects();
        initGame();
    });
    
    // Assemble modal
    victoryModal.appendChild(trophy);
    victoryModal.appendChild(title);
    victoryModal.appendChild(message);
    victoryModal.appendChild(button);
    document.body.appendChild(victoryModal);
    
    // Activate effects with delay for animation
    setTimeout(() => {
        document.body.classList.add('victory-active');
    }, 500);
    
    // Add animation to game title
    document.querySelector('h1').classList.add('victory-shake');
    
    // Make all cards shimmer
    cards.forEach(card => {
        card.element.classList.add('matched');
    });
}

// Remove victory effects
function removeVictoryEffects() {
    // Remove victory class from body
    document.body.classList.remove('victory-active');
    
    // Remove confetti elements
    const confettiContainer = document.querySelector('.confetti-container');
    if (confettiContainer) {
        confettiContainer.remove();
    }
    
    // Remove victory overlay
    const victoryOverlay = document.querySelector('.victory-overlay');
    if (victoryOverlay) {
        victoryOverlay.remove();
    }
    
    // Remove victory modal
    const victoryModal = document.querySelector('.victory-modal');
    if (victoryModal) {
        victoryModal.remove();
    }
    
    // Remove card animations
    cards.forEach(card => {
        if (card.element) {
            card.element.classList.remove('matched');
        }
    });
    
    // Remove title animation
    document.querySelector('h1').classList.remove('victory-shake');
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Event listeners
startButton.addEventListener('click', initGame);

// Initialize player scores on load
updatePlayerScores();

// Start message
gameMessageElement.textContent = 'Click "New Game" to start';