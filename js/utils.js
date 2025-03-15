// Function to get query parameters from the URL
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return ""; //if the param exists but has no value, return empty string
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getRandomChance(percent) {
  return Math.random() < percent / 100;
}

/**
 * Determines if the block is adjacent to any visible face of the other block.
 * @param {object} block1 - The block to check for adjacency.
 * @param {object} block2 - The block to check against.
 * @returns {boolean} - Returns true if the block is adjacent to any visible face of the other block, false otherwise.
 */
function isAdjacent({ block1, block2 }) {
  const adjacentOffsets = [
    { dx: 0, dy: 1, dz: 0 },
    { dx: 1, dy: 0, dz: 0 },
    { dx: 0, dy: 0, dz: 1 },
  ];

  return adjacentOffsets.some(
    (offset) =>
      block1.grid.position.z === block2.grid.position.z + offset.dz &&
      block1.grid.position.x === block2.grid.position.x + offset.dx &&
      block1.grid.position.y === block2.grid.position.y + offset.dy
  );
}

function sameCordsOffsetOne({ object1, object2 }) {
  return (
    object1.z === object2.z &&
    object1.x + 1 === object2.x &&
    object1.y + 1 === object2.y
  );
}

function collisionCursor(block, hover = false) {
  const { x: mouseX, y: mouseY } = renderer.mouse.worldPosition;

  const ellipse = {
    center: {
      x: block.position.x + Constants.TILE_WIDTH / 2,
      y:
        block.position.y +
        Constants.TILE_HEIGHT * 0.625 -
        (block.position.z ?? 0) / 2 +
        (hover ? world.hoverBlockDepth / 2 : 0),
    },
    radiusX: Constants.TILE_WIDTH / 2 + 2,
    radiusY: Constants.TILE_HEIGHT * 0.375,
  };

  const dx = Math.abs(mouseX - ellipse.center.x) / ellipse.radiusX;
  const dy = Math.abs(mouseY - ellipse.center.y) / ellipse.radiusY;
  const diamond = dx + dy;
  const circle = Math.sqrt(dx * dx + dy * dy);

  const lerpFactor = 0.5;
  const blendedDistance = lerpFactor * circle + (1 - lerpFactor) * diamond;
  return blendedDistance <= 1;
}

function collisionScreen({ object1, object2 }) {
  const y1 = object1.position.y - (object1.position.z ?? 0) / 2;
  const y2 = object2.position.y - (object2.position.z ?? 0) / 2;
  return (
    y1 + object1.height >= y2 &&
    y1 <= y2 + object2.height &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.x + object1.width >= object2.position.x
  );
}

function collisionGrid({ object1, object2, includesFeet }) {
  const x1 = object1.position.x;
  const y1 = object1.position.y;
  const z1 = object1.position.z + object1.depth + (includesFeet ? 0 : 1); // add depth to start under the obj
  const w1 = object1.width;
  const h1 = object1.height;
  const d1 = object1.depth;

  const x2 = object2.position.x;
  const y2 = object2.position.y;
  const z2 = object2.position.z + object2.depth; // add depth to start under the obj
  const w2 = object2.width;
  const h2 = object2.height;
  const d2 = object2.depth;

  return (
    z1 + d1 >= z2 &&
    z1 <= z2 + d2 &&
    y1 + h1 >= y2 &&
    y1 <= y2 + h2 &&
    x1 + w1 >= x2 &&
    x1 <= x2 + w2
  );
}

function calcAngle({ object1, object2 }) {
  const x1 = object1.position.x + object1.width / 2;
  const y1 = object1.position.y + object1.height / 2;
  const x2 = object2.position.x + object2.width / 2;
  const y2 = object2.position.y + object2.height / 2;
  return Math.atan2(y2 - y1, x2 - x1);
}

function calcDistance({ object1, object2 }) {
  const x1 = object1.position.x + object1.width / 2;
  const y1 = object1.position.y + object1.height / 2;
  const x2 = object2.position.x + object2.width / 2;
  const y2 = object2.position.y + object2.height / 2;
  return Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
}

// These are the four numbers that define the transform
const axis = {
  x: {
    x: 1,
    y: 0.5,
  },
  y: {
    x: -1,
    y: 0.5,
  },
};

function toScreenCoordinate(tile) {
  return {
    x:
      tile.x * axis.x.x * (0.5 * Constants.TILE_WIDTH) +
      tile.y * axis.y.x * (0.5 * Constants.TILE_WIDTH),
    y:
      tile.x * axis.x.y * (0.5 * Constants.TILE_HEIGHT) +
      tile.y * axis.y.y * (0.5 * Constants.TILE_HEIGHT),
    z: tile.z * (0.5 * Constants.TILE_HEIGHT),
  };
}

// Going from screen coordinate to grid coordinate

function invertMatrix(a, b, c, d) {
  // Determinant
  const det = 1 / (a * d - b * c);

  return {
    a: det * d,
    b: det * -b,
    c: det * -c,
    d: det * a,
  };
}

function toGridCoordinate(screen) {
  const a = axis.x.x * (0.5 * Constants.TILE_WIDTH);
  const b = axis.y.x * (0.5 * Constants.TILE_WIDTH);
  const c = axis.x.y * (0.5 * Constants.TILE_HEIGHT);
  const d = axis.y.y * (0.5 * Constants.TILE_HEIGHT);

  const inv = invertMatrix(a, b, c, d);

  return {
    x: Math.floor(screen.x * inv.a + screen.y * inv.b + 0.5),
    y: Math.floor(screen.x * inv.c + screen.y * inv.d + 0.5),
    z: Math.floor((screen.z * 2) / Constants.TILE_HEIGHT + 0.5),
  };
}
