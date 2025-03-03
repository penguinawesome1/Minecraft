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
    this.velocity.y += gravity;
    this.position.y += this.velocity.y;
  }

  applyFriction() {
    this.velocity.x *= frictionMultiplier;
    this.position.x += this.velocity.x;
  }

  isCollision(chunkSize = world1.chunkSize) {
    const square = to_grid_coordinate(this.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    const hitBlocks = [];
    const adjacentChunks = [
      { cx: 0, cy: 0 },
      { cx: 1, cy: 0 },
      { cx: -1, cy: 0 },
      { cx: 0, cy: 1 },
      { cx: 0, cy: -1 },
    ];

    for (const { cx, cy } of adjacentChunks) {
      const key = `${playerChunkX + cx},${playerChunkY + cy}`;
      const chunk = world1.chunkMap[key];
      if (!chunk) continue;

      for (let i = 0; i < chunk.length; i++) {
        const block = chunk[i];
        if (collision3D({ object1: this.hitbox, object2: block.position })) {
          hitBlocks.push(block);
        }
      }
    }

    return hitBlocks;
  }
}
