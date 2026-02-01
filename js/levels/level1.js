// Level 1 - Jail Cell Escape
// A beginner level teaching basic mechanics

// ==================== DEBUG FLAGS ====================

const DEBUG = {
    showMouseCoords: true,   // Show mouse X/Y world coordinates
    showFPS: true,           // Show frames per second
    showPlayerPos: true,     // Show player world position
    showHitboxes: false,     // Show collision hitboxes for sprites
    showCameraInfo: false,   // Show camera position and bounds
    showGrid: false,         // Show grid overlay (100px spacing)
    gridSize: 100,           // Grid cell size in pixels
    logClickPosition: true   // Click + L key to log position to console for easy copy/paste
};

// ==================== LEVEL CONFIGURATION ====================

const Level1Config = {
    // Jail cell dimensions
    jail: {
        x: 100,
        wallThickness: 20,
        width: 200,
        height: 200,
        getY: () => height - 250
    },

    // Player settings
    player: {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8,
        getSpawnX: function () { return Level1Config.jail.x + Level1Config.jail.width / 2; },
        getSpawnY: function () { return Level1Config.jail.getY() + Level1Config.jail.height / 2; }
    },

    // Enemy settings
    enemy: {
        width: 40,
        height: 40,
        color: 'red',
        shootInterval: 1500,
        bulletSpeed: 6,
        bulletColor: 'darkred',
        bulletSize: 10,
        hasShield: true,
        shieldHealth: 3,
        shieldColor: 'cyan',
        shieldRadius: 35,
        getX: function () { return Level1Config.jail.x + Level1Config.jail.width + 150; },
        getY: function () { return Level1Config.jail.getY() + Level1Config.jail.height / 2; }
    },

    // Instructions
    instructions: [
        'Level 1 - Jail Cell Escape!',
        'Use Arrow Keys or WASD to move, Space to Jump',
        'Press Shift to teleport the RED WALL and escape',
        'Click to shoot tongue - Break the enemy\'s shield first!'
    ]
};

// ==================== LEVEL OBJECTS ====================

let jailBackWall;
let jailCeiling;
let jailRightWall;
let waitingEnemy;

// Teleporting platforms for the gauntlet
let teleportPlatform1;
let teleportPlatform2;
let teleportPlatform3;
let teleportPlatform4;

// Face mask display
let faceMask;

// ==================== LEVEL LIFECYCLE ====================

/**
 * Preload assets before setup runs
 */
function preload() {
    // Load background music (game-wide, loops forever)
    game.loadBackgroundMusic('assets/sounds/mask game theme song.wav', 0.3);

    // Load face and mask images
    FaceMask.preloadImages('assets/images/face.png', 'assets/images/mask.png');
}

function setup() {
    // Create canvas
    new Canvas(windowWidth, windowHeight);

    game.init();
    game.initializeGravity(20);

    // Enable camera scrolling
    game.enableCamera({
        scrollThresholdRight: 0.8,  // Scroll when player is in right 20%
        scrollThresholdLeft: 0.2,   // Scroll when player is in left 20%
        scrollSpeed: 0.15,           // Smooth following
        minX: 0,                     // Don't scroll past left edge
        maxX: 3000 - width           // Stop scrolling at the end of the ground
    });

    createLevelGeometry();
    createLevelEntities();
    setupRestartCallback();

    // Create the face mask display (below the hearts)
    // Hearts are at y=30, heartSize=30, so place mask below at y ~= 30 + 30 + 50 = 110
    faceMask = new FaceMask(80, 120, 100);
    faceMask.setImages();
}

function draw() {
    game.createPaperBackground();

    // Update and draw face mask (in screen space, not affected by camera)
    if (faceMask) {
        faceMask.update();
        push();
        camera.off(); // Draw in screen space
        faceMask.draw();
        camera.on();
        pop();
    }

    if (!game.isGameOver) {
        // Update camera to follow player
        game.updateCamera();

        game.showInstructions(Level1Config.instructions);

        game.player.update();
        jailRightWall.update();
        waitingEnemy.update(game.player, game.platforms);

        // Update teleporting platforms
        teleportPlatform1.update();
        teleportPlatform2.update();
        teleportPlatform3.update();
        teleportPlatform4.update();

        // Track ability usage for the indicator
        trackAbilityUsage();

        game.checkPlayerFell(
            Level1Config.player.getSpawnX(),
            Level1Config.player.getSpawnY()
        );
        game.checkGameOver();
    }

    if (game.healthBar) {
        game.healthBar.update();
    }

    if (game.abilityIndicator) {
        game.abilityIndicator.update();
    }

    // ===== DEBUG TOOLS =====
    drawDebugTools();
}

