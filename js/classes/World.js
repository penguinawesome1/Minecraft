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
    let playerUpdated = false;

    this.loopBackToFront(renderDistance, (cx, cy) => {
      const key = `${playerChunkX + cx},${playerChunkY + cy}`;
      const chunk = this.chunkMap[key];
      if (!chunk) {
        // generate any chunks that are missing
        if (gamemode !== "skyblock") {
          this.generateOneChunk(playerChunkX + cx, playerChunkY + cy);
        }
        return;
      }

      for (const block of chunk) {
        // visually update blocks and place any in queue
        this.tryToPlace(block);
        block.update();

        // update player relative to other blocks
        if (
          !playerUpdated &&
          sameCordsOffsetOne({
            object1: player1.hitbox.position,
            object2: block.hitbox.position,
          })
        ) {
          player1.update();
          playerUpdated = true;
        }

        // changes hoverBlock up to last searched block in chunk
        const shouldAccountForHover = block === this.hoverBlock;
        if (
          block.name !== "air" &&
          collisionCursor(block, shouldAccountForHover)
        ) {
          newHoverBlock = block;
        }
      }
    });

    this.tryToSaveChunk(playerChunkX, playerChunkY);
    this.clearOldHover();
    this.setNewHover(newHoverBlock);
    this.addBlockType = null;
    if (!playerUpdated) player1.update();
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
      this.hoverBlock &&
      isAdjacent({
        block1: block,
        block2: this.hoverBlock,
      }) &&
      collisionCursor(block, true)
    ) {
      block.name = this.addBlockType.name;
      block.image.src = this.addBlockType.imageSrc;
      this.addBlockType = null;
    }
  }

  tryToSaveChunk(chunkX, chunkY) {
    if (this.saveChunk) {
      const key = `${chunkX},${chunkY}`;
      this.persistantChunks[key] = this.chunkMap[key];
      this.saveChunk = false;
    }
  }

  generateOneChunk(
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
          const gridPosition = {
            x: worldX,
            y: worldY,
            z,
          };
          chunk.push(
            this.chooseBlock({
              gridPosition,
              noiseVal,
              position: toScreenCoordinate(gridPosition),
              dirtChance: this.getRandomChance(20),
              heightDifference,
            })
          );
        }
      }
    }
    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  chooseBlock({
    gridPosition,
    noiseVal,
    position,
    dirtChance,
    heightDifference,
  }) {
    const blockType =
      gridPosition.z === 0
        ? { name: "bedrock", imageSrc: `../../img/tiles/tile_115.png` }
        : gridPosition.z > noiseVal * heightDifference
        ? { name: "air", imageSrc: `../../img/tiles/missing.png` }
        : dirtChance
        ? { name: "dirt", imageSrc: `../../img/tiles/tile_021.png` }
        : noiseVal > 0.25
        ? { name: "grass", imageSrc: `../../img/tiles/tile_023.png` }
        : { name: "stone", imageSrc: `../../img/tiles/tile_063.png` };
    return new Sprite({
      name: blockType.name,
      position,
      gridPosition,
      imageSrc: blockType.imageSrc,
    });
  }

  deleteBlock(type) {
    if (this.hoverBlock && this.hoverBlock.name === "bedrock") return;
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

  generateSkyBlock(chunkSize = this.chunkSize, chunkHeight = this.chunkHeight) {
    const { x: playerChunkX, y: playerChunkY } = player1.chunkPosition;
    const key = `${playerChunkX},${playerChunkY}`;
    if (this.chunkMap[key]) return;

    let chunk = [];
    for (let y = 0; y < chunkSize; y++) {
      const worldY = playerChunkY + y;
      for (let x = 0; x < chunkSize; x++) {
        const worldX = playerChunkX + x;
        for (let z = 0; z < chunkHeight; z++) {
          if (x < chunkSize * 0.5 && y >= chunkSize * 0.5) continue;
          const gridPosition = {
            x: worldX,
            y: worldY,
            z,
          };
          const position = toScreenCoordinate(gridPosition);
          if (z < 4) {
            chunk.push(
              new Sprite({
                name: "dirt",
                gridPosition,
                position,
                imageSrc: `../../img/tiles/tile_021.png`,
              })
            );
          } else if (z === 4) {
            chunk.push(
              new Sprite({
                name: "grass",
                gridPosition,
                position,
                imageSrc: `../../img/tiles/tile_023.png`,
              })
            );
          } else {
            chunk.push(
              new Sprite({
                name: "air",
                gridPosition,
                position,
                imageSrc: `../../img/tiles/missing.png`,
              })
            );
          }
        }
      }
    }
    this.chunkMap[key] = chunk;
  }
}
