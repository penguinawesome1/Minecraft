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

  isCollision(chunkSize = world1.chunkSize) {
    const { x: playerChunkX, y: playerChunkY } = player1.chunkPosition;
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
      const key = `${playerChunkX + cx},${playerChunkY + cy}`;
      const chunk = world1.chunkMap[key];
      if (!chunk) continue;

      for (const block of chunk) {
        if (
          block.name !== "air" &&
          collisionGrid({
            object1: player1.hitbox,
            object2: block.hitbox,
          })
        ) {
          collisionBlocks.push(block);
        }
      }
    }

    return collisionBlocks;
  }
}
