class Player extends Life {
    constructor({
        position,
        collisionBlocks,
        imageSrc,
        frameRate,
        scale = 1,
        animations
    }) {
        super({ position, imageSrc, frameRate, scale, animations });
        
        this.attackBox = {
            position: this.position,
            width: 0,
            height: 0,
        };

        this.cameraBox = {
            position: this.position,
            width: 0,
            height: 0,
        };

        this.jumps = true;
        this.lastDirection = "right";
        this.animations = animations;
        
        this.keys = {
            left: false,
            right: false,
            down: false,
            up: false,
        };
    }

    update() {
        this.updateFrames();
        this.updateHitbox();

        this.updateCameraBox();
        // c.fillStyle = 'rgba(0, 255, 0, 0.2)';
        // c.fillRect(
        //     this.cameraBox.position.x,
        //     this.cameraBox.position.y,
        //     this.cameraBox.width,
        //     this.cameraBox.height
        // );
        
        this.draw();

        this.checkForKeys();
        
        this.applyFriction();
        this.updateHitbox();
        // this.respondToHorizontalCollision();

        // this.checkForHit();
        // this.checkForDeath();
    }

    updateCameraBox() {
        const w = 1000 / scaledCanvas.scale;
        const h = 600 / scaledCanvas.scale;
        this.cameraBox = {
            position: {
                x: this.position.x + this.width / 2 - w/2,
                y: this.position.y + this.height / 2 - h/2,
            },
            width: w,
            height: h,
        };
    }

    shouldPanCameraLeft({ canvas, camera, scaledCanvas }) {
        const cameraBoxRightSide = this.cameraBox.position.x + this.cameraBox.width;
        if (cameraBoxRightSide >= canvas.width / scaledCanvas.scale - camera.position.x) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraRight({ camera }) {
        if (this.cameraBox.position.x <= -camera.position.x) {
            camera.position.x -= this.velocity.x;
        }
    }

    shouldPanCameraUp({ canvas, camera, scaledCanvas }) {
        const cameraBoxBottomSide = this.cameraBox.position.y + this.cameraBox.height;
        if (cameraBoxBottomSide >= canvas.height / scaledCanvas.scale - camera.position.y) {
            camera.position.y -= this.velocity.y;
        }
    }

    shouldPanCameraDown({ camera }) {
        if (this.cameraBox.position.y <= -camera.position.y) {
            camera.position.y -= this.velocity.y;
        }
    }

    applyFriction() {
        this.velocity.x *= frictionMultiplier;
        this.velocity.y *= frictionMultiplier;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.velocity.x > 0) player1.shouldPanCameraLeft({ canvas, camera, scaledCanvas });
        else if (this.velocity.x < 0) player1.shouldPanCameraRight({ camera });

        if (this.velocity.y > 0) player1.shouldPanCameraUp({ canvas, camera, scaledCanvas });
        else if (this.velocity.y < 0) player1.shouldPanCameraDown({ camera });
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height / 2,
            },
            width: 1 * this.scale,
            height: 1 * this.scale,
        }
        
        this.attackBox = {
            position: {
                x: this.position.x + this.scale * (28 + 52 * (this.attackDirection === "right" ? 1 : 0)),
                y: this.position.y + 23 * this.scale,
            },
            width: 53 * this.scale,
            height: 20 * this.scale,
        }
    }

    checkForKeys() {        
        const k = {
            x: 0,
            y: 0,
        }
        if (this.keys.left) k.x--;
        if (this.keys.right) k.x++;
        if (this.keys.up) k.y--;
        if (this.keys.down) k.y++;

        if (k.x !== 0 && k.y !== 0) {
            k.x *= .7;
            k.y *= .7;
        }

        this.velocity.x += k.x;
        this.velocity.y += k.y;
    }

    respondToHorizontalCollision() {
        const collisionBlock = this.isCollision();
        if (!collisionBlock) return;

        if (this.velocity.x > 0) {
            this.velocity.x = 0;

            const offset = this.hitbox.position.x - this.position.x + this.hitbox.width;

            this.position.x = collisionBlock.position.x - offset - 0.01;
        } else if (this.velocity.x < 0) {
            this.velocity.x = 0;

            const offset = this.hitbox.position.x - this.position.x;
            
            this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01;
        }
    }

    respondToVerticalCollision() {
        const collisionBlock = this.isCollision();
        if (!collisionBlock) return false;

        if (this.velocity.y > 0) {
            this.velocity.y = 0;
            this.jumps = maxJumps;
            this.dashes = maxDashes;
            this.smashing = false;

            const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

            this.position.y = collisionBlock.position.y - offset - 0.01;
        } else if (this.velocity.y < 0) {
            this.velocity.y = 0;
            
            const offset = this.hitbox.position.y - this.position.y;

            this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01;
        }
        return true;
        
    }

}