// ==================== ABILITY TRACKING ====================

/**
 * Track when abilities are used and update the indicator
 */
function trackAbilityUsage() {
    if (!game.abilityIndicator) return;

    // Detect shift press (teleport ability)
    if (kb.presses('shift')) {
        game.abilityIndicator.onTeleportUsed();
    }

    // Detect tongue usage (mouse click while not already extending)
    if (game.player && game.player.tongueState === 'extending') {
        // Only trigger once when tongue starts extending
        if (!window._tongueWasExtending) {
            game.abilityIndicator.onTongueUsed();
        }
        window._tongueWasExtending = true;
    } else {
        window._tongueWasExtending = false;
    }
}

// ==================== INPUT HANDLERS ====================

/**
 * Handle key press events
 */
function keyPressed() {
    // Toggle mute with M key
    if (key === 'm' || key === 'M') {
        game.toggleMute();
        return false; // Prevent default behavior
    }
}

// ==================== DEBUG TOOLS ====================

/**
 * Master function to draw all enabled debug tools
 */
function drawDebugTools() {
    // Grid (draw first, in world space)
    if (DEBUG.showGrid) {
        drawDebugGrid();
    }

    // Hitboxes (in world space)
    if (DEBUG.showHitboxes) {
        drawHitboxes();
    }

    // Screen-fixed debug info
    camera.off();

    let debugY = 60; // Starting Y position for debug panel

    if (DEBUG.showFPS) {
        drawFPS(debugY);
        debugY += 25;
    }

    if (DEBUG.showPlayerPos) {
        drawPlayerPos(debugY);
        debugY += 25;
    }

    if (DEBUG.showCameraInfo) {
        drawCameraInfo(debugY);
        debugY += 45;
    }

    if (DEBUG.showMouseCoords) {
        drawMouseCoords();
    }

    if (DEBUG.logClickPosition) {
        checkLogClick();
    }

    camera.on();
}

/**
 * Draw FPS counter
 */
function drawFPS(yPos) {
    push();
    fill(0, 0, 0, 180);
    noStroke();
    rect(width - 80, yPos - 15, 70, 22, 5);

    fill(0, 255, 0);
    textSize(14);
    textAlign(RIGHT);
    text(`FPS: ${Math.round(frameRate())}`, width - 15, yPos);
    pop();
}

/**
 * Draw player world position
 */
function drawPlayerPos(yPos) {
    if (!game.player) return;

    const px = Math.round(game.player.x);
    const py = Math.round(game.player.y);

    push();
    fill(0, 0, 0, 180);
    noStroke();
    rect(width - 160, yPos - 15, 150, 22, 5);

    fill(0, 255, 255);
    textSize(14);
    textAlign(RIGHT);
    text(`Player: (${px}, ${py})`, width - 15, yPos);
    pop();
}

/**
 * Draw camera info
 */
function drawCameraInfo(yPos) {
    push();
    fill(0, 0, 0, 180);
    noStroke();
    rect(width - 180, yPos - 15, 170, 42, 5);

    fill(255, 165, 0);
    textSize(14);
    textAlign(RIGHT);
    text(`Camera X: ${Math.round(game.camera.x)}`, width - 15, yPos);
    text(`Bounds: ${game.camera.minX} - ${game.camera.maxX || '∞'}`, width - 15, yPos + 20);
    pop();
}

/**
 * Draw mouse coordinates on screen (for level design)
 */
function drawMouseCoords() {
    // Calculate world coordinates from mouse position
    const worldX = Math.round(mouseX + (camera.x - width / 2));
    const worldY = Math.round(mouseY + (camera.y - height / 2));

    push();
    // Background box for readability
    fill(0, 0, 0, 180);
    noStroke();
    rect(mouseX + 15, mouseY - 25, 130, 50, 5);

    // Text
    fill(255, 255, 0);
    textSize(14);
    textAlign(LEFT);
    text(`World X: ${worldX}`, mouseX + 22, mouseY - 8);
    text(`World Y: ${worldY}`, mouseX + 22, mouseY + 12);

    // Crosshair at mouse position
    stroke(255, 255, 0);
    strokeWeight(1);
    line(mouseX - 10, mouseY, mouseX + 10, mouseY);
    line(mouseX, mouseY - 10, mouseX, mouseY + 10);
    pop();
}

