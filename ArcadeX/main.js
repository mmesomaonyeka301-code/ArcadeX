document.addEventListener('DOMContentLoaded', () => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const gameCards = document.querySelectorAll('.game-card');
    const backBtn = document.getElementById('back-to-dash');
    const currentGameTitle = document.getElementById('current-game-title');
    
    // Navigation handling
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            switchPage(targetId);
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Handle Play clicks
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const gameId = card.getAttribute('data-game');
            const title = card.querySelector('h3').innerText;
            launchGame(gameId, title);
        });
        
        // Ensure play button inside card also trigers the row gracefully
        const btn = card.querySelector('.play-btn');
        if(btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent double firing
                const gameId = card.getAttribute('data-game');
                const title = card.querySelector('h3').innerText;
                launchGame(gameId, title);
            });
        }
    });

    // Back button handling
    backBtn.addEventListener('click', () => {
        // Stop current active games
        const stopEvent = new CustomEvent('stopGames');
        document.dispatchEvent(stopEvent);

        switchPage('dashboard');
        // Reset nav highlight
        navBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('.nav-btn[data-target="dashboard"]').classList.add('active');
    });

    function switchPage(pageId) {
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
            } else {
                page.classList.remove('active');
                page.classList.add('hidden');
            }
        });
    }

    function launchGame(gameId, title) {
        currentGameTitle.innerText = title;
        switchPage('game-view');
        
        // Hide all wrappers inside the game-canvas-container
        const gameWrappers = document.querySelectorAll('.game-wrapper');
        gameWrappers.forEach(w => w.classList.remove('active'));

        // Show specific wrapper
        const targetGame = document.getElementById(`wrapper-${gameId}`);
        if(targetGame) {
            targetGame.classList.add('active');
        }

        // Fire game event
        const startEvent = new CustomEvent(`startGame_${gameId}`);
        document.dispatchEvent(startEvent);
    }
});
