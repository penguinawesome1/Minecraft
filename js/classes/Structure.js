class Structure {
  generateTree({ gridPosition, chunk, chunkSize, chunkHeight }) {
    const x = gridPosition.x % chunkSize;
    const y = gridPosition.y % chunkSize;
    const z = gridPosition.z;
    const SIZE = 1;

    if (
      x < SIZE ||
      x >= chunkSize - SIZE ||
      y < SIZE ||
      y >= chunkSize - SIZE
    ) {
      return;
    }

    const adjacentBlocks = [
      { dx: 0, dy: 0, dz: 0, blockNum: Renderer.WOOD },
      { dx: 0, dy: 0, dz: 1, blockNum: Renderer.WOOD },
      { dx: 0, dy: 0, dz: 2, blockNum: Renderer.WOOD },
      { dx: 0, dy: 0, dz: 3, blockNum: Renderer.WOOD },
      { dx: 0, dy: 0, dz: 4, blockNum: Renderer.WOOD },

      { dx: 0, dy: 0, dz: 5, blockNum: Renderer.LEAF },
      { dx: 0, dy: 0, dz: 6, blockNum: Renderer.LEAF },
      { dx: 0, dy: 0, dz: 7, blockNum: Renderer.LEAF },

      { dx: 1, dy: 0, dz: 4, blockNum: Renderer.LEAF },
      { dx: -1, dy: 0, dz: 4, blockNum: Renderer.LEAF },
      { dx: 0, dy: 1, dz: 4, blockNum: Renderer.LEAF },
      { dx: 0, dy: -1, dz: 4, blockNum: Renderer.LEAF },
      { dx: 1, dy: 1, dz: 4, blockNum: Renderer.LEAF },
      { dx: 1, dy: -1, dz: 4, blockNum: Renderer.LEAF },
      { dx: -1, dy: 1, dz: 4, blockNum: Renderer.LEAF },
      { dx: -1, dy: -1, dz: 4, blockNum: Renderer.LEAF },

      { dx: 1, dy: 0, dz: 5, blockNum: Renderer.LEAF },
      { dx: -1, dy: 0, dz: 5, blockNum: Renderer.LEAF },
      { dx: 0, dy: 1, dz: 5, blockNum: Renderer.LEAF },
      { dx: 0, dy: -1, dz: 5, blockNum: Renderer.LEAF },
      { dx: 1, dy: 1, dz: 5, blockNum: Renderer.LEAF },
      { dx: 1, dy: -1, dz: 5, blockNum: Renderer.LEAF },
      { dx: -1, dy: 1, dz: 5, blockNum: Renderer.LEAF },
      { dx: -1, dy: -1, dz: 5, blockNum: Renderer.LEAF },

      { dx: 1, dy: 0, dz: 6, blockNum: Renderer.LEAF },
      { dx: -1, dy: 0, dz: 6, blockNum: Renderer.LEAF },
      { dx: 0, dy: 1, dz: 6, blockNum: Renderer.LEAF },
      { dx: 0, dy: -1, dz: 6, blockNum: Renderer.LEAF },
    ];

    for (const offset of adjacentBlocks) {
      const nx = x + offset.dx;
      const ny = y + offset.dy;
      const nz = z + offset.dz;

      if (
        nz < 0 ||
        nz >= chunkHeight ||
        nx < 0 ||
        nx >= chunkSize ||
        ny < 0 ||
        ny >= chunkSize
      ) {
        return; // return if out of chunk
      }

      const block = chunk[nz + nx * chunkHeight + ny * chunkHeight * chunkSize];
      if (block.blockNum !== Renderer.AIR) continue;
      block.blockNum = offset.blockNum;
    }
  }
}
