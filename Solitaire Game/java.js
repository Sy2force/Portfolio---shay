// Game constants
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = Array.from({ length: 13 }, (_, i) => i + 1); // 1 (Ace) to 13 (King)
const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const VALUE_DISPLAY = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const GAME_TIME = 600; // 10 minutes in seconds

// Game state
const gameState = {
  deck: [],
  waste: [],
  foundations: Array(4).fill().map(() => []),
  tableau: Array(7).fill().map(() => []),
  selection: {
    cards: [],
    source: null
  },
  stats: {
    moves: 0,
    timeRemaining: GAME_TIME,
    gameStarted: false
  },
  timer: null
};

// DOM elements - cached for performance
const domElements = {
  deck: document.getElementById('deck'),
  waste: document.getElementById('waste'),
  foundations: Array(4).fill().map((_, i) => document.getElementById(`foundation-${i + 1}`)),
  tableau: Array(7).fill().map((_, i) => document.getElementById(`tableau-${i + 1}`)),
  stats: {
    moves: document.getElementById('moves'),
    time: document.getElementById('time')
  },
  winMessage: document.getElementById('win-message'),
  finalStats: {
    moves: document.getElementById('final-moves'),
    time: document.getElementById('final-time')
  },
  buttons: {
    newGame: document.getElementById('new-game-btn'),
    playAgain: document.getElementById('play-again-btn')
  }
};

// ===== Game initialization =====
function initGame() {
  resetGameState();
  createDeck();
  shuffleDeck();
  dealCards();
  updateStats();
  renderGame();
  resetTimer();
  startTimer();
}

function resetGameState() {
  gameState.deck = [];
  gameState.waste = [];
  gameState.foundations = Array(4).fill().map(() => []);
  gameState.tableau = Array(7).fill().map(() => []);
  gameState.selection.cards = [];
  gameState.selection.source = null;
  gameState.stats.moves = 0;
  gameState.stats.gameStarted = false;
  gameState.stats.timeRemaining = GAME_TIME;
}

function createDeck() {
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      gameState.deck.push({
        suit,
        value,
        faceUp: false
      });
    });
  });
}

function shuffleDeck() {
  for (let i = gameState.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
  }
}

function dealCards() {
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = gameState.deck.pop();
      card.faceUp = (row === col); // Only the last card is face up
      gameState.tableau[col].push(card);
    }
  }
}

// ===== Rendering functions =====
function renderGame() {
  renderDeck();
  renderWaste();
  gameState.foundations.forEach((_, i) => renderFoundation(i));
  gameState.tableau.forEach((_, i) => renderTableau(i));
}

function renderDeck() {
  domElements.deck.innerHTML = '';
  
  if (gameState.deck.length > 0) {
    const cardBack = document.createElement('div');
    cardBack.className = 'card face-down';
    domElements.deck.appendChild(cardBack);
  }
}

function renderWaste() {
  domElements.waste.innerHTML = '';
  
  if (gameState.waste.length > 0) {
    const card = gameState.waste[gameState.waste.length - 1];
    const cardElement = createCardElement(card);
    domElements.waste.appendChild(cardElement);
  }
}

function renderFoundation(index) {
  const foundationElement = domElements.foundations[index];
  foundationElement.innerHTML = '';
  
  const foundation = gameState.foundations[index];
  if (foundation.length > 0) {
    const card = foundation[foundation.length - 1];
    const cardElement = createCardElement(card);
    foundationElement.appendChild(cardElement);
  }
}

function renderTableau(index) {
  const tableauElement = domElements.tableau[index];
  tableauElement.innerHTML = '';
  
  const column = gameState.tableau[index];
  column.forEach((card, cardIndex) => {
    const cardElement = createCardElement(card);
    cardElement.style.top = `${cardIndex * 20}px`;
    
    if (isCardSelected(card, index, cardIndex)) {
      cardElement.classList.add('selected');
    }
    
    tableauElement.appendChild(cardElement);
  });
}

