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

<<<<<<< HEAD
    this.setMaps();
    if (this.worldMode === "skyblock") this.generateSkyBlock(10);
=======
    if (this.worldMode === "skyblock") this.generateSkyBlock(10);
    this.setMaps();
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
<<<<<<< HEAD
    const { renderDistance, hoverBlock } = this;
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
=======
    const { x: playerChunkX, y: playerChunkY } = this.player.chunkPosition;
    const renderDistance = this.renderDistance;
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
    const minChunkX = playerChunkX - renderDistance;
    const maxChunkX = playerChunkX + renderDistance;
    const minChunkY = playerChunkY - renderDistance;
    const maxChunkY = playerChunkY + renderDistance;
    let newHoverBlock = null;
<<<<<<< HEAD
    this.playerDrawn = false;
=======
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74

    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
        const chunk = this.chunkMap[`${chunkX},${chunkY}`];
        if (!chunk) {
          // generate any chunks that are missing
          if (this.worldMode !== "skyblock") {
<<<<<<< HEAD
            this.generateOneChunk(chunkX, chunkY);
=======
            this.generateOneChunk({ chunkX, chunkY });
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
          }
          continue;
        }

        for (let i = 0; i < chunk.length; i++) {
          const block = chunk[i];

<<<<<<< HEAD
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
=======
          // visually update blocks, place any if needed, load people when needed
          this.tryToPlace(block);
          this.tryToUpdateLife(block);
          this.renderer.draw({
            blockNum: block.blockNum,
            position: block.position,
          });
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74

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

<<<<<<< HEAD
=======
    this.tryToSaveChunk({ chunkX: playerChunkX, chunkY: playerChunkY });
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
    this.clearOldHover();
    this.setNewHover(newHoverBlock);
    this.tryToAddZombie();
    this.addBlockNum = null;

<<<<<<< HEAD
    if (!this.playerDrawn) this.player.draw();
    this.player.update();
=======
    if (!this.player.updated) this.player.update();
    for (const enemy of this.enemyList) {
      if (!enemy.updated) {
        enemy.update();
      }
    }
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
  }

  tryToUpdateLife(block) {
    // update player relative to other blocks
    if (
      sameCordsOffsetOne({
        object1: this.player.hitbox.position,
        object2: block.grid.position,
      })
    ) {
<<<<<<< HEAD
      this.player.draw();
      this.playerDrawn = true;
=======
      this.player.update();
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
    const { addBlockNum, hoverBlock } = this;

    if (
<<<<<<< HEAD
      addBlockNum &&
      block.blockNum === Renderer.AIR &&
      hoverBlock &&
      collisionCursor(block, true) &&
=======
      this.addBlockNum &&
      block.blockNum === Renderer.AIR &&
      this.hoverBlock &&
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
      isAdjacent({
        block1: block,
        block2: hoverBlock,
      })
    ) {
<<<<<<< HEAD
      block.blockNum = addBlockNum;
      this.addBlockNum = null;
      return true;
=======
      block.blockNum = this.addBlockNum;
      this.addBlockNum = null;
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
    }
    return false;
  }

<<<<<<< HEAD
  saveChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    this.persistantChunks[key] = this.chunkMap[key];
  }

  generateOneChunk(chunkX, chunkY) {
    const { chunkSize, chunkHeight } = this;
=======
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
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
<<<<<<< HEAD
            grid: { position: gridPosition, width: 1, height: 1, depth: 1 },
=======
            grid: {
              position: gridPosition,
              width: 1,
              height: 1,
              depth: 1,
            },
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
          });
        }
      }
    }

    this.updateVisibility(chunk);

    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

<<<<<<< HEAD
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
      this.isDeleteBlock = true;
    }
  }

  addBlock(blockNum = Renderer.MISSING) {
    if (!this.hoverBlock) return;
    this.addBlockNum = blockNum;
  }

=======
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

>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
<<<<<<< HEAD
            blockNum: this.getBlockNumSkyBlock({ z, heightDifference }),
=======
            blockNum: block1.getBlockNumSkyBlock({ z, heightDifference }),
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
