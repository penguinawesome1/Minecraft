class World {
  constructor({
    player,
    worldMode = "default",
    seed = 1,
    renderDistance = 0,
    chunkSize = 16,
    chunkHeight = 16,
    airHeight = 8,
    mobCap = 0,
  }) {
    this.player = player;
    this.worldMode = worldMode;
    Math.random = this.seededRandom(seed);
    this.renderDistance = renderDistance;
    this.chunkSize = chunkSize;
    this.chunkHeight = chunkHeight;
    this.airHeight = airHeight;
    this.mobCap = mobCap;
    this.hoverBlockDepth = 6;
    this.enemyList = [];

    if (this.worldMode === "skyblock") this.generateSkyBlock(10);
    this.setMaps();
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

  seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function () {
      return (s = (s * a) % m) / m;
    };
  }

  /**
   * Generates chunks in render distance that are missing
   * Updates all blocks within chunks in the render distance
   * Places any blocks in queue
   * Changes hoverBlock to what's hovered over
   * Tries to save chunk if needed
   */
  update() {
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
    const renderDistance = this.renderDistance;
    const minChunkX = playerChunkX - renderDistance;
    const maxChunkX = playerChunkX + renderDistance;
    const minChunkY = playerChunkY - renderDistance;
    const maxChunkY = playerChunkY + renderDistance;
    let newHoverBlock = null;

    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
        const chunk = this.chunkMap[`${chunkX},${chunkY}`];
        if (!chunk) {
          // generate any chunks that are missing
          if (this.worldMode !== "skyblock") {
            this.generateOneChunk({ chunkX, chunkY });
          }
          continue;
        }

        for (let i = 0; i < chunk.length; i++) {
          const block = chunk[i];

          // visually update blocks, place any if needed, load people when needed
          this.tryToPlace(block);
          this.tryToUpdateLife(block);
          this.renderer.draw({
            blockNum: block.blockNum,
            position: block.position,
          });

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

    this.tryToSaveChunk({ chunkX: playerChunkX, chunkY: playerChunkY });
    this.clearOldHover();
    this.setNewHover(newHoverBlock);
    this.tryToAddZombie();
    this.addBlockNum = null;

    if (!this.player.updated) this.player.update();
    for (const enemy of this.enemyList) {
      if (!enemy.updated) {
        enemy.update();
      }
    }
  }

  tryToUpdateLife(block) {
    // update player relative to other blocks
    if (
      sameCordsOffsetOne({
        object1: this.player.hitbox.position,
        object2: block.grid.position,
      })
    ) {
      this.player.update();
    }

    // update enemies relative to other blocks
    for (const enemy of this.enemyList) {
      if (
        sameCordsOffsetOne({
          object1: enemy.hitbox.position,
          object2: block.grid.position,
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
    if (
      this.addBlockNum &&
      block.blockNum === Renderer.AIR &&
      this.hoverBlock &&
      isAdjacent({
        block1: block,
        block2: this.hoverBlock,
      }) &&
      collisionCursor(block, true)
    ) {
      block.blockNum = this.addBlockNum;
      this.addBlockNum = null;
    }
  }

  tryToSaveChunk({ chunkX, chunkY }) {
    if (this.saveChunk) {
      const key = `${chunkX},${chunkY}`;
      this.persistantChunks[key] = this.chunkMap[key];
      this.saveChunk = false;
    }
  }

  generateOneChunk({ chunkX, chunkY }) {
    const chunkSize = this.chunkSize;
    const chunkHeight = this.chunkHeight;
    const worldXOffset = chunkX * chunkSize;
    const worldYOffset = chunkY * chunkSize;
    const heightDifference = chunkHeight - this.airHeight;
    const chunk = [];

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
            grid: {
              position: gridPosition,
              width: 1,
              height: 1,
              depth: 1,
            },
          });
        }
      }
    }
    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  getBlockNum({
    z,
    noiseVal,
    heightDifference,
    dirtChance = getRandomChance(5),
    noiseGrass = 0.25,
  }) {
    if (z === 0) return Renderer.BEDROCK;
    if (z > noiseVal * (heightDifference - 1) + 1) return Renderer.AIR;
    if (dirtChance) return Renderer.DIRT;
    if (noiseVal > noiseGrass) return Renderer.GRASS;
    return Renderer.STONE;
  }

  getBlockNumSkyBlock({ z, heightDifference }) {
    if (z < heightDifference - 1) return Renderer.DIRT;
    if (z === heightDifference - 1) return Renderer.GRASS;
    return Renderer.AIR;
  }

  deleteBlock(type) {
    if (this.hoverBlock && this.hoverBlock.blockNum === Renderer.BEDROCK)
      return;
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.blockNum = Renderer.AIR;
      this.saveChunk = true;
    }
  }

  addBlock(blockNum = Renderer.MISSING) {
    if (!this.hoverBlock) return;
    this.addBlockNum = blockNum;
    this.saveChunk = true;
  }

  generateSkyBlock() {
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
    const key = `${playerChunkX},${playerChunkY}`;
    if (this.chunkMap[key]) return;

    const chunkSize = this.chunkSize;
    const heightDifference = 5; // height of ground

    let chunk = [];
    for (let y = playerChunkY; y < playerChunkY + chunkSize; y++) {
      for (let x = playerChunkX; x < playerChunkX + chunkSize; x++) {
        for (let z = 0; z < this.chunkHeight; z++) {
          if (
            x < playerChunkY + chunkSize * 0.5 &&
            y >= playerChunkY + chunkSize * 0.5
          ) {
            continue;
          }

          const gridPosition = { x, y, z };
          chunk.push({
            blockNum: block1.getBlockNumSkyBlock({ z, heightDifference }),
            position: toScreenCoordinate(gridPosition),
            grid: {
              position: gridPosition,
              width: 1,
              height: 1,
              depth: 1,
            },
          });
        }
      }
    }
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
