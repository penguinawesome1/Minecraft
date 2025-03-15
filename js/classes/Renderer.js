class Renderer {
  constructor({ gameManager, world, zoom }) {
    this.gameManager = gameManager;
    this.world = world;
    this.canvas = document.getElementById(Constants.CANVAS_ID);
    this.c = this.canvas.getContext("2d");
    this.zoom = zoom;
    this.scaledCanvas = this.getScaledCanvas();
    this.mouse = {
      screenPosition: { x: 0, y: 0 },
      worldPosition: { x: 0, y: 0 },
    };

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.setupImages();
  }

  // Constants for block numbers
  static AIR = -1;
  static MISSING = -2;
  static MUD = 3;
  static SPROUT = 19;
  static DIRT = 21;
  static GRASS = 23;
  static WOOD = 25;
  static MOSS = 27;
  static LEAF = 30;
  static SHRUB = 36;
  static COBBLESTONE = 61;
  static STONE = 63;
  static WATER = 114;
  static BEDROCK = 115;

  async setupImages() {
    this.imageMap = [];
    this.imagesLoaded = false;
    await this.loadAllImagesObjects();
    this.imagesLoaded = true;
  }

  setInitialCameraPosition(player) {
    this.camera = {
      position: {
        x: -player.position.x + this.scaledCanvas.width / 2,
        y: -player.position.y + this.scaledCanvas.height / 2,
      },
    };
  }

  getScaledCanvas() {
    const zoom = this.zoom;
    return {
      scale: zoom,
      width: this.canvas.width / zoom,
      height: this.canvas.height / zoom,
    };
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.scaledCanvas = this.getScaledCanvas();
  }

  async loadAllImagesObjects() {
    const imageDefinitions = [
      { src: `../img/tiles/missing.png`, blockNum: Renderer.MISSING },
      { src: `../img/tiles/tile_003.png`, blockNum: Renderer.MUD },
      { src: `../img/tiles/tile_019.png`, blockNum: Renderer.SPROUT },
      { src: `../img/tiles/tile_021.png`, blockNum: Renderer.DIRT },
      { src: `../img/tiles/tile_023.png`, blockNum: Renderer.GRASS },
      { src: `../img/tiles/tile_025.png`, blockNum: Renderer.WOOD },
      { src: `../img/tiles/tile_027.png`, blockNum: Renderer.MOSS },
      { src: `../img/tiles/tile_030.png`, blockNum: Renderer.LEAF },
      { src: `../img/tiles/tile_036.png`, blockNum: Renderer.SHRUB },
      { src: `../img/tiles/tile_061.png`, blockNum: Renderer.COBBLESTONE },
      { src: `../img/tiles/tile_063.png`, blockNum: Renderer.STONE },
      { src: `../img/tiles/tile_114.png`, blockNum: Renderer.WATER },
      { src: `../img/tiles/tile_115.png`, blockNum: Renderer.BEDROCK },
    ];

    for (let i = 0; i < imageDefinitions.length; i++) {
      const { src, blockNum: id } = imageDefinitions[i];
      const img = document.createElement("img");
      img.src = src;
      this.imageMap[id] = img;
    }
  }

  draw({ blockNum, position }) {
    if (blockNum === Renderer.AIR || !this.imagesLoaded) return;
    this.c.drawImage(
      this.imageMap[blockNum],
      position.x,
      position.y - position.z / 2,
      32,
      32
    );
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    this.updateMouse();
    if (this.gameManager.pause) return;

    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.c.save();
    this.c.scale(this.scaledCanvas.scale, this.scaledCanvas.scale);
    this.c.translate(this.camera.position.x, this.camera.position.y);

    this.world.update();

    this.c.restore();
  }

  updateMouse(
    x = this.mouse.screenPosition.x,
    y = this.mouse.screenPosition.y
  ) {
    this.mouse.screenPosition.x = x;
    this.mouse.screenPosition.y = y;
    const { x: cameraX, y: cameraY } = this.camera.position;
    const scale = this.scaledCanvas.scale;
    this.mouse.worldPosition.x = x / scale - cameraX;
    this.mouse.worldPosition.y = y / scale - cameraY;
  }

  handleZoom(delta) {
    const { x: cameraX, y: cameraY } = this.camera.position;
    let { width: canvasWidth, height: canvasHeight } = this.scaledCanvas;

    const originalCenterX = cameraX + canvasWidth / 2;
    const originalCenterY = cameraY + canvasHeight / 2;

    this.zoom = Math.max(1.2, Math.min(2.8, this.zoom - delta * 0.1)); // Clamp zoom

    this.scaledCanvas = this.getScaledCanvas();
    ({ width: canvasWidth, height: canvasHeight } = this.scaledCanvas);

    const newCenterX = cameraX + canvasWidth / 2;
    const newCenterY = cameraY + canvasHeight / 2;

    const offsetX = originalCenterX - newCenterX;
    const offsetY = originalCenterY - newCenterY;

    this.camera.position.x -= offsetX;
    this.camera.position.y -= offsetY;
  }

  panCamera(player) {
    const { x: cameraX, y: cameraY } = this.camera.position;
    const { width: canvasWidth, height: canvasHeight } = this.scaledCanvas;
    const { x: boxX, y: boxY } = player.cameraBox.position;
    const { width: boxWidth, height: boxHeight } = player.cameraBox;

    const leftBoundary = -cameraX;
    const rightBoundary = -cameraX + canvasWidth - boxWidth;
    const topBoundary = -cameraY;
    const bottomBoundary = -cameraY + canvasHeight - boxHeight;

    if (boxX < leftBoundary) {
      this.camera.position.x = -boxX;
    } else if (boxX > rightBoundary) {
      this.camera.position.x = -boxX + canvasWidth - boxWidth;
    }

    if (boxY < topBoundary) {
      this.camera.position.y = -boxY;
    } else if (boxY > bottomBoundary) {
      this.camera.position.y = -boxY + canvasHeight - boxHeight;
    }
  }
}
