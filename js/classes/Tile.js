class Tile extends Sprite {
    constructor({ position, imageSrc, frameRate = 1, frameBuffer = 3, scale = 1, grid }) {
        super({ position, imageSrc, frameRate, frameBuffer, scale });
        this.grid = grid;
    }
    
}