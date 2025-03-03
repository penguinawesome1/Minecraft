class World {
  constructor({
    seed = 1,
    renderDistance = 0,
    generateDistance = 0,
    chunkSize = 16,
    chunkHeight = 16,
    airHeight = 8,
  }) {
    Math.random = this.seededRandom(seed);
    this.perlin = new Perlin();
    // this.chunkMap = savedChunks ?? {};
    this.chunkMap = {};
    this.persistantChunks = { ...this.chunkMap };
    this.renderDistance = renderDistance;
    this.generateDistance = generateDistance;
    this.chunkSize = chunkSize;
    this.chunkHeight = chunkHeight;
    this.airHeight = airHeight;
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

  renderChunks(
    renderDistance = this.renderDistance,
    chunkSize = this.chunkSize
  ) {
    const playerGridPos = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(playerGridPos.x / chunkSize);
    const playerChunkY = Math.floor(playerGridPos.y / chunkSize);

    if (this.saveChunk) {
      const key = `${playerChunkX},${playerChunkY}`;
      this.persistantChunks[key] = this.chunkMap[key];
      localStorage.setItem(
        `${gamemode}Chunks`,
        JSON.stringify(this.persistantChunks)
      );
      this.saveChunk = false;
    }

    for (let cx = -renderDistance; cx <= renderDistance; cx++) {
      for (let cy = -renderDistance; cy <= renderDistance; cy++) {
        const chunk =
          this.chunkMap[`${playerChunkX + cx},${playerChunkY + cy}`];
        if (!chunk) continue;

        for (let i = 0, len = chunk.length; i < len; i++) {
          const block = chunk[i];
          this.tryToPlace(block);
          block.update();
        }
      }
    }
    this.addBlockType = null;
  }

  // renderChunks(
  //   renderDistance = this.renderDistance,
  //   chunkSize = this.chunkSize
  // ) {
  //   const playerGridPos = to_grid_coordinate(player1.position);
  //   const playerChunkX = Math.floor(playerGridPos.x / chunkSize);
  //   const playerChunkY = Math.floor(playerGridPos.y / chunkSize);

  //   if (
  //     this.lastCameraPosition &&
  //     this.lastCameraPosition.x === camera.position.x &&
  //     this.lastCameraPosition.y === camera.position.y
  //   ) {
  //     return; // Camera hasn't moved, no need to re-render
  //   }

  //   this.lastCameraPosition = { ...camera.position };

  //   const renderList = [];

  //   for (let cx = -renderDistance; cx <= renderDistance; cx++) {
  //     for (let cy = -renderDistance; cy <= renderDistance; cy++) {
  //       const chunk =
  //         this.chunkMap[`${playerChunkX + cx},${playerChunkY + cy}`];
  //       if (!chunk) continue;

  //       for (let i = 0, len = chunk.length; i < len; i++) {
  //         const block = chunk[i];
  //         if (this.isBlockVisible(block)) {
  //           renderList.push(block);
  //         }
  //       }
  //     }
  //   }

  //   // Sort blocks by Z-coordinate for depth sorting
  //   renderList.sort((a, b) => b.position.z - a.position.z);

  //   this.batchRender(renderList);

  //   this.addBlockType = null;
  // }

  // isBlockVisible(block) {
  //   const screenPos = to_screen_coordinate(block.position);
  //   return (
  //     screenPos.x > camera.position.x &&
  //     screenPos.x < camera.position.x + scaledCanvas.width &&
  //     screenPos.y > camera.position.y &&
  //     screenPos.y < camera.position.y + scaledCanvas.height
  //   );
  // }

  // batchRender(renderList) {
  //   renderList.forEach((block) => {
  //     this.tryToPlace(block);
  //     block.update();
  //   });
  // }

  tryToPlace(block) {
    if (!this.addBlockType || block.name !== "air") return;

    const hoverGrid = to_grid_coordinate(this.hoverBlock.position);
    const blockGrid = to_grid_coordinate(block.position);
    const hoverZ = this.hoverBlock.position.z - this.hoverBlockHeight;

    const adjacentOffsets = [
      { dx: 0, dy: 1, dz: 0 },
      { dx: 1, dy: 0, dz: 0 },
      { dx: 0, dy: 0, dz: 8 },
    ];

    const isAdjacent = adjacentOffsets.some(
      (offset) =>
        blockGrid.x === hoverGrid.x + offset.dx &&
        blockGrid.y === hoverGrid.y + offset.dy &&
        block.position.z === hoverZ + offset.dz
    );

    if (
      isAdjacent &&
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
      this.saveChunk = true;
    }
  }

  async generateChunks(
    generateDistance = this.generateDistance,
    chunkSize = this.chunkSize,
    chunkHeight = this.chunkHeight,
    airHeight = this.airHeight
  ) {
    const playerGridPos = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(playerGridPos.x / chunkSize);
    const playerChunkY = Math.floor(playerGridPos.y / chunkSize);

    const chunkGenerationPromises = [];

    for (let cx = -generateDistance; cx <= generateDistance; cx++) {
      for (let cy = -generateDistance; cy <= generateDistance; cy++) {
        const chunkX = playerChunkX + cx;
        const chunkY = playerChunkY + cy;
        const key = `${chunkX},${chunkY}`;

        if (!this.chunkMap[key]) {
          chunkGenerationPromises.push(
            this.generateOneChunk(
              chunkX,
              chunkY,
              chunkSize,
              chunkHeight,
              airHeight
            )
          );
        }
      }
    }

    await Promise.all(chunkGenerationPromises);
  }

  // this.screenPoints = [];
  // for (
  //   let cx = -camera.position.x;
  //   cx < canvas.width - camera.position.x;
  //   cx += w / 2
  // ) {
  //   for (
  //     let cy = -camera.position.y;
  //     cy < canvas.height - camera.position.y;
  //     cy += h / 2
  //   ) {
  //     this.screenPoints.push({
  //       position: {
  //         x: cx,
  //         y: cy,
  //       },
  //       width: 1,
  //       height: 1,
  //     });
  //   }
  // }

  // for (let cx = generateDistance; cx >= -generateDistance; cx--) {
  //   for (let cy = generateDistance; cy >= -generateDistance; cy--) {
  //     const key = `${playerChunkX + cx},${playerChunkY + cy}`;
  //     for (const block of ch)
  //     // if (this.chunkMap[key]) continue;
  //     const collisionDetected = this.screenPoints.some((point) =>
  //       collision2D({ object2: point, object1: block })
  //     );

  //     block.visible = collisionDetected;
  //     if (!collisionDetected) continue;

  //     const indexToRemove = this.screenPoints.findIndex((point) =>
  //       collision2D({ object2: point, object1: block })
  //     );

  //     if (indexToRemove !== -1) {
  //       this.screenPoints.splice(indexToRemove, 1);
  //     }
  //   }
  // }

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
    const noiseScale = 1 / chunkSize;
    const sigmoidMultiplier = -10;
    const heightDifference = chunkHeight - airHeight;

    for (let y = 0; y < chunkSize; y++) {
      const worldY = worldYOffset + y;
      for (let x = 0; x < chunkSize; x++) {
        const worldX = worldXOffset + x;
        const noiseVal = this.perlin.octaveNoise(
          worldX * noiseScale,
          worldY * noiseScale,
          3,
          0.5
        );
        const sigmoid = 1 / (1 + 2 ** (noiseVal * sigmoidMultiplier));
        const isoBlock = to_screen_coordinate({ x: worldX, y: worldY });

        for (let z = chunkHeight; z > 0; z--) {
          let blockType;
          if (sigmoid * heightDifference > z - airHeight) {
            blockType = { name: "air", imageSrc: "" };
          } else if (this.getRandomChance(20)) {
            blockType = {
              name: "dirt",
              imageSrc: `../../img/tiles/tile_021.png`,
            };
          } else if (noiseVal < 0.25) {
            blockType = {
              name: "grass",
              imageSrc: `../../img/tiles/tile_023.png`,
            };
          } else {
            blockType = {
              name: "stone",
              imageSrc: `../../img/tiles/tile_063.png`,
            };
          }

          chunk.push(
            new Sprite({
              name: blockType.name,
              position: { x: isoBlock.x, y: isoBlock.y, z: z * -8 },
              imageSrc: blockType.imageSrc,
            })
          );
        }
      }
    }

    this.chunkMap[`${chunkX},${chunkY}`] = chunk;
  }

  deleteBlock(type) {
    if (type === "hover") {
      if (!this.hoverBlock) return;
      this.hoverBlock.name = "air";
      this.hoverBlock.image.src = "";
      this.saveChunk = true;
    }
  }

  addBlock(block = { name: "", imageSrc: `../../img/tiles/unknown.png` }) {
    if (!this.hoverBlock) return;
    this.addBlockType = block;
  }

  updateHoverBlock(
    renderDistance = this.renderDistance,
    chunkSize = this.chunkSize
  ) {
    const playerGridPos = to_grid_coordinate(player1.position);
    const playerChunkX = Math.floor(playerGridPos.x / chunkSize);
    const playerChunkY = Math.floor(playerGridPos.y / chunkSize);
    const mouseWorldPos = {
      x: mouseScreen.position.x / scaledCanvas.scale - camera.position.x,
      y: mouseScreen.position.y / scaledCanvas.scale - camera.position.y,
    };

    if (this.hoverBlock) {
      this.hoverBlock.position.z -= this.hoverBlockHeight;
      this.hoverBlock = null;
    }

    for (let cx = -renderDistance; cx <= renderDistance; cx++) {
      for (let cy = -renderDistance; cy <= renderDistance; cy++) {
        const key = `${playerChunkX + cx},${playerChunkY + cy}`;
        const chunk = this.chunkMap[key];
        if (!chunk) continue;

        for (let i = chunk.length - 1; i >= 0; i--) {
          const block = chunk[i];

          if (
            block.name !== "air" &&
            collisionCircle({
              object1: block,
              circle2: { center: mouseWorldPos, radius: 1 },
            })
          ) {
            this.hoverBlock = block;
            this.hoverBlock.position.z += this.hoverBlockHeight;
            return;
          }
        }
      }
    }
  }
}
