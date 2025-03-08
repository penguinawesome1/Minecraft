const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let dev = false;
let zoom = 2;
let pause = false;
const instantRespawn = false;
const gamemode = getParameterByName("gamemode");
const pauseMenu = document.getElementById("pausemenu");
const deathMenu = document.getElementById("deathmenu");
pauseMenu.classList.add(gamemode);
deathMenu.classList.add(gamemode);
// localStorage.clear();
const savedChunksString = localStorage.getItem(`${gamemode}Chunks`);
const savedChunks = savedChunksString ? JSON.parse(savedChunksString) : null;

const hotbar = document.getElementById("hotbar");
const healthbar = document.getElementById("healthbar");
const frictionMultiplier = 0.4;
const gravity = 0.3;
const playerSpeed = 3;
const jumpStrength = 8;
// Sprite size
const w = 32;
const h = 32;

function getScaledCanvas(canvas, zoom) {
  return {
    scale: zoom,
    width: canvas.width / zoom,
    height: canvas.height / zoom,
  };
}
let scaledCanvas = getScaledCanvas(canvas, zoom);

function togglePause() {
  if (!deathMenu.classList.contains("hidden")) return;
  pause = !pause;
  pauseMenu.classList.toggle("hidden");
}
function toggleDeath() {
  pause = !pause;
  deathMenu.classList.toggle("hidden");
}

const mouse = {
  screenPosition: {
    x: 0,
    y: 0,
  },
  worldPosition: {
    x: 0,
    y: 0,
  },
};

function updateMouse(x = mouse.screenPosition.x, y = mouse.screenPosition.y) {
  mouse.screenPosition.x = x;
  mouse.screenPosition.y = y;
  mouse.worldPosition.x = x / scaledCanvas.scale - camera.position.x;
  mouse.worldPosition.y = y / scaledCanvas.scale - camera.position.y;
}

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
    z: 20,
  },
  scale: 1,
  collisionBlocks,
  imageSrc: `../../img/player/Idle.png`,
  frameRate: 1,
  animations: {
    Idle: {
      imageSrc: `../../img/player/Idle.png`,
      frameRate: 1,
      frameBuffer: 0,
    },
  },
});

for (let i = 0; i < player1.hotbar.length; i++) {
  itemImage = player1.hotbar[i].imageSrc;
  hotbar.children[i].children[0].src = itemImage ?? "";
}

const camera = {
  position: {
    x: -player1.position.x + scaledCanvas.width / 2,
    y: -player1.position.y + scaledCanvas.height / 2,
  },
};

const world1 = new World(
  gamemode === "skyblock"
    ? {
        seed: 1,
        renderDistance: 2,
        chunkSize: 16,
        chunkHeight: 10,
        airHeight: 9,
      }
    : {
        seed: 1,
        renderDistance: 2,
        chunkSize: 16,
        chunkHeight: 10,
        airHeight: 5,
      }
);

if (gamemode === "skyblock") world1.generateChunks();

function animate() {
  window.requestAnimationFrame(animate);
  updateMouse();
  if (pause) return;

  c.clearRect(0, 0, canvas.width, canvas.height);

  c.save();
  c.scale(scaledCanvas.scale, scaledCanvas.scale);
  c.translate(camera.position.x, camera.position.y);

  world1.update();
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
    case " ":
      player1.jump();
      break;
    case "ESCAPE":
      togglePause();
      break;
    case "1":
      dev = !dev;
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
  updateMouse(e.clientX, e.clientY);
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
      if (block.name) world1.addBlock(block);
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

  const originalCenterX = camera.position.x + scaledCanvas.width / 2;
  const originalCenterY = camera.position.y + scaledCanvas.height / 2;

  zoom -= delta * 0.1;

  // clamp zoom
  // zoom = Math.max(1.2, Math.min(2.8, zoom));
  scaledCanvas = getScaledCanvas(canvas, zoom);

  const newCenterX = camera.position.x + scaledCanvas.width / 2;
  const newCenterY = camera.position.y + scaledCanvas.height / 2;

  const offsetX = originalCenterX - newCenterX;
  const offsetY = originalCenterY - newCenterY;

  camera.position.x -= offsetX;
  camera.position.y -= offsetY;

  player1.panCamera();
});
