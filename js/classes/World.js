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
    this.willDeleteBlocks = [];
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
        if (!this.chunkMap.get(key)) continue;
        this.generateOneChunk(playerChunkX + cx, playerChunkY + cy, chunkSize);
      }
    }
  }

  async generateOneChunk(chunkX, chunkY, chunkSize = this.chunkSize) {
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
        const tileNum = this.getRandomChance(20) ? "021" : "023";
        const block = new Sprite({
          position: {
            x: isoBlock.x,
            y: isoBlock.y + noiseVal * 100,
          },
          imageSrc: `./img/tiles/tile_${tileNum}.png`,
        });
        chunk.push(block);
      }
    }
    const key = `${chunkX},${chunkY}`;
    this.chunkMap.set(key, chunk);
  }

  deleteBlock(type) {
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.image.src = "";
      this.hoverBlock.air = true;
    }
  }

  addBlock(renderDistance = this.renderDistance, chunkSize = this.chunkSize) {
    if (!this.hoverBlock) return;
    const src = `./img/tiles/tile_099.png`;

    const square = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    for (let cx = renderDistance; cx >= -renderDistance; cx--) {
      for (let cy = renderDistance; cy >= -renderDistance; cy--) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        const chunk = this.chunkMap.get(key);
        for (let i = chunk.length - 1; i >= 0; i--) {
          const block = chunk[i];
          if (
            !block.air &&
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
            this.hoverBlock = block;
            this.hoverBlock.position.y -= 5;
            return;
          }
        }
      }
    }
  }

  async updateHoverBlock(
    renderDistance = this.renderDistance,
    chunkSize = this.chunkSize
  ) {
    const square = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    if (this.hoverBlock) this.hoverBlock.position.y += 5;
    for (let cx = renderDistance; cx >= -renderDistance; cx--) {
      for (let cy = renderDistance; cy >= -renderDistance; cy--) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        const chunk = this.chunkMap.get(key);
        for (let i = chunk.length - 1; i >= 0; i--) {
          const block = chunk[i];
          if (
            !block.air &&
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
            this.hoverBlock = block;
            this.hoverBlock.position.y -= 5;
            return;
          }
        }
      }
    }
    this.hoverBlock = null;
  }
}
