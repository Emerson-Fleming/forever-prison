// Game.js
// Core game manager class for shared functionality across levels

class Game {
    constructor() {
        this.currentLevel = null;
        this.platforms = null;
        this.player = null;
    }

    // Initialize common game elements
    init() {
        // Create platform group
        this.platforms = new Group();
        this.platforms.color = 'green';
        this.platforms.collider = 'static';

        return this;
    }

    // Set up the world with gravity
    initializeGravity(gravityY = 20) {
        world.gravity.y = gravityY;
    }

    // Create a basic ground platform
    createGround(color = 'green') {
        // Store reference to ground for resizing
        if (!this.ground) {
            this.ground = new this.platforms.Sprite();
            this.ground.collider = 'static';
        }
        this.ground.x = width / 2;
        this.ground.y = height - 25;
        this.ground.width = width;
        this.ground.height = 50;
        this.ground.color = color;

        // Add resize listener only once
        if (!this._resizeListenerAdded) {
            window.addEventListener('resize', () => {
                // Update ground size and position on resize
                this.ground.x = width / 2;
                this.ground.y = height - 25;
                this.ground.width = width;
                this.ground.height = 50;
            });
            this._resizeListenerAdded = true;
        }

        return this.ground;
    }

    // Create a static platform
    createPlatform(x, y, w, h, color = 'green') {
        let platform = new this.platforms.Sprite();
        platform.x = x;
        platform.y = y;
        platform.width = w;
        platform.height = h;
        platform.color = color;
        return platform;
    }

    // Create a player
    createPlayer(x, y, options = {}) {
        this.player = new Player(x, y, options);
        this.player.setPlatforms(this.platforms);
        return this.player;
    }

    // Display UI text
    showInstructions(instructions = []) {
        fill(0);
        textSize(16);
        textAlign(CENTER);

        instructions.forEach((text, index) => {
            window.text(text, width / 2, 30 + (index * 20));
        });
    }

    // Check if player fell off screen
    checkPlayerFell(resetX, resetY) {
        if (this.player && this.player.y > height + 100) {
            this.player.reset(resetX, resetY);
        }
    }
}

// Global game instance
let game = new Game();

// Prevent default browser behavior for game keys (stops page scrolling)
window.addEventListener('keydown', function (e) {
    // Prevent scrolling for spacebar, arrow keys
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
});
