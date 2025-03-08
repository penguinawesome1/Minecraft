class Sprite {
  constructor({
    name,
    position,
    imageSrc,
    frameRate = 1,
    frameBuffer = 3,
    scale = 1,
  }) {
    this.name = name;
    this.position = position;
    this.scale = scale;
    this.frameRate = frameRate;
    this.image = new Image();
    if (!imageSrc) {
      this.width = w;
      this.height = h;
      this.depth = h / 4;
    }
    this.hitbox = {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      width: 0,
      height: 0,
      depth: 0,
    };
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      this.height = this.image.height * this.scale;
      this.depth = this.height / 4;
      this.hitbox = {
        position: {
          x: this.position.x,
          y: this.position.y + this.height / 2,
          z: this.position.z,
        },
        width: this.width * 2.24,
        height: this.width * 2.24,
        depth: this.height / 4,
      };
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

    // if (this.name !== "air") {
    //   c.fillStyle = "rgba(255, 0, 0, 0.1)";
    //   c.fillRect(
    //     this.position.x,
    //     this.position.y - this.position.z,
    //     this.width,
    //     this.height
    //   );
    // }

    c.drawImage(
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
