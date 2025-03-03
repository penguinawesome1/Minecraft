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
    this.width = w;
    this.height = h;
    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      this.height = this.image.height * this.scale;
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

    // if (this.name === "air") {
    //   c.fillStyle = "rgba(255, 0, 0, 0.5)";
    //   c.fillRect(
    //     this.position.x,
    //     this.position.y + this.position.z,
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
      this.position.y - this.position.z,
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
