class World {
  constructor({
    seed = 1,
    renderDistance = 0,
    generateDistance = 0,
    chunkSize = 16,
  }) {
    Math.random = this.seededRandom(seed);
    this.perlin = new Perlin();
    this.chunkMap = new Map();
    this.renderDistance = renderDistance;
    this.generateDistance = generateDistance;
    this.chunkSize = chunkSize;
    this.hoverBlock = null;
    this.deleteBlocks = [];
  }

  seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function () {
      return (s = (s * a) % m) / m;
    };
  }

  getRandomChance(n) {
    return Math.floor(Math.random() * n) === 0;
  }

  async renderChunks(
    renderDistance = this.renderDistance,
    chunkSize = this.chunkSize
  ) {
    const square = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    for (let cx = -renderDistance; cx <= renderDistance; cx++) {
      for (let cy = -renderDistance; cy <= renderDistance; cy++) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        const chunk = this.chunkMap.get(key);
        if (!chunk) continue;
        for (const block of chunk) {
          if (this.deleteBlocks.includes(block)) {
            chunk.splice(chunk.indexOf(block), 1);
            if (block === this.hoverBlock) this.updateHoverBlock();
          }
          block.update();
        }
      }
    }
  }

  async generateChunks(
    generateDistance = this.generateDistance,
    chunkSize = this.chunkSize
  ) {
    const square = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    for (let cx = -generateDistance; cx <= generateDistance; cx++) {
      for (let cy = -generateDistance; cy <= generateDistance; cy++) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        if (this.chunkMap.get(key)) continue;
        this.generateOneChunk(playerChunkX + cx, playerChunkY + cy, chunkSize);
      }
    }
  }

  generateOneChunk(chunkX, chunkY, chunkSize = this.chunkSize) {
    const chunk = [];
    for (let y = 0; y < chunkSize; y++) {
      for (let x = 0; x < chunkSize; x++) {
        const worldX = chunkX * chunkSize + x;
        const worldY = chunkY * chunkSize + y;
        const noiseVal = this.perlin.octaveNoise(
          worldX / chunkSize,
          worldY / chunkSize,
          6,
          0.5
        ); // Adjust scaling for terrain features.

        const isoBlock = to_screen_coordinate({ x: worldX, y: worldY });
        const block = new Sprite({
          position: {
            x: isoBlock.x,
            y: isoBlock.y + noiseVal * 100,
          },
          imageSrc: this.getRandomChance(20)
            ? `./img/tiles/tile_025.png`
            : `./img/tiles/tile_023.png`,
        });
        chunk.push(block);
      }
    }
    const key = `${chunkX},${chunkY}`;
    this.chunkMap.set(key, chunk);
  }

  deleteBlock(type) {
    if (type === "hover") {
      this.deleteBlocks.push(this.hoverBlock);
    }
  }

  updateHoverBlock() {
    for (const [key, chunk] of this.chunkMap.entries()) {
      for (let i = chunk.length - 1; i >= 0; i--) {
        const block = chunk[i];
        if (
          collision({
            object1: {
              position: {
                x:
                  mouseScreen.position.x / scaledCanvas.scale -
                  camera.position.x,
                y:
                  mouseScreen.position.y / scaledCanvas.scale -
                  camera.position.y,
              },
              width: 1,
              height: 1,
            },
            object2: block,
          })
        ) {
          if (this.hoverBlock) this.hoverBlock.position.y += 5;
          this.hoverBlock = block;
          this.hoverBlock.position.y -= 5;
          return;
        }
      }
    }
    if (this.hoverBlock) {
      this.hoverBlock.position.y += 5;
      this.hoverBlock = null;
    }
  }
}
