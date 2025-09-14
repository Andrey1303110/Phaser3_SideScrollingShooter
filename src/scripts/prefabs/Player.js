import { screenData } from "../Utils";
import { EVENTS, WEAPONS } from "../constants";
import { config } from "../main";
import { Fires } from "./Fires";
import { MovableObject } from "./MovableObject";

const PLAYER_TEXTURE_NAME = 'dragon';
const ANIMATION_NAME = 'fly';
const FRAME_RATE = 8;
const FRAME_DURATION = 1000 / FRAME_RATE;

export class Player extends MovableObject {
    constructor(data) {
        super({
            scene: data.scene,
            x: screenData.left,
            y: config.height * 0.5,
            texture: PLAYER_TEXTURE_NAME,
            velocity: data.scene.model.player.velocity,
            scale: data.scene.model.player.scale,
            weapon: {
                origin: {x: 1, y: 0.5},
                ...WEAPONS.FIRE,
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

        this.scene.events.on(EVENTS.UPDATE, this._updateFrame, this);
        this._lastFrame = null;
        this._tweenFlying = null;

        this.maxHealth = this.scene.model.player.maxHealth;
        this.currentHealth = this.scene.model.player.maxHealth;
    }

    shooting() {
        if ((this.scene.cursors.space.isDown || this.scene.fireButton?.active) && !this._firesActivate) {
            this.scene.fireButton?.setAlpha(0.95);
            this.fires.createFire(this);
            this._firesActivate = true;

            this.scene.time.addEvent({
                delay: this.weapon.reload,
                callback: () => { 
                    this._firesActivate = false;
                    this.scene.fireButton?.setAlpha(0.65);
                }
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

        this._handling(); 
    }

    _createAnimation() {
        if (this.scene.anims.anims.entries[ANIMATION_NAME]) {
            return;
        }

        const frames = this.scene.anims.generateFrameNames(PLAYER_TEXTURE_NAME,{
            prefix: PLAYER_TEXTURE_NAME,
            start: 1,
            end: 6,
        });

        this.scene.anims.create({
            key: ANIMATION_NAME,
            frames,
            frameRate: FRAME_RATE,
            repeat: -1,
        });

        this.play(ANIMATION_NAME);
    }

    _updateFrame() {
        if (!this.active) {
            return;
        }
        this._addTweenFly();
    }

    _addTweenFly() {
        if (this.frame.name === this._lastFrame) {
            return;
        }

        this._lastFrame = this.frame.name;

        if (this.frame.name === 'dragon3') {
            this.scene.sounds.wings.play({volume: 0.1});
            return this._tweenFly(false);
        }
        if (this.frame.name === 'dragon6') {
            return this._tweenFly(true);
        }
    }

    async _tweenFly(isDown) {
        const height = this.displayHeight * 0.2;
        const duration = FRAME_DURATION * 2.5;
        const y = isDown ? this.y + height : this.y - height;

        this._tweenFlying = this.scene.tweens.add({
            targets: this,
            y,
            ease: 'Linear',
            duration,
            onComplete: () => {
                this._tweenFlying.destroy();
                this._tweenFlying = null;
            }
        });
    }

    _handling(){
        let buttons;
        let cof = 100;
        let isJoystick = false;

        for (let name in this.scene.cursorKeys) {
            if (this.scene.cursorKeys[name].isDown) {
                isJoystick = true;
                cof = Math.floor(this.scene.joystick.force * 100) / 100;
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
            if (this._tweenFlying) {
                this._tweenFlying.paused = true;
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
