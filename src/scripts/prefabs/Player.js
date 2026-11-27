import { TIMING } from '../timing';
import { ANIMATION_KEYS, FRAME_KEYS, LIFECYCLE_EVENTS, TEXTURE_KEYS } from '../identifiers';
import { screenData } from "../Utils";
import { EVENTS } from "../constants";
import { config } from "../main";
import { Fires } from "./Fires";
import { MovableObject } from "./MovableObject";
import { CAMPAIGN_SKILL_BALANCE } from '../campaignSkills';

const PLAYER_TEXTURE_NAME = TEXTURE_KEYS.DRAGON;
const ANIMATION_NAME = ANIMATION_KEYS.FLY;
const FRAME_RATE = TIMING.PLAYER.DEFAULT_FRAME_RATE_FPS;
const FRAME_DURATION = TIMING.PLAYER.FRAME_SECONDS_TO_MS / FRAME_RATE;

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
                ...data.scene.model.fireWeapon,
            }
        });

        this._createAnimation();
        this.play(ANIMATION_NAME);
    }

    init(data) {
        super.init(data);

        this.fires = new Fires(this.scene);
        this.weapon = data.weapon;

        this.scene.events.on(EVENTS.UPDATE, this._updateFrame, this);
        this.once(LIFECYCLE_EVENTS.DESTROY, () => {
            this.scene.events.off(EVENTS.UPDATE, this._updateFrame, this);
            this._reloadTimer?.remove();
            this._reloadTimer = null;
            this._tweenFlying?.stop();
            this._tweenFlying = null;
        });
        this._reloadTimer = null;
        this._lastFrame = null;
        this._nextShotIsPair = false;
        this._tweenFlying = null;
        this._flightMotion = { offset: 0 };
        this._lastFlightOffset = 0;
        this._flightVelocity = 0;
        this._inputVelocityY = 0;
        this._controlsStopped = false;

        this.maxHealth = this.scene.model.player.maxHealth;
        this.currentHealth = this.scene.model.player.maxHealth;
    }

    shooting() {
        if (!this.active || !this.scene || this._controlsStopped || this.scene._blackBG) return;
        if ((this.scene.model.autoFireEnabled || this.scene.cursors.space.isDown || this.scene.fireButton?.active) && !this._firesActivate) {
            const tier = this.scene.fireSkillTier;
            const targets = tier >= 2 ? CAMPAIGN_SKILL_BALANCE.piercingTargets : 1;
            if (tier && this._nextShotIsPair) {
                this.fires.createFire(this, { direction: -1, targets });
                this.fires.createFire(this, { direction: 1, targets });
            } else {
                this.fires.createFire(this, { targets });
            }
            this._nextShotIsPair = tier > 0 && !this._nextShotIsPair;
            this._firesActivate = true;

            this._reloadTimer = this.scene.time.addEvent({
                delay: this.weapon.reload,
                callback: () => {
                    this._reloadTimer = null;
                    if (!this.active || !this.scene) return;
                    this._firesActivate = false;
                }
            });
        }
    }

    move() {
        if (this._controlsStopped) return;
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

    stopControls() {
        this._controlsStopped = true;
        this._reloadTimer?.remove();
        this._reloadTimer = null;
        this._tweenFlying?.stop();
        this._tweenFlying = null;
        this._inputVelocityY = 0;
        this._flightVelocity = 0;
        this.body.stop();
        this.body.moves = false;
    }

    _createAnimation() {
        if (this.scene.anims.anims.entries[ANIMATION_NAME]) {
            return;
        }

        const frames = this.scene.anims.generateFrameNames(PLAYER_TEXTURE_NAME,{
            prefix: PLAYER_TEXTURE_NAME,
            start: 1,
            end: 12,
        });

        this.scene.anims.create({
            key: ANIMATION_NAME,
            frames,
            frameRate: FRAME_RATE,
            repeat: -1,
        });

        this.play(ANIMATION_NAME);
    }

    _updateFrame(time, delta) {
        if (!this.active || !this.body || this._controlsStopped) {
            return;
        }
        this._addTweenFly();

        // Animate an offset, then add its change to physics velocity. Never tween
        // the same position that Arcade Physics updates for player movement.
        this._flightVelocity = delta > 0
            ? (this._flightMotion.offset - this._lastFlightOffset) * 1000 / delta
            : 0;
        this._lastFlightOffset = this._flightMotion.offset;
        this.body.setVelocityY(this._inputVelocityY + this._flightVelocity);
    }

    _addTweenFly() {
        if (this.frame.name === this._lastFrame) {
            return;
        }

        this._lastFrame = this.frame.name;

        if (this.frame.name === FRAME_KEYS.DRAGON4) {
            this.scene.sounds.wings.play({volume: 0.1});
            return this._tweenFly(false);
        }
        if (this.frame.name === FRAME_KEYS.DRAGON10) {
            return this._tweenFly(true);
        }
    }

    _tweenFly(isDown) {
        const height = this.displayHeight * 0.065;
        const duration = FRAME_DURATION * TIMING.PLAYER.TWEEN_FLY_DURATION_FACTOR;

        this._tweenFlying?.stop();

        this._tweenFlying = this.scene.tweens.add({
            targets: this._flightMotion,
            offset: isDown ? 0 : -height,
            ease: 'Sine.InOut',
            duration,
            onComplete: () => { this._tweenFlying = null; }
        });
    }

    _handling(){
        const isJoystick = Object.values(this.scene.cursorKeys ?? {}).some(key => key.isDown);
        const buttons = isJoystick ? this.scene.cursorKeys : this.scene.cursors;
        if (!buttons) return;

        const force = isJoystick ? Math.min(1, this.scene.joystick.force / this.scene.joystick.radius) : 1;
        const x = Number(buttons.right.isDown) - Number(buttons.left.isDown);
        const y = Number(buttons.down.isDown) - Number(buttons.up.isDown);
        const length = Math.hypot(x, y) || 1;
        this._inputVelocityY = y / length * this.velocity * force;
        this.body.setVelocity(x / length * this.velocity * force, this._inputVelocityY + this._flightVelocity);
    }
}
