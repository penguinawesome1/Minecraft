// Function to get query parameters from the URL
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null; // Handle the case where the parameter is not found at all

  //Check if there is a value after the =
  if (!results[2]) return ""; //if the param exists but has no value, return empty string

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function collisionCircle({ object1, circle2 }) {
  const ellipse1 = {
    center: {
      x: object1.position.x + object1.width / 2,
      y:
        object1.position.y + object1.height / 2 - (object1.position.z ?? 0) + 2,
    },
    radiusX: object1.width / 2 + 2,
    radiusY: object1.height / 2,
  };

  const dx = Math.abs(circle2.center.x - ellipse1.center.x) / ellipse1.radiusX;
  const dy = Math.abs(circle2.center.y - ellipse1.center.y) / ellipse1.radiusY;

  // Manhattan distance (diamond).
  const manhattanDistance = dx + dy;
  // Euclidean distance (circle).
  const euclideanDistance = Math.sqrt(dx * dx + dy * dy);

  const lerpFactor = 0.5;
  const blendedDistance =
    lerpFactor * euclideanDistance + (1 - lerpFactor) * manhattanDistance;

  return blendedDistance <= 1;
}

function collision2D({ object1, object2 }) {
  const y1 = object1.position.y - (object1.position.z ?? 0);
  const y2 = object2.position.y - (object2.position.z ?? 0);
  return (
    y1 + object1.height >= y2 &&
    y1 <= y2 + object2.height &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.x + object1.width >= object2.position.x
  );
}

function collision3D({ object1, object2 }) {
  // return (
  //   object1.position.y + object1.height >= object2.position.y &&
  //   object1.position.y <= object2.position.y + object2.height &&
  //   object1.position.x <= object2.position.x + object2.width &&
  //   object1.position.x + object1.width >= object2.position.x
  // );
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

function to_screen_coordinate(tile) {
  return {
    x: tile.x * axis.x.x * (0.5 * w) + tile.y * axis.y.x * (0.5 * w),
    y: tile.x * axis.x.y * (0.5 * h) + tile.y * axis.y.y * (0.5 * h),
  };
}

// Going from screen coordinate to grid coordinate

function invert_matrix(a, b, c, d) {
  // Determinant
  const det = 1 / (a * d - b * c);

  return {
    a: det * d,
    b: det * -b,
    c: det * -c,
    d: det * a,
  };
}

function to_grid_coordinate(screen) {
  const a = axis.x.x * (0.5 * w);
  const b = axis.y.x * (0.5 * w);
  const c = axis.x.y * (0.5 * h);
  const d = axis.y.y * (0.5 * h);

  const inv = invert_matrix(a, b, c, d);

  return {
    x: Math.floor(screen.x * inv.a + screen.y * inv.b - 0.5),
    y: Math.floor(screen.x * inv.c + screen.y * inv.d + 0.3),
  };
}
