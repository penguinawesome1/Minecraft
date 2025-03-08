class Player extends Life {
  constructor({
    position,
    collisionBlocks,
    imageSrc,
    frameRate,
    scale = 1,
    animations,
  }) {
    super({ position, imageSrc, frameRate, scale, animations });

    this.spawn = { ...position };

    this.chunkPosition = { x: 0, y: 0 };

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

    this.cameraBox = {
      position: this.position,
      width: 0,
      height: 0,
    };

    this.jumps = true;
    this.lastDirection = "right";
    this.animations = animations;

    this.keys = {
      left: false,
      right: false,
      down: false,
      up: false,
    };

    this.hotbar =
      gamemode === "creative" || true //////////////////////////////
        ? [
            {
              name: "cobblestone",
              imageSrc: `../../img/tiles/tile_061.png`,
              quantity: 1,
            },
            {
              name: "grass",
              imageSrc: `../../img/tiles/tile_023.png`,
              quantity: 1,
            },
            {
              name: "dirt",
              imageSrc: `../../img/tiles/tile_021.png`,
              quantity: 1,
            },
            {
              name: "water",
              imageSrc: `../../img/tiles/tile_114.png`,
              quantity: 1,
            },
            {
              name: "mud",
              imageSrc: `../../img/tiles/tile_003.png`,
              quantity: 1,
            },
            {
              name: "shrub",
              imageSrc: `../../img/tiles/tile_036.png`,
              quantity: 1,
            },
            {
              name: "moss",
              imageSrc: `../../img/tiles/tile_027.png`,
              quantity: 1,
            },
            {
              name: "sprout",
              imageSrc: `../../img/tiles/tile_019.png`,
              quantity: 1,
            },
            {
              name: "farmland",
              imageSrc: `../../img/tiles/tile_025.png`,
              quantity: 1,
            },
          ]
        : [{}, {}, {}, {}, {}, {}, {}, {}, {}];
    this.selectedItem = 0;
    this.maxHealth = 9;
    this.selectedHeart = this.maxHealth;
  }

  update() {
    this.updateFrames();
    this.updateHitbox();

    this.updateCameraBox();
    this.panCamera();

    if (dev) {
      // draw camera box
      c.fillStyle = "rgba(0, 0, 0, 0.2)";
      c.fillRect(
        this.cameraBox.position.x,
        this.cameraBox.position.y,
        this.cameraBox.width,
        this.cameraBox.height
      );

      // // draw player image
      // c.fillStyle = "rgba(0, 255, 0, 0.2)";
      // c.fillRect(
      //   this.position.x,
      //   this.position.y - this.position.z,
      //   this.width,
      //   this.height - this.depth
      // );

      // draw player hitbox
      c.fillStyle = "rgba(255, 0, 0, 0.2)";
      c.fillRect(
        this.hitbox.position.x,
        this.hitbox.position.y - this.hitbox.position.z,
        this.hitbox.width,
        this.hitbox.height - this.hitbox.depth
      );

      // draw player xy hitbox
      c.fillStyle = "rgba(0, 0, 255, 0.2)";
      c.fillRect(
        this.hitbox.position.x,
        this.hitbox.position.y,
        this.hitbox.width,
        this.hitbox.height
      );
    }

    this.draw();

    this.checkForKeys();

    // this.applyGravity();
    this.respondToDepthCollision();
    this.updateHitbox();

    this.applyFriction();
    // this.respondToHorizontalCollision();

    // this.checkForHit();
    this.checkForDeath();
  }

  checkForDeath() {
    if (this.position.z < -50) {
      healthbar.children[this.selectedHeart].classList.add("hurt");
      this.selectedHeart--;
    }
    if (this.selectedHeart < 0) {
      if (instantRespawn || dev) toggleDeath();
      this.respawn();
    }
  }

  respawn() {
    this.position = { ...this.spawn };
    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };
    for (const heart of healthbar.children) {
      heart.classList.remove("hurt");
    }
    this.selectedHeart = this.maxHealth;
    toggleDeath();
  }

  updateCameraBox() {
    const w = 1000 / scaledCanvas.scale;
    const h = 600 / scaledCanvas.scale;
    this.cameraBox = {
      position: {
        x: this.position.x + this.width / 2 - w / 2,
        y: this.position.y + this.height / 2 - h / 2,
      },
      width: w,
      height: h,
    };
  }

  panCamera() {
    const cameraX = -camera.position.x;
    const cameraY = -camera.position.y;
    const canvasWidth = scaledCanvas.width;
    const canvasHeight = scaledCanvas.height;
    const boxX = this.cameraBox.position.x;
    const boxY = this.cameraBox.position.y;
    const boxWidth = this.cameraBox.width;
    const boxHeight = this.cameraBox.height;

    const leftBoundary = cameraX;
    const rightBoundary = cameraX + canvasWidth - boxWidth;
    const topBoundary = cameraY;
    const bottomBoundary = cameraY + canvasHeight - boxHeight;

    if (boxX < leftBoundary) {
      camera.position.x = -boxX;
    } else if (boxX > rightBoundary) {
      camera.position.x = -boxX + canvasWidth - boxWidth;
    }

    if (boxY < topBoundary) {
      camera.position.y = -boxY;
    } else if (boxY > bottomBoundary) {
      camera.position.y = -boxY + canvasHeight - boxHeight;
    }
  }

  applyFriction() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= frictionMultiplier;
    this.velocity.y *= frictionMultiplier;
  }

  applyGravity() {
    this.position.z += this.velocity.z;
    this.velocity.z -= gravity;
  }

  jump() {
    this.velocity.z = jumpStrength;
  }

  updateHitbox(chunkSize = world1.chunkSize) {
    const playerGrid = toGridCoordinate(this.position);
    this.chunkPosition = {
      x: Math.floor(playerGrid.x / chunkSize),
      y: Math.floor(playerGrid.y / chunkSize),
    };

    this.hitbox = {
      position: playerGrid,
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

    k.y *= 0.5;

    this.velocity.x += k.x * playerSpeed;
    this.velocity.y += k.y * playerSpeed;
  }

  respondToFlatCollision() {
    const collisionBlock = this.isCollision();
    if (!collisionBlock) return false;

    if (this.velocity.x > 0) {
      this.velocity.x = 0;

      const offset =
        this.hitbox.position.x - this.position.x + this.hitbox.width;

      this.position.x = collisionBlock.position.x - offset - 0.01;
    } else if (this.velocity.x < 0) {
      this.velocity.x = 0;

      const offset = this.hitbox.position.x - this.position.x;

      this.position.x =
        collisionBlock.position.x + collisionBlock.width - offset + 0.01;
    }
  }

  respondToDepthCollision() {
    const collisionBlocks = this.isCollision();
    if (collisionBlocks.length === 0) return;
    // this.velocity.z = 0;

    if (this.velocity.z < 0) {
      this.velocity.z = 0;

      let maxZBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].z > maxZBlock.z) {
          maxZBlock = collisionBlocks[i];
        }
      }

      // const offset =
      //   this.hitbox.position.z - this.position.z + this.hitbox.depth;

      this.position.z = maxZBlock.position.z + this.hitbox.depth + 0.01;
    }
    // else if (this.velocity.z > 0) {
    //   this.velocity.z = 0;

    //   const offset = this.hitbox.position.z - this.position.z;

    //   this.position.z =
    //     collisionBlock.position.z + collisionBlock.depth - offset + 0.01;
    // }
  }
}
