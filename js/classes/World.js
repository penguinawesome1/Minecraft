class World {
  constructor({
    renderer,
    structure,
    player,
    worldMode = "default",
    renderDistance = 0,
    chunkSize = 16,
    chunkHeight = 16,
    airHeight = 8,
    mobCap = 0,
  }) {
    this.renderer = renderer;
    this.structure = structure;
    this.player = player;
    this.worldMode = worldMode;
    this.renderDistance = renderDistance;
    this.chunkSize = chunkSize;
    this.chunkHeight = chunkHeight;
    this.airHeight = airHeight;
    this.mobCap = mobCap;
    this.hoverBlockDepth = 6;
    this.enemyList = [];

    this.setMaps();
    if (this.worldMode === "skyblock") this.generateSkyBlock(10);
  }

  setObjects({ renderer }) {
    this.renderer = renderer;
  }

  setMaps() {
    const savedChunksString = localStorage.getItem(`${this.worldMode}Chunks`);
    const savedChunks = savedChunksString ? JSON.parse(savedChunksString) : {};
    this.chunkMap = savedChunks;
    this.persistantChunks = savedChunks;
  }

  /**
   * Generates chunks in render distance that are missing
   * Updates all blocks within chunks in the render distance
   * Places any blocks in queue
   * Changes hoverBlock to what's hovered over
   * Tries to save chunk if needed
   */
  update() {
    const { renderDistance, hoverBlock } = this;
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
    const minChunkX = playerChunkX - renderDistance;
    const maxChunkX = playerChunkX + renderDistance;
    const minChunkY = playerChunkY - renderDistance;
    const maxChunkY = playerChunkY + renderDistance;
    let newHoverBlock = null;
    this.playerDrawn = false;

    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
        const chunk = this.chunkMap[`${chunkX},${chunkY}`];
        if (!chunk) {
          // generate any chunks that are missing
          if (this.worldMode === "default")
            this.generateOneChunk(chunkX, chunkY);
          if (this.worldMode === "flat")
            this.generateOneChunkFlat(chunkX, chunkY);
          continue;
        }

        for (let i = 0; i < chunk.length; i++) {
          const block = chunk[i];

          if (block === hoverBlock && this.isDeleteBlock) {
            this.saveChunk(chunkX, chunkY);
            this.updateVisibility(chunk);
            this.isDeleteBlock = false;
          }

          // visually update blocks, place any if needed, load people when needed
          if (this.tryToPlace(block)) {
            this.saveChunk(chunkX, chunkY);
            this.updateVisibility(chunk);
          }
          this.tryToUpdateLife(block);

          if (block.visible) {
            this.renderer.draw({
              blockNum: block.blockNum,
              position: block.position,
            });
          }

          // changes hoverBlock up to last searched block in chunk
          const shouldAccountForHover = block === this.hoverBlock;
          if (
            block.blockNum !== Renderer.AIR &&
            collisionCursor(block, shouldAccountForHover)
          ) {
            newHoverBlock = block;
          }
        }
      }
    }

    this.clearOldHover();
    this.setNewHover(newHoverBlock);
    this.tryToAddZombie();
    this.addBlockNum = null;

    if (!this.playerDrawn) this.player.draw();
    this.player.update();
  }

  tryToUpdateLife(block) {
    // update player relative to other blocks
    if (
      sameCordsOffsetOne({
        object1: this.player.hitbox.position,
        object2: block.gridPosition,
      })
    ) {
      this.player.draw();
      this.playerDrawn = true;
    }

    // update enemies relative to other blocks
    for (const enemy of this.enemyList) {
      if (
        sameCordsOffsetOne({
          object1: enemy.hitbox.position,
          object2: block.gridPosition,
        })
      ) {
        enemy.update();
      }
    }
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
    const { addBlockNum, hoverBlock } = this;

    if (
      addBlockNum &&
      block.blockNum === Renderer.AIR &&
      hoverBlock &&
      collisionCursor(block, true) &&
      isAdjacent({
        block1: block,
        block2: hoverBlock,
      })
    ) {
      block.blockNum = addBlockNum;
      this.addBlockNum = null;
      return true;
    }
    return false;
  }

  saveChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    this.persistantChunks[key] = this.chunkMap[key];
  }

  generateOneChunk(chunkX, chunkY) {
    const { chunkSize, chunkHeight } = this;
    const worldXOffset = chunkX * chunkSize;
    const worldYOffset = chunkY * chunkSize;
    const heightDifference = chunkHeight - this.airHeight;
    const chunk = [];
    const treeCords = [];

    for (let y = worldYOffset; y < worldYOffset + chunkSize; y++) {
      for (let x = worldXOffset; x < worldXOffset + chunkSize; x++) {
        for (let z = 0; z < chunkHeight; z++) {
          const gridPosition = { x, y, z };
          chunk.push({
            blockNum: this.getBlockNum({
              z,
              noiseVal: octaveNoise(x / chunkSize, y / chunkSize),
              heightDifference,
            }),
            position: toScreenCoordinate(gridPosition),
            gridPosition,
          });

          if (
            getRandomChance(30) &&
            chunk.at(-1).blockNum === Renderer.AIR &&
            chunk.at(-2).blockNum === Renderer.DIRT
          ) {
            treeCords.push(gridPosition);
          }
        }
      }
    }
    for (const gridPosition of treeCords) {
      this.structure.generateTree({
        gridPosition,
        chunk,
        chunkSize,
        chunkHeight,
      });
    }
    this.updateVisibility(chunk);
    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  generateOneChunkFlat(chunkX, chunkY) {
    const { chunkSize, chunkHeight } = this;
    const heightDifference = 5; // height of ground
    const worldXOffset = chunkX * chunkSize;
    const worldYOffset = chunkY * chunkSize;
    const chunk = [];

    for (let y = worldYOffset; y < worldYOffset + chunkSize; y++) {
      for (let x = worldXOffset; x < worldXOffset + chunkSize; x++) {
        for (let z = 0; z < chunkHeight; z++) {
          const gridPosition = { x, y, z };
          chunk.push({
            blockNum: this.getBlockNumFlat({
              z,
              heightDifference,
            }),
            position: toScreenCoordinate(gridPosition),
            gridPosition,
          });
        }
      }
    }
    this.updateVisibility(chunk);
    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  updateVisibility(chunk) {
    const { chunkSize, chunkHeight } = this;
    const chunkLength = chunk.length;
    const adjacentOffsets = [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ];

    for (let i = 0; i < chunkLength; i++) {
      const block = chunk[i];
      if (block.blockNum === Renderer.AIR) continue;

      const z = i % chunkHeight;
      const temp = Math.floor(i / chunkHeight);
      const x = temp % chunkSize;
      const y = Math.floor(temp / chunkSize);

      block.visible = false;

      for (const [dx, dy, dz] of adjacentOffsets) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;

        if (nz >= chunkHeight || nx >= chunkSize || ny >= chunkSize) {
          block.visible = true; // visible if a visible face next to chunk border
          break;
        }

        const neighborBlock =
          chunk[nz + nx * chunkHeight + ny * chunkHeight * chunkSize];
        if (neighborBlock && neighborBlock.blockNum === Renderer.AIR) {
          block.visible = true; // visible if a visible face has air against it
          break;
        }
      }
    }
  }

  getBlockNum({
    z,
    noiseVal,
    heightDifference,
    dirtChance = getRandomChance(5),
    noiseGrass = 0.25,
  }) {
    const groundLevel = noiseVal * (heightDifference - 1) + 1;
    if (z === 0) return Renderer.BEDROCK;
    if (z > groundLevel) return Renderer.AIR;
    if (dirtChance) return Renderer.DIRT;
    if (noiseVal > noiseGrass) {
      if (z === Math.floor(groundLevel)) {
        return Renderer.GRASS;
      }
      return Renderer.DIRT;
    }
    return Renderer.STONE;
  }

  getBlockNumSkyBlock({
    gridPosition,
    playerChunkX,
    playerChunkY,
    heightDifference,
  }) {
    const { x, y, z } = gridPosition;
    const chunkSize = this.chunkSize;
    if (
      x < playerChunkX + chunkSize * 0.5 &&
      y >= playerChunkY + chunkSize * 0.5
    )
      return Renderer.AIR;
    if (z === heightDifference - 1) return Renderer.GRASS;
    if (z < heightDifference - 1) return Renderer.DIRT;
    return Renderer.AIR;
  }

  getBlockNumFlat({ z, heightDifference }) {
    if (z === 0) return Renderer.BEDROCK;
    if (z === heightDifference - 1) return Renderer.GRASS;
    if (z < heightDifference - 1) return Renderer.DIRT;
    return Renderer.AIR;
  }

  deleteBlock(type) {
    if (this.hoverBlock && this.hoverBlock.blockNum === Renderer.BEDROCK)
      return;
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.blockNum = Renderer.AIR;
      this.isDeleteBlock = true;
    }
  }

  addBlock(blockNum = Renderer.MISSING) {
    if (!this.hoverBlock) return;
    this.addBlockNum = blockNum;
  }

  generateSkyBlock() {
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
    const { chunkSize, chunkHeight } = this;
    const heightDifference = 5; // height of ground
    const key = `${playerChunkX},${playerChunkY}`;
    if (this.chunkMap[key]) return;

    let chunk = [];
    for (let y = playerChunkY; y < playerChunkY + chunkSize; y++) {
      for (let x = playerChunkX; x < playerChunkX + chunkSize; x++) {
        for (let z = 0; z < chunkHeight; z++) {
          const gridPosition = { x, y, z };
          chunk.push({
            blockNum: this.getBlockNumSkyBlock({
              gridPosition,
              playerChunkX,
              playerChunkY,
              heightDifference,
            }),
            position: toScreenCoordinate(gridPosition),
            gridPositon,
          });
        }
      }
    }

    this.structure.generateTree({
      gridPosition: { x: 4, y: 4, z: 5 },
      chunk,
      chunkSize,
      chunkHeight,
    });

    this.updateVisibility(chunk);

    this.chunkMap[key] = chunk;
  }

  tryToAddZombie() {
    if (this.enemyList.length >= this.mobCap || !getRandomChance(0.5)) return;

    this.enemyList.push(
      new Zombie({
        position: {
          x: 0,
          y: 0,
          z: 200,
        },
        scale: 1,
        imageSrc: `../img/player/Idle.png`,
        frameRate: 1,
        animations: {
          Idle: {
            imageSrc: `../img/player/Idle.png`,
            frameRate: 1,
            frameBuffer: 0,
          },
        },
      })
    );
  }
}
