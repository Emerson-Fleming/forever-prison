// TeleportingPlatform.js
// A platform that teleports between two positions when shift is pressed

class TeleportingPlatform {
    constructor(pointA, pointB, dimA, dimB, colorA, colorB, platformGroup) {
        // Store positions
        this.pointA = pointA; // { x, y }
        this.pointB = pointB; // { x, y }

        // Store dimensions
        this.dimA = dimA; // { width, height }
        this.dimB = dimB; // { width, height }

        // Store colors
        this.colorA = colorA;
        this.colorB = colorB;

        // Track current state (true = at point A, false = at point B)
        this.atPointA = true;

        // Create the sprite
        this.sprite = new platformGroup.Sprite();
        this.sprite.x = this.pointA.x;
        this.sprite.y = this.pointA.y;
        this.sprite.width = this.dimA.width;
        this.sprite.height = this.dimA.height;
        this.sprite.color = this.colorA;
        this.sprite.collider = 'kinematic';
    }

    // Set platform dimensions
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
    }

    // Toggle between point A and point B
    teleport() {
        if (this.atPointA) {
            // Teleport to point B
            this.sprite.x = this.pointB.x;
            this.sprite.y = this.pointB.y;
            this.sprite.width = this.dimB.width;
            this.sprite.height = this.dimB.height;
            this.sprite.color = this.colorB;
            this.atPointA = false;
        } else {
            // Teleport to point A
            this.sprite.x = this.pointA.x;
            this.sprite.y = this.pointA.y;
            this.sprite.width = this.dimA.width;
            this.sprite.height = this.dimA.height;
            this.sprite.color = this.colorA;
            this.atPointA = true;
        }
    }

    // Check if shift is pressed and teleport
    update() {
        if (kb.presses('shift')) {
            this.teleport();
        }
    }
}
