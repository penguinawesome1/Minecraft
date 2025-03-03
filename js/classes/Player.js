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

    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    this.attackBox = {
      position: this.position,
      width: 0,
      height: 0,
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
      gamemode === "creative"
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

    // c.fillStyle = "rgba(0, 0, 0, 0.2)";
    // c.fillRect(
    //   this.cameraBox.position.x,
    //   this.cameraBox.position.y,
    //   this.cameraBox.width,
    //   this.cameraBox.height
    // );

    this.draw();

    this.checkForKeys();

    // this.applyGravity();
    // this.respondToVerticalCollision();
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
    if (this.selectedHeart < 0) toggleDeath();
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
    const negCameraX = -camera.position.x;
    const negCameraY = -camera.position.y;
    const scaledWidth = scaledCanvas.width;
    const scaledHeight = scaledCanvas.height;

    if (this.cameraBox.position.x < negCameraX) {
      camera.position.x = -this.cameraBox.position.x;
    } else if (
      this.cameraBox.position.x >
      negCameraX + scaledWidth - this.cameraBox.width
    ) {
      camera.position.x = -(
        this.cameraBox.position.x -
        scaledWidth +
        this.cameraBox.width
      );
    }

    if (this.cameraBox.position.y < negCameraY) {
      camera.position.y = -this.cameraBox.position.y;
    } else if (
      this.cameraBox.position.y >
      negCameraY + scaledHeight - this.cameraBox.height
    ) {
      camera.position.y = -(
        this.cameraBox.position.y -
        scaledHeight +
        this.cameraBox.height
      );
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

  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2,
      },
      width: 1 * this.scale,
      height: 1 * this.scale,
    };

    this.attackBox = {
      position: {
        x:
          this.position.x +
          this.scale * (28 + 52 * (this.attackDirection === "right" ? 1 : 0)),
        y: this.position.y + 23 * this.scale,
      },
      width: 53 * this.scale,
      height: 20 * this.scale,
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

    if (k.x !== 0 && k.y !== 0) {
      k.x *= 0.7;
      k.y *= 0.7;
    }

    this.velocity.x += k.x * playerSpeed;
    this.velocity.y += k.y * playerSpeed;
  }

  respondToHorizontalCollision() {
    const collisionBlock = this.isCollision();
    if (collisionBlock.length === 0) return false;

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

  respondToVerticalCollision() {
    const collisionBlock = this.isCollision();
    if (collisionBlock.length === 0) return false;

    if (this.velocity.y > 0) {
      this.velocity.y = 0;
      this.jumps = maxJumps;
      this.dashes = maxDashes;
      this.smashing = false;

      const offset =
        this.hitbox.position.y - this.position.y + this.hitbox.height;

      this.position.y = collisionBlock.position.y - offset - 0.01;
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0;

      const offset = this.hitbox.position.y - this.position.y;

      this.position.y =
        collisionBlock.position.y + collisionBlock.height - offset + 0.01;
    }
    return true;
  }
}
