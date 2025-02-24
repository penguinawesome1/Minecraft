function generatePerlinNoise2D({ width, height, scale = 10.0, octaves = 6, persistence = 0.5, lacunarity = 2.0 }) {
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(t, a, b) {
        return a + t * (b - a);
    }

    function grad(hash, x, y) {
        const h = hash & 15;
        const gradVectors = [
            x + y, x, y, 0,
            -x + y, -x, -y, 0,
            x - y, 0, -x, y,
            -y - x, 0, 0, -y
        ];
        return gradVectors[h];
    }

    function noise(x, y) {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
      
        const sx = x - x0;
        const sy = y - y0;
      
        const n0 = grad(p[x0 + p[y0]], sx, sy);
        const n1 = grad(p[x1 + p[y0]], sx - 1, sy);
        const ix0 = lerp(fade(sx), n0, n1);
      
        const n2 = grad(p[x0 + p[y1]], sx, sy - 1);
        const n3 = grad(p[x1 + p[y1]], sx - 1, sy - 1);
        const ix1 = lerp(fade(sx), n2, n3);
      
        return lerp(fade(sy), ix0, ix1);
      }

    const pSize = 256;
    const p = Array.from({ length: pSize }, (_, i) => i);
    for (let i = p.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    const pExtended = p.concat(p); // Duplicate

    const noiseMap = Array.from({ length: height }, () => Array(width).fill(0.0));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let frequency = 1.0;
            let amplitude = 1.0;
            let total = 0.0;
            let maxValue = 0.0;

            for (let i = 0; i < octaves; i++) {
            const sampleX = x / scale * frequency;
            const sampleY = y / scale * frequency;

            const perlinValue = noise(sampleX, sampleY);
            total += perlinValue * amplitude;
            maxValue += amplitude;

            frequency *= lacunarity;
            amplitude *= persistence;
            }

            noiseMap[y][x] = total / maxValue;
        }
    }

    return noiseMap;
}