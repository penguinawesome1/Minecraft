class Player extends Component {
    constructor({
        position,
        collisionBlocks,
        platformCollisionBlocks,
        imageSrc,
        frameRate,
        scale = .4,
        animations
    }) {
        super({ position, imageSrc, frameRate, scale });
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.hitbox = {
            position: this.position,
            width: 10,
            height: 10,
        }

        this.otherPlayer = null;
        this.healthBar = null;
        this.lives = maxLives;
        this.jumps = maxJumps;
        this.dashes = maxDashes;
        this.lastDirection = "right";
        this.animations = animations;

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;

            this.animations[key].image = image;
        }

        this.attackBox = {
            position: this.position,
            width: 0,
            height: 0,
        }

        this.keys = {
            left: false,
            right: false,
            down: false,
            up: false,
        };

        this.attackList = [];

        this.attackImages = new Set([
            this.animations.Attack1.image,
            this.animations.Attack1Left.image,
            this.animations.Attack2.image,
            this.animations.Attack2Left.image,
        ]);
    }

    switchSprite(key) {
        const isAttacking = this.attackImages.has(this.image);
        const notLastFrame = this.currentFrame < this.animations.Attack1.frameRate - 1;
        const sameImage = this.image === this.animations[key].image;
        if (sameImage || !this.loaded || (isAttacking && notLastFrame)) return;

        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
    }

    update() {
        this.updateFrames();
        this.updateHitbox();
        
        this.draw();

        this.checkForKeys();
        
        this.applyFriction();
        this.updateHitbox();
        this.respondToHorizontalCollision();

        this.applyGravity();
        this.updateHitbox();
        this.grounded = this.respondToVerticalCollision() !== false;
        this.crouching = this.grounded && this.keys.down;

        this.checkForHit();
        this.checkForDeath();
    }

    jump() {
        if (this.jumps < 1 || this.crouching) return;
        this.velocity.y = -jumpStrength;
        this.jumps--;
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    applyFriction() {
        this.velocity.x *= frictionMultiplier;
        this.position.x += this.velocity.x;
    }

    checkForHit() {
        if (!this.isAttacking || this.otherPlayer.dashing) return;

        if (collision({
            object1: this.attackBox,
            object2: this.otherPlayer.hitbox,
        })) {
            const angle = calcAngle({
                object1: this.attackBox,
                object2: this.otherPlayer.hitbox,
            });
            this.otherPlayer.velocity.x += Math.cos(angle) * 2000 / this.otherPlayer.healthBar.value;
            this.otherPlayer.velocity.y += Math.sin(angle) * 700 / this.otherPlayer.healthBar.value;

            this.hitStop = true;
            this.otherPlayer.hitStop = true;
            setTimeout(() => {
                this.hitStop = false;
                this.otherPlayer.hitStop = false;
            }, hitStopDuration);

            this.otherPlayer.healthBar.value -= 10;
            this.isAttacking = false;
        }
    }

    updateHitbox() {
        if (this.crouching || this.keys.up || this.velocity.y < 0) {
            this.hitbox = {
                position: {
                    x: this.position.x + 44 * this.scale,
                    y: this.position.y + 110 * this.scale / 2,
                },
                width: 70 * this.scale,
                height: 110 * this.scale / 2,
            }
        } else {
            this.hitbox = {
                position: {
                    x: this.position.x + 44 * this.scale,
                    y: this.position.y,
                },
                width: 70 * this.scale,
                height: 110 * this.scale,
            }
        }
        
        if (this.dashing) {
            this.attackBox.width = 0;
        } else if (this.keys.up) {
            this.attackBox = {
                position: {
                    x: this.position.x + this.scale * 70,
                    y: this.position.y - 21 * this.scale,
                },
                width: 20 * this.scale,
                height: 20 * this.scale,
            }
        } else {
            this.attackBox = {
                position: {
                    x: this.position.x + this.scale * (28 + 52 * (this.attackDirection === "right" ? 1 : 0)),
                    y: this.position.y + 23 * this.scale,
                },
                width: 53 * this.scale,
                height: 20 * this.scale,
            }
        }
    }

    checkForKeys() {
        let sprite = "Idle";
        
        if (this.keys.right && !this.keys.left) {
            sprite = "Run";
            this.velocity.x += playerSpeed;
            if (!this.isAttacking) this.lastDirection = "right";
        } else if (this.keys.left && !this.keys.right) {
            sprite = "RunLeft";
            this.velocity.x += -playerSpeed;
            if (!this.isAttacking) this.lastDirection = "left";
        } else if (this.velocity.y === 0) {
            if (this.lastDirection === "right") {
                sprite = "Idle";
            } else {
                sprite = "IdleLeft";
            }
        }
    
        if (this.velocity.y < 0) {
            if (this.lastDirection === "right") {
                sprite = "Jump";
            } else {
                sprite = "JumpLeft";
            }
        } else if (this.velocity.y > 0) {
            if (this.lastDirection === "right") {
                sprite = "Fall";
            } else {
                sprite = "FallLeft";
            }
        }

        this.switchSprite(sprite);
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
        const platformCollisionBlock = this.isPlatformCollision();
        if (collisionBlock) {
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
            } return true;
        } else if (platformCollisionBlock) {
            const jumpDown = this.crouching && this.keys.up;
            if (jumpDown || this.velocity.y <= 0) return;

            this.velocity.y = 0;
            this.jumps = maxJumps;
            this.dashes = maxDashes;
            this.smashing = false;

            const offset = this.hitbox.position.y - this.position.y + this.hitbox.height;

            this.position.y = platformCollisionBlock.position.y - offset - 0.01;
            return true;
        }
        return false;
        
    }

}