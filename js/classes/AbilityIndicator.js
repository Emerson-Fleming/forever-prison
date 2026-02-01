// AbilityIndicator.js
// UI element showing current ability with a rotating pie-chart style indicator

class AbilityIndicator {
    constructor(options = {}) {
        // Position (will be set relative to health bar)
        this.x = options.x || 30;
        this.y = options.y || 80;

        // Visual settings
        this.size = options.size || 30;
        this.baseColor = options.baseColor || 'white';
        this.overlayColor = options.overlayColor || 'black';
        this.outlineColor = options.outlineColor || 'black';
        this.outlineWeight = options.outlineWeight || 2;

        // Current rotation angle (where the "mouth" opening points)
        // 0 = right, PI/2 = down, PI = left, -PI/2 = up
        this.currentAngle = -HALF_PI; // Default pointing up (tongue)
        this.targetAngle = -HALF_PI;

        // Smooth rotation
        this.rotationSpeed = 0.2;
    }

    /**
     * Called when tongue ability is used - point UP
     */
    onTongueUsed() {
        this.targetAngle = -HALF_PI; // Point up
    }

    /**
     * Called when teleport/shift ability is used - point DOWN
     */
    onTeleportUsed() {
        this.targetAngle = HALF_PI; // Point down
    }

    /**
     * Draw the ability indicator (fixed to screen)
     */
    draw() {
        camera.off();

        // Smoothly rotate toward target angle
        let angleDiff = this.targetAngle - this.currentAngle;
        // Normalize angle difference to -PI to PI
        while (angleDiff > PI) angleDiff -= TWO_PI;
        while (angleDiff < -PI) angleDiff += TWO_PI;
        this.currentAngle += angleDiff * this.rotationSpeed;

        push();

        // Draw base white circle
        fill(this.baseColor);
        stroke(this.outlineColor);
        strokeWeight(this.outlineWeight);
        ellipse(this.x, this.y, this.size, this.size);

        // Draw black 3/4 circle overlay that rotates
        fill(this.overlayColor);
        noStroke();

        const radius = this.size / 2 - 2;

        // The opening (1/4 missing) points in the direction of currentAngle
        // Draw 3/4 of a circle, leaving a gap where currentAngle points
        const gapSize = HALF_PI; // 1/4 of circle (90 degrees)
        const startAngle = this.currentAngle + gapSize / 2;
        const endAngle = this.currentAngle + TWO_PI - gapSize / 2;

        this._drawArcWedge(this.x, this.y, radius, startAngle, endAngle);

        pop();

        camera.on();
    }

    /**
     * Draw an arc wedge (pie slice shape)
     * @private
     */
    _drawArcWedge(cx, cy, radius, startAngle, endAngle) {
        beginShape();
        vertex(cx, cy); // Center point
        for (let a = startAngle; a <= endAngle; a += 0.1) {
            vertex(cx + cos(a) * radius, cy + sin(a) * radius);
        }
        // Make sure we hit the exact end angle
        vertex(cx + cos(endAngle) * radius, cy + sin(endAngle) * radius);
        vertex(cx, cy); // Back to center
        endShape(CLOSE);
    }

    /**
     * Update (call in draw loop)
     */
    update() {
        this.draw();
    }
}
