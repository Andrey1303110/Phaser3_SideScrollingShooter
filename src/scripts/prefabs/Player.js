import { EVENTS, SCENE_NAMES } from '../constants';
import { config, screenData } from '/src/scripts/main';
import { Fires } from '/src/scripts/prefabs/Fires';
import { MovableObject } from '/src/scripts/prefabs/MovableObject';

const PLAYER_TEXTURE_NAME = 'dragon';
const FIRST_PLAYER_FRAME = 'dragon1';
const FIRE_TEXTURE_NAME = 'fire';
const ANIMATION_NAME = 'fly';
const FRAME_DUARTION = 350;

export class Player extends MovableObject {
    constructor(data) {
        super({
            scene: data.scene,
            x: screenData.left,
            y: config.height * 0.5,
            texture: PLAYER_TEXTURE_NAME,
            frame: FIRST_PLAYER_FRAME,
            velocity: config.Player.velocity,
            weapon: {
                texture: FIRE_TEXTURE_NAME,
                delay: config.Weapons.fire.reload,
                velocity: config.Weapons.fire.velocity,
                scale: config.Weapons.fire.scale,
                damage: config.Weapons.fire.damage,
                origin: {x: 1, y: 0.5},
            }
        });

        this._createAnimation();
        this.play(ANIMATION_NAME);
    }

    init(data) {
        super.init(data);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;

        this.fires = new Fires(this.scene);
        this.weapon = data.weapon;
        this.scale = config.Player.scale;

        this.scene.events.on(EVENTS.update, this._updateFrame, this);
        this._lastFrame = FIRST_PLAYER_FRAME;
        this._tweenFly = null;
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

        this._handling(); 
    }

    shooting() {
        if ((this.scene.cursors.space.isDown || this.scene.fireButton.active) && !this._firesActivate) {
            this.scene.fireButton.setAlpha(.95);
            this.fires.createFire(this);
            this._firesActivate = true;

            this.scene.time.addEvent({
                delay: this.weapon.delay,
                callback: () => { 
                    this._firesActivate = false;
                    this.scene.fireButton.setAlpha(.65);
                },
                callbackScope: this,
            });
        }
    }

    _createAnimation() {
        if (this.scene.anims.anims.entries[ANIMATION_NAME]) return;

        const frames = this.scene.anims.generateFrameNames(PLAYER_TEXTURE_NAME,{
            prefix: PLAYER_TEXTURE_NAME,
            start: 1,
            end: 6,
        });

        this.scene.anims.create({
            key: ANIMATION_NAME,
            frames,
            frameRate: 8,
            repeat: -1,
        });

        this.play(ANIMATION_NAME);
    }

    _updateFrame() {
        if (!this.active) {
            return;
        }

        if (this.frame.name !== this._lastFrame) {
            const last_y = this.y;
            if (this.frame.name === 'dragon6') {
                if (this.scene.constructor.name !== SCENE_NAMES.game) {
                    this._tweenFly = this.scene.tweens.add({
                        targets: this,
                        y: last_y + this.displayHeight / 3,
                        ease: 'Linear',
                        duration: FRAME_DUARTION,
                        onComplete: () => this._tweenFly = null
                    });
                }
            }
            else if (this.frame.name === 'dragon3') {
                if (this.scene.constructor.name !== SCENE_NAMES.game) {
                    this._tweenFly = this.scene.tweens.add({
                        targets: this,
                        y: last_y - this.displayHeight / 3,
                        ease: 'Linear',
                        duration: FRAME_DUARTION,
                        onComplete: () => this._tweenFly = null
                    });
                }
                this.scene.sounds.wings.play({volume: 0.1});
            }
        }
        this._lastFrame = this.frame.name;
    }

    shooting() {
        if ((this.scene.cursors.space.isDown || this.scene.fireButton.active) && !this._firesActivate) {
            this.scene.fireButton.setAlpha(.95);
            this.fires.createFire(this);
            this._firesActivate = true;

            this.scene.time.addEvent({
                delay: this.weapon.delay,
                callback: () => { 
                    this._firesActivate = false;
                    this.scene.fireButton.setAlpha(.65);
                },
                callbackScope: this,
            });
        }
    }

    move() {
        this.body.setVelocity(0);

        if (this.y < screenData.top + this.displayHeight / 1.5) {
            this.y = screenData.top + this.displayHeight / 1.5;
        } else if (this.y > screenData.bottom - this.displayHeight / 1.5) {
            this.y = screenData.bottom - this.displayHeight / 1.5;
        }

        if (this.x < screenData.left + this.displayWidth / 1.5) {
            this.x = screenData.left + this.displayWidth / 1.5;
        } else if (this.x > screenData.right - this.displayWidth / 1.5) {
            this.x = screenData.right - this.displayWidth / 1.5;
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
            if (this.x < this.x - this.velocity) { 
                return;
            }
            this.body.setVelocityX(-this.velocity * (cof / 100));
        } else if (buttons.right.isDown) {
            if (this.x > this.x + this.velocity) { 
                return;
            }
            this.body.setVelocityX(this.velocity * (cof / 100));
        }

        if (buttons.up.isDown || buttons.down.isDown) {
            if (this._tweenFly) {
                this._tweenFly.paused = true;
            }
            if (buttons.up.isDown) {
                if (this.y < this.y - this.velocity) { 
                    return;
                }
                this.body.setVelocityY(-this.velocity * (cof / 100));
            } else if (buttons.down.isDown) {
                if (this.y > this.y + this.velocity) { 
                    return;
                }
                this.body.setVelocityY(this.velocity * (cof / 100));
            }
        }
    }
}
