// StaticPlatform.js
// A static platform that stays in one position

class StaticPlatform {
    /**
     * Create a static platform
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @param {string} color - Platform color
     * @param {Group} platformGroup - p5play platform group
     * @param {boolean} useTexture - Whether to use wall texture
     */
    constructor(x, y, width, height, color, platformGroup, useTexture = false) {
        this.position = { x, y };
        this.dimensions = { width, height };
        this.color = color;
        this.useTexture = useTexture;
        this.textureCache = null;

        this._createSprite(platformGroup);
        this._applyAppearance();
    }

    /**
     * Create the platform sprite
     * @private
     */
    _createSprite(platformGroup) {
        this.sprite = new platformGroup.Sprite();
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.width = this.dimensions.width;
        this.sprite.height = this.dimensions.height;
        this.sprite.collider = 'static';
    }

    /**
     * Apply texture or color to the sprite
     * @private
     */
    _applyAppearance() {
        if (this._shouldUseWallTexture()) {
            this.textureCache = game.createWallTexture(this.dimensions.width, this.dimensions.height);
            this.sprite.img = this.textureCache;
        } else {
            this.sprite.color = this.color;
        }
    }

    /**
     * Check if wall texture should be used
     * @private
     */
    _shouldUseWallTexture() {
        const greyColors = ['gray', 'grey', 'darkgray'];
        return this.useTexture && greyColors.includes(this.color);
    }

    /**
     * Set platform dimensions
     * @param {number} w - New width
     * @param {number} h - New height
     */
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
        this.dimensions.width = w;
        this.dimensions.height = h;

        // Regenerate texture if needed
        if (this._shouldUseWallTexture()) {
            this.textureCache = game.createWallTexture(w, h);
            this.sprite.img = this.textureCache;
        }
    }

    /**
     * Set platform position
     * @param {number} x - New x position
     * @param {number} y - New y position
     */
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Set platform color
     * @param {string} color - New color
     */
    setColor(color) {
        this.sprite.color = color;
        this.color = color;
    }

    /**
     * Update method (for API consistency)
     */
    update() {
        // Static platforms don't need updates
    }

    /**
     * Clean up and remove the platform
     */
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }
}
