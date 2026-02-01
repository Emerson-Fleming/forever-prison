// helpers.js
// Shared utility functions for the game

const GameUtils = {
    /**
     * Check if a point is inside a rectangle (AABB)
     * @param {number} px - Point x
     * @param {number} py - Point y  
     * @param {number} rx - Rectangle center x
     * @param {number} ry - Rectangle center y
     * @param {number} rw - Rectangle width
     * @param {number} rh - Rectangle height
     * @returns {boolean}
     */
    pointInRect(px, py, rx, ry, rw, rh) {
        const halfW = rw / 2;
        const halfH = rh / 2;
        return px >= rx - halfW && px <= rx + halfW &&
            py >= ry - halfH && py <= ry + halfH;
    },

    /**
     * Check if two rectangles overlap (AABB collision)
     * @param {Object} a - First rect {x, y, width, height}
     * @param {Object} b - Second rect {x, y, width, height}
     * @returns {boolean}
     */
    rectsOverlap(a, b) {
        const aLeft = a.x - a.width / 2;
        const aRight = a.x + a.width / 2;
        const aTop = a.y - a.height / 2;
        const aBottom = a.y + a.height / 2;

        const bLeft = b.x - b.width / 2;
        const bRight = b.x + b.width / 2;
        const bTop = b.y - b.height / 2;
        const bBottom = b.y + b.height / 2;

        return aLeft < bRight && aRight > bLeft &&
            aTop < bBottom && aBottom > bTop;
    },

    /**
     * Get rectangle bounds from a sprite
     * @param {Object} sprite - Sprite with x, y, width, height
     * @returns {Object} - {left, right, top, bottom}
     */
    getSpriteBounds(sprite) {
        return {
            left: sprite.x - sprite.width / 2,
            right: sprite.x + sprite.width / 2,
            top: sprite.y - sprite.height / 2,
            bottom: sprite.y + sprite.height / 2
        };
    },

    /**
     * Normalize a vector and return direction components
     * @param {number} dx - X difference
     * @param {number} dy - Y difference
     * @returns {Object} - {dirX, dirY, distance}
     */
    normalizeVector(dx, dy) {
        const distance = dist(0, 0, dx, dy);
        if (distance === 0) {
            return { dirX: 0, dirY: 0, distance: 0 };
        }
        return {
            dirX: dx / distance,
            dirY: dy / distance,
            distance: distance
        };
    },

    /**
     * Calculate velocity toward a target position
     * @param {number} fromX - Start x
     * @param {number} fromY - Start y
     * @param {number} toX - Target x
     * @param {number} toY - Target y
     * @param {number} speed - Movement speed
     * @returns {Object} - {vx, vy}
     */
    velocityToward(fromX, fromY, toX, toY, speed) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const { dirX, dirY } = this.normalizeVector(dx, dy);
        return {
            vx: dirX * speed,
            vy: dirY * speed
        };
    },

    /**
     * Check if a point is within a circle
     * @param {number} px - Point x
     * @param {number} py - Point y
     * @param {number} cx - Circle center x
     * @param {number} cy - Circle center y
     * @param {number} radius - Circle radius
     * @returns {boolean}
     */
    pointInCircle(px, py, cx, cy, radius) {
        return dist(px, py, cx, cy) < radius;
    },

    /**
     * Clamp a value between min and max
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};

// Texture generation utilities
const TextureUtils = {
    /**
     * Draw organic irregular shapes for papery texture
     * @param {Object} cnv - p5 graphics context
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {number} size - Base size
     * @param {number} irregularity - How irregular (0-1)
     * @param {number} angleStep - Step for shape vertices (smaller = more detailed)
     */
    drawOrganicShape(cnv, x, y, size, irregularity = 0.3, angleStep = 0.5) {
        cnv.push();
        cnv.translate(x, y);
        cnv.rotate(random(TWO_PI));
        cnv.beginShape();
        for (let angle = 0; angle < TWO_PI; angle += angleStep) {
            const r = size + random(-size * irregularity, size * irregularity);
            cnv.vertex(cos(angle) * r, sin(angle) * r);
        }
        cnv.endShape(CLOSE);
        cnv.pop();
    },

    /**
     * Add paper fiber lines to a texture
     * @param {Object} cnv - p5 graphics context
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {Array} palette - Color palette array [{r,g,b}, ...]
     * @param {number} count - Number of fibers
     * @param {Object} options - {minAlpha, maxAlpha, minWeight, maxWeight, minLength, maxLength}
     */
    addPaperFibers(cnv, w, h, palette, count, options = {}) {
        const opts = {
            minAlpha: options.minAlpha || 8,
            maxAlpha: options.maxAlpha || 20,
            minWeight: options.minWeight || 0.5,
            maxWeight: options.maxWeight || 2,
            minLength: options.minLength || 10,
            maxLength: options.maxLength || 30,
            useCurves: options.useCurves !== false
        };

        for (let i = 0; i < count; i++) {
            const shade = random(palette);
            cnv.stroke(shade.r, shade.g, shade.b, random(opts.minAlpha, opts.maxAlpha));
            cnv.strokeWeight(random(opts.minWeight, opts.maxWeight));

            const x = random(-w * 0.2, w * 1.2);
            const y = random(-h * 0.2, h * 1.2);
            const curveLength = random(opts.minLength, opts.maxLength);
            const angle = random(TWO_PI);

            if (opts.useCurves) {
                cnv.push();
                cnv.translate(x, y);
                cnv.rotate(angle);
                cnv.noFill();
                cnv.beginShape();
                cnv.curveVertex(0, 0);
                cnv.curveVertex(0, 0);
                cnv.curveVertex(curveLength * 0.3, random(-5, 5));
                cnv.curveVertex(curveLength * 0.7, random(-5, 5));
                cnv.curveVertex(curveLength, random(-3, 3));
                cnv.curveVertex(curveLength, random(-3, 3));
                cnv.endShape();
                cnv.pop();
            } else {
                cnv.line(x, y, x + cos(angle) * curveLength, y + sin(angle) * curveLength);
            }
        }
    },

    /**
     * Add pixel noise/grain to a texture
     * @param {Object} cnv - p5 graphics context
     * @param {number} intensity - Noise intensity
     */
    addPixelNoise(cnv, intensity = 8) {
        cnv.loadPixels();
        for (let i = 0; i < cnv.pixels.length; i += 4) {
            const noise = random(-intensity, intensity);
            cnv.pixels[i] += noise;     // R
            cnv.pixels[i + 1] += noise; // G
            cnv.pixels[i + 2] += noise; // B
        }
        cnv.updatePixels();
    },

    /**
     * Add colored texture patches
     * @param {Object} cnv - p5 graphics context
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {Array} palette - Color palette
     * @param {number} count - Number of patches
     * @param {Object} options - {minAlpha, maxAlpha, minSize, maxSize, angleStep}
     */
    addTexturePatches(cnv, w, h, palette, count, options = {}) {
        const opts = {
            minAlpha: options.minAlpha || 10,
            maxAlpha: options.maxAlpha || 30,
            minSize: options.minSize || 30,
            maxSize: options.maxSize || 80,
            angleStep: options.angleStep || 0.5
        };

        cnv.noStroke();
        for (let i = 0; i < count; i++) {
            const shade = random(palette);
            cnv.fill(shade.r, shade.g, shade.b, random(opts.minAlpha, opts.maxAlpha));

            const x = random(-w * 0.1, w * 1.1);
            const y = random(-h * 0.1, h * 1.1);
            const size = random(opts.minSize, opts.maxSize);

            this.drawOrganicShape(cnv, x, y, size, 0.3, opts.angleStep);
        }
    }
};

