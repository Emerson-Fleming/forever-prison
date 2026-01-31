# p5.js with p5.play Project

A modular game project using p5.js and the p5.play extension.

## Project Structure

```
project-weak-good/
├── index.html              # Main entry point (loads current level)
├── sketch.js               # (Legacy - can be removed)
├── js/
│   ├── classes/            # Reusable game classes
│   │   ├── Game.js         # Core game manager
│   │   ├── Player.js       # Player class with movement
│   │   └── TeleportingPlatform.js
│   └── levels/             # Individual level sketches
│       ├── level1.js       # Introduction level
│       └── level2.js       # Second level example
├── assets/
│   ├── images/             # Image assets
│   └── sounds/             # Sound assets
└── README.md
```

## Getting Started

1. Open `index.html` in a web browser
2. Or press `F5` in VS Code to launch with debugging

## Switching Levels

To switch between levels, edit `index.html` and change the level script:

```html
<!-- Change this line to load different levels -->
<script src="js/levels/level1.js"></script>
<!-- or -->
<script src="js/levels/level2.js"></script>
```

## Creating a New Level

1. Create a new file in `js/levels/` (e.g., `level3.js`)
2. Use this template:

```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    
    game.init();
    game.setupWorld(20);
    
    // Create your player
    game.createPlayer(width / 2, height / 2, {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    });
    
    // Create platforms
    game.createGround('green');
    game.createPlatform(x, y, width, height, 'color');
    
    // Add your custom elements...
}

function draw() {
    background(220);
    
    game.showInstructions(['Your instructions here']);
    game.player.update();
    game.checkPlayerFell(width / 2, height / 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
```

3. Update `index.html` to load your new level

## Available Classes

### Player
- `new Player(x, y, options)` - Create a player
- `player.update()` - Handle movement (call in draw)
- `player.reset(x, y)` - Reset position
- `player.setPlatforms(group)` - Set collision group

### TeleportingPlatform
- `new TeleportingPlatform(pointA, pointB, dimA, dimB, colorA, colorB, platformGroup)`
- `platform.update()` - Check for shift press
- `platform.teleport()` - Manually teleport

### Game
- `game.init()` - Initialize game
- `game.setupWorld(gravity)` - Set gravity
- `game.createPlayer(x, y, options)` - Create player
- `game.createGround(color)` - Create ground platform
- `game.createPlatform(x, y, w, h, color)` - Create platform
- `game.showInstructions(array)` - Display text
- `game.checkPlayerFell(resetX, resetY)` - Reset if fallen

## Controls

- **Move Left**: Left Arrow or A
- **Move Right**: Right Arrow or D
- **Jump**: Space, W, or Up Arrow
- **Toggle Teleporting Platforms**: Shift

## Learn More

- [p5.js Documentation](https://p5js.org/reference/)
- [p5.play Documentation](https://p5play.org/learn/)
