// Level Template
// Copy this file and modify it to create a new level

// ==================== LEVEL CONFIGURATION ====================
// All level-specific settings go here for easy editing

const LevelConfig = {
    // Player spawn settings
    player: {
        getSpawnX: () => 100,
        getSpawnY: () => height / 2,
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    },

    // Health bar settings
    healthBar: {
        maxHealth: 5,
        x: 30,
        y: 30,
        heartSize: 30
    },

    // Ground settings (null to skip ground creation)
    ground: {
        color: 'brown'
    },

    // Static platforms: array of platform configs
    // Each platform: { x, y, width, height, color, useTexture }
    staticPlatforms: [
        // Example:
        // { x: 300, y: 400, width: 150, height: 20, color: 'brown', useTexture: false }
    ],

    // Teleporting platforms: array of teleport configs
    // Each: { pointA, pointB, dimA, dimB, colorA, colorB }
    teleportingPlatforms: [
        // Example:
        // {
        //     pointA: { x: 200, y: 300 },
        //     pointB: { x: 400, y: 200 },
        //     dimA: { width: 100, height: 20 },
        //     dimB: { width: 100, height: 20 },
        //     colorA: 'red',
        //     colorB: 'pink'
        // }
    ],

    // Enemies: array of enemy configs
    enemies: [
        // Example:
        // {
        //     x: 500,
        //     y: 300,
        //     width: 40,
        //     height: 40,
        //     color: 'red',
        //     shootInterval: 1500,
        //     bulletSpeed: 6,
        //     bulletColor: 'darkred',
        //     hasShield: true,
        //     shieldHealth: 3
        // }
    ],

    // UI instructions shown at top of screen
    instructions: [
        'Level Name',
        'Use Arrow Keys or WASD to move, Space to Jump',
        'Additional instructions here'
    ]
};

// ==================== LEVEL OBJECTS ====================
// Track all level-specific objects for cleanup

let levelStaticPlatforms = [];
let levelTeleportingPlatforms = [];
let levelEnemies = [];

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
    // Background - use game.createPaperBackground() for textured, or background(color) for solid
    game.createPaperBackground();

    if (!game.isGameOver) {
        game.showInstructions(LevelConfig.instructions);

        // Update player
        game.player.update();

        // Update teleporting platforms
        for (let platform of levelTeleportingPlatforms) {
            platform.update();
        }

        // Update enemies
        for (let enemy of levelEnemies) {
            enemy.update(game.player, game.platforms);
        }

        // Check if player fell
        game.checkPlayerFell(
            LevelConfig.player.getSpawnX(),
            LevelConfig.player.getSpawnY()
        );

        game.checkGameOver();
    }

    // Always draw health bar
    if (game.healthBar) {
        game.healthBar.update();
    }

    game.drawGameOver();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ==================== LEVEL CREATION HELPERS ====================

/**
 * Create all static and teleporting platforms
 */
function createLevelGeometry() {
    // Ground
    if (LevelConfig.ground) {
        game.createGround(LevelConfig.ground.color);
    }

    // Static platforms
    levelStaticPlatforms = [];
    for (let cfg of LevelConfig.staticPlatforms) {
        const platform = new StaticPlatform(
            cfg.x, cfg.y,
            cfg.width, cfg.height,
            cfg.color,
            game.platforms,
            cfg.useTexture || false
        );
        levelStaticPlatforms.push(platform);
    }

    // Teleporting platforms
    levelTeleportingPlatforms = [];
    for (let cfg of LevelConfig.teleportingPlatforms) {
        const platform = new TeleportingPlatform(
            cfg.pointA,
            cfg.pointB,
            cfg.dimA,
            cfg.dimB,
            cfg.colorA,
            cfg.colorB,
            game.platforms
        );
        levelTeleportingPlatforms.push(platform);
    }
}

/**
 * Create player, health bar, and enemies
 */
function createLevelEntities() {
    const playerCfg = LevelConfig.player;
    const healthCfg = LevelConfig.healthBar;

    // Player
    game.createPlayer(playerCfg.getSpawnX(), playerCfg.getSpawnY(), {
        color: playerCfg.color,
        moveSpeed: playerCfg.moveSpeed,
        jumpForce: playerCfg.jumpForce
    });

    // Health bar
    game.createHealthBar(healthCfg.maxHealth, {
        x: healthCfg.x,
        y: healthCfg.y,
        heartSize: healthCfg.heartSize
    });

    // Enemies
    levelEnemies = [];
    for (let cfg of LevelConfig.enemies) {
        const enemy = new Enemy(cfg.x, cfg.y, cfg);
        game.player.addEnemy(enemy);
        levelEnemies.push(enemy);
    }
}

/**
 * Set up the restart callback to clean up level objects
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
    // Clean static platforms
    for (let obj of levelStaticPlatforms) {
        if (obj && obj.remove) obj.remove();
    }
    levelStaticPlatforms = [];

    // Clean teleporting platforms
    for (let obj of levelTeleportingPlatforms) {
        if (obj && obj.remove) obj.remove();
    }
    levelTeleportingPlatforms = [];

    // Clean enemies
    for (let obj of levelEnemies) {
        if (obj && obj.remove) obj.remove();
    }
    levelEnemies = [];
}
