class Component extends Sprite {
    constructor({
        position,
        collisionBlocks = null,
        platformCollisionBlocks = null,
        imageSrc,
        frameRate = 1,
        scale = 1,
    }) {
        super({ position, imageSrc, frameRate, scale });

        this.position = position;
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.hitbox = {
            position: this.position,
            width: 10,
            height: 10,
        };
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

    isPlatformCollision() {
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];

            if (platformCollision({
                object1: this.hitbox,
                object2: platformCollisionBlock,
            })) {
                return platformCollisionBlock;
            }
        }
        return null;
    }
}