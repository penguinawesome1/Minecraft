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
  WORLD_MODE: getParameterByName("worldmode"),
  CANVAS_ID: "canvas",
};

const structure = new Structure();
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
const gameManager = new GameManager({
  player,
  worldMode: Constants.WORLD_MODE,
  hotbarID: "hotbar",
  healthbarID: "healthbar",
  pauseMenuID: "pausemenu",
  deathMenuID: "deathmenu",
  instantRespawn: false,
});
const world = new World({
  structure,
  player,
  worldMode: Constants.WORLD_MODE,
  seed: 1,
  renderDistance: 1,
  chunkSize: 16,
  chunkHeight: 22,
  airHeight: 12,
  mobCap: 0,
});
const renderer = new Renderer({ gameManager, world, zoom: 2 });
const input = new Input({ player, world, gameManager, renderer });

renderer.setInitialCameraPosition(player);

gameManager.setObjects({ world });
player.setObjects({ gameManager, renderer, world });
world.setObjects({ renderer });

renderer.animate();
