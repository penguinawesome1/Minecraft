class Life extends Sprite {
  constructor({
    position,
    collisionBlocks,
    imageSrc,
    frameRate = 1,
    scale = 1,
    animations,
  }) {
    super({ position, imageSrc, frameRate, scale });

    this.velocity = {
      x: 0,
      y: 0,
    };
    this.collisionBlocks = collisionBlocks;
    this.hitbox = {
      position: this.position,
      width: 0,
      height: 0,
      depth: 0,
    };

    this.animations = animations;
    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imageSrc;

      this.animations[key].image = image;
    }
  }

  switchSprite(key) {
    const sameImage = this.image === this.animations[key].image;
    if (sameImage || !this.loaded) return;

    this.currentFrame = 0;
    this.image = this.animations[key].image;
    this.frameBuffer = this.animations[key].frameBuffer;
    this.frameRate = this.animations[key].frameRate;
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

  isCollision(includesFeet = false) {
    const { x: chunkX, y: chunkY } = this.chunkPosition;
    const adjacentChunks = [
      { cx: 0, cy: 0 },
      { cx: 1, cy: 0 },
      { cx: -1, cy: 0 },
      { cx: 0, cy: 1 },
      { cx: 0, cy: -1 },
      { cx: 1, cy: 1 },
      { cx: 1, cy: -1 },
      { cx: -1, cy: 1 },
      { cx: -1, cy: -1 },
    ];

    const collisionBlocks = [];
    for (const { cx, cy } of adjacentChunks) {
      const key = `${chunkX + cx},${chunkY + cy}`;
      const chunk = this.world.chunkMap[key];
      if (!chunk) continue;

      for (const block of chunk) {
        if (
          block.blockNum !== Renderer.AIR &&
          collisionGrid({
            object1: this.hitbox,
            object2: block,
            includesFeet,
          })
        ) {
          // block.blockNum = Renderer.MISSING;
          collisionBlocks.push(block);
        }
      }
    }

    return collisionBlocks;
  }

  respondToFlatCollision() {
    const collisionBlocks = this.isCollision();
    if (collisionBlocks.length === 0) return;

    if (this.velocity.x < 0) {
      this.velocity.x = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].gridPosition.x > maxBlock.gridPosition.x) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.x = maxBlock.position.x + maxBlock.width + 0.01;
    } else if (this.velocity.x > 0) {
      this.velocity.x = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].gridPosition.x < maxBlock.gridPosition.x) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.x = maxBlock.position.x - this.width + 0.01;
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].gridPosition.y > maxBlock.gridPosition.y) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.y = maxBlock.position.y + maxBlock.height - 0.01;
    } else if (this.velocity.y > 0) {
      this.velocity.y = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].gridPosition.y < maxBlock.gridPosition.y) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.y = maxBlock.position.y - this.height - 0.01;
    }
  }

  respondToDepthCollision() {
    const collisionBlocks = this.isCollision(true);
    if (collisionBlocks.length === 0) return;

    if (this.velocity.z < 0) {
      const fallDamage = Math.floor(-this.velocity.z / 5);
      if (fallDamage > 0) this.takeDamage(fallDamage);
      this.velocity.z = 0;
      this.canJump = true;

      let maxZBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].gridPosition.z > maxZBlock.gridPosition.z) {
          maxZBlock = collisionBlocks[i];
        }
      }

      this.position.z =
        maxZBlock.position.z +
        this.hitbox.depth * Constants.TILE_HEIGHT * 0.25 +
        0.01;
    } else if (this.velocity.z > 0) {
      this.velocity.z = 0;

      // let minZBlock = collisionBlocks[0];
      // for (let i = 1; i < collisionBlocks.length; i++) {
      //   if (collisionBlocks[i].gridPosition.z < minZBlock.gridPosition.z) {
      //     minZBlock = collisionBlocks[i];
      //   }
      // }

      // this.position.z =
      //   minZBlock.position.z -
      //   this.hitbox.depth * Constants.TILE_HEIGHT * 0.25 -
      //   0.01;
    }
  }
}
