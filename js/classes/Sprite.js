class Sprite {
  constructor({
    position,
    gridPosition,
    imageSrc,
    frameRate = 1,
    frameBuffer = 15,
    scale = 1,
    animations,
  }) {
    this.canvas = document.getElementById(Constants.CANVAS_ID);
    this.c = this.canvas.getContext("2d");
    this.position = position;
    this.gridPosition = gridPosition;
    this.scale = scale;
    this.hitbox = {
      position: this.position,
      width: 1,
      height: 1,
      depth: 1,
    };
    this.loaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      // this.height = this.image.height * 0.25 * this.scale;
      this.height = this.image.height * this.scale;
      if (this.gridPosition) {
        this.hitbox = {
          position: this.gridPosition,
          width: 1,
          height: 1,
          depth: 1,
        };
      }
      this.loaded = true;
    };
    this.image.src = imageSrc;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
    this.direction = Sprite.SW;
  }

  static SW = 0;
  static SE = 1;
  static NW = 2;
  static NE = 3;

  draw() {
    if (!this.image) return;

    // const cropbox = {
    //   position: {
    //     x: this.currentFrame * (this.image.width / this.frameRate),
    //     y: this.direction * this.image.height * 0.25,
    //   },
    //   width: this.image.width / this.frameRate,
    //   height: this.image.height * 0.25,
    // };

    const cropbox = {
      position: {
        x: 0,
        y: 0,
      },
      width: this.image.width,
      height: this.image.height,
    };

    this.c.drawImage(
      this.image,
      cropbox.position.x,
      cropbox.position.y,
      cropbox.width,
      cropbox.height,
      this.position.x,
      this.position.y - this.position.z / 2,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.updateFrames();
  }

  updateFrames() {
    this.elapsedFrames++;

    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.frameRate - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
  }
}
