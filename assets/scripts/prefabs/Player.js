class Player extends MovableObject {
    constructor(data) {
        super({
            scene: data.scene,
            x: screenEndpoints.left,
            y: config.height / 2,
            texture: 'dragon',
            frame: 'dragon1',
            velocity: config.Player.velocity,
            weapon: {
                texture: 'fire',
                delay: config.Player.fireReload,
                velocity: config.Player.fireVelocity,
                scale: config.Player.fireScale,
                origin: {x: 1, y: 0.5},
            }
        });

        const frames = this.scene.anims.generateFrameNames('dragon',{
            prefix: 'dragon',
            start: 1,
            end: 6,
        });

        this.scene.anims.create({
            key: 'fly',
            frames,
            frameRate: 8,
            repeat: -1,
        });

        this.play('fly');
    }

    init(data) {
        super.init(data);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.fires = new Fires(this.scene);
        this.scene.events.on('update', this.updateFrame, this);
        this.last_frame = 'dragon1';
        this.tween_fly = null;
        this.weapon = data.weapon;
    }

    updateFrame() {
        if (!this.active) {
            return;
        }

        if (this.frame.name !== this.last_frame) {
            let last_y = this.y;
            if (this.frame.name === 'dragon6') {
                this.tween_fly = this.scene.tweens.add({
                    targets: this,
                    y: last_y + this.displayHeight / 3,
                    ease: 'Linear',
                    duration: 425,
                    onComplete: () => { this.tween_fly = null }
                });
            }
            else if (this.frame.name === 'dragon3') {
                this.scene.sounds.wings.play({volume: 0.2});
                this.tween_fly = this.scene.tweens.add({
                    targets: this,
                    y: last_y - this.displayHeight / 3,
                    ease: 'Linear',
                    duration: 250,
                    onComplete: () => { this.tween_fly = null }
                });
            }
        }
        this.last_frame = this.frame.name;
    }

    shooting() {
        if (this.scene.cursors.space.isDown && !this.fires_activate) {
            this.fires.createFire(this);
            this.fires_activate = true;

            this.fireTimer = this.scene.time.addEvent({
                delay: config.Player.fireReload,
                callback: () => { this.fires_activate = false },
                callbackScope: this,
            });
        }
    }

    move() {
        this.body.setVelocity(0);

        if (this.y < screenEndpoints.top + this.displayHeight / 2) {
            return this.y += 2;
        } else if (this.y > screenEndpoints.bottom - this.displayHeight / 2) {
            return this.y -= 2;
        }

        if (this.x < screenEndpoints.left + this.displayWidth / 2) {
            return this.x += 2;
        } else if (this.x > screenEndpoints.right - this.displayWidth / 2) {
            return this.x -= 2;
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
