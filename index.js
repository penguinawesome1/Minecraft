const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  c.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let zoom = 2;
const hotbar = document.getElementById("hotbar");
const frictionMultiplier = 0.4;
const playerSpeed = 5;
const jumpStrength = 6;
// Sprite size
const w = 32;
const h = 32;

const scaledCanvas = {
  scale: zoom,
  width: canvas.width / this.scale,
  height: canvas.height / this.scale,
};

const mouseScreen = {
  position: {
    x: 0,
    y: 0,
  },
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
    z: 0,
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

for (let i = 0; i < player1.hotbar.length; i++) {
  itemImage = player1.hotbar[i].imageSrc;
  hotbar.children[i].children[0].src = itemImage;
}

const camera = {
  position: {
    x: -player1.position.x + window.innerWidth / scaledCanvas.scale / 2,
    y: -player1.position.y + window.innerHeight / scaledCanvas.scale / 2,
  },
};

const world1 = new World({ seed: 1, renderDistance: 1, generateDistance: 1 });

function animate() {
  window.requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);

  c.save();
  c.scale(scaledCanvas.scale, scaledCanvas.scale);
  c.translate(camera.position.x, camera.position.y);

  world1.generateChunks();
  world1.renderChunks();
  world1.updateHoverBlock();

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

canvas.addEventListener("mousemove", (e) => {
  mouseScreen.position.x = e.clientX;
  mouseScreen.position.y = e.clientY;
});

canvas.addEventListener("mousedown", (e) => {
  switch (e.button) {
    case 0:
      world1.deleteBlock("hover");
      break;
    case 1:
      for (let i = 0; i < player1.hotbar.length; i++) {
        const hasItem = player1.hotbar[i].name === world1.hoverBlock.name;
        if (!hasItem) continue;

        hotbar.children[player1.selectedItem].id = "";
        player1.selectedItem = i;
        hotbar.children[player1.selectedItem].id = "selected";
        break;
      }
      break;
    case 2:
      const block = player1.hotbar[player1.selectedItem];
      world1.addBlock(block);
      break;
  }
});

canvas.addEventListener("contextmenu", (e) => {
  if (e.button === 2) {
    e.preventDefault();
  }
});

window.addEventListener("wheel", (e) => {
  const delta = Math.sign(e.deltaY); // -1 for down, 1 for up, 0 for no movement

  if (!e.shiftKey) {
    hotbar.children[player1.selectedItem].id = "";
    player1.selectedItem =
      (((player1.selectedItem + delta) % player1.hotbar.length) +
        player1.hotbar.length) %
      player1.hotbar.length;
    hotbar.children[player1.selectedItem].id = "selected";
    return;
  }

  const originalCenterX =
    camera.position.x + window.innerWidth / scaledCanvas.scale / 2;
  const originalCenterY =
    camera.position.y + window.innerHeight / scaledCanvas.scale / 2;

  zoom -= delta * 0.1;

  // clamp zoom
  // zoom = Math.max(1.2, Math.min(2.8, zoom));
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
});
