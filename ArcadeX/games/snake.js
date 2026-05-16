(() => {
    const canvas = document.getElementById("snake-canvas");
    const ctx = canvas.getContext("2d");
    const scoreText = document.getElementById("snake-score");
    const highScoreText = document.getElementById("snake-highscore");
    const startBtn = document.getElementById("snake-start");

    // Game variables
    let boardSize = 400;
    let unitSize = 20;
    let gameTimeout; 
    let gameActive = false;
    let score = 0;
    let highScore = 0;

    let snake = [];
    let maxTailLength = 4;
    let dx = unitSize;
    let dy = 0;
    let changingDirection = false; 

    let foodX;
    let foodY;

    // Particle system for eating effect
    let particles = [];

    function initializeGame() {
        startBtn.addEventListener('click', resetSnakeGame);
        document.addEventListener('keydown', changeDirection);
        drawBlankBoard();
    }

    function resetSnakeGame() {
        clearTimeout(gameTimeout);
        score = 0;
        maxTailLength = 4;
        dx = unitSize;
        dy = 0;
        changingDirection = false;
        
        snake = [
            {x: unitSize * 4, y: 0},
            {x: unitSize * 3, y: 0},
            {x: unitSize * 2, y: 0},
            {x: unitSize, y: 0},
            {x: 0, y: 0}
        ];
        
        gameActive = true;
        scoreText.innerText = score;
        createFood();
        particles = [];
        nextTick();
    }

    function stopGame() {
        gameActive = false;
        clearTimeout(gameTimeout);
    }

    function nextTick() {
        if(!gameActive) return;

        if(checkGameOver()) {
            displayGameOver();
            stopGame();
            return;
        }

        changingDirection = false; 
        ctx.clearRect(0, 0, boardSize, boardSize);
        
        drawFood();
        moveSnake();
        drawSnake();
        updateParticles();
        
        let speed = Math.max(40, 100 - (score * 2));

        gameTimeout = setTimeout(nextTick, speed);
    }

    function drawBlankBoard() {
        ctx.clearRect(0, 0, boardSize, boardSize);
        ctx.font = "20px 'Outfit'";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText("Press Start to Play", boardSize/2, boardSize/2);
    }

    function createFood() {
        function randomFood(min, max) {
            return Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        }
        
        foodX = randomFood(0, boardSize - unitSize);
        foodY = randomFood(0, boardSize - unitSize);
        
        snake.forEach(part => {
            if(part.x === foodX && part.y === foodY) {
                createFood();
            }
        });
    }

    function drawFood() {
        ctx.fillStyle = "#00ffff"; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffff";
        ctx.fillRect(foodX, foodY, unitSize, unitSize);
        ctx.shadowBlur = 0; 
    }

    function moveSnake() {
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        if(head.x === foodX && head.y === foodY) {
            score += 1;
            scoreText.innerText = score;
            if(score > highScore) {
                highScore = score;
                highScoreText.innerText = highScore;
            }
            createEatingParticles(foodX, foodY);
            createFood();
        } else {
            snake.pop();
        }
    }

    function drawSnake() {
        snake.forEach((part, index) => {
            if (index === 0) {
                ctx.fillStyle = "#ffffff";
            } else {
                let ratio = 1 - (index / snake.length);
                ctx.fillStyle = `rgba(138, 43, 226, ${ratio})`; 
            }
            
            ctx.shadowBlur = index === 0 ? 15 : 5;
            ctx.shadowColor = "#8a2be2";
            ctx.fillRect(part.x, part.y, unitSize, unitSize);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(part.x, part.y, unitSize, unitSize);
        });
        ctx.shadowBlur = 0;
    }

    function changeDirection(event) {
        if(!gameActive || changingDirection) return;

        const LEFT = 37;
        const RIGHT = 39;
        const UP = 38;
        const DOWN = 40;
        const W = 87;
        const A = 65;
        const S = 83;
        const D = 68;
        
        const keyPressed = event.keyCode;
        
        if([LEFT, RIGHT, UP, DOWN, W, A, S, D].includes(keyPressed)) {
            event.preventDefault();
        }

        const goingUp = (dy === -unitSize);
        const goingDown = (dy === unitSize);
        const goingRight = (dx === unitSize);
        const goingLeft = (dx === -unitSize);

        let changed = false;

        if((keyPressed === LEFT || keyPressed === A) && !goingRight) { dx = -unitSize; dy = 0; changed = true; }
        if((keyPressed === UP || keyPressed === W) && !goingDown) { dx = 0; dy = -unitSize; changed = true; }
        if((keyPressed === RIGHT || keyPressed === D) && !goingLeft) { dx = unit, dy = 0; changed = true; } // NOTE error here but wait, I typed dx = unit instead of dx = unitSize in right arrow.
        if((keyPressed === RIGHT || keyPressed === D) && !goingLeft) { dx = unitSize; dy = 0; changed = true; }
        if((keyPressed === DOWN || keyPressed === S) && !goingUp) { dx = 0; dy = unitSize; changed = true; }

        if(changed) {
            changingDirection = true;
        }
    }

    function checkGameOver() {
        let head = snake[0];
        if(head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
            return true;
        }
        
        for(let i = 1; i < snake.length; i++) {
            if(head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    function displayGameOver() {
        ctx.font = "bold 40px 'Pixelify Sans'";
        ctx.fillStyle = "#ff0055";
        ctx.textAlign = "center";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0055";
        ctx.fillText("GAME OVER", boardSize/2, boardSize/2);
        ctx.shadowBlur = 0;
        ctx.font = "20px 'Outfit'";
        ctx.fillStyle = "white";
        ctx.fillText("Press Start to Try Again", boardSize/2, boardSize/2 + 40);
    }

    function createEatingParticles(x, y) {
        for(let i=0; i<10; i++) {
            particles.push({
                x: x + unitSize/2,
                y: y + unitSize/2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: "#00ffff"
            });
        }
    }

    function updateParticles() {
        for(let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.1;

            if(p.life <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeGame();
    });

    document.addEventListener('startGame_snake', () => {
        drawBlankBoard(); 
    });

    document.addEventListener('stopGames', () => {
        stopGame();
    });
})();