function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  
  if (card.faceUp) {
    cardElement.classList.add('face-up');
    
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    cardElement.classList.add(isRed ? 'red' : 'black');
    
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // Card values and symbols
    const displayValue = VALUE_DISPLAY[card.value] || card.value.toString();
    const suitSymbol = SUIT_SYMBOLS[card.suit];
    
    // Top value
    const topValue = document.createElement('div');
    topValue.className = 'card-value top';
    topValue.textContent = displayValue + suitSymbol;
    
    // Center symbol
    const centerSuit = document.createElement('div');
    centerSuit.className = 'card-suit';
    centerSuit.textContent = suitSymbol;
    
    // Bottom value
    const bottomValue = document.createElement('div');
    bottomValue.className = 'card-value bottom';
    bottomValue.textContent = displayValue + suitSymbol;
    
    // Assembly
    cardContent.append(topValue, centerSuit, bottomValue);
    cardElement.appendChild(cardContent);
  } else {
    cardElement.classList.add('face-down');
  }
  
  return cardElement;
}

function isCardSelected(card, colIndex, cardIndex) {
  if (gameState.selection.source !== `tableau-${colIndex}`) return false;
  return cardIndex >= gameState.tableau[colIndex].length - gameState.selection.cards.length;
}

// ===== Game stats =====
function updateStats() {
  domElements.stats.moves.textContent = `Moves: ${gameState.stats.moves}`;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(gameState.stats.timeRemaining / 60);
  const seconds = gameState.stats.timeRemaining % 60;
  domElements.stats.time.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
  clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    gameState.stats.timeRemaining--;
    
    if (gameState.stats.timeRemaining <= 0) {
      clearInterval(gameState.timer);
      gameState.stats.timeRemaining = 0;
    }
    
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  clearInterval(gameState.timer);
  gameState.stats.timeRemaining = GAME_TIME;
  updateTimerDisplay();
}

// ===== Game actions =====
function drawCard() {
  if (gameState.deck.length === 0) {
    recycleWaste();
  } else {
    const card = gameState.deck.pop();
    card.faceUp = true;
    gameState.waste.push(card);
    
    incrementMoves();
  }
  
  renderDeck();
  renderWaste();
  
  // Check if all tableau cards are face up
  checkTableauFaceUp();
}

function recycleWaste() {
  if (gameState.waste.length === 0) return;
  
  gameState.deck = gameState.waste.map(card => ({
    ...card,
    faceUp: false
  })).reverse();
  
  gameState.waste = [];
}

function incrementMoves() {
  gameState.stats.moves++;
  gameState.stats.gameStarted = true;
  updateStats();
}

// ===== Card selection =====
function selectWasteCard() {
  if (gameState.waste.length === 0) return;
  
  deselectCards();
  
  gameState.selection.cards = [gameState.waste[gameState.waste.length - 1]];
  gameState.selection.source = 'waste';
  
  renderWaste();
}

function selectFoundationCard(foundationIndex) {
  const foundation = gameState.foundations[foundationIndex];
  if (foundation.length === 0) return;
  
  deselectCards();
  
  gameState.selection.cards = [foundation[foundation.length - 1]];
  gameState.selection.source = `foundation-${foundationIndex}`;
  
  renderFoundation(foundationIndex);
}

function selectTableauCard(colIndex, cardIndex) {
  const column = gameState.tableau[colIndex];
  
  if (!column[cardIndex].faceUp) return;
  
  deselectCards();
  
  gameState.selection.cards = column.slice(cardIndex);
  gameState.selection.source = `tableau-${colIndex}`;
  
  renderTableau(colIndex);
}

function deselectCards() {
  gameState.selection.cards = [];
  gameState.selection.source = null;
  
  renderGame();
}

// ===== Move validation =====
function canPlaceOnFoundation(card, foundationIndex) {
  const foundation = gameState.foundations[foundationIndex];
  
  if (foundation.length === 0) {
    return card.value === 1; // Only Ace can be placed on empty foundation
  } else {
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  }
}

function canPlaceOnTableau(cards, colIndex) {
  if (!cards || cards.length === 0) return false;
  
  const column = gameState.tableau[colIndex];
  
  if (column.length === 0) {
    return cards[0].value === 13; // Only King can be placed on empty column
  } else {
    const topCard = column[column.length - 1];
    const card = cards[0];
    
    const isCardRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const isTopCardRed = topCard.suit === 'hearts' || topCard.suit === 'diamonds';
    
    return isCardRed !== isTopCardRed && card.value === topCard.value - 1;
  }
}

