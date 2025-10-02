// Game state variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

// New variables for game modes and players
let gameMode = ''; // 'single' or 'two'
let difficulty = 'normal'; // 'normal' or 'hard'
let totalRounds = 5;
let currentRound = 1;
let player1Name = '';
let player2Name = '';
let isComputerTurn = false;
let computerMovesLeft = 0; // For hard difficulty

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const gameMessage = document.getElementById('game-message');
const currentPlayerSpan = document.getElementById('current-player');

// Screen elements
const welcomeScreen = document.getElementById('welcome-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameContainer = document.getElementById('game-container');

// Settings elements
const roundsSlider = document.getElementById('rounds-slider');
const roundsValue = document.getElementById('rounds-value');

// Add click event listeners to all cells
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Rounds slider event listener
roundsSlider.addEventListener('input', function() {
    totalRounds = parseInt(this.value);
    roundsValue.textContent = totalRounds;
});

// Mode selection function
function selectMode(mode) {
    gameMode = mode;
    showSettings();
}

// Show settings screen
function showSettings() {
    welcomeScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
    
    const difficultySection = document.getElementById('difficulty-section');
    const nameInputsDiv = document.getElementById('name-inputs');
    
    // Show/hide difficulty section based on game mode
    if (gameMode === 'single') {
        difficultySection.style.display = 'block';
        nameInputsDiv.innerHTML = `
            <input type="text" id="player1-input" class="name-input" placeholder="Enter your name (optional)" maxlength="20">
            <p style="color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">You'll play as X against the computer</p>
        `;
    } else {
        difficultySection.style.display = 'none';
        nameInputsDiv.innerHTML = `
            <input type="text" id="player1-input" class="name-input" placeholder="Player 1 name (X)" maxlength="20">
            <input type="text" id="player2-input" class="name-input" placeholder="Player 2 name (O)" maxlength="20">
            <p style="color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">Default names will be used if left empty</p>
        `;
    }
}

// Select difficulty
function selectDifficulty(selectedDifficulty) {
    difficulty = selectedDifficulty;
    
    // Update button states
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update difficulty info
    const difficultyInfo = document.getElementById('difficulty-info');
    if (selectedDifficulty === 'normal') {
        difficultyInfo.textContent = 'Computer plays with standard AI';
    } else {
        difficultyInfo.textContent = 'Computer gets two consecutive turns and plays more aggressively';
    }
}

// Back to mode selection function
function backToModeSelection() {
    settingsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    
    // Reset values
    gameMode = '';
    difficulty = 'normal';
    totalRounds = 5;
    player1Name = '';
    player2Name = '';
    
    // Reset slider and difficulty
    roundsSlider.value = 5;
    roundsValue.textContent = '5';
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.difficulty-btn').classList.add('active');
}

// Start the game with entered settings
function startGame() {
    const player1Input = document.getElementById('player1-input').value.trim();
    const player2Input = document.getElementById('player2-input');
    
    if (gameMode === 'single') {
        player1Name = player1Input || 'Player';
        player2Name = 'Computer';
    } else {
        player1Name = player1Input || 'Player 1';
        player2Name = player2Input ? player2Input.value.trim() || 'Player 2' : 'Player 2';
    }
    
    // Show game screen
    settingsScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // Reset game state
    currentRound = 1;
    scores = { X: 0, O: 0, draw: 0 };
    
    // Update UI with game settings
    updateGameInfo();
    initializeGame();
}

// Update game info display
function updateGameInfo() {
    const modeDisplay = document.getElementById('mode-display');
    const difficultyDisplay = document.getElementById('difficulty-display');
    const roundsProgress = document.getElementById('rounds-progress');
    
    modeDisplay.textContent = gameMode === 'single' ? 'Single Player' : 'Two Players';
    
    if (gameMode === 'single') {
        difficultyDisplay.textContent = ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty`;
    } else {
        difficultyDisplay.textContent = '';
    }
    
    roundsProgress.textContent = `Round ${currentRound} of ${totalRounds}`;
    
    // Update player names
    document.getElementById('x-player-name').textContent = `${player1Name} (X)`;
    document.getElementById('o-player-name').textContent = `${player2Name} (O)`;
}

// Initialize game
function initializeGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isComputerTurn = false;
    computerMovesLeft = 0;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
    
    updateGameMessage();
    updateScoreDisplay();
}

// Update game message with current player
function updateGameMessage() {
    const currentPlayerName = currentPlayer === 'X' ? player1Name : player2Name;
    currentPlayerSpan.textContent = currentPlayerName;
    gameMessage.innerHTML = `Current player: <span class="current-player">${currentPlayerName} (${currentPlayer})</span>`;
}

// Handle cell clicks
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (gameBoard[index] !== '' || !gameActive || isComputerTurn) {
        return;
    }

    makeMove(index, cell);
}

// Make a move
function makeMove(index, cell) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');
    cell.classList.add(currentPlayer.toLowerCase());

    if (checkWinner()) {
        gameActive = false;
        highlightWinningCells();
        const winnerName = currentPlayer === 'X' ? player1Name : player2Name;
        gameMessage.innerHTML = `<span class="winner">🎉 ${winnerName} wins this round! 🎉</span>`;
        scores[currentPlayer]++;
        updateScoreDisplay();
        
        setTimeout(() => {
            nextRound();
        }, 2000);
    } else if (gameBoard.every(cell => cell !== '')) {
        gameActive = false;
        gameMessage.innerHTML = `<span class="winner">🤝 Round ${currentRound} is a draw! 🤝</span>`;
        scores.draw++;
        updateScoreDisplay();
        
        setTimeout(() => {
            nextRound();
        }, 2000);
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameMessage();
        
        // Handle computer turn in single player mode
        if (gameMode === 'single' && currentPlayer === 'O' && gameActive) {
            isComputerTurn = true;
            
            if (difficulty === 'hard') {
                computerMovesLeft = 2; // Computer gets 2 moves in hard mode
                makeComputerMoveHard();
            } else {
                setTimeout(makeComputerMove, 800);
            }
        }
    }
}

// Computer makes a move (normal difficulty)
function makeComputerMove() {
    if (!gameActive) return;
    
    const availableMoves = [];
    gameBoard.forEach((cell, index) => {
        if (cell === '') {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length > 0) {
        // Try to win first
        let move = findWinningMove('O');
        // If can't win, try to block player from winning
        if (move === -1) {
            move = findWinningMove('X');
        }
        // If no strategic move, pick random
        if (move === -1) {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        const cell = cells[move];
        isComputerTurn = false;
        makeMove(move, cell);
    }
}

// Computer makes moves in hard difficulty (2 consecutive moves)
function makeComputerMoveHard() {
    if (!gameActive || computerMovesLeft <= 0) {
        isComputerTurn = false;
        return;
    }
    
    const availableMoves = [];
    gameBoard.forEach((cell, index) => {
        if (cell === '') {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length > 0) {
        // Strategic move selection for hard mode
        let move = findWinningMove('O');
        if (move === -1) {
            move = findWinningMove('X');
        }
        if (move === -1) {
            // Prefer center, then corners, then edges
            const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
            for (let preferredMove of preferredMoves) {
                if (availableMoves.includes(preferredMove)) {
                    move = preferredMove;
                    break;
                }
            }
        }
        
        // Make the move
        const cell = cells[move];
        gameBoard[move] = 'O';
        cell.textContent = 'O';
        cell.classList.add('taken');
        cell.classList.add('o');
        
        computerMovesLeft--;
        
        // Check if game ended after this move
        if (checkWinner()) {
            gameActive = false;
            highlightWinningCells();
            gameMessage.innerHTML = `<span class="winner">🎉 ${player2Name} wins this round! 🎉</span>`;
            scores['O']++;
            updateScoreDisplay();
            setTimeout(() => {
                nextRound();
            }, 2000);
            return;
        } else if (gameBoard.every(cell => cell !== '')) {
            gameActive = false;
            gameMessage.innerHTML = `<span class="winner">🤝 Round ${currentRound} is a draw! 🤝</span>`;
            scores.draw++;
            updateScoreDisplay();
            setTimeout(() => {
                nextRound();
            }, 2000);
            return;
        }
        
        // If computer has more moves left and game is still active, make another move
        if (computerMovesLeft > 0 && gameActive) {
            setTimeout(() => {
                makeComputerMoveHard();
            }, 600);
        } else {
            // Switch back to player
            currentPlayer = 'X';
            isComputerTurn = false;
            updateGameMessage();
        }
    } else {
        isComputerTurn = false;
    }
}

// Find winning move for given player
function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const line = [gameBoard[a], gameBoard[b], gameBoard[c]];
        
        // Check if two positions have the player and one is empty
        if (line.filter(cell => cell === player).length === 2 && line.filter(cell => cell === '').length === 1) {
            if (gameBoard[a] === '') return a;
            if (gameBoard[b] === '') return b;
            if (gameBoard[c] === '') return c;
        }
    }
    return -1;
}

// Check for winner
function checkWinner() {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
    });
}

// Highlight winning cells
function highlightWinningCells() {
    winningConditions.forEach(condition => {
        const [a, b, c] = condition;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
        }
    });
}

// Move to next round
function nextRound() {
    currentRound++;
    
    if (currentRound > totalRounds) {
        // Game series finished - determine overall winner
        endGameSeries();
    } else {
        // Continue to next round
        updateGameInfo();
        initializeGame();
    }
}

// End game series and show final results
function endGameSeries() {
    const xWins = scores.X;
    const oWins = scores.O;
    const draws = scores.draw;
    
    let finalMessage = '';
    
    if (xWins > oWins) {
        finalMessage = `<span class="final-winner">🏆 ${player1Name} wins the series! 🏆</span><br>
                      Final Score: ${xWins}-${oWins}${draws > 0 ? `-${draws}` : ''}`;
    } else if (oWins > xWins) {
        finalMessage = `<span class="final-winner">🏆 ${player2Name} wins the series! 🏆</span><br>
                      Final Score: ${oWins}-${xWins}${draws > 0 ? `-${draws}` : ''}`;
    } else {
        finalMessage = `<span class="final-winner">🤝 The series ends in a tie! 🤝</span><br>
                      Final Score: ${xWins}-${oWins}${draws > 0 ? `-${draws}` : ''}`;
    }
    
    gameMessage.innerHTML = finalMessage;
    startNewGameBlink();
}

// Reset current game
function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isComputerTurn = false;
    computerMovesLeft = 0;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });

    // Stop the blinking animation
    stopNewGameBlink();
    updateGameMessage();
}

// Reset scores and start new series
function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    currentRound = 1;
    updateScoreDisplay();
    updateGameInfo();
    initializeGame();
    stopNewGameBlink();
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('x-score').textContent = scores.X;
    document.getElementById('o-score').textContent = scores.O;
    document.getElementById('draw-score').textContent = scores.draw;
}

// Go back to main menu
function backToMenu() {
    gameContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    
    // Stop blinking animation
    stopNewGameBlink();
    
    // Reset everything
    gameMode = '';
    difficulty = 'normal';
    totalRounds = 5;
    currentRound = 1;
    player1Name = '';
    player2Name = '';
    scores = { X: 0, O: 0, draw: 0 };
}

// Start blinking animation on New Game button
function startNewGameBlink() {
    const newGameBtn = document.querySelector('.controls button');
    if (newGameBtn) {
        newGameBtn.classList.add('new-game-blink');
    }
}

// Stop blinking animation on New Game button
function stopNewGameBlink() {
    const newGameBtn = document.querySelector('.controls button');
    if (newGameBtn) {
        newGameBtn.classList.remove('new-game-blink');
    }
}