// Color palettes for easy reuse
const ColorPalettes = {
    brown: [
        { r: 62, g: 36, b: 19 },   // Very dark brown
        { r: 191, g: 75, b: 17 },  // Reddish brown
        { r: 119, g: 59, b: 23 },  // Classic medium brown
        { r: 26, g: 15, b: 3 },    // Almost black brown
        { r: 110, g: 66, b: 39 }   // Light brown
    ],

    redBrown: [
        { r: 20, g: 10, b: 10 },   // Very dark
        { r: 60, g: 25, b: 20 },   // Deep reddish brown
        { r: 80, g: 30, b: 25 },   // Dark red-brown
        { r: 100, g: 35, b: 30 },  // Medium dark red-brown
        { r: 90, g: 20, b: 20 },   // Dark red
        { r: 130, g: 50, b: 40 }   // Burnt sienna
    ],

    grey: [
        { r: 15, g: 15, b: 15 },   // Almost black
        { r: 35, g: 35, b: 35 },   // Very dark grey
        { r: 60, g: 60, b: 60 },   // Dark grey
        { r: 85, g: 85, b: 85 },   // Medium-dark grey
        { r: 110, g: 110, b: 110 }, // Medium grey
        { r: 140, g: 140, b: 140 }, // Medium-light grey
        { r: 170, g: 170, b: 170 }, // Light grey
        { r: 200, g: 200, b: 200 }  // Very light grey
    ],

    red: [
        { r: 150, g: 20, b: 20 },  // Dark red
        { r: 180, g: 30, b: 30 },  // Medium red
        { r: 210, g: 40, b: 40 },  // Red
        { r: 230, g: 60, b: 60 },  // Light red
        { r: 200, g: 50, b: 50 }   // Medium-light red
    ],

    greyEmpty: [
        { r: 80, g: 80, b: 80 },   // Dark grey
        { r: 100, g: 100, b: 100 }, // Medium grey
        { r: 120, g: 120, b: 120 }, // Light grey
        { r: 90, g: 90, b: 90 }    // Medium-dark grey
    ]
};
