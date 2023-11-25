import { config, screenEndpoints } from "/src/scripts/main";
import { Fires } from "/src/scripts/prefabs/Fires";
import { MovableObject } from "/src/scripts/prefabs/MovableObject";

export class Player extends MovableObject {
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
                delay: config.Weapons.fire.reload,
                velocity: config.Weapons.fire.velocity,
                scale: config.Weapons.fire.scale,
                origin: {x: 1, y: 0.5},
            }
        });

        this.x += this.width;

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
            const last_y = this.y;
            if (this.frame.name === 'dragon6') {
                if (this.scene.constructor.name !== 'GameScene') {
                    this.tween_fly = this.scene.tweens.add({
                        targets: this,
                        y: last_y + this.displayHeight / 3,
                        ease: 'Linear',
                        duration: 350,
                        onComplete: () => { this.tween_fly = null }
                    });
                }
            }
            else if (this.frame.name === 'dragon3') {
                if (this.scene.constructor.name !== 'GameScene') {
                    this.tween_fly = this.scene.tweens.add({
                        targets: this,
                        y: last_y - this.displayHeight / 3,
                        ease: 'Linear',
                        duration: 350,
                        onComplete: () => { this.tween_fly = null }
                    });
                }
                this.scene.sounds.wings.play({volume: 0.1});
            }
        }
        this.last_frame = this.frame.name;
    }

    shooting() {
        if ((this.scene.cursors.space.isDown || this.scene.fireButton.active) && !this.fires_activate) {
            this.scene.fireButton.setAlpha(.95);
            this.fires.createFire(this);
            this.fires_activate = true;

            this.fireTimer = this.scene.time.addEvent({
                delay: this.weapon.delay,
                callback: () => { 
                    this.fires_activate = false;
                    this.scene.fireButton.setAlpha(.65);
                },
                callbackScope: this,
            });
        }
    }

    move() {
        this.body.setVelocity(0);

        if (this.y < screenEndpoints.top + this.displayHeight / 1.5) {
            this.y = screenEndpoints.top + this.displayHeight / 1.5;
        } else if (this.y > screenEndpoints.bottom - this.displayHeight / 1.5) {
            this.y = screenEndpoints.bottom - this.displayHeight / 1.5;
        }

        if (this.x < screenEndpoints.left + this.displayWidth / 1.5) {
            this.x = screenEndpoints.left + this.displayWidth / 1.5;
        } else if (this.x > screenEndpoints.right - this.displayWidth / 1.5) {
            this.x = screenEndpoints.right - this.displayWidth / 1.5;
        }

        this.handling(); 
    }

    handling(){
        let buttons;
        let cof = 100;
        let isJoystick = false;

        for (let name in this.scene.cursorKeys) {
            if (this.scene.cursorKeys[name].isDown) {
                isJoystick = true;
                cof = Math.floor(this.scene.joyStick.force * 100) / 100;
                if (cof > 100) {
                    cof = 100;
                }
            }
        }

        (!isJoystick) ? buttons = this.scene.cursors : buttons = this.scene.cursorKeys;

        if (!buttons) {
            return;
        }

        if (buttons.left.isDown) {
            if (this.x < this.x - this.velocity/config.fps) return;
            this.body.setVelocityX(-this.velocity * (cof / 100));
        } else if (buttons.right.isDown) {
            if (this.x > this.x + this.velocity/config.fps) return;
            this.body.setVelocityX(this.velocity * (cof / 100));
        }

        if (buttons.up.isDown || buttons.down.isDown) {
            if (this.tween_fly) {
                this.tween_fly.paused = true;
            }
            if (buttons.up.isDown) {
                if (this.y < this.y - this.velocity/config.fps) return;
                this.body.setVelocityY(-this.velocity * (cof / 100));
            } else if (buttons.down.isDown) {
                if (this.y > this.y + this.velocity/config.fps) return;
                this.body.setVelocityY(this.velocity * (cof / 100));
            }
        }
    }
}
