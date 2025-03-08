class World {
  constructor({
    seed = 1,
    renderDistance = 0,
    chunkSize = 16,
    chunkHeight = 16,
    airHeight = 8,
  }) {
    Math.random = this.seededRandom(seed);
    this.chunkMap = savedChunks ?? {};
    this.persistantChunks = savedChunks ?? {};
    this.renderDistance = renderDistance;
    this.chunkSize = chunkSize;
    this.chunkHeight = chunkHeight;
    this.airHeight = airHeight;
    this.hoverBlockDepth = 6;
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

  /**
   * Generates chunks in render distance that are missing
   * Updates all blocks within chunks in the render distance
   * Places any blocks in queue
   * Changes hoverBlock to what's hovered over
   * Tries to save chunk if needed
   * @param {int} renderDistance How many chunks out displayed and generated
   */
  update(renderDistance = this.renderDistance) {
    const { x: playerChunkX, y: playerChunkY } = player1.chunkPosition;
    let newHoverBlock = null;

    this.loopBackToFront(renderDistance, async (cx, cy) => {
      const key = `${playerChunkX + cx},${playerChunkY + cy}`;
      const chunk = this.chunkMap[key];
      if (!chunk) {
        // generate any chunks that are missing
        if (player1.gamemode !== "skyblock") {
          await this.generateOneChunk(playerChunkX + cx, playerChunkY + cy);
        }
        return;
      }

      for (const block of chunk) {
        // visually update blocks and place any in queue
        this.tryToPlace(block);
        block.update();

        // changes hoverBlock up to last searched block in chunk
        if (block.name !== "air" && collisionCursor(block)) {
          newHoverBlock = block;
        }
      }
    });

    this.tryToSaveChunk(playerChunkX, playerChunkY);
    this.clearOldHover();
    this.setNewHover(newHoverBlock);
  }

  clearOldHover() {
    if (this.hoverBlock) {
      this.hoverBlock.position.z -= this.hoverBlockDepth;
      this.hoverBlock = null;
    }
  }

  setNewHover(newHoverBlock) {
    if (newHoverBlock) {
      this.hoverBlock = newHoverBlock;
      this.hoverBlock.position.z += this.hoverBlockDepth;
    }
  }

  tryToPlace(block) {
    if (
      this.addBlockType &&
      block.name === "air" &&
      this.isAdjacentToHover(block) &&
      collisionCursor(block)
    ) {
      block.name = this.addBlockType.name;
      block.image.src = this.addBlockType.imageSrc;
      this.addBlockType = null;
    }
  }

  isAdjacentToHover(block, hoverBlock = this.hoverBlock) {
    return true;
    const adjacentOffsets = [
      { dx: 0, dy: 1, dz: 0 },
      { dx: 1, dy: 0, dz: 0 },
      { dx: 0, dy: 0, dz: 0 },
    ];

    return adjacentOffsets.some(
      (offset) =>
        block.hitbox.position.x === hoverBlock.hitbox.position.x + offset.dx &&
        block.hitbox.position.y === hoverBlock.hitbox.position.y + offset.dy &&
        block.hitbox.position.z === hoverBlock.hitbox.position.z + offset.dz
    );
  }

  tryToSaveChunk(chunkX, chunkY) {
    if (this.saveChunk) {
      const key = `${chunkX},${chunkY}`;
      this.persistantChunks[key] = this.chunkMap[key];
      this.saveChunk = false;
    }
  }

  async generateOneChunk(
    chunkX,
    chunkY,
    chunkSize = this.chunkSize,
    chunkHeight = this.chunkHeight,
    airHeight = this.airHeight
  ) {
    const chunk = [];
    const worldXOffset = chunkX * chunkSize;
    const worldYOffset = chunkY * chunkSize;
    const heightDifference = chunkHeight - airHeight;

    for (let y = 0; y < chunkSize; y++) {
      const worldY = worldYOffset + y;
      for (let x = 0; x < chunkSize; x++) {
        const worldX = worldXOffset + x;
        const noiseVal = octaveNoise(worldX / chunkSize, worldY / chunkSize);

        for (let z = 0; z < chunkHeight; z++) {
          chunk.push(
            this.chooseBlock({
              z,
              noiseVal,
              position: toScreenCoordinate({
                x: worldX,
                y: worldY,
                z,
              }),
              dirtChance: this.getRandomChance(20),
              heightDifference,
            })
          );
        }
      }
    }
    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  chooseBlock({ z, noiseVal, position, dirtChance, heightDifference }) {
    if (z > noiseVal * heightDifference) {
      return new Sprite({ name: "air", position, imageSrc: "" });
    }
    if (dirtChance) {
      return new Sprite({
        name: "dirt",
        position,
        imageSrc: `../../img/tiles/tile_021.png`,
      });
    }
    const blockType =
      noiseVal > 0.25
        ? { name: "grass", imageSrc: `../../img/tiles/tile_023.png` }
        : { name: "stone", imageSrc: `../../img/tiles/tile_063.png` };
    return new Sprite({
      name: blockType.name,
      position,
      imageSrc: blockType.imageSrc,
    });
  }

  deleteBlock(type) {
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.name = "air";
      this.hoverBlock.image.src = "";
      this.saveChunk = true;
    }
  }

  addBlock(block = { name: "", imageSrc: `../../img/tiles/missing.png` }) {
    if (!this.hoverBlock) return;
    this.addBlockType = block;
    this.saveChunk = true;
  }

  loopBackToFront(distance, callback) {
    for (let cx = -distance; cx <= distance; cx++) {
      for (let cy = -distance; cy <= distance; cy++) {
        callback(cx, cy);
      }
    }
  }
}
