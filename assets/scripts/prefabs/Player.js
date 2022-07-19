class Player extends MovableObject {
    constructor(data) {
        super({
            scene: data.scene, 
            x: screenEndpoints.left,
            y: config.height/2, 
            texture: 'dragon',
            frame: 'dragon1',
            velocity: config.player.velocity
        });
    }

    init(data) {
        super.init(data);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.velocity = 500;
        this.spriteNum = 0;
        this.fires = new Fires(this.scene);
        this.scene.events.on('update', this.updateFrame, this);
        this.last_frame = 1;
        this.tween_fly = null;
    }

    updateFrame() {
        this.spriteNum++;
        let sprite_num = Math.round(this.spriteNum / 10) % 6 + 1;
        if (sprite_num !== this.last_frame) {
            let last_y = this.y;
            this.setTexture('dragon', `dragon${sprite_num}`);
            if (sprite_num === 1) {
                this.tween_fly = this.scene.tweens.add({
                    targets: this,
                    y: last_y + this.displayHeight/2,
                    ease: 'Linear',
                    duration: 375,
                    onComplete: ()=>{this.tween_fly = null}
                });
            }
            else if (sprite_num === 4) {
                this.tween_fly = this.scene.tweens.add({
                    targets: this,
                    y: last_y - this.displayHeight/2,
                    ease: 'Linear',
                    duration: 375,
                    onComplete: ()=>{this.tween_fly = null}
                });
            }
        }
        this.last_frame = sprite_num;
    }

    shooting(){
        if (this.scene.cursors.space.isDown && !this.fires_activate) {
            this.fires.createFire(this);
            this.fires_activate = true;
            
            this.fireTimer = this.scene.time.addEvent({
                delay: config.player.fireReload,
                callback: ()=>{this.fires_activate = false},
                callbackScope: this,
            });
        }
    }

    move() {
        this.body.setVelocity(0);

        if (this.y < screenEndpoints.top + this.displayHeight / 2) {
            return this.y+=2;
        } else if (this.y > screenEndpoints.bottom - this.displayHeight / 2) {
            return this.y-=2;
        }

        if (this.x < screenEndpoints.left + this.displayWidth / 2) {
            return this.x+=2;
        } else if (this.x > screenEndpoints.right - this.displayWidth / 2) {
            return this.x-=2;
        }

        if (this.scene.cursors.left.isDown) {
            this.body.setVelocityX(-this.velocity);
        } else if (this.scene.cursors.right.isDown) {
            this.body.setVelocityX(this.velocity);
        }

        if (this.scene.cursors.up.isDown || this.scene.cursors.down.isDown) {
            if (this.tween_fly) {
                this.tween_fly.paused = true;
            }
            if (this.scene.cursors.up.isDown) {
                this.body.setVelocityY(-this.velocity);
            } else if (this.scene.cursors.down.isDown) {
                this.body.setVelocityY(this.velocity);
            }
        }
    }
}
