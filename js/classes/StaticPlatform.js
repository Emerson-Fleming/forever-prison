// StaticPlatform.js
// A static platform that stays in one position

class StaticPlatform {
    /**
     * Create a static platform
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @param {string} color - Platform color (or 'light', 'medium', 'dark' for paper texture)
     * @param {Group} platformGroup - p5play platform group
     * @param {boolean} useTexture - Whether to use wall texture (defaults to paper texture)
     * @param {string} textureType - 'paper' or 'wall' texture type
     */
    constructor(x, y, width, height, color, platformGroup, useTexture = true, textureType = 'paper') {
        this.position = { x, y };
        this.dimensions = { width, height };
        this.color = color;
        this.useTexture = useTexture;
        this.textureType = textureType;
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
        if (this.useTexture) {
            if (this.textureType === 'paper') {
                // Use paper texture with shade variants
                const shade = this._getPaperShade();
                this.textureCache = game.createPaperPlatformTexture(
                    this.dimensions.width, 
                    this.dimensions.height,
                    shade
                );
                this.sprite.img = this.textureCache;
            } else if (this._shouldUseWallTexture()) {
                // Use wall texture for grey platforms
                this.textureCache = game.createWallTexture(this.dimensions.width, this.dimensions.height);
                this.sprite.img = this.textureCache;
            } else {
                this.sprite.color = this.color;
            }
        } else {
            this.sprite.color = this.color;
        }
    }

    /**
     * Get paper shade from color string
     * @private
     */
    _getPaperShade() {
        const shadeMap = {
            'light': 'light',
            'tan': 'light',
            'medium': 'medium',
            'brown': 'medium',
            'dark': 'dark',
            'darkbrown': 'dark'
        };
        return shadeMap[this.color.toLowerCase()] || 'medium';
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
        if (this.useTexture) {
            if (this.textureType === 'paper') {
                const shade = this._getPaperShade();
                this.textureCache = game.createPaperPlatformTexture(w, h, shade);
                this.sprite.img = this.textureCache;
            } else if (this._shouldUseWallTexture()) {
                this.textureCache = game.createWallTexture(w, h);
                this.sprite.img = this.textureCache;
            }
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
