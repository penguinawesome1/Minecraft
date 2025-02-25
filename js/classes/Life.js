class Life extends Sprite {
    constructor({
        position,
        collisionBlocks,
        imageSrc,
        frameRate = 1,
        scale = 1,
        animations
    }) {
        super({ position, imageSrc, frameRate, scale });
        
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.collisionBlocks = collisionBlocks;
        this.hitbox = {
            position: this.position,
            width: 0,
            height: 0,
        };

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;

            this.animations[key].image = image;
        }
    }

    switchSprite(key) {
        const sameImage = this.image === this.animations[key].image;
        if (sameImage || !this.loaded) return;

        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameRate;
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    applyFriction() {
        this.velocity.x *= frictionMultiplier;
        this.position.x += this.velocity.x;
    }

    isCollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (collision({
                object1: this.hitbox,
                object2: collisionBlock,
            })) {
                return collisionBlock;
            }
        }
        return null;
    }
}