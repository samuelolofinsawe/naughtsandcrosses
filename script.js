function makeComputerMoveHard() {
    if (!gameActive || computerMovesLeft <= 0) {
        isComputerTurn = false;
        return;
    }
    
    const availableMoves = [];
    gameBoard.forEach((cell, index) => {
        if (cell === '' && !blockedCells.includes(index)) {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length > 0) {
        let move = findWinningMove('O');
        if (move === -1) move = findWinningMove('X');
        if (move === -1) {
            if (boardSize === 3) {
                const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
                for (let preferredMove of preferredMoves) {
                    if (availableMoves.includes(preferredMove)) {
                        move = preferredMove;
                        break;
                    }
                }
            } else {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }
        
        const cells = document.querySelectorAll('.cell');
        const cell = cells[move];
        gameBoard[move] = 'O';
        cell.textContent = 'O';
        cell.classList.add('taken', 'o');
        createParticles('O', cell);
        
        computerMovesLeft--;
        
        if (checkWinner()) {
            gameActive = false;
            highlightWinningCells();
            gameMessage.innerHTML = `<span class="winner">🎉 ${player2Name} wins this round! 🎉</span>`;
            scores['O']++;
            updateScoreDisplay();
            setTimeout(() => nextRound(), 2000);
            return;
        } else if (gameBoard.every((cell, idx) => cell !== '' || blockedCells.includes(idx))) {
            gameActive = false;
            gameMessage.innerHTML = `<span class="winner">🤝 Round ${currentRound} is a draw! 🤝</span>`;
            scores.draw++;
            updateScoreDisplay();
            setTimeout(() => nextRound(), 2000);
            return;
        }
        
        if (computerMovesLeft > 0 && gameActive) {
            setTimeout(() => makeComputerMoveHard(), 600);
        } else {
            currentPlayer = 'X';
            isComputerTurn = false;
            updateGameMessage();
            updatePowerupDisplay();
        }
    } else {
        isComputerTurn = false;
    }
}// Game state variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

// Game settings
let gameMode = '';
let difficulty = 'normal';
let totalRounds = 5;
let currentRound = 1;
let player1Name = '';
let player2Name = '';
let isComputerTurn = false;
let computerMovesLeft = 0;
let powerupsEnabled = true;

// Power-up system
let powerups = {
    X: {
        undo: 2,
        block: 2,
        double: 1,
        freeze: 1,
        swap: 1,
        expand: 1
    },
    O: {
        undo: 2,
        block: 2,
        double: 1,
        freeze: 1,
        swap: 1,
        expand: 1
    }
};

let activePowerup = null;
let blockedCells = [];
let frozenPlayer = null;
let lastMove = null;
let moveHistory = [];
let comboCount = 0;
let boardSize = 3; // Track current board size
let expandedThisRound = false;

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
const welcomeScreen = document.getElementById('welcome-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameContainer = document.getElementById('game-container');
const roundsSlider = document.getElementById('rounds-slider');
const roundsValue = document.getElementById('rounds-value');

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

roundsSlider.addEventListener('input', function() {
    totalRounds = parseInt(this.value);
    roundsValue.textContent = totalRounds;
});

function selectMode(mode) {
    gameMode = mode;
    showSettings();
}

function showSettings() {
    welcomeScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
    
    const difficultySection = document.getElementById('difficulty-section');
    const nameInputsDiv = document.getElementById('name-inputs');
    
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

function selectDifficulty(selectedDifficulty) {
    difficulty = selectedDifficulty;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const difficultyInfo = document.getElementById('difficulty-info');
    if (selectedDifficulty === 'normal') {
        difficultyInfo.textContent = 'Computer plays with standard AI';
    } else {
        difficultyInfo.textContent = 'Computer gets two consecutive turns and plays more aggressively';
    }
}

function togglePowerups(enabled) {
    powerupsEnabled = enabled;
    document.querySelectorAll('.powerup-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function backToModeSelection() {
    settingsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    gameMode = '';
    difficulty = 'normal';
    totalRounds = 5;
    powerupsEnabled = true;
    roundsSlider.value = 5;
    roundsValue.textContent = '5';
}

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
    
    settingsScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    currentRound = 1;
    scores = { X: 0, O: 0, draw: 0 };
    
    // Initialize power-ups based on total rounds
    initializePowerupsForSeries();
    
    if (powerupsEnabled) {
        document.getElementById('powerups-display').style.display = 'block';
    } else {
        document.getElementById('powerups-display').style.display = 'none';
    }
    
    updateGameInfo();
    initializeGame();
    saveGameState();
}

function initializePowerupsForSeries() {
    // Calculate power-ups based on number of rounds
    // More conservative distribution - scales slowly with rounds
    let undoCount, blockCount, doubleCount, freezeCount, swapCount;
    
    if (totalRounds <= 3) {
        undoCount = 1;
        blockCount = 1;
        doubleCount = 0;
        freezeCount = 0;
        swapCount = 0;
    } else if (totalRounds <= 5) {
        undoCount = 1;
        blockCount = 0;
        doubleCount = 1;
        freezeCount = 0;
        swapCount = 1;
    } else if (totalRounds <= 7) {
        undoCount = 1;
        blockCount = 1;
        doubleCount = 1;
        freezeCount = 1;
        swapCount = 1;
    } else {
        undoCount = 2;
        blockCount = 2;
        doubleCount = 1;
        freezeCount = 1;
        swapCount = 1;
    }
    
    powerups = {
        X: {
            undo: undoCount,
            block: blockCount,
            double: doubleCount,
            freeze: freezeCount,
            swap: swapCount,
            expand: 1  // Trump card - always 1 regardless of rounds
        },
        O: {
            undo: undoCount,
            block: blockCount,
            double: doubleCount,
            freeze: freezeCount,
            swap: swapCount,
            expand: 1  // Trump card - always 1 regardless of rounds
        }
    };
}

function updateGameInfo() {
    const modeDisplay = document.getElementById('mode-display');
    const difficultyDisplay = document.getElementById('difficulty-display');
    const roundsProgress = document.getElementById('rounds-progress');
    
    modeDisplay.textContent = gameMode === 'single' ? '🤖 Single Player' : '👥 Two Players';
    
    if (gameMode === 'single') {
        difficultyDisplay.textContent = ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty`;
    } else {
        difficultyDisplay.textContent = '';
    }
    
    roundsProgress.textContent = `Round ${currentRound} of ${totalRounds}`;
    document.getElementById('x-player-name').textContent = `${player1Name} (X)`;
    document.getElementById('o-player-name').textContent = `${player2Name} (O)`;
}

function initializeGame() {
    currentPlayer = 'X';
    gameActive = true;
    isComputerTurn = false;
    computerMovesLeft = 0;
    activePowerup = null;
    blockedCells = [];
    frozenPlayer = null;
    lastMove = null;
    moveHistory = [];
    expandedThisRound = false;
    
    // Reset board to 3x3
    // Only reset board if there's no saved game
    
        boardSize = 3;
        gameBoard = new Array(boardSize * boardSize).fill('');
    
    createBoard();

    
    // Don't reset power-ups - they persist across rounds
    
    updateGameMessage();
    updateScoreDisplay();
    updatePowerupDisplay();
}

function createBoard() {
    const gameBoard_div = document.getElementById('game-board');
    gameBoard_div.innerHTML = '';
    
    // Create appropriate board size
   if ( !gameBoard || gameBoard.length !== boardSize * boardSize) {
    gameBoard = new Array(boardSize * boardSize).fill('');
}

    
    // Update grid template
    gameBoard_div.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    gameBoard_div.setAttribute('data-size', boardSize);
    
    // Create cells
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoard_div.appendChild(cell);
    }
    
    // Update winning conditions based on board size
    updateWinningConditions();
}

function updateWinningConditions() {
    winningConditions.length = 0;
    
    // Rows
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            row.push(i * boardSize + j);
        }
        winningConditions.push(row);
    }
    
    // Columns
    for (let i = 0; i < boardSize; i++) {
        const col = [];
        for (let j = 0; j < boardSize; j++) {
            col.push(j * boardSize + i);
        }
        winningConditions.push(col);
    }
    
    // Diagonals
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < boardSize; i++) {
        diag1.push(i * boardSize + i);
        diag2.push(i * boardSize + (boardSize - 1 - i));
    }
    winningConditions.push(diag1);
    winningConditions.push(diag2);
}

function updateGameMessage() {
    const currentPlayerName = currentPlayer === 'X' ? player1Name : player2Name;
    
    if (frozenPlayer === currentPlayer) {
        gameMessage.innerHTML = `<span style="color: #3498db;">❄️ ${currentPlayerName} is frozen! Turn skipped ❄️</span>`;
        setTimeout(() => {
            frozenPlayer = null;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameMessage();
            
            if (gameMode === 'single' && currentPlayer === 'O') {
                isComputerTurn = true;
                setTimeout(makeComputerMove, 800);
            }
        }, 1500);
        return;
    }
    
    currentPlayerSpan.textContent = currentPlayerName;
    gameMessage.innerHTML = `Current player: <span class="current-player">${currentPlayerName} (${currentPlayer})</span>`;
}

function updatePowerupDisplay() {
    if (!powerupsEnabled) return;
    
    const powerupGrid = document.getElementById('powerup-grid');
    const playerPowerups = powerups[currentPlayer];
    
    powerupGrid.innerHTML = `
        <div class="powerup-item ${playerPowerups.undo > 0 ? '' : 'disabled'} ${activePowerup === 'undo' ? 'active' : ''}" onclick="selectPowerup('undo')">
            <div class="powerup-icon">↩️</div>
            <div class="powerup-name">Undo</div>
            ${playerPowerups.undo > 0 ? `<div class="powerup-count">${playerPowerups.undo}</div>` : ''}
        </div>
        <div class="powerup-item ${playerPowerups.block > 0 ? '' : 'disabled'} ${activePowerup === 'block' ? 'active' : ''}" onclick="selectPowerup('block')">
            <div class="powerup-icon">🚫</div>
            <div class="powerup-name">Block</div>
            ${playerPowerups.block > 0 ? `<div class="powerup-count">${playerPowerups.block}</div>` : ''}
        </div>
        <div class="powerup-item ${playerPowerups.double > 0 ? '' : 'disabled'} ${activePowerup === 'double' ? 'active' : ''}" onclick="selectPowerup('double')">
            <div class="powerup-icon">⚡</div>
            <div class="powerup-name">Double</div>
            ${playerPowerups.double > 0 ? `<div class="powerup-count">${playerPowerups.double}</div>` : ''}
        </div>
        <div class="powerup-item ${playerPowerups.freeze > 0 ? '' : 'disabled'} ${activePowerup === 'freeze' ? 'active' : ''}" onclick="selectPowerup('freeze')">
            <div class="powerup-icon">❄️</div>
            <div class="powerup-name">Freeze</div>
            ${playerPowerups.freeze > 0 ? `<div class="powerup-count">${playerPowerups.freeze}</div>` : ''}
        </div>
        <div class="powerup-item ${playerPowerups.swap > 0 ? '' : 'disabled'} ${activePowerup === 'swap' ? 'active' : ''}" onclick="selectPowerup('swap')">
            <div class="powerup-icon">🔄</div>
            <div class="powerup-name">Swap</div>
            ${playerPowerups.swap > 0 ? `<div class="powerup-count">${playerPowerups.swap}</div>` : ''}
        </div>
        <div class="powerup-item trump-card ${playerPowerups.expand > 0 ? '' : 'disabled'} ${activePowerup === 'expand' ? 'active' : ''}" onclick="selectPowerup('expand')">
            <div class="powerup-icon">🃏</div>
            <div class="powerup-name">Expand</div>
            ${playerPowerups.expand > 0 ? `<div class="powerup-count">${playerPowerups.expand}</div>` : ''}
        </div>
    `;
}

function selectPowerup(powerup) {
    if (!powerupsEnabled || !gameActive || isComputerTurn) return;
    if (powerups[currentPlayer][powerup] <= 0) return;
    
    if (activePowerup === powerup) {
        activePowerup = null;
    } else {
        activePowerup = powerup;
        
        if (powerup === 'undo') {
            usePowerupUndo();
            return;
        } else if (powerup === 'freeze') {
            usePowerupFreeze();
            return;
        } else if (powerup === 'swap') {
            usePowerupSwap();
            return;
        } else if (powerup === 'expand') {
            usePowerupExpand();
            return;
        }
    }
    
    updatePowerupDisplay();
}

function usePowerupExpand() {
    if (expandedThisRound && boardSize >= 5) {
        // Can't expand beyond 5x5
        activePowerup = null;
        updatePowerupDisplay();
        return;
    }
    
    // Expand the board
    boardSize++;
    expandedThisRound = true;
    
    // Save current board state
    const oldBoardState = [...gameBoard];
    const oldBoardSize = boardSize - 1;
    
    // Create new expanded board
    createBoard();
    
    // Copy old positions to new board (top-left corner)
    for (let i = 0; i < oldBoardSize; i++) {
        for (let j = 0; j < oldBoardSize; j++) {
            const oldIndex = i * oldBoardSize + j;
            const newIndex = i * boardSize + j;
            gameBoard[newIndex] = oldBoardState[oldIndex];
            
            const cell = document.querySelector(`[data-index="${newIndex}"]`);
            if (oldBoardState[oldIndex]) {
                cell.textContent = oldBoardState[oldIndex];
                cell.classList.add('taken', oldBoardState[oldIndex].toLowerCase());
            }
        }
    }
    
    // Copy blocked cells
    const newBlockedCells = [];
    blockedCells.forEach(oldIndex => {
        const row = Math.floor(oldIndex / oldBoardSize);
        const col = oldIndex % oldBoardSize;
        const newIndex = row * boardSize + col;
        newBlockedCells.push(newIndex);
        document.querySelector(`[data-index="${newIndex}"]`).classList.add('blocked');
    });
    blockedCells = newBlockedCells;
    
    powerups[currentPlayer].expand--;
    activePowerup = null;
    
    const expandMessage = boardSize === 4 ? 'Board expanded to 4×4! 🃏' : 'Board expanded to 5×5! 🃏🃏';
    gameMessage.innerHTML = `<span style="color: #667eea; font-weight: 700;">${expandMessage}</span>`;
    
    createParticles('🃏', gameContainer);
    
    setTimeout(() => {
        updateGameMessage();
    }, 1500);
    
    updatePowerupDisplay();
    saveGameState();
}

function usePowerupUndo() {
    if (moveHistory.length === 0) {
        activePowerup = null;
        updatePowerupDisplay();
        return;
    }
    
    const lastMove = moveHistory.pop();
    const cells = document.querySelectorAll('.cell');
    gameBoard[lastMove.index] = '';
    cells[lastMove.index].textContent = '';
    cells[lastMove.index].classList.remove('taken', 'x', 'o');
    
    powerups[currentPlayer].undo--;
    activePowerup = null;
    createParticles('↩️', cells[lastMove.index]);
    updatePowerupDisplay();
    saveGameState();
}

function usePowerupFreeze() {
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    frozenPlayer = opponent;
    powerups[currentPlayer].freeze--;
    activePowerup = null;
    
    createParticles('❄️', gameContainer);
    updatePowerupDisplay();
    
    currentPlayer = opponent;
    updateGameMessage();
    saveGameState();
}

function usePowerupSwap() {
    const xPositions = [];
    const oPositions = [];
    
    gameBoard.forEach((cell, index) => {
        if (cell === 'X') xPositions.push(index);
        if (cell === 'O') oPositions.push(index);
    });
    
    const cells = document.querySelectorAll('.cell');
    
    xPositions.forEach(index => {
        gameBoard[index] = 'O';
        cells[index].textContent = 'O';
        cells[index].classList.remove('x');
        cells[index].classList.add('o');
    });
    
    oPositions.forEach(index => {
        gameBoard[index] = 'X';
        cells[index].textContent = 'X';
        cells[index].classList.remove('o');
        cells[index].classList.add('x');
    });
    
    powerups[currentPlayer].swap--;
    activePowerup = null;
    createParticles('🔄', gameContainer);
    updatePowerupDisplay();
    saveGameState();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (!gameActive || isComputerTurn) return;
    if (blockedCells.includes(index)) return;
    
    if (activePowerup === 'block') {
        if (gameBoard[index] === '') {
            usePowerupBlock(index, cell);
        }
        return;
    }
    
    if (gameBoard[index] !== '') return;

    makeMove(index, cell);
    
}

function usePowerupBlock(index, cell) {
    blockedCells.push(index);
    cell.classList.add('blocked');
    powerups[currentPlayer].block--;
    activePowerup = null;
    
    createParticles('🚫', cell);
    updatePowerupDisplay();
    saveGameState();
}

function makeMove(index, cell) {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('taken');
    cell.classList.add(currentPlayer.toLowerCase());
    
    moveHistory.push({ index, player: currentPlayer });
    lastMove = { index, player: currentPlayer };
    
    createParticles(currentPlayer, cell);

    if (checkWinner()) {
        gameActive = false;
        highlightWinningCells();
        const winnerName = currentPlayer === 'X' ? player1Name : player2Name;
        gameMessage.innerHTML = `<span class="winner">🎉 ${winnerName} wins this round! 🎉</span>`;
        scores[currentPlayer]++;
        comboCount++;
        showCombo();
        updateScoreDisplay();
        saveGameState();
        setTimeout(() => {
            nextRound();
        }, 2000);
    } else if (gameBoard.every((cell, idx) => cell !== '' || blockedCells.includes(idx))) {
        gameActive = false;
        gameMessage.innerHTML = `<span class="winner">🤝 Round ${currentRound} is a draw! 🤝</span>`;
        scores.draw++;
        comboCount = 0;
        updateScoreDisplay();
        saveGameState();  

        setTimeout(() => {
            nextRound();
        }, 2000);
    } else {
        let doubleTurn = activePowerup === 'double';
        
        if (doubleTurn) {
            powerups[currentPlayer].double--;
            activePowerup = null;
            updatePowerupDisplay();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameMessage();
            updatePowerupDisplay();
        }
        saveGameState();  

        
        if (gameMode === 'single' && currentPlayer === 'O' && gameActive && !doubleTurn) {
            isComputerTurn = true;
            
            if (difficulty === 'hard') {
                computerMovesLeft = 2;
                makeComputerMoveHard();
            } else {
                setTimeout(makeComputerMove, 800);
            }
        }
    }
}

function makeComputerMove() {
    if (!gameActive) return;
    
    const availableMoves = [];
    gameBoard.forEach((cell, index) => {
        if (cell === '' && !blockedCells.includes(index)) {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length > 0) {
        let move = findWinningMove('O');
        if (move === -1) move = findWinningMove('X');
        if (move === -1) {
            // Prefer center, then corners, then edges for 3x3
            if (boardSize === 3) {
                const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
                for (let preferredMove of preferredMoves) {
                    if (availableMoves.includes(preferredMove)) {
                        move = preferredMove;
                        break;
                    }
                }
            } else {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }
        
        const cells = document.querySelectorAll('.cell');
        const cell = cells[move];
        isComputerTurn = false;
        makeMove(move, cell);
    }
}

function makeComputerMoveHard() {
    if (!gameActive || computerMovesLeft <= 0) {
        isComputerTurn = false;
        return;
    }
    
    const availableMoves = [];
    gameBoard.forEach((cell, index) => {
        if (cell === '' && !blockedCells.includes(index)) {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length > 0) {
        let move = findWinningMove('O');
        if (move === -1) move = findWinningMove('X');
        if (move === -1) {
            const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
            for (let preferredMove of preferredMoves) {
                if (availableMoves.includes(preferredMove)) {
                    move = preferredMove;
                    break;
                }
            }
        }
        
        const cell = cells[move];
        gameBoard[move] = 'O';
        cell.textContent = 'O';
        cell.classList.add('taken', 'o');
        createParticles('O', cell);
        saveGameState();  

        
        computerMovesLeft--;
        
        if (checkWinner()) {
            gameActive = false;
            highlightWinningCells();
            gameMessage.innerHTML = `<span class="winner">🎉 ${player2Name} wins this round! 🎉</span>`;
            scores['O']++;
            updateScoreDisplay();
            setTimeout(() => nextRound(), 2000);
            return;
        } else if (gameBoard.every((cell, idx) => cell !== '' || blockedCells.includes(idx))) {
            gameActive = false;
            gameMessage.innerHTML = `<span class="winner">🤝 Round ${currentRound} is a draw! 🤝</span>`;
            scores.draw++;
            updateScoreDisplay();
            setTimeout(() => nextRound(), 2000);
            return;
        }
        
        if (computerMovesLeft > 0 && gameActive) {
            setTimeout(() => makeComputerMoveHard(), 600);
        } else {
            currentPlayer = 'X';
            isComputerTurn = false;
            updateGameMessage();
            updatePowerupDisplay();
            saveGameState();  

        }
    } else {
        isComputerTurn = false;
    }
}

function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        const values = condition.map(i => gameBoard[i]);
        
        if (values.filter(v => v === player).length === boardSize - 1 && values.filter(v => v === '').length === 1) {
            for (let idx of condition) {
                if (gameBoard[idx] === '' && !blockedCells.includes(idx)) {
                    return idx;
                }
            }
        }
    }
    return -1;
}

function checkWinner() {
    return winningConditions.some(condition => {
        const values = condition.map(i => gameBoard[i]);
        return values[0] && values.every(v => v === values[0]);
    });
}

function highlightWinningCells() {
    const cells = document.querySelectorAll('.cell');
    winningConditions.forEach(condition => {
        const values = condition.map(i => gameBoard[i]);
        if (values[0] && values.every(v => v === values[0])) {
            condition.forEach(i => cells[i].classList.add('winning'));
        }
    });
}

function createParticles(symbol, element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = symbol;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.fontSize = '1.5rem';
        particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }
}

function showCombo() {
    if (comboCount > 1) {
        const combo = document.createElement('div');
        combo.className = 'combo-counter';
        combo.textContent = `🔥 ${comboCount}x COMBO! 🔥`;
        document.body.appendChild(combo);
        
        setTimeout(() => combo.remove(), 2000);
    }
}

function nextRound() {
    currentRound++;
    
    if (currentRound > totalRounds) {
        endGameSeries();
    } else {
        updateGameInfo();
        initializeGame();
        saveGameState();
    }
}

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
    comboCount = 0;
    startNewGameBlink();
}

function resetGame() {
    initializeGame();
    stopNewGameBlink();
}

function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    currentRound = 1;
    comboCount = 0;
    
    // Reinitialize power-ups for the new series
    initializePowerupsForSeries();
    
    updateScoreDisplay();
    updateGameInfo();
    initializeGame();
    stopNewGameBlink();
}

function updateScoreDisplay() {
    document.getElementById('x-score').textContent = scores.X;
    document.getElementById('o-score').textContent = scores.O;
    document.getElementById('draw-score').textContent = scores.draw;
}

function backToMenu() {
    gameContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    stopNewGameBlink();
    gameMode = '';
    difficulty = 'normal';
    totalRounds = 5;
    currentRound = 1;
    scores = { X: 0, O: 0, draw: 0 };
    comboCount = 0;
    powerupsEnabled = true;
    localStorage.removeItem('gameState'); // clear when exiting

}

function startNewGameBlink() {
    const newGameBtn = document.querySelector('.controls button');
    if (newGameBtn) newGameBtn.classList.add('new-game-blink');
}

function stopNewGameBlink() {
    const newGameBtn = document.querySelector('.controls button');
    if (newGameBtn) newGameBtn.classList.remove('new-game-blink');
}
function saveGameState() {
    const state = {
        gameMode,
        difficulty,
        totalRounds,
        currentRound,
        player1Name,
        player2Name,
        gameBoard,
        currentPlayer,
        scores,
        powerupsEnabled,
        powerups,
        blockedCells,
        frozenPlayer,
        boardSize 
    };
    localStorage.setItem('gameState', JSON.stringify(state));
}

window.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const state = JSON.parse(savedState);
       


        // Restore values
        gameMode = state.gameMode;
        difficulty = state.difficulty;
        totalRounds = state.totalRounds;
        currentRound = state.currentRound;
        player1Name = state.player1Name;
        player2Name = state.player2Name;
        gameBoard = state.gameBoard;
        currentPlayer = state.currentPlayer;
        scores = state.scores;
        powerupsEnabled = state.powerupsEnabled;
        powerups = state.powerups;
        blockedCells = state.blockedCells;
        frozenPlayer = state.frozenPlayer;

        // Hide welcome, show game
        welcomeScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        // Rebuild board
        createBoard();
        const cells = document.querySelectorAll('.cell');
        gameBoard.forEach((val, i) => {
            if (val !== '') {
                cells[i].textContent = val;
                cells[i].classList.add('taken', val.toLowerCase());
            }
        });

        // Restore blocked cells
        blockedCells.forEach(index => {
            cells[index].classList.add('blocked');
        });

        updateGameInfo();
        updateScoreDisplay();
        updateGameMessage();
        updatePowerupDisplay();
    }
});
