class Perlin {
    constructor() {
        this.p = new Uint8Array(512); // Use Uint8Array for performance
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        for (let i = 0; i < 256; i++) { // Duplicate directly into Uint8Array
            this.p[i + 256] = this.p[i];
        }
    
        this.gradVectors = new Float32Array([ // Use Float32Array for performance
            1, 1, -1, 1, 1, -1, -1, -1,
            1, 0, -1, 0, 0, 1, 0, -1,
            1, 1, 0, 1, -1, 1, 1, 0,
            -1, 0, 0, -1, 1, -1, -1, -1
        ]);
    }
  
    lerp(a, b, t) {
        return a + t * (b - a);
    }
  
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    grad(hash, x, y) {
        const h = (hash & 15) << 1; // Pre-calculate the index
        return x * this.gradVectors[h] + y * this.gradVectors[h + 1];
    }
  
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
    
        const u = this.fade(x);
        const v = this.fade(y);
    
        const aa = this.p[this.p[X] + Y];
        const ab = this.p[this.p[X] + Y + 1];
        const ba = this.p[this.p[X + 1] + Y];
        const bb = this.p[this.p[X + 1] + Y + 1];
    
        const g1 = this.grad(aa, x, y);
        const g2 = this.grad(ba, x - 1, y);
        const g3 = this.grad(ab, x, y - 1);
        const g4 = this.grad(bb, x - 1, y - 1);
    
        const l1 = this.lerp(g1, g2, u);
        const l2 = this.lerp(g3, g4, u);
        return this.lerp(l1, l2, v);
    }

    octaveNoise(x, y, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0; // Used for normalizing result to 0.0 - 1.0
    
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
        
            maxValue += amplitude;
        
            amplitude *= persistence;
            frequency *= 2;
        }
    
        return total / maxValue;
    }
}