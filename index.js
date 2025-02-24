const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let zoom = 2;

function updateHoverBlock(e) {
    const mouse = {
        position: {
            x: e.clientX / scaledCanvas.scale,
            y: e.clientY / scaledCanvas.scale,
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
    transX: 0,
    transY: 0,
}

function seededRandom(seed) {
    const m = 2**35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}
Math.random = seededRandom(23);

function getRandomChance(n) {
    return Math.floor(Math.random() * n) === 0;
}

const noiseMap = generatePerlinNoise2D({
    width: 50,
    height: 50,
    scale: 40,
    octaves: 8,
    persistence: 0.6,
    lacunarity: 2,
});

map = [];
for (let i_a = 0; i_a < 50; i_a++) {
    for (let i_b = 0; i_b < 50; i_b++) {
        const isoBlock = to_screen_coordinate({
            x: i_a,
            y: i_b,
        });
        const block = new Sprite({
            position: {
                x: isoBlock.x,
                y: isoBlock.y + noiseMap[i_a][i_b] * 200,
            },
            imageSrc: getRandomChance(20) ? `./img/tiles/tile_025.png` : `./img/tiles/tile_023.png`,
        });
        map.push(block);
    }
}

const gravity = 0.3;
const frictionMultiplier = 0.9;
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
    position: { x: 100, y: 100 },
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

function animate() {
    window.requestAnimationFrame(animate);

    // fill bg with black
    c.fillStyle = "rgb(0, 0, 0)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.scale(scaledCanvas.scale, scaledCanvas.scale);
    c.translate(scaledCanvas.transX, scaledCanvas.transY);

    for (const block of map) {
        // block.position.x += .1;
        block.update();
    }

    // collisionBlocks.forEach((collisionBlock) => {
    //     collisionBlock.update();
    // });

    player1.update();

    for (let i = map.length - 1; i >= 0; i--) {
        const block = map[i];
        if (collision({
            object1: player1.hitbox,
            object2: block,
        })) {
            map.splice(map.indexOf(block), 1);
            break;
        }
    }

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