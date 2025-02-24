const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let zoom = 2;

window.addEventListener('wheel', (e) => {
    console.log(zoom);
    const delta = Math.sign(e.deltaY); // -1 for down, 1 for up, 0 for no movement
    zoom += delta * .1;
  
    // clamp zoom
    zoom = Math.max(1.2, Math.min(3, zoom));
    scaledCanvas.scale = zoom;
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

// const gravity = 0.3;
// const frictionMultiplier = 0.9;
// const playerSpeed = 0.3;
// const jumpStrength = 6;

// const collisions2D = [];
// for (let i = 0; i < collisions.length; i += 32) {
//     collisions2D.push(collisions.slice(i, i + 32));
// }

// const collisionBlocks = [];
// collisions2D.forEach((row, y) => {
//     row.forEach((symbol, x) => {
//         if (symbol === 202) {
//             collisionBlocks.push(new CollisionBlock({
//                 position: {
//                     x: x * 16,
//                     y: y * 16,
//                 },
//             }));
//         }
//     });
// });

// const player1 = new Player({
//     position: { x: 0, y: 0 },
//     collisionBlocks,
//     imageSrc: `./img/player/Idle.png`,
//     frameRate: 8,
//     animations: {
//         Idle: {
//             imageSrc: `./img/player/Idle.png`,
//             frameRate: 1,
//             frameBuffer: 0,
//         },
//     }
// });

function animate() {
    window.requestAnimationFrame(animate);

    c.fillStyle = "rgb(0, 0, 0)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.scale(scaledCanvas.scale, scaledCanvas.scale);
    c.translate(scaledCanvas.transX, scaledCanvas.transY);

    for (const block of map) {
        block.position.x += .1;
        block.update();
    }

    // collisionBlocks.forEach((collisionBlock) => {
    //     collisionBlock.update();
    // });

    // player1.update();

    c.restore();
}

animate();

canvas.addEventListener("keydown", (event) => {
    switch (event.key.toUpperCase()) {
        case "D": player1.keys.right = true; break;
        case "A": player1.keys.left = true; break;
        case "S": player1.keys.down = true; break;
        case "W": player1.keys.up = true; break;
    }
});

canvas.addEventListener("keyup", (event) => {
    switch (event.key.toUpperCase()) {
        case "D": player1.keys.right = false; break;
        case "A": player1.keys.left = false; break;
        case "S": player1.keys.down = false; break;
        case "W": player1.keys.up = false; break;
    }
});

let highlightedBlock = null;
canvas.addEventListener('mousemove', (e) => {
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
        if (highlightedBlock) {
            highlightedBlock.position.y += 5;
            highlightedBlock = null;
        }
        if (collision({
            object1: mouse,
            object2: block,
        })) {
            highlightedBlock = block;
            highlightedBlock.position.y -= 5;
            break;
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (!highlightedBlock) return;
    map.splice(map.indexOf(highlightedBlock), 1);
    highlightedBlock = null;
});