// ===== Move execution =====
function tryMoveToFoundation(foundationIndex) {
  if (gameState.selection.cards.length !== 1) {
    deselectCards();
    return;
  }
  
  const card = gameState.selection.cards[0];
  
  if (canPlaceOnFoundation(card, foundationIndex)) {
    removeSelectedCardsFromSource();
    
    gameState.foundations[foundationIndex].push(card);
    
    incrementMoves();
    checkWinCondition();
  }
  
  deselectCards();
}

function tryMoveToTableau(colIndex) {
  if (gameState.selection.cards.length === 0) return;
  
  if (canPlaceOnTableau(gameState.selection.cards, colIndex)) {
    removeSelectedCardsFromSource();
    
    gameState.tableau[colIndex].push(...gameState.selection.cards);
    
    incrementMoves();
    renderGame();
  }
  
  deselectCards();
}

function removeSelectedCardsFromSource() {
  if (gameState.selection.source === 'waste') {
    gameState.waste.pop();
  } else if (gameState.selection.source.startsWith('foundation-')) {
    const foundationIndex = parseInt(gameState.selection.source.split('-')[1]);
    gameState.foundations[foundationIndex].pop();
  } else if (gameState.selection.source.startsWith('tableau-')) {
    const colIndex = parseInt(gameState.selection.source.split('-')[1]);
    gameState.tableau[colIndex].splice(gameState.tableau[colIndex].length - gameState.selection.cards.length);
    
    // Flip the new top card if needed
    const column = gameState.tableau[colIndex];
    if (column.length > 0 && !column[column.length - 1].faceUp) {
      column[column.length - 1].faceUp = true;
      
      // Check if all cards are now face up
      checkTableauFaceUp();
    }
  }
}

// ===== Game state checks =====
function checkWinCondition() {
  const isWon = gameState.foundations.every(foundation => foundation.length === 13);
  
  if (isWon && gameState.stats.gameStarted) {
    clearInterval(gameState.timer);
    
    const timeSpent = GAME_TIME - gameState.stats.timeRemaining;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    domElements.finalStats.moves.textContent = gameState.stats.moves;
    domElements.finalStats.time.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Show victory message with a small delay to see the animation
    setTimeout(() => {
      domElements.winMessage.classList.remove('hidden');
    }, 1500);
  }
}

// Check if all tableau cards are face up
function checkTableauFaceUp() {
  const allFaceUp = gameState.tableau.every(column => 
    column.every(card => card.faceUp)
  );
  
  if (allFaceUp && gameState.stats.gameStarted) {
    // Trigger auto-completion with a small delay
    setTimeout(autoCompleteGame, 500);
  }
}

function newGame() {
  domElements.winMessage.classList.add('hidden');
  initGame();
}

// Auto-completion function
function autoCompleteGame() {
  // Pause the timer during auto-completion
  clearInterval(gameState.timer);
  
  // Auto-completion animation
  let animationInProgress = false;
  
  const performNextMove = () => {
    // Check if a card can be moved to a foundation
    const validMove = findValidAutoMove();
    
    if (validMove) {
      // Animation in progress
      animationInProgress = true;
      
      // Move the card to the foundation with visual effect
      moveCardWithAnimation(validMove.card, validMove.source, validMove.foundationIndex);
      
      // Schedule the next move
      setTimeout(performNextMove, 300);
    } else if (!animationInProgress) {
      // If no animation and no valid move, check win condition
      checkWinCondition();
      
      // Resume timer
      startTimer();
    } else {
      // No valid move but animation was in progress
      animationInProgress = false;
      
      // Check if game is finished
      checkWinCondition();
      
      // Resume timer
      startTimer();
    }
  };
  
  // Start auto-completion sequence
  performNextMove();
}

// Find a valid move for auto-completion
function findValidAutoMove() {
  // First check the waste card
  if (gameState.waste.length > 0) {
    const wasteCard = gameState.waste[gameState.waste.length - 1];
    
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(wasteCard, i)) {
        return { card: wasteCard, source: 'waste', foundationIndex: i };
      }
    }
  }
  
  // Check tableau cards
  for (let colIndex = 0; colIndex < 7; colIndex++) {
    const column = gameState.tableau[colIndex];
    
    if (column.length > 0) {
      const tableauCard = column[column.length - 1];
      
      for (let i = 0; i < 4; i++) {
        if (canPlaceOnFoundation(tableauCard, i)) {
          return { card: tableauCard, source: `tableau-${colIndex}`, foundationIndex: i };
        }
      }
    }
  }
  
  return null;
}

