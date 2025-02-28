function collision2D({ object1, object2 }) {
  const y1 = object1.position.y + (object1.position.z ?? 0);
  const y2 = object2.position.y + (object2.position.z ?? 0);
  return (
    y1 + object1.height >= y2 &&
    y1 <= y2 + object2.height &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.x + object1.width >= object2.position.x
  );
}

function collision3D({ object1, object2 }) {
  return (
    object1.position.y + object1.height >= object2.position.y &&
    object1.position.y <= object2.position.y + object2.height &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.x + object1.width >= object2.position.x
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
