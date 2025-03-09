// Function to get query parameters from the URL
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return ""; //if the param exists but has no value, return empty string
  return decodeURIComponent(results[2].replace(/\+/g, " "));
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
      block1.hitbox.position.z === block2.hitbox.position.z + offset.dz &&
      block1.hitbox.position.x === block2.hitbox.position.x + offset.dx &&
      block1.hitbox.position.y === block2.hitbox.position.y + offset.dy
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
  const { x: mouseX, y: mouseY } = mouse.worldPosition;

  const ellipse = {
    center: {
      x: block.position.x + block.width / 2,
      y:
        block.position.y +
        block.height * 0.625 -
        (block.position.z ?? 0) / 2 +
        (hover ? world1.hoverBlockDepth / 2 : 0),
    },
    radiusX: block.width / 2 + 2,
    radiusY: block.height * 0.375,
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
    x: tile.x * axis.x.x * (0.5 * w) + tile.y * axis.y.x * (0.5 * w),
    y: tile.x * axis.x.y * (0.5 * h) + tile.y * axis.y.y * (0.5 * h),
    z: tile.z * (0.5 * h),
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
  const a = axis.x.x * (0.5 * w);
  const b = axis.y.x * (0.5 * w);
  const c = axis.x.y * (0.5 * h);
  const d = axis.y.y * (0.5 * h);

  const inv = invertMatrix(a, b, c, d);

  return {
    x: Math.floor(screen.x * inv.a + screen.y * inv.b + 0.5),
    y: Math.floor(screen.x * inv.c + screen.y * inv.d + 0.5),
    z: Math.floor((screen.z * 2) / h + 0.5),
  };
}
