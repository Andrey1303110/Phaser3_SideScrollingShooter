import { TIMING } from '../timing';
import { LIFECYCLE_EVENTS, TEXTURE_KEYS, TEXT_KEYS } from '../identifiers';
import { delayInMSec } from '../Utils';
import { WEAPONS } from '../constants';
import { config } from '../main';
import { MovableObject } from './MovableObject'
import { CAMPAIGN_SKILL_BALANCE } from '../campaignSkills';
import { dragonMouth } from '../skillEffects';

export class Fire extends MovableObject {
    static generate(scene, source, options) {
        const data = {
            scene: scene,
            x: source.x + source.displayWidth * 0.5 * source.weapon.origin.x,
            y: source.y,
            sourceVelocity: source.velocity,
            ...source.weapon,
        };

        if (source.texture.key === TEXTURE_KEYS.DRAGON) {
            Object.assign(data, dragonMouth(source), { emissionDepth: source.depth - 0.1 });
        }

        return new Fire(data, options);
    }

    constructor(data, { direction = 0, targets = 1 } = {}) {
        super(data);

        this._spreadDirection = direction;
        this.targetsRemaining = targets;
        this._setup(data);
        if (targets > 1) this.setTint(0xffca85);
        const particles = targets > 1 && data.particlesSetting
            ? { ...data.particlesSetting, tint: [0xffa337, 0xffda77, 0xfff1bb], lifespan: { min: 110, max: 320 } }
            : data.particlesSetting;
        this._addParticles(particles);
        if (data.emissionDepth !== undefined) {
            this.setDepth(data.emissionDepth).setAlpha(0);
            this._emitter?.setDepth(data.emissionDepth);
            this._emergeTween = this.scene.tweens.add({ targets: this, alpha: 1, duration: 90 });
        }

        this.once(LIFECYCLE_EVENTS.DESTROY, () => this._onKilled());
    }

    move(){
        if (!this.acceleration) {
            return;
        }

        if (this._spreadDirection !== 1) this._playLaunchSound();
        this.body.setAccelerationX(this.acceleration);

        switch (this.texture.key) {
            case WEAPONS.ROCKET.texture:
                this._rocketMove();
                break;
            case WEAPONS.MISSILE.texture:
                this._missileMove();
                break;
            case WEAPONS.MISSILE_2.texture:
                this._missile2Move();
                break;
            case WEAPONS.FIRE.texture:
                this._fireMove();
                break;
        }
    }

    _setup({ sourceVelocity, maxSpeed, sound }) {
        this.body.setVelocityX(sourceVelocity);
        this.body.setMaxSpeed(Math.abs(maxSpeed));

        this._sound = this.scene.sounds[sound];
    }

    _playLaunchSound() {
        this._sound.play();
    }

    _fireMove() {
        this.body.setVelocityX(this.velocity * 0.3);
        this.body.setVelocityY(this.velocity * CAMPAIGN_SKILL_BALANCE.doubleFireSpread * this._spreadDirection);
    }

    async _rocketMove() {
        const randomDelay = Phaser.Math.Between(TIMING.FIRE.ROCKET_MANEUVER_MIN_DELAY_MS, TIMING.FIRE.ROCKET_MANEUVER_MAX_DELAY_MS);
        
        if (this.isDead()) {
            return;
        } 
        const randomVelocityModifier = (Phaser.Math.Between(-20, 20) * 0.01);
        await delayInMSec(this.scene, randomDelay);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * randomVelocityModifier);
        this._rocketMove();
    }

    async _missileMove() {
        if (this.isDead()) {
            return;
        } 
        this.body.setVelocityY(230);
        await delayInMSec(this.scene, TIMING.FIRE.MISSILE_MOVE_DELAY_MS);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * 0.035);
    }

    async _missile2Move() {
        if (this.isDead()) {
            return;
        }
        this.body.setVelocityY(280);
        await delayInMSec(this.scene, TIMING.FIRE.MISSILE2MOVE_DELAY_MS);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * 0.05);
    }

    _addParticles(settings) {
        if (!settings) {
            return;
        }

        // todo add react particle speed x on updated speed from source fire or make it depends by multiplier from original speed 
        this._emitter = this.scene.add.particles(0, 0, TEXTURE_KEYS.EXPLOSION_PARTICLE, {
            blendMode: TEXT_KEYS.ADD,
            follow: this,
            followOffset: {
                x: this.width * 0.225
            },
            ...settings
        });
        this._emitter.tintFill = true;
    }

    isDead() {
        return !this.active || !this.body || this.x > config.width + this.displayWidth || this.x < -this.displayWidth
            || this.y < -this.displayHeight || this.y > config.height + this.displayHeight;
    }

    _onKilled() {
        this._emergeTween?.stop();
        this._emitter?.destroy();
    }
}
