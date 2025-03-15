class Player extends Life {
  constructor({
    gamemode,
    spawnRadius,
    imageSrc,
    frameRate,
    scale = 1,
    animations,
  }) {
    super({
      position: {
        x: Math.random() * spawnRadius,
        y: Math.random() * spawnRadius,
        z: 200,
      },
      imageSrc,
      frameRate,
      scale,
      animations,
    });

    this.gamemode = gamemode;
    this.spawn = { ...this.position };
    this.chunkPosition = { x: 0, y: 0 };
    this.lastDirection = "right";
    this.animations = animations;
    this.keys = {
      left: false,
      right: false,
      down: false,
      up: false,
    };

    this.setupPhysics();
    this.setupHotbar();
    this.setupHealth();
  }

  setObjects({ gameManager, renderer, world }) {
    this.gameManager = gameManager;
    this.renderer = renderer;
    this.world = world;
  }

  setupPhysics() {
    this.hitbox = {
      position: this.position,
      width: 1,
      height: 1,
      depth: 1,
    };

    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    this.canJump = false;
  }

  setupHotbar() {
    this.hotbar = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
    if (this.gamemode === "creative") return;
    this.hotbar = [
      {
        imageSrc: `../img/tiles/tile_061.png`,
        blockNum: Renderer.COBBLESTONE,
      },
      { imageSrc: `../img/tiles/tile_023.png`, blockNum: Renderer.GRASS },
      { imageSrc: `../img/tiles/tile_021.png`, blockNum: Renderer.DIRT },
      { imageSrc: `../img/tiles/tile_114.png`, blockNum: Renderer.WATER },
      { imageSrc: `../img/tiles/tile_003.png`, blockNum: Renderer.MUD },
      { imageSrc: `../img/tiles/tile_036.png`, blockNum: Renderer.SHRUB },
      { imageSrc: `../img/tiles/tile_027.png`, blockNum: Renderer.MOSS },
      { imageSrc: `../img/tiles/tile_019.png`, blockNum: Renderer.SPROUT },
<<<<<<< HEAD
      { imageSrc: `../img/tiles/tile_025.png`, blockNum: Renderer.WOOD },
=======
      { imageSrc: `../img/tiles/tile_025.png`, blockNum: Renderer.FARMLAND },
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
    ];
  }

  setupHealth() {
    this.maxHealth = 9;
    this.health = this.maxHealth;
    this.invulnerable = this.gamemode === "creative";
  }

  update() {
    this.updateFrames();
    this.updateHitbox();

    this.updateCameraBox();
    this.renderer.panCamera(this);

    if (this.gameManager.dev) {
      // draw camera box
      this.renderer.c.fillStyle = "rgba(0, 0, 0, 0.2)";
      this.renderer.c.fillRect(
        this.cameraBox.position.x,
        this.cameraBox.position.y,
        this.cameraBox.width,
        this.cameraBox.height
      );

      // draw player
      this.renderer.c.fillStyle = "rgba(255, 0, 0, 0.2)";
      this.renderer.c.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    this.checkForKeys();

    this.applyGravity();
    this.respondToDepthCollision();
    this.updateHitbox();

    this.applyFriction();
    // this.respondToFlatCollision();

    // this.checkForHit();

    // Check for fall damage
    if (this.position.z < Constants.VOID_DEPTH) {
      this.takeDamage(2);
    }

    if (this.health <= 0) {
      this.gameManager.toggleDeath();
      this.gameManager.respawnPlayer(this);
    }
  }

  takeDamage(amount) {
    if (this.invulnerable || this.gameManager.dev) return;

    this.health = Math.max(0, this.health - amount);
    this.gameManager.updateHealthbar();

    this.invulnerable = true;
    setTimeout(() => {
      this.invulnerable = false;
    }, Constants.INVULNERABLE_DURATION);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.gameManager.updateHealthbar();
  }

  updateCameraBox() {
    const w = 1000 / this.renderer.scaledCanvas.scale;
    const h = 600 / this.renderer.scaledCanvas.scale;
    this.cameraBox = {
      position: {
        x: this.position.x + this.width / 2 - w / 2,
        y: this.position.y + this.height / 2 - h / 2 - this.position.z / 2,
      },
      width: w,
      height: h,
    };
  }

  applyFriction() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y * 0.5;
    this.velocity.x *= Constants.FRICTION_MULTIPLIER;
    this.velocity.y *= Constants.FRICTION_MULTIPLIER;
  }

  applyGravity() {
    this.position.z += this.velocity.z;
    this.velocity.z -= Constants.GRAVITY;
  }

  jump() {
    if (!this.canJump) return;
    this.canJump = false;
    this.velocity.z = Constants.JUMP_STRENGTH;
  }

  updateHitbox() {
    const grid = toGridCoordinate({
      x: this.position.x,
      y: this.position.y + this.height / 4,
      z: this.position.z,
    });
    const chunkSize = this.world.chunkSize ?? 0;
    this.chunkPosition = {
      x: Math.floor(grid.x / chunkSize),
      y: Math.floor(grid.y / chunkSize),
    };

    this.hitbox = {
      position: grid,
      width: 1,
      height: 1,
      depth: 1,
    };
  }

  checkForKeys() {
    const k = {
      x: 0,
      y: 0,
    };
    if (this.keys.left) k.x--;
    if (this.keys.right) k.x++;
    if (this.keys.up) k.y--;
    if (this.keys.down) k.y++;

    if (k.x && k.y) {
      k.x *= 0.7;
      k.y *= 0.7;
    }

    this.velocity.x += k.x * Constants.PLAYER_SPEED;
    this.velocity.y += k.y * Constants.PLAYER_SPEED;
  }
}
