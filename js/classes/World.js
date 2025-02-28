class World {
  constructor({
    seed = 1,
    renderDistance = 0,
    generateDistance = 0,
    chunkSize = 16,
    chunkHeight = 8,
  }) {
    Math.random = this.seededRandom(seed);
    this.perlin = new Perlin();
    this.chunkMap = new Map();
    this.renderDistance = renderDistance;
    this.generateDistance = generateDistance;
    this.chunkSize = chunkSize;
    this.chunkHeight = chunkHeight;
    this.hoverBlock = null;
    this.hoverBlockHeight = 3;
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
          this.tryToPlace(block);
          block.update();
        }
      }
    }
    this.addBlockType = null;
  }

  tryToPlace(block, hoverGrid = this.hoverGrid) {
    if (!this.addBlockType || block.name !== "air") return;

    const blockGrid = to_grid_coordinate(block.position);
    const adjacentBlock = [
      { dx: 0, dy: 1, dz: 0 },
      { dx: 1, dy: 0, dz: 0 },
      { dx: 0, dy: 0, dz: 1 },
    ].some(
      (offset) =>
        blockGrid.x === hoverGrid.x + offset.dx &&
        blockGrid.y === hoverGrid.y + offset.dy
      // && blockGrid.z === hoverGrid.z + offset.dz
    );

    if (
      adjacentBlock &&
      collision2D({
        object1: {
          position: {
            x: mouseScreen.position.x / scaledCanvas.scale - camera.position.x,
            y: mouseScreen.position.y / scaledCanvas.scale - camera.position.y,
          },
          width: 1,
          height: 1,
        },
        object2: block,
      })
    ) {
      block.name = this.addBlockType.name;
      block.image.src = this.addBlockType.imageSrc;
      this.addBlockType = null;
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

  async generateOneChunk(
    chunkX,
    chunkY,
    chunkSize = this.chunkSize,
    chunkHeight = this.chunkHeight
  ) {
    const chunk = [];
    for (let y = 0; y < chunkSize; y++) {
      for (let x = 0; x < chunkSize; x++) {
        const worldX = chunkX * chunkSize + x;
        const worldY = chunkY * chunkSize + y;
        const noiseVal = this.perlin.octaveNoise(
          worldX / chunkSize,
          worldY / chunkSize,
          3,
          0.5
        );
        const sigmoid = 1 / (1 + 2 ** (-noiseVal * 10));
        for (let z = chunkHeight; z > 0; z--) {
          if (sigmoid * chunkHeight > z) continue;

          const isoBlock = to_screen_coordinate({ x: worldX, y: worldY });
          const blockType = this.getRandomChance(20)
            ? {
                name: "dirt",
                imageSrc: `./img/tiles/tile_021.png`,
              }
            : noiseVal < 0.25
            ? {
                name: "grass",
                imageSrc: `./img/tiles/tile_023.png`,
              }
            : {
                name: "stone",
                imageSrc: `./img/tiles/tile_063.png`,
              };
          const block = new Sprite({
            name: blockType.name,
            position: {
              x: isoBlock.x,
              y: isoBlock.y,
              z: z * 8,
            },
            imageSrc: blockType.imageSrc,
          });
          chunk.push(block);
        }
      }
    }
    const key = `${chunkX},${chunkY}`;
    this.chunkMap.set(key, chunk);
  }

  deleteBlock(type) {
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.name = "air";
      this.hoverBlock.image.src = "";
    }
  }

  addBlock(block = { name: "", imageSrc: `./img/tiles/unknown.png` }) {
    if (!this.hoverBlock) return;
    this.addBlockType = block;

    this.hoverGrid = to_grid_coordinate({
      x: this.hoverBlock.position.x,
      y: this.hoverBlock.position.y + this.hoverBlockHeight,
    });
  }

  async updateHoverBlock(
    renderDistance = this.renderDistance,
    chunkSize = this.chunkSize
  ) {
    const square = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(square.x / chunkSize);
    const playerChunkY = Math.floor(square.y / chunkSize);

    if (this.hoverBlock) this.hoverBlock.position.y += this.hoverBlockHeight;
    for (let cx = renderDistance; cx >= -renderDistance; cx--) {
      for (let cy = renderDistance; cy >= -renderDistance; cy--) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        const chunk = this.chunkMap.get(key);
        if (!chunk) continue;
        for (let i = chunk.length - 1; i >= 0; i--) {
          const block = chunk[i];
          if (
            block.name !== "air" &&
            collision2D({
              object2: {
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
              object1: block,
            })
          ) {
            this.hoverBlock = block;
            this.hoverBlock.position.y -= this.hoverBlockHeight;
            return;
          }
        }
      }
    }
    this.hoverBlock = null;
  }
}
