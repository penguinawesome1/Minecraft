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
        }

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
        
        this.draw();

        this.checkForKeys();
        
        this.applyFriction();
        this.updateHitbox();
        // this.respondToHorizontalCollision();S

        // this.checkForHit();
        // this.checkForDeath();
    }

    applyFriction() {
        this.velocity.x *= frictionMultiplier;
        this.velocity.y *= frictionMultiplier;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    checkForHit() {
        // if (!this.isAttacking || this.otherPlayer.dashing) return;

        // if (collision({
        //     object1: this.attackBox,
        //     object2: this.otherPlayer.hitbox,
        // })) {
        //     const angle = calcAngle({
        //         object1: this.attackBox,
        //         object2: this.otherPlayer.hitbox,
        //     });
        //     this.otherPlayer.velocity.x += Math.cos(angle) * 2000 / this.otherPlayer.healthBar.value;
        //     this.otherPlayer.velocity.y += Math.sin(angle) * 700 / this.otherPlayer.healthBar.value;
        // }
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
        const v = {
            x: 0,
            y: 0,
        }
        if (this.keys.left) v.x--;
        if (this.keys.right) v.x++;
        if (this.keys.up) v.y--;
        if (this.keys.down) v.y++;

        if (v.x !== 0 && v.y !== 0) {
            v.x *= .7;
            v.y *= .7;
        }
        console.log(v.x, v.y, this.keys.left)

        this.velocity.x += v.x;
        this.velocity.y += v.y;

        // let sprite = "Idle";
        // if (this.keys.right && !this.keys.left) {
        //     sprite = "Run";
        //     this.velocity.x += playerSpeed;
        //     if (!this.isAttacking) this.lastDirection = "right";
        // } else if (this.keys.left && !this.keys.right) {
        //     sprite = "RunLeft";
        //     this.velocity.x += -playerSpeed;
        //     if (!this.isAttacking) this.lastDirection = "left";
        // } else if (this.velocity.y === 0) {
        //     if (this.lastDirection === "right") {
        //         sprite = "Idle";
        //     } else {
        //         sprite = "IdleLeft";
        //     }
        // }

        // this.switchSprite(sprite);
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