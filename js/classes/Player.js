// Player.js
// Player class with movement and physics

class Player {
    constructor(x, y, options = {}) {
        // Create the sprite
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = options.width || 50;
        this.sprite.height = options.height || 50;
        this.sprite.color = options.color || 'green';
        this.sprite.bounciness = options.bounciness || 0;

        // Movement settings
        this.moveSpeed = options.moveSpeed || 5;
        this.jumpForce = options.jumpForce || 8;

        // Reference to platforms for collision detection
        this.platforms = null;
    }

    // Set the platforms group for collision detection
    setPlatforms(platformGroup) {
        this.platforms = platformGroup;
    }

    // Handle player movement input
    handleMovement() {
        // Horizontal movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
            this.sprite.velocity.x = -this.moveSpeed;
        } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
            this.sprite.velocity.x = this.moveSpeed;
        } else {
            this.sprite.velocity.x = 0;
        }

        // Jump control
        if (kb.presses('space') || kb.presses('w') || kb.presses('up_arrow')) {
            // Only jump if player is on a platform
            if (this.platforms && this.sprite.colliding(this.platforms)) {
                this.sprite.velocity.y = -this.jumpForce;
            }
        }
    }

    // Keep player within canvas bounds
    keepInBounds() {
        if (this.sprite.x < 0) this.sprite.x = 0;
        if (this.sprite.x > width) this.sprite.x = width;
    }

    // Reset player to a position
    reset(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.velocity.x = 0;
        this.sprite.velocity.y = 0;
    }

    // Update player (call in draw)
    update() {
        this.handleMovement();
        this.keepInBounds();
    }

    // Getters for position
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    // Setters for position
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
