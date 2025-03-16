const Constants = {
  FRICTION_MULTIPLIER: 0.8,
  GRAVITY: 0.3,
  PLAYER_SPEED: 0.35,
  JUMP_STRENGTH: 5,
  INVULNERABLE_DURATION: 500,
  VOID_DEPTH: -50,
  TILE_WIDTH: 32,
  TILE_HEIGHT: 32,
  GAME_MODE: "survival", // also "survival", "spectator"
  WORLD_MODE: getParameterByName("worldmode"),
  CANVAS_ID: "canvas",
  SEED: 1,
};

let player;
switch (localStorage.getItem("selectedPlayer")) {
  default:
  case "player1": {
    player = new Player({
      gamemode: Constants.GAME_MODE,
      spawnRadius: 0,
      scale: 1,
      imageSrc: `../img/players/player1/Idle.png`,
      frameRate: 1,
      animations: {
        Idle: {
          imageSrc: `../img/players/player1/Idle.png`,
          frameRate: 1,
          frameBuffer: 1,
        },
        Run: {
          imageSrc: `../img/players/player1/Idle.png`,
          frameRate: 1,
          frameBuffer: 1,
        },
      },
    });
    break;
  }
}
const structure = new Structure();
const world = new World({
  structure,
  player,
  worldMode: Constants.WORLD_MODE,
  renderDistance: 1,
  chunkSize: 16,
  chunkHeight: 18,
  airHeight: 10,
  mobCap: 0,
});
const gameManager = new GameManager({
  player,
  world,
  hotbarID: "hotbar",
  healthbarID: "healthbar",
  pauseMenuID: "pausemenu",
  deathMenuID: "deathmenu",
  instantRespawn: false,
});
const renderer = new Renderer({ gameManager, world, zoom: 2 });
const input = new Input({ player, world, gameManager, renderer });

world.renderer = renderer;
player.gameManager = gameManager;
player.renderer = renderer;
player.world = world;

renderer.setInitialCameraPosition(player);
renderer.animate();
