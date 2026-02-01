// Game.js
// Core game manager class for shared functionality across levels

class Game {
    constructor() {
        this.currentLevel = null;
        this.platforms = null;
        this.player = null;
        this.healthBar = null;
        this.isGameOver = false;
        this.gameOverCallback = null;
        this.backgroundImage = null; // Cached background
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize common game elements
     * @returns {Game} - Returns this for chaining
     */
    init() {
        this.platforms = new Group();
        this.platforms.color = 'green';
        this.platforms.collider = 'static';
        return this;
    }

    /**
     * Set up world gravity
     * @param {number} gravityY - Gravity strength (default 20)
     */
    initializeGravity(gravityY = 20) {
        world.gravity.y = gravityY;
    }

    // ==================== ENTITY CREATION ====================

    /**
     * Create the player
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {Object} options - Player options
     * @returns {Player}
     */
    createPlayer(x, y, options = {}) {
        this.player = new Player(x, y, options);
        this.player.setPlatforms(this.platforms);
        return this.player;
    }

    /**
     * Create a basic static platform
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {string} color - Platform color
     * @returns {Sprite}
     */
    createPlatform(x, y, w, h, color = 'green') {
        let platform = new this.platforms.Sprite();
        platform.x = x;
        platform.y = y;
        platform.width = w;
        platform.height = h;
        platform.color = color;
        return platform;
    }

    /**
     * Create ground platform with textured paper look
     * @param {string} color - Ground color (unused, texture applied)
     * @returns {Sprite}
     */
    createGround(color = 'brown') {
        if (!this.ground) {
            this.ground = new this.platforms.Sprite();
            this.ground.collider = 'static';
        }
        
        this._updateGroundPosition();
        this.ground.img = this.createPaperGroundTexture(width, 50);
        this._setupGroundResizeListener();
        
        return this.ground;
    }

    /**
     * Update ground position and size
     * @private
     */
    _updateGroundPosition() {
        this.ground.x = width / 2;
        this.ground.y = height - 25;
        this.ground.width = width;
        this.ground.height = 50;
    }

    /**
     * Set up resize listener for ground (only once)
     * @private
     */
    _setupGroundResizeListener() {
        if (this._resizeListenerAdded) return;
        
        window.addEventListener('resize', () => {
            this._updateGroundPosition();
            this.ground.img = this.createPaperGroundTexture(width, 50);
        });
        this._resizeListenerAdded = true;
    }

    /**
     * Create health bar
     * @param {number} maxHealth - Maximum health
     * @param {Object} options - HealthBar options
     * @returns {HealthBar}
     */
    createHealthBar(maxHealth = 5, options = {}) {
        this.healthBar = new HealthBar(maxHealth, options);
        if (this.player) {
            this.player.setHealthBar(this.healthBar);
        }
        return this.healthBar;
    }

    // ==================== UI & DISPLAY ====================

    /**
     * Display instruction text at top of screen
     * @param {string[]} instructions - Array of instruction lines
     */
    showInstructions(instructions = []) {
        fill(0);
        textSize(16);
        textAlign(CENTER);
        instructions.forEach((text, index) => {
            window.text(text, width / 2, 30 + (index * 20));
        });
    }

    /**
     * Draw game over overlay with restart option
     */
    drawGameOver() {
        if (!this.isGameOver) return;

        push();
        // Overlay
        fill(0, 0, 0, 180);
        rect(0, 0, width, height);

        // Game Over text
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(64);
        text('GAME OVER', width / 2, height / 2 - 50);

        // Restart instruction
        fill(255);
        textSize(24);
        text('Press R to Restart', width / 2, height / 2 + 20);
        pop();

        if (kb.presses('r')) {
            this.restartLevel();
        }
    }

    // ==================== GAME STATE ====================

    /**
     * Check if player fell off screen and reset
     * @param {number} resetX - Reset x position
     * @param {number} resetY - Reset y position
     */
    checkPlayerFell(resetX, resetY) {
        if (this.player && this.player.y > height + 100) {
            this.player.reset(resetX, resetY);
        }
    }

    /**
     * Check if player is dead and trigger game over
     * @returns {boolean} - True if game just ended
     */
    checkGameOver() {
        if (this.healthBar && this.healthBar.isDead() && !this.isGameOver) {
            this.isGameOver = true;
            return true;
        }
        return false;
    }

    /**
     * Restart the current level
     */
    restartLevel() {
        this.isGameOver = false;
        this.cleanup();

        if (this.healthBar) {
            this.healthBar.reset();
        }

        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
    }

    /**
     * Clean up all game objects and sprites
     */
    cleanup() {
        if (this.player && this.player.sprite) {
            this.player.sprite.remove();
        }
        if (this.platforms) {
            this.platforms.removeAll();
        }

        this.player = null;
        this.platforms = null;
        this.ground = null;
        // Keep cached background for performance
    }

    /**
     * Set callback for level restart
     * @param {Function} callback - Function to call on restart
     */
    setRestartCallback(callback) {
        this.gameOverCallback = callback;
    }

    // ==================== TEXTURE GENERATION ====================

    /**
     * Create textured paper ground with brown shades
     * @param {number} w - Width
     * @param {number} h - Height
     * @returns {Graphics} - p5 Graphics object
     */
    createPaperGroundTexture(w, h) {
        let cnv = createGraphics(w, h);
        const palette = ColorPalettes.brown;

        // Base color
        cnv.background(180, 130, 80);

        // Add texture patches
        const patchCount = (w * h) / 80;
        TextureUtils.addTexturePatches(cnv, w, h, palette, patchCount);

        // Add paper fibers
        const fiberCount = (w * h) / 40;
        TextureUtils.addPaperFibers(cnv, w, h, palette, fiberCount, {
            minAlpha: 8, maxAlpha: 20
        });

        // Add noise and blur
        TextureUtils.addPixelNoise(cnv, 8);
        cnv.filter(BLUR, 0.3);

        return cnv;
    }

    /**
     * Create and draw paper background (cached for performance)
     */
    createPaperBackground() {
        // Use cached background if available and correct size
        if (this.backgroundImage &&
            this.backgroundImage.width === width &&
            this.backgroundImage.height === height) {
            image(this.backgroundImage, 0, 0);
            return;
        }

        let cnv = createGraphics(width, height);
        const palette = ColorPalettes.redBrown;

        // Base color
        cnv.background(60, 30, 25);

        // Reduced patches for performance
        const patchCount = (width * height) / 3000;
        TextureUtils.addTexturePatches(cnv, width, height, palette, patchCount, {
            minAlpha: 20, maxAlpha: 50,
            minSize: 100, maxSize: 250,
            angleStep: 0.8
        });

        // Reduced fibers
        const fiberCount = (width * height) / 300;
        TextureUtils.addPaperFibers(cnv, width, height, palette, fiberCount, {
            minAlpha: 10, maxAlpha: 20,
            minLength: 20, maxLength: 40,
            useCurves: false
        });

        // Cache and draw
        this.backgroundImage = cnv;
        image(this.backgroundImage, 0, 0);
    }

    /**
     * Create textured stone/concrete wall texture
     * @param {number} w - Width
     * @param {number} h - Height
     * @returns {Graphics} - p5 Graphics object
     */
    createWallTexture(w, h) {
        let cnv = createGraphics(w, h);
        const palette = ColorPalettes.grey;

        // Base color
        cnv.background(90, 90, 90);

        // Stone texture patches
        const patchCount = (w * h) / 800;
        TextureUtils.addTexturePatches(cnv, w, h, palette, patchCount, {
            minAlpha: 40, maxAlpha: 80,
            minSize: w * 0.15, maxSize: w * 0.3,
            angleStep: 0.8
        });

        // Stone cracks/lines
        const lineCount = (w * h) / 400;
        TextureUtils.addPaperFibers(cnv, w, h, palette, lineCount, {
            minAlpha: 40, maxAlpha: 90,
            minWeight: 0.8, maxWeight: 2.5,
            minLength: w * 0.1, maxLength: w * 0.4,
            useCurves: false
        });

        // Accent highlights and shadows
        this._addWallAccents(cnv, w, h);

        // Texture dots
        this._addWallGrain(cnv, w, h, palette);

        return cnv;
    }

    /**
     * Add highlight/shadow accents to wall texture
     * @private
     */
    _addWallAccents(cnv, w, h) {
        const accentCount = (w * h) / 600;
        cnv.noStroke();
        
        for (let i = 0; i < accentCount; i++) {
            const isHighlight = random() > 0.5;
            if (isHighlight) {
                cnv.fill(200, 200, 200, random(60, 100));
            } else {
                cnv.fill(20, 20, 20, random(60, 100));
            }
            cnv.circle(random(w), random(h), random(3, 8));
        }
    }

    /**
     * Add grain dots to wall texture
     * @private
     */
    _addWallGrain(cnv, w, h, palette) {
        const dotCount = (w * h) / 120;
        cnv.noStroke();
        
        for (let i = 0; i < dotCount; i++) {
            const shade = random(palette);
            cnv.fill(shade.r, shade.g, shade.b, random(20, 50));
            cnv.circle(random(w), random(h), random(1, 3));
        }
    }
}

// Global game instance
let game = new Game();

// Prevent default browser behavior for game keys
window.addEventListener('keydown', function (e) {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
});
