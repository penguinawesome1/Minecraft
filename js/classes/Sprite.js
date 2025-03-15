class Sprite {
  constructor({
    position,
    gridPosition,
    imageSrc,
    frameRate = 1,
    frameBuffer = 3,
    scale = 1,
  }) {
    this.canvas = document.getElementById(Constants.CANVAS_ID);
    this.c = this.canvas.getContext("2d");
    this.position = position;
    this.gridPosition = gridPosition;
    this.scale = scale;
    this.frameRate = frameRate;
    this.hitbox = {
      position: this.position,
      width: 1,
      height: 1,
      depth: 1,
    };
    this.imageLoaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      this.height = this.image.height * this.scale;
      if (this.gridPosition) {
        this.hitbox = {
          position: this.gridPosition,
          width: 1,
          height: 1,
          depth: 1,
        };
      }
      this.imageLoaded = true;
    };
    this.image.src = imageSrc;
    this.currentFrame = 0;
    this.frameBuffer = frameBuffer;
    this.elapsedFrames = 0;
  }

  draw() {
    if (!this.image) return;

    const cropbox = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0,
      },
      width: this.image.width / this.frameRate,
      height: this.image.height,
    };
<<<<<<< HEAD
      try {
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
      catch (e) {
          console.log(this.image.src)
      }
=======

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
>>>>>>> 3ad5e85428332d2d0cf1f655713cc45ef695ef74
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
