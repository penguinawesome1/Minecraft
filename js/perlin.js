const p = new Uint8Array(512); // Use Uint8Array for performance
for (let i = 0; i < 256; i++) {
  p[i] = i;
}
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [p[i], p[j]] = [p[j], p[i]];
}
for (let i = 0; i < 256; i++) {
  // Duplicate directly into Uint8Array
  p[i + 256] = p[i];
}

const gradVectors = new Float32Array([
  // Use Float32Array for performance
  1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1, 1, 1, 0, 1, -1, 1, 1, 0,
  -1, 0, 0, -1, 1, -1, -1, -1,
]);

function lerp(a, b, t) {
  return a + t * (b - a);
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash, x, y) {
  const h = (hash & 15) << 1; // Pre-calculate the index
  return x * gradVectors[h] + y * gradVectors[h + 1];
}

function noise(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  const aa = p[p[X] + Y];
  const ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y];
  const bb = p[p[X + 1] + Y + 1];

  const g1 = grad(aa, x, y);
  const g2 = grad(ba, x - 1, y);
  const g3 = grad(ab, x, y - 1);
  const g4 = grad(bb, x - 1, y - 1);

  const l1 = lerp(g1, g2, u);
  const l2 = lerp(g3, g4, u);
  return lerp(l1, l2, v);
}

function octaveNoise(x, y, octaves = 3, persistence = 0.5) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves; i++) {
    total += noise(x * frequency, y * frequency) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
    frequency *= 2;
  }

  return 1 / (1 + 2 ** ((total / maxValue) * -10));
}
