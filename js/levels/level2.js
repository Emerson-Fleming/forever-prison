// Level 2 - Multiple Teleporting Platforms
// A level with multiple teleporting platforms to navigate

// ==================== LEVEL CONFIGURATION ====================

const Level2Config = {
    player: {
        x: 100,
        getY: () => height / 2,
        color: 'blue',
        moveSpeed: 6,
        jumpForce: 10
    },

    staticPlatforms: [
        { xOffset: 200, yOffset: -150, width: 150, height: 20, color: 'brown' },
        { xOffset: -200, yOffset: -150, width: 150, height: 20, color: 'brown' }
    ],

    teleportingPlatforms: [
        {
            pointA: { xRatio: 1/3, yOffset: -250 },
            pointB: { xRatio: 1/3, yOffset: -400 },
            dim: { width: 120, height: 20 },
            colorA: 'red',
            colorB: 'pink'
        },
        {
            pointA: { xRatio: 2/3, yOffset: -300 },
            pointB: { xRatio: 2/3, yOffset: -450 },
            dim: { width: 120, height: 20 },
            colorA: 'cyan',
            colorB: 'lightblue'
        }
    ],

    instructions: [
        'Level 2 - Reach the top!',
        'Use Arrow Keys or WASD to move, Space to Jump',
        'Press Shift to toggle ALL teleporting platforms'
    ]
};

// ==================== LEVEL OBJECTS ====================

let teleportingPlatforms = [];

// ==================== LEVEL LIFECYCLE ====================

function setup() {
    createCanvas(windowWidth, windowHeight);

    game.init();
    game.initializeGravity(20);

    createLevelGeometry();
    createLevelEntities();
    setupRestartCallback();
}

function draw() {
    // Simple background for level 2
    background(180, 200, 220);

    game.showInstructions(Level2Config.instructions);

    game.player.update();

    // Update all teleporting platforms
    for (let platform of teleportingPlatforms) {
        platform.update();
    }

    game.checkPlayerFell(Level2Config.player.x, Level2Config.player.getY());
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ==================== LEVEL CREATION HELPERS ====================

/**
 * Create all platforms
 */
function createLevelGeometry() {
    // Ground
    game.createGround('darkgreen');

    // Static platforms
    for (let cfg of Level2Config.staticPlatforms) {
        const x = cfg.xOffset > 0 ? cfg.xOffset : width + cfg.xOffset;
        game.createPlatform(x, height + cfg.yOffset, cfg.width, cfg.height, cfg.color);
    }

    // Teleporting platforms
    teleportingPlatforms = [];
    for (let cfg of Level2Config.teleportingPlatforms) {
        const platform = new TeleportingPlatform(
            { x: width * cfg.pointA.xRatio, y: height + cfg.pointA.yOffset },
            { x: width * cfg.pointB.xRatio, y: height + cfg.pointB.yOffset },
            cfg.dim,
            cfg.dim,
            cfg.colorA,
            cfg.colorB,
            game.platforms
        );
        teleportingPlatforms.push(platform);
    }
}

/**
 * Create player
 */
function createLevelEntities() {
    const cfg = Level2Config.player;
    game.createPlayer(cfg.x, cfg.getY(), {
        color: cfg.color,
        moveSpeed: cfg.moveSpeed,
        jumpForce: cfg.jumpForce
    });
}

/**
 * Set up the restart callback
 */
function setupRestartCallback() {
    game.setRestartCallback(() => {
        cleanupLevelObjects();
        setup();
    });
}

/**
 * Clean up all level-specific objects
 */
function cleanupLevelObjects() {
    for (let platform of teleportingPlatforms) {
        if (platform && platform.remove) {
            platform.remove();
        }
    }
    teleportingPlatforms = [];
}
