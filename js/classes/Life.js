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

  applyGravity() {
    this.position.y += this.velocity.y;
    this.velocity.y += gravity;
  }

  applyFriction() {
    this.position.x += this.velocity.x;
    this.velocity.x *= frictionMultiplier;
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
          block.blockNum !== -1 &&
          collisionGrid({
            object1: this.hitbox,
            object2: block.grid,
            includesFeet,
          })
        ) {
          // block.blockNum = Block.MISSING;
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
        if (collisionBlocks[i].grid.position.x > maxBlock.grid.position.x) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.x = maxBlock.position.x + maxBlock.width + 0.01;
    } else if (this.velocity.x > 0) {
      this.velocity.x = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].grid.position.x < maxBlock.grid.position.x) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.x = maxBlock.position.x - this.width + 0.01;
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].grid.position.y > maxBlock.grid.position.y) {
          maxBlock = collisionBlocks[i];
        }
      }

      this.position.y = maxBlock.position.y + maxBlock.height - 0.01;
    } else if (this.velocity.y > 0) {
      this.velocity.y = 0;

      let maxBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].grid.position.y < maxBlock.grid.position.y) {
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
      this.velocity.z = 0;
      this.canJump = true;

      let maxZBlock = collisionBlocks[0];
      for (let i = 1; i < collisionBlocks.length; i++) {
        if (collisionBlocks[i].grid.position.z > maxZBlock.grid.position.z) {
          maxZBlock = collisionBlocks[i];
        }
      }

      this.position.z =
        maxZBlock.position.z +
        this.hitbox.depth * Constants.TILE_HEIGHT * 0.25 +
        0.01;
    }
    // else if (this.velocity.z > 0) {
    //   this.velocity.z = 0;

    //   const offset = this.hitbox.position.z - this.position.z;

    //   this.position.z =
    //     collisionBlock.position.z + collisionBlock.depth - offset + 0.01;
    // }
  }
}
