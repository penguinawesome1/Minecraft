const Constants = {
  FRICTION_MULTIPLIER: 0.8,
  GRAVITY: 0.3,
  PLAYER_SPEED: 0.5,
  JUMP_STRENGTH: 8,
  INVULNERABLE_DURATION: 500,
  VOID_DEPTH: -50,
  TILE_WIDTH: 32,
  TILE_HEIGHT: 32,
  GAME_MODE: "survival", // also "survival", "spectator"
<<<<<<< HEAD
  WORLD_MODE: getParameterByName("worldmode"),
=======
  WORLD_MODE: "default", // also "flat", "skyblock"
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
  CANVAS_ID: "canvas",
};

const player = new Player({
  gamemode: Constants.GAME_MODE,
  spawnRadius: 10,
  scale: 1,
  imageSrc: `../img/player/Idle.png`,
  frameRate: 1,
  animations: {
    Idle: {
      imageSrc: `../img/player/Idle.png`,
      frameRate: 1,
      frameBuffer: 0,
    },
  },
});
<<<<<<< HEAD
=======

>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
const gameManager = new GameManager({
  player,
  worldMode: Constants.WORLD_MODE,
  hotbarID: "hotbar",
  healthbarID: "healthbar",
  pauseMenuID: "pausemenu",
  deathMenuID: "deathmenu",
  instantRespawn: false,
});
<<<<<<< HEAD
=======

>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
const world = new World({
  player,
  worldMode: Constants.WORLD_MODE,
  seed: 1,
  renderDistance: 1,
  chunkSize: 16,
<<<<<<< HEAD
  chunkHeight: 22,
  airHeight: 12,
=======
  chunkHeight: 4,
  airHeight: 0,
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
  mobCap: 0,
});
const renderer = new Renderer({ gameManager, world, zoom: 2 });
const input = new Input({ player, world, gameManager, renderer });

<<<<<<< HEAD
=======
const renderer = new Renderer({
  gameManager,
  world,
  zoom: 2,
});

const input = new Input({ player, world, gameManager, renderer });

>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
renderer.setInitialCameraPosition(player);

player.setObjects({ gameManager, renderer, world });
world.setObjects({ renderer });

renderer.animate();
