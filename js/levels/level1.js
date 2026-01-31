// Level 1 - Introduction level with teleporting platform

let teleportingPlatform;

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);

    // Initialize game
    game.init();
    game.setupWorld(20);

    // Create player
    game.createPlayer(width / 2, height / 2, {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    });

    // Create ground
    game.createGround('green');

    // Create teleporting platform
    teleportingPlatform = new TeleportingPlatform(
        { x: width / 4, y: height - 200 },       // Point A position
        { x: (3 * width) / 4, y: height - 350 }, // Point B position
        { width: 150, height: 20 },              // Point A dimensions
        { width: 500, height: 100 },             // Point B dimensions
        'purple',                                 // Point A color
        'orange',                                 // Point B color
        game.platforms                            // Platform group
    );
}

function draw() {
    // Background
    background(220);

    // Display instructions
    game.showInstructions([
        'Level 1 - Use Arrow Keys or WASD to move',
        'Press Space to Jump',
        'Press Shift to toggle the teleporting platform'
    ]);

    // Update player
    game.player.update();

    // Update teleporting platform
    teleportingPlatform.update();

    // Check if player fell
    game.checkPlayerFell(width / 2, height / 2);
}

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
