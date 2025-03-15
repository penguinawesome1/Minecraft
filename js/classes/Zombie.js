class Zombie extends Life {
  constructor({ position, imageSrc, frameRate, scale = 1, animations }) {
    super({ position, imageSrc, frameRate, scale, animations });

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

    this.animations = animations;

    this.health = 10;
  }

  update() {
    this.updateFrames();
    this.updateHitbox();

    if (dev) {
      // draw zombie
      c.fillStyle = "rgba(255, 0, 0, 0.2)";
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    this.draw();

    this.pathFind();

    this.applyGravity();
    this.respondToDepthCollision();
    this.updateHitbox();

    this.applyFriction();
    // this.respondToFlatCollision();

    this.checkForHit();
    if (this.position.z < -50) this.changeHealth({ amount: -2 });
    this.checkForDeath();
  }

  tryToHit() {
    if (collisionCursor(this)) {
      this.changeHealth({ amount: -1 });

      const angle = calcAngle({
        object1: player1,
        object2: this,
      });

      const knockback = 15;
      this.velocity.x = Math.cos(angle) * knockback;
      this.velocity.y = Math.sin(angle) * knockback;

      return true;
    }
    return false;
  }

  changeHealth({ amount }) {
    if (this.invulnerable) return;

    if (amount < 0) {
      for (let i = 0; i > amount; i--) {
        this.health--;

        if (this.checkForDeath()) break;
      }

      this.invulnerable = true;
      setTimeout(() => {
        this.invulnerable = false;
      }, invulnerableDuration);
      return;
    }

    if (amount > 0) {
      for (let i = 0; i < amount; i++) {
        if (this.health === this.maxHealth) return;
        this.health++;
      }
    }
  }

  checkForDeath() {
    if (this.health < 0) {
      world1.enemyList.splice(world1.enemyList.indexOf(this), 1);
      return;
    }
  }

  checkForHit() {
    if (
      dev ||
      player1.invulnerable ||
      !collisionGrid({
        object1: this.hitbox,
        object2: player1.hitbox,
      })
    ) {
      return;
    }

    player1.changeHealth({ amount: -1 });

    const angle = calcAngle({
      object1: this,
      object2: player1,
    });

    const knockback = 15;
    player1.velocity.x = Math.cos(angle) * knockback;
    player1.velocity.y = Math.sin(angle) * knockback;
  }

  pathFind() {
    if (gamemode === "creative" || !this.imageLoaded) return;

    const angle = calcAngle({
      object1: this,
      object2: player1,
    });

    this.velocity.x += Math.cos(angle) / 5;
    this.velocity.y += Math.sin(angle) / 5;
  }

  applyFriction() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y * 0.5;
    this.velocity.x *= frictionMultiplier;
    this.velocity.y *= frictionMultiplier;
  }

  applyGravity() {
    this.position.z += this.velocity.z;
    this.velocity.z -= gravity;
  }

  updateHitbox(chunkSize = world1.chunkSize) {
    const grid = toGridCoordinate({
      x: this.position.x,
      y: this.position.y + this.height / 4,
      z: this.position.z,
    });
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
}