// Move card with animation for auto-completion
function moveCardWithAnimation(card, source, foundationIndex) {
  // Create temporary card for animation
  const tempCard = createCardElement(card);
  document.body.appendChild(tempCard);
  
  // Starting position
  let startRect;
  if (source === 'waste') {
    startRect = domElements.waste.getBoundingClientRect();
  } else if (source.startsWith('tableau-')) {
    const colIndex = parseInt(source.split('-')[1]);
    startRect = domElements.tableau[colIndex].getBoundingClientRect();
    // Adjust for stacked position
    startRect = {
      ...startRect,
      top: startRect.top + (gameState.tableau[colIndex].length - 1) * 20
    };
  }
  
  // Ending position
  const endRect = domElements.foundations[foundationIndex].getBoundingClientRect();
  
  // Position the temporary card
  tempCard.style.position = 'fixed';
  tempCard.style.left = `${startRect.left}px`;
  tempCard.style.top = `${startRect.top}px`;
  tempCard.style.zIndex = '1000';
  tempCard.classList.add('card-moving-to-foundation');
  
  // Animation
  const animation = tempCard.animate([
    { 
      left: `${startRect.left}px`,
      top: `${startRect.top}px`,
      transform: 'scale(1)',
      opacity: '1'
    },
    { 
      left: `${(startRect.left + endRect.left) / 2}px`,
      top: `${Math.min(startRect.top, endRect.top) - 50}px`,
      transform: 'scale(1.2)',
      opacity: '1',
      offset: 0.5
    },
    { 
      left: `${endRect.left}px`,
      top: `${endRect.top}px`,
      transform: 'scale(1)',
      opacity: '1'
    }
  ], {
    duration: 300,
    easing: 'ease-out'
  });
  
  // Move the real card at the end of animation
  animation.onfinish = () => {
    tempCard.remove();
    
    // Move the card in the model
    if (source === 'waste') {
      gameState.waste.pop();
    } else if (source.startsWith('tableau-')) {
      const colIndex = parseInt(source.split('-')[1]);
      gameState.tableau[colIndex].pop();
      
      // Flip the top card if needed
      if (gameState.tableau[colIndex].length > 0 && !gameState.tableau[colIndex][gameState.tableau[colIndex].length - 1].faceUp) {
        gameState.tableau[colIndex][gameState.tableau[colIndex].length - 1].faceUp = true;
      }
    }
    
    // Add card to foundation
    gameState.foundations[foundationIndex].push(card);
    
    // Increment move counter
    incrementMoves();
    
    // Update display
    renderGame();
  };
}

// ===== Event listeners =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game
  initGame();
  
  // Deck click event
  domElements.deck.addEventListener('click', drawCard);
  
  // Waste click event
  domElements.waste.addEventListener('click', () => {
    if (gameState.selection.cards.length > 0) {
      deselectCards();
    } else {
      selectWasteCard();
    }
  });
  
  // Foundation click events
  domElements.foundations.forEach((element, index) => {
    element.addEventListener('click', () => {
      if (gameState.selection.cards.length > 0) {
        tryMoveToFoundation(index);
      } else {
        selectFoundationCard(index);
      }
    });
  });
  
  // Tableau click events
  domElements.tableau.forEach((element, colIndex) => {
    element.addEventListener('click', (e) => {
      const column = gameState.tableau[colIndex];
      
      if (column.length === 0) {
        if (gameState.selection.cards.length > 0) {
          tryMoveToTableau(colIndex);
        }
        return;
      }
      
      // Find the clicked card
      const rect = element.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      
      // Calculate card index based on vertical position
      const cardIndex = Math.min(Math.floor(relativeY / 20), column.length - 1);
      
      if (gameState.selection.cards.length > 0) {
        tryMoveToTableau(colIndex);
      } else {
        selectTableauCard(colIndex, cardIndex);
      }
    });
  });
  
  // New game button events
  domElements.buttons.newGame.addEventListener('click', newGame);
  domElements.buttons.playAgain.addEventListener('click', newGame);
});