const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let zoom = 2;
// Sprite size
const w = 32;
const h = 32;

function updateHoverBlock(e) {
    const mouse = {
        position: {
            x: e.clientX / scaledCanvas.scale - camera.position.x,
            y: e.clientY / scaledCanvas.scale - camera.position.y,
        },
        width: 1,
        height: 1,
    }

    for (let i = map.length - 1; i >= 0; i--) {
        const block = map[i];
        if (hoverBlock) {
            hoverBlock.position.y += 5;
            hoverBlock = null;
        }
        if (collision({
            object1: mouse,
            object2: block,
        })) {
            hoverBlock = block;
            hoverBlock.position.y -= 5;
            break;
        }
    }
}

let hoverBlock = null;
canvas.addEventListener('mousemove', (e) => {
    updateHoverBlock(e);
});

canvas.addEventListener('mousedown', (e) => {
    if (!hoverBlock) return;
    map.splice(map.indexOf(hoverBlock), 1);
    updateHoverBlock(e);
});

window.addEventListener('wheel', (e) => {
    const delta = Math.sign(e.deltaY); // -1 for down, 1 for up, 0 for no movement
    zoom -= delta * .1;
  
    // clamp zoom
    zoom = Math.max(1.2, Math.min(3, zoom));
    scaledCanvas.scale = zoom;

    updateHoverBlock(e);
});

const scaledCanvas = {
    scale: zoom,
    width: canvas.width / this.scale,
    height: canvas.height / this.scale,
};

function seededRandom(seed) {
    const m = 2**35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}
Math.random = seededRandom(238);

function getRandomChance(n) {
    return Math.floor(Math.random() * n) === 0;
}

const perlin = new Perlin();
map = [];
function generateChunk(chunkX, chunkY, chunkSize = 16) {
    for (let y = 0; y < chunkSize; y++) {
        for (let x = 0; x < chunkSize; x++) {
            const worldX = chunkX * chunkSize + x;
            const worldY = chunkY * chunkSize + y;
            const noiseVal = perlin.octaveNoise(worldX / 16.0, worldY / 16.0, 6, .5); // Adjust scaling for terrain features.

            const isoBlock = to_screen_coordinate({ x: worldX, y: worldY });
            const block = new Sprite({
                position: {
                    x: isoBlock.x,
                    y: isoBlock.y + noiseVal * 100,
                },
                imageSrc: getRandomChance(20) ? `./img/tiles/tile_025.png` : `./img/tiles/tile_023.png`,
            });
            map.push(block);
        }
    }
}

for (let cx = 0; cx < 4; cx++) {
    for (let cy = 0; cy < 4; cy++) {
        generateChunk(cx,cy);
    }
}

// const singleNoise = perlin.noise(2.5, 3.7);

const frictionMultiplier = 0.45;
const playerSpeed = 0.3;
const jumpStrength = 6;

const collisions = []; //////////////////////////
const collisions2D = [];
for (let i = 0; i < collisions.length; i += 32) {
    collisions2D.push(collisions.slice(i, i + 32));
}

const collisionBlocks = [];
collisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 202) {
            collisionBlocks.push(new CollisionBlock({
                position: {
                    x: x * 16,
                    y: y * 16,
                },
            }));
        }
    });
});

const player1 = new Player({
    position: {
        x: 0,
		y: 500,
    },
    scale: 1,
    collisionBlocks,
    imageSrc: `./img/player/Idle.png`,
    frameRate: 1,
    animations: {
        Idle: {
            imageSrc: `./img/player/Idle.png`,
            frameRate: 1,
            frameBuffer: 0,
        },
    }
});

const camera = {
    position: {
        x: -player1.position.x + window.innerWidth / scaledCanvas.scale / 2,
		y: -player1.position.y + window.innerHeight / scaledCanvas.scale / 2,
    },
};

function animate() {
    window.requestAnimationFrame(animate);

    // fill bg with black
    c.fillStyle = "rgb(0, 0, 0)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.scale(scaledCanvas.scale, scaledCanvas.scale);
    c.translate(camera.position.x, camera.position.y);
    
    for (const block of map) {
        block.update();
    }

    // collisionBlocks.forEach((collisionBlock) => {
    //     collisionBlock.update();
    // });

    player1.update();

    c.restore();
}

animate();

document.addEventListener("keydown", (e) => {
    switch (e.key.toUpperCase()) {
        case "D": player1.keys.right = true; break;
        case "A": player1.keys.left = true; break;
        case "S": player1.keys.down = true; break;
        case "W": player1.keys.up = true; break;
    }
});

document.addEventListener("keyup", (e) => {
    switch (e.key.toUpperCase()) {
        case "D": player1.keys.right = false; break;
        case "A": player1.keys.left = false; break;
        case "S": player1.keys.down = false; break;
        case "W": player1.keys.up = false; break;
    }
});