// HealthBar.js
// Visual health bar display for the player

class HealthBar {
    constructor(maxHealth = 5, options = {}) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this._initVisuals(options);
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize visual settings
     * @private
     */
    _initVisuals(options) {
        // Position
        this.x = options.x || 30;
        this.y = options.y || 30;

        // Visual settings
        this.heartSize = options.heartSize || 30;
        this.heartSpacing = options.heartSpacing || 10;
        this.fullColor = options.fullColor || 'red';
        this.emptyColor = options.emptyColor || 'gray';
        this.outlineColor = options.outlineColor || 'black';
        this.outlineWeight = options.outlineWeight || 2;

        // Texture settings
        this.useTexture = options.useTexture !== false;
        this.textureCache = { full: null, empty: null };

        if (this.useTexture) {
            this._generateHeartTextures();
        }
    }

    // ==================== HEALTH MANAGEMENT ====================

    /**
     * Reduce health by amount
     * @param {number} amount - Damage amount
     * @returns {number} - Current health after damage
     */
    damage(amount = 1) {
        this.currentHealth = max(0, this.currentHealth - amount);
        return this.currentHealth;
    }

    /**
     * Heal by amount
     * @param {number} amount - Heal amount
     * @returns {number} - Current health after healing
     */
    heal(amount = 1) {
        this.currentHealth = min(this.maxHealth, this.currentHealth + amount);
        return this.currentHealth;
    }

    /**
     * Reset to full health
     */
    reset() {
        this.currentHealth = this.maxHealth;
    }

    /**
     * Check if dead
     * @returns {boolean}
     */
    isDead() {
        return this.currentHealth <= 0;
    }

    // ==================== TEXTURE GENERATION ====================

    /**
     * Generate textured heart graphics
     * @private
     */
    _generateHeartTextures() {
        this.textureCache.full = this._createHeartTexture(true);
        this.textureCache.empty = this._createHeartTexture(false);
    }

    /**
     * Create a single textured heart
     * @private
     * @param {boolean} isFull - Whether it's a full (red) or empty (grey) heart
     * @returns {Graphics}
     */
    _createHeartTexture(isFull) {
        const size = this.heartSize;
        let cnv = createGraphics(size * 1.2, size * 1.2);
        cnv.clear();

        const palette = isFull ? ColorPalettes.red : ColorPalettes.greyEmpty;
        const baseColor = isFull ? { r: 200, g: 40, b: 40 } : { r: 100, g: 100, b: 100 };

        // Draw base heart
        cnv.fill(baseColor.r, baseColor.g, baseColor.b);
        cnv.noStroke();
        this._drawHeartPath(cnv, size);

        // Add texture patches
        this._addHeartTexturePatches(cnv, size, palette);

        // Add texture details
        this._addHeartTextureDetails(cnv, size, palette);

        // Draw outline
        this._drawHeartOutline(cnv, size);

        return cnv;
    }

    /**
     * Draw heart bezier path
     * @private
     */
    _drawHeartPath(cnv, size) {
        const x = size * 0.6;
        const y = size * 0.5;

        cnv.beginShape();
        cnv.vertex(x, y + size * 0.3);
        cnv.bezierVertex(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
        cnv.bezierVertex(x - size * 0.5, y + size * 0.6, x, y + size * 0.9, x, y + size);
        cnv.bezierVertex(x, y + size * 0.9, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
        cnv.bezierVertex(x + size * 0.5, y, x, y, x, y + size * 0.3);
        cnv.endShape(CLOSE);
    }

    /**
     * Add texture patches to heart
     * @private
     */
    _addHeartTexturePatches(cnv, size, palette) {
        const x = size * 0.6;
        const y = size * 0.5;
        const numPatches = 15;

        cnv.noStroke();
        for (let i = 0; i < numPatches; i++) {
            const shade = random(palette);
            cnv.fill(shade.r, shade.g, shade.b, random(30, 70));

            const px = random(x - size * 0.4, x + size * 0.4);
            const py = random(y + size * 0.1, y + size * 0.9);
            const psize = random(size * 0.15, size * 0.3);

            cnv.ellipse(px, py, psize, psize);
        }
    }

    /**
     * Add small texture details to heart
     * @private
     */
    _addHeartTextureDetails(cnv, size, palette) {
        const x = size * 0.6;
        const y = size * 0.5;
        const numDetails = 20;

        for (let i = 0; i < numDetails; i++) {
            const shade = random(palette);
            cnv.stroke(shade.r, shade.g, shade.b, random(40, 80));
            cnv.strokeWeight(random(0.5, 1.5));

            const px = random(x - size * 0.3, x + size * 0.3);
            const py = random(y + size * 0.2, y + size * 0.8);
            const len = random(3, 8);
            const angle = random(TWO_PI);

            cnv.line(px, py, px + cos(angle) * len, py + sin(angle) * len);
        }
    }

    /**
     * Draw heart outline
     * @private
     */
    _drawHeartOutline(cnv, size) {
        const x = size * 0.6;
        const y = size * 0.5;

        cnv.noFill();
        cnv.stroke(this.outlineColor);
        cnv.strokeWeight(this.outlineWeight);
        this._drawHeartPath(cnv, size);
    }

    // ==================== DRAWING ====================

    /**
     * Draw a heart shape
     * @param {number} x - Heart x position
     * @param {number} y - Heart y position
     * @param {number} size - Heart size
     * @param {boolean} filled - Whether heart is filled or empty
     */
    drawHeart(x, y, size, filled) {
        push();

        if (this.useTexture && this.textureCache.full) {
            // Use cached texture
            const texture = filled ? this.textureCache.full : this.textureCache.empty;
            image(texture, x - size * 0.1, y - size * 0.05);
        } else {
            // Fallback to solid color
            fill(filled ? this.fullColor : this.emptyColor);
            stroke(this.outlineColor);
            strokeWeight(this.outlineWeight);

            beginShape();
            vertex(x, y + size * 0.3);
            bezierVertex(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
            bezierVertex(x - size * 0.5, y + size * 0.6, x, y + size * 0.9, x, y + size);
            bezierVertex(x, y + size * 0.9, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
            bezierVertex(x + size * 0.5, y, x, y, x, y + size * 0.3);
            endShape(CLOSE);
        }

        pop();
    }

    /**
     * Draw the health bar
     */
    draw() {
        push();
        for (let i = 0; i < this.maxHealth; i++) {
            const heartX = this.x + (i * (this.heartSize + this.heartSpacing));
            const heartY = this.y;
            const filled = i < this.currentHealth;
            this.drawHeart(heartX, heartY, this.heartSize, filled);
        }
        pop();
    }

    /**
     * Update (call in draw)
     */
    update() {
        this.draw();
    }
}
