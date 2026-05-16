(() => {
    // Tic-Tac-Toe Logic with Unbeatable Minimax AI
    const tttBoard = document.getElementById('ttt-board');
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('ttt-status');
    const restartBtn = document.getElementById('ttt-restart');
    const modeRadios = document.querySelectorAll('input[name="ttt-mode"]');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = false; 
    let isCpuMode = false;

    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function initializeGame() {
        cells.forEach(cell => {
            cell.addEventListener('click', cellClicked);
        });
        restartBtn.addEventListener('click', restartGame);
        modeRadios.forEach(radio => radio.addEventListener('change', (e) => {
            isCpuMode = e.target.value === 'pvc';
            restartGame();
        }));
    }

    function startGame() {
        gameActive = true;
        currentPlayer = 'X';
        board = ['', '', '', '', '', '', '', '', ''];
        statusText.innerText = `Your Turn! (${currentPlayer})`;
        statusText.style.color = 'var(--text-main)';
        cells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('x-mark', 'o-mark');
        });
    }

    function cellClicked() {
        if (!gameActive) return;
        const cellIndex = this.getAttribute('data-index');

        if (board[cellIndex] !== '') return;

        updateCell(this, cellIndex);
        checkWinner();

        if (gameActive && isCpuMode && currentPlayer === 'O') {
            gameActive = false; // Block user clicks while AI thinks
            setTimeout(aiMove, 500); 
        }
    }

    function emptyCells(boardState) {
        let avail = [];
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                avail.push(i);
            }
        }
        return avail;
    }

    function minimax(newBoard, player) {
        let availSpots = emptyCells(newBoard);

        if (checkWinLogic(newBoard, 'X')) {
            return {score: -10};
        } else if (checkWinLogic(newBoard, 'O')) {
            return {score: 10};
        } else if (availSpots.length === 0) {
            return {score: 0};
        }

        let moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            let move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === 'O') {
                let result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                let result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availSpots[i]] = ''; // reset board
            moves.push(move);
        }

        let bestMove = 0;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function aiMove() {
        if (board.includes('')) {
            // Find best move using minimax
            let bestSpot = minimax(board, 'O').index;
            const cell = document.querySelector(`.cell[data-index="${bestSpot}"]`);
            
            updateCell(cell, bestSpot);
            gameActive = true;
            checkWinner();
        }
    }

    function checkWinLogic(tempBoard, player) {
        for (let i = 0; i < winConditions.length; i++) {
            const [a, b, c] = winConditions[i];
            if (tempBoard[a] === player && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
                return true;
            }
        }
        return false;
    }

    function updateCell(cell, index) {
        board[index] = currentPlayer;
        cell.innerText = currentPlayer;
        cell.classList.add(currentPlayer === 'X' ? 'x-mark' : 'o-mark');
    }

    function checkWinner() {
        let roundWon = checkWinLogic(board, currentPlayer);

        if (roundWon) {
            statusText.innerText = `Player ${currentPlayer} Wins!`;
            if(currentPlayer === 'X') {
                statusText.style.color = 'var(--secondary)';
            } else {
                statusText.style.color = 'var(--primary)';
            }
            gameActive = false;
            return;
        }

        if (!board.includes('')) {
            statusText.innerText = `It's a Draw!`;
            statusText.style.color = 'var(--text-main)';
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.innerText = `Your Turn! (${currentPlayer})`;
    }

    function restartGame() {
        startGame();
    }

    // Hook into the main framework
    document.addEventListener('DOMContentLoaded', () => {
        initializeGame();
    });

    document.addEventListener('startGame_tictactoe', () => {
        startGame();
    });

    document.addEventListener('stopGames', () => {
        gameActive = false;
    });
})();