/**
 * Draw grid overlay in world space
 */
function drawDebugGrid() {
    const gridSize = DEBUG.gridSize;
    const camOffsetX = camera.x - width / 2;
    const camOffsetY = camera.y - height / 2;

    // Calculate visible area in world coords
    const startX = Math.floor(camOffsetX / gridSize) * gridSize;
    const startY = Math.floor(camOffsetY / gridSize) * gridSize;
    const endX = camOffsetX + width + gridSize;
    const endY = camOffsetY + height + gridSize;

    push();
    stroke(255, 255, 255, 50);
    strokeWeight(1);

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        line(x, startY, x, endY);
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        line(startX, y, endX, y);
    }

    // Draw coordinate labels at grid intersections
    fill(255, 255, 255, 100);
    textSize(10);
    textAlign(LEFT);
    noStroke();
    for (let x = startX; x <= endX; x += gridSize * 2) {
        for (let y = startY; y <= endY; y += gridSize * 2) {
            text(`${x},${y}`, x + 3, y + 12);
        }
    }
    pop();
}

/**
 * Draw hitboxes for sprites
 */
function drawHitboxes() {
    push();
    noFill();
    strokeWeight(2);

    // Player hitbox
    if (game.player && game.player.sprite) {
        stroke(0, 255, 0, 150);
        rectMode(CENTER);
        rect(game.player.sprite.x, game.player.sprite.y,
            game.player.sprite.width, game.player.sprite.height);
    }

    // Enemy hitboxes
    if (waitingEnemy && waitingEnemy.sprite) {
        stroke(255, 0, 0, 150);
        rectMode(CENTER);
        rect(waitingEnemy.sprite.x, waitingEnemy.sprite.y,
            waitingEnemy.sprite.width, waitingEnemy.sprite.height);

        // Shield radius
        if (waitingEnemy.hasShield) {
            stroke(0, 255, 255, 100);
            noFill();
            ellipse(waitingEnemy.sprite.x, waitingEnemy.sprite.y,
                waitingEnemy.shieldRadius * 2);
        }
    }

    // Platform hitboxes
    if (game.platforms) {
        stroke(255, 165, 0, 100);
        for (let p of game.platforms) {
            rectMode(CENTER);
            rect(p.x, p.y, p.width, p.height);
        }
    }
    pop();
}

/**
 * Log click position to console when L key is held
 */
