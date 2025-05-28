// Matter.js module aliases
const { Engine, World, Bodies, Composite, Query, Constraint, Body} = Matter;

// Create a Matter.js engine and world
let engine;
let world;
let player;
let platforms = [];
let loadedPlatforms = new Set(); // Track which platforms we've loaded by their y position
let CANVAS_WIDTH = 1200;
let CANVAS_HEIGHT = 800;
const loadDistance = 800; // How far ahead to load platforms

// Game state
let gameState = 'playing'; // 'playing', 'won', 'lost'
const VICTORY_HEIGHT = 15000; // Height needed to win
const DEFEAT_HEIGHT = -100; // Height at which player loses

function resetGame() {
    // Clear existing world
    World.clear(world);
    Engine.clear(engine);
    
    // Reset variables
    platforms = [];
    loadedPlatforms.clear();
    gameState = 'playing';
    
    // Create new player
    player = new Player(0, 100);
    
    // Load initial platforms
    loadPlatformsAroundY(height);
}

function loadPlatformsAroundY(y) {
    // Load platforms that are within loadDistance of y position
    for (let platformData of levelData.platforms) {
        // Only load if it's within our loading range and hasn't been loaded yet
        if (platformData.y < y + loadDistance && 
            platformData.y > y - loadDistance && 
            !loadedPlatforms.has(platformData.y)) {
            if (platformData.type === 'platform') {
                platforms.push(new Platform(
                    platformData.x,
                    platformData.y,
                platformData.width,
                platformData.height,
                ));
            }
            else if (platformData.type === 'spinning') {
                platforms.push(new SpinningPlatform(
                    platformData.x,
                    platformData.y,
                    platformData.width,
                    platformData.height,
                    platformData.angularSpeed
                ));
            }
            loadedPlatforms.add(platformData.y);
        }
    }
}

function setup() {
    // Create p5.js canvas
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Create engine and world
    engine = Engine.create();
    engine.gravity.y = -1;  // Invert gravity direction
    world = engine.world;

    // Create player
    player = new Player(0, 16000);

    // Load initial platforms
    loadPlatformsAroundY(height);
}

function draw() {
    if (gameState === 'playing') {
        background(220);
        
        // Update physics engine
        Engine.update(engine);

        player.update(platforms);
        
        // Check win/lose conditions
        if (player.body.position.y >= VICTORY_HEIGHT) {
            gameState = 'won';
        } else if (player.body.position.y <= DEFEAT_HEIGHT) {
            gameState = 'lost';
        }
        
        // Set up coordinate system with positive Y going up
        translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        scale(1, -1);  // Flip Y axis
        translate(-player.body.position.x, -player.body.position.y);
        
        // Load more platforms if needed
        loadPlatformsAroundY(player.body.position.y);
        
        // Remove platforms that are too far below
        platforms = platforms.filter(platform => {
            if (platform.body.position.y < player.body.position.y - loadDistance) {
                World.remove(world, platform.body);
                return false;
            }
            return true;
        });

        // Draw all platforms
        for (let platform of platforms) {
            platform.update();
            platform.show();
        }

        // Draw player
        player.show();
        
    } else {
        // Draw end screen
        background(0, 150); // Semi-transparent black
        
        // Reset coordinate system for UI
        resetMatrix();
        
        // Set up text properties
        textAlign(CENTER, CENTER);
        textSize(64);
        fill(255);
        noStroke();
        
        // Draw message based on game state
        if (gameState === 'won') {
            text('Well done!\nThanks for playing!', CANVAS_WIDTH/2, CANVAS_HEIGHT/3);
        } else if (gameState === 'lost') {
            text('Game Over', CANVAS_WIDTH/2, CANVAS_HEIGHT/3);
            textSize(32);
            text('Score: ' + round(player.maxY), CANVAS_WIDTH/2, CANVAS_HEIGHT/2+300);
        }
        
        // Draw restart instruction
        textSize(32);
        text('Press SPACE to play again', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
    }
}

function mousePressed() {
    if (gameState === 'playing') {
        // Convert mouse coordinates to world coordinates
        let worldX = mouseX - CANVAS_WIDTH/2 + player.body.position.x;
        let worldY = -(mouseY - CANVAS_HEIGHT/2) + player.body.position.y;
        player.launch(worldX, worldY);
    }
}

function keyPressed() {
    if (gameState !== 'playing' && keyCode === 32) { // 32 is spacebar
        resetGame();
    } else {
        let worldX = mouseX - CANVAS_WIDTH/2 + player.body.position.x;
        let worldY = -(mouseY - CANVAS_HEIGHT/2) + player.body.position.y;
        console.log(round(worldX), round(worldY));
    }
}