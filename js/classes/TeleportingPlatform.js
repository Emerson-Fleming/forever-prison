// TeleportingPlatform.js
// A platform that teleports between two positions when shift is pressed

class TeleportingPlatform {
    // Static sound files
    static soundWallPhase1 = null;
    static soundWallPhase2 = null;
    static usePhase1 = true; // Track which sound to play next

    /**
     * Preload teleporting platform sound effects - call this in preload()
     */
    static preloadSounds() {
        TeleportingPlatform.soundWallPhase1 = loadSound('assets/sounds/wallphase1.wav');
        TeleportingPlatform.soundWallPhase2 = loadSound('assets/sounds/wallphase2.wav');
    }

    /**
     * Create a teleporting platform
     * @param {Object} pointA - First position {x, y}
     * @param {Object} pointB - Second position {x, y}
     * @param {Object} dimA - First dimensions {width, height}
     * @param {Object} dimB - Second dimensions {width, height}
     * @param {string} colorA - First state color (or 'light', 'medium', 'dark' for paper)
     * @param {string} colorB - Second state color (or 'light', 'medium', 'dark' for paper)
     * @param {Group} platformGroup - p5play platform group
     * @param {boolean} usePaperTexture - Whether to use paper texture (default true)
     */
    constructor(pointA, pointB, dimA, dimB, colorA, colorB, platformGroup, usePaperTexture = true) {
        // Store state configurations
        this.stateA = { pos: pointA, dim: dimA, color: colorA };
        this.stateB = { pos: pointB, dim: dimB, color: colorB };
        this.atPointA = true;
        this.usePaperTexture = usePaperTexture;

        // Cache for textures
        this.textureCache = { A: null, B: null };

        // Outline settings
        this.outlineStrokeWeight = 2;
        this.outlineDashPattern = [10, 10];

        this._createSprite(platformGroup);
    }

    /**
     * Create the platform sprite
     * @private
     */
    _createSprite(platformGroup) {
        this.sprite = new platformGroup.Sprite();
        
        // Generate textures for both states if using paper texture
        if (this.usePaperTexture) {
            this.textureCache.A = this._generatePaperTexture(this.stateA);
            this.textureCache.B = this._generatePaperTexture(this.stateB);
        }
        
        this._applyState(this.stateA);
        this.sprite.collider = 'kinematic';
    }

    /**
     * Generate paper texture for a state
     * @private
     */
    _generatePaperTexture(state) {
        const shade = this._getPaperShade(state.color);
        return game.createPaperPlatformTexture(state.dim.width, state.dim.height, shade);
    }

    /**
     * Get paper shade from color string
     * @private
     */
    _getPaperShade(color) {
        const shadeMap = {
            'light': 'light',
            'tan': 'light',
            'medium': 'medium',
            'brown': 'medium',
            'dark': 'dark',
            'darkbrown': 'dark'
        };
        return shadeMap[color.toLowerCase()] || 'medium';
    }

    /**
     * Apply a state configuration to the sprite
     * @private
     */
    _applyState(state) {
        this.sprite.x = state.pos.x;
        this.sprite.y = state.pos.y;
        this.sprite.width = state.dim.width;
        this.sprite.height = state.dim.height;
        
        if (this.usePaperTexture) {
            // Use cached texture for this state
            const texture = this.atPointA ? this.textureCache.A : this.textureCache.B;
            this.sprite.img = texture;
        } else {
            this.sprite.color = state.color;
        }
    }

    /**
     * Get the current state configuration
     * @private
     */
    _getCurrentState() {
        return this.atPointA ? this.stateA : this.stateB;
    }

    /**
     * Get the alternate state configuration
     * @private
     */
    _getAlternateState() {
        return this.atPointA ? this.stateB : this.stateA;
    }

    /**
     * Set platform dimensions (affects current state)
     * @param {number} w - New width
     * @param {number} h - New height
     */
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
    }

    /**
     * Draw a dotted rectangle outline at the alternate position
     * Draws in world coordinates - p5play camera handles viewport transformation
     */
    drawAlternateOutline() {
        const alt = this._getAlternateState();

        push();
        // Use a muted brown color for the outline instead of the platform color
        stroke(110, 80, 60, 180);  // Muted brown with some transparency
        strokeWeight(this.outlineStrokeWeight);
        noFill();
        drawingContext.setLineDash(this.outlineDashPattern);
        rectMode(CENTER);
        // Draw in world coordinates - p5play's camera handles transformation
        rect(alt.pos.x, alt.pos.y, alt.dim.width, alt.dim.height);
        drawingContext.setLineDash([]);
        pop();
    }

    /**
     * Toggle between point A and point B
     */
    teleport() {
        this.atPointA = !this.atPointA;
        this._applyState(this._getCurrentState());

        // Alternate between wallphase1 and wallphase2 sounds
        const sound = TeleportingPlatform.usePhase1 ? 
            TeleportingPlatform.soundWallPhase1 : 
            TeleportingPlatform.soundWallPhase2;
        
        if (sound && sound.isLoaded()) {
            try {
                if (sound.isPlaying()) {
                    sound.stop();
                }
                sound.setVolume(0.5);
                sound.play();
            } catch (e) {
                console.warn('Wallphase sound error:', e);
            }
        }

        // Toggle which sound to use next time
        TeleportingPlatform.usePhase1 = !TeleportingPlatform.usePhase1;
    }

    /**
     * Update - check for teleport input and draw outline
     */
    update() {
        if (kb.presses('shift')) {
            this.teleport();
        }
        this.drawAlternateOutline();
    }

    /**
     * Clean up and remove the platform
     */
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }

    // ==================== LEGACY PROPERTY ACCESS ====================
    // For backward compatibility with existing code

    get pointA() { return this.stateA.pos; }
    get pointB() { return this.stateB.pos; }
    get dimA() { return this.stateA.dim; }
    get dimB() { return this.stateB.dim; }
    get colorA() { return this.stateA.color; }
    get colorB() { return this.stateB.color; }
}