function checkLogClick() {
    if (mouseIsPressed && keyIsDown(76)) { // 76 = 'L' key
        const worldX = Math.round(mouseX + (camera.x - width / 2));
        const worldY = Math.round(mouseY + (camera.y - height / 2));

        // Only log once per click (use a simple debounce)
        if (!window._lastLogTime || millis() - window._lastLogTime > 500) {
            console.log(`%c📍 Position: { x: ${worldX}, y: ${worldY} }`, 'color: yellow; font-weight: bold;');
            console.log(`   Platform code: new StaticPlatform(${worldX}, ${worldY}, 150, 20, 'brown', game.platforms, false);`);
            console.log(`   TeleportingPlatform point: { x: ${worldX}, y: ${worldY} }`);
            window._lastLogTime = millis();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ==================== LEVEL CREATION HELPERS ====================

/**
 * Create all static and teleporting platforms
 */
function createLevelGeometry() {
    const cfg = Level1Config.jail;
    const jailY = cfg.getY();

    // Ground - extend it to 3000 pixels wide for a linear gauntlet
    game.createGround('brown', 3000);

    // Back wall (left side)
    jailBackWall = new StaticPlatform(
        cfg.x - cfg.wallThickness / 2,
        jailY + cfg.height / 2,
        cfg.wallThickness,
        cfg.height,
        'gray',
        game.platforms,
        true
    );

    // Ceiling
    jailCeiling = new StaticPlatform(
        cfg.x + cfg.width / 2,
        jailY - cfg.wallThickness / 2,
        cfg.width + cfg.wallThickness * 2,
        cfg.wallThickness,
        'darkgray',
        game.platforms,
        true
    );

    // Right wall (teleporting)
    jailRightWall = new TeleportingPlatform(
        { x: cfg.x + cfg.width + cfg.wallThickness / 2, y: jailY + cfg.height / 2 },
        { x: cfg.x + cfg.width + cfg.wallThickness / 2, y: jailY - 200 },
        { width: cfg.wallThickness, height: cfg.height },
        { width: cfg.wallThickness, height: cfg.wallThickness },
        'red',
        'pink',
        game.platforms
    );

    // Add teleporting platforms to the right for the gauntlet
    const groundY = height - 50;

    // Platform 1 - teleports between low and high position
    teleportPlatform1 = new TeleportingPlatform(
        { x: 600, y: groundY - 100 },
        { x: 600, y: groundY - 250 },
        { width: 150, height: 20 },
        { width: 150, height: 20 },
        'brown',
        'sienna',
        game.platforms
    );

    // Platform 2 - teleports horizontally
    teleportPlatform2 = new TeleportingPlatform(
        { x: 850, y: groundY - 200 },
        { x: 950, y: groundY - 200 },
        { width: 120, height: 20 },
        { width: 120, height: 20 },
        'brown',
        'sienna',
        game.platforms
    );

    // Platform 3 - teleports diagonally
    teleportPlatform3 = new TeleportingPlatform(
        { x: 1100, y: groundY - 150 },
        { x: 1200, y: groundY - 300 },
        { width: 150, height: 20 },
        { width: 150, height: 20 },
        'brown',
        'sienna',
        game.platforms
    );

    // Platform 4 - teleports between two heights
    teleportPlatform4 = new TeleportingPlatform(
        { x: 1400, y: groundY - 180 },
        { x: 1400, y: groundY - 350 },
        { width: 120, height: 20 },
        { width: 120, height: 20 },
        'brown',
        'sienna',
        game.platforms
    );
}

/**
 * Create player and enemies
 */
function createLevelEntities() {
    const playerCfg = Level1Config.player;
    const enemyCfg = Level1Config.enemy;

    // Player
    game.createPlayer(playerCfg.getSpawnX(), playerCfg.getSpawnY(), {
        color: playerCfg.color,
        moveSpeed: playerCfg.moveSpeed,
        jumpForce: playerCfg.jumpForce
    });

    // Health bar
    game.createHealthBar(5, { x: 30, y: 30, heartSize: 30 });

    // Enemy
    waitingEnemy = new Enemy(enemyCfg.getX(), enemyCfg.getY(), {
        width: enemyCfg.width,
        height: enemyCfg.height,
        color: enemyCfg.color,
        shootInterval: enemyCfg.shootInterval,
        bulletSpeed: enemyCfg.bulletSpeed,
        bulletColor: enemyCfg.bulletColor,
        bulletSize: enemyCfg.bulletSize,
        hasShield: enemyCfg.hasShield,
        shieldHealth: enemyCfg.shieldHealth,
        shieldColor: enemyCfg.shieldColor,
        shieldRadius: enemyCfg.shieldRadius
    });

    game.player.addEnemy(waitingEnemy);
    
    // Set enemies array for sword attacks
    game.player.setEnemies([waitingEnemy]);
}

/**
 * Set up the restart callback to clean up level objects
 */
function setupRestartCallback() {
    game.setRestartCallback(() => {
        // Clean up level-specific objects
        cleanupLevelObjects();
        // Restart
        setup();
    });
}

/**
 * Clean up all level-specific objects
 */
function cleanupLevelObjects() {
    const levelObjects = [
        jailBackWall,
        jailCeiling,
        jailRightWall,
        waitingEnemy,
        teleportPlatform1,
        teleportPlatform2,
        teleportPlatform3,
        teleportPlatform4
    ];

    for (let obj of levelObjects) {
        if (obj && obj.remove) {
            obj.remove();
        }
    }
}

// ==================== INPUT HANDLERS ====================

/**
 * Handle mouse press events
 */
function mousePressed() {
    // Check for debug click logging
    if (DEBUG.logClickPosition) {
        checkLogClick();
    }
}