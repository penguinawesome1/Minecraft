const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let zoom = 2;
const frictionMultiplier = 0.8;
const playerSpeed = 0.3;
const jumpStrength = 6;
// Sprite size
const w = 32;
const h = 32;

const scaledCanvas = {
  scale: zoom,
  width: canvas.width / this.scale,
  height: canvas.height / this.scale,
};

const collisions = []; //////////////////////////
const collisions2D = [];
for (let i = 0; i < collisions.length; i += 32) {
  collisions2D.push(collisions.slice(i, i + 32));
}

const collisionBlocks = [];
collisions2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 202) {
      collisionBlocks.push(
        new CollisionBlock({
          position: {
            x: x * 16,
            y: y * 16,
          },
        })
      );
    }
  });
});

const player1 = new Player({
  position: {
    x: 0,
    y: 0,
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
  },
});

const camera = {
  position: {
    x: -player1.position.x + window.innerWidth / scaledCanvas.scale / 2,
    y: -player1.position.y + window.innerHeight / scaledCanvas.scale / 2,
  },
};

const world1 = new World({ seed: 1, renderDistance: 3, generateDistance: 3 });

function animate() {
  window.requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);

  c.save();
  c.scale(scaledCanvas.scale, scaledCanvas.scale);
  c.translate(camera.position.x, camera.position.y);

  world1.generateChunks();
  world1.renderChunks();

  // const singleNoise = perlin.noise(2.5, 3.7);

  // collisionBlocks.forEach((collisionBlock) => {
  //     collisionBlock.update();
  // });

  player1.update();

  c.restore();
}

animate();

document.addEventListener("keydown", (e) => {
  switch (e.key.toUpperCase()) {
    case "D":
      player1.keys.right = true;
      break;
    case "A":
      player1.keys.left = true;
      break;
    case "S":
      player1.keys.down = true;
      break;
    case "W":
      player1.keys.up = true;
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key.toUpperCase()) {
    case "D":
      player1.keys.right = false;
      break;
    case "A":
      player1.keys.left = false;
      break;
    case "S":
      player1.keys.down = false;
      break;
    case "W":
      player1.keys.up = false;
      break;
  }
});

const mouseScreen = {
  position: {
    x: 0,
    y: 0,
  },
};

canvas.addEventListener("mousemove", (e) => {
  mouseScreen.position.x = e.clientX;
  mouseScreen.position.y = e.clientY;
  world1.updateHoverBlock();
});

canvas.addEventListener("mousedown", (e) => {
  if (world1.hoverBlock) world1.deleteBlock("hover");
});

window.addEventListener("wheel", (e) => {
  const originalCenterX =
    camera.position.x + window.innerWidth / scaledCanvas.scale / 2;
  const originalCenterY =
    camera.position.y + window.innerHeight / scaledCanvas.scale / 2;

  const delta = Math.sign(e.deltaY); // -1 for down, 1 for up, 0 for no movement
  zoom -= delta * 0.1;

  // clamp zoom
  zoom = Math.max(1.4, Math.min(2.8, zoom));
  scaledCanvas.scale = zoom;

  const newCenterX =
    camera.position.x + window.innerWidth / scaledCanvas.scale / 2;
  const newCenterY =
    camera.position.y + window.innerHeight / scaledCanvas.scale / 2;

  const offsetX = originalCenterX - newCenterX;
  const offsetY = originalCenterY - newCenterY;

  camera.position.x -= offsetX;
  camera.position.y -= offsetY;

  player1.panCamera();

  world1.updateHoverBlock();
});
