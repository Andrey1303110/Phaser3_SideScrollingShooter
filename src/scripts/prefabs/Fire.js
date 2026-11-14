import { delayInMSec } from '../Utils';
import { WEAPONS } from '../constants';
import { config } from '../main';
import { MovableObject } from './MovableObject'

export class Fire extends MovableObject {
    static generate(scene, source) {
        const data = {
            scene: scene,
            x: source.x + source.displayWidth * 0.5 * source.weapon.origin.x,
            y: source.y,
            sourceVelocity: source.velocity,
            ...source.weapon,
        };

        return new Fire(data);
    }

    constructor(data) {
        super(data);

        this._setup(data);
        this._addParticles(data.particlesSetting);

        this.once('destroy', () => this._onKilled());
    }

    move(){
        if (!this.acceleration) {
            return;
        }

        this._playLaunchSound();
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
    }

    async _rocketMove() {
        const randomDelay = Phaser.Math.Between(500, 1000);
        
        if (this._isDead()) {
            return;
        } 
        const randomVelocityModifier = (Phaser.Math.Between(-20, 20) * 0.01);
        await delayInMSec(this.scene, randomDelay);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * randomVelocityModifier);
        this._rocketMove();
    }

    async _missileMove() {
        if (this._isDead()) {
            return;
        } 
        this.body.setVelocityY(230);
        await delayInMSec(this.scene, 225);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * 0.035);
    }

    async _missile2Move() {
        if (this._isDead()) {
            return;
        }
        this.body.setVelocityY(280);
        await delayInMSec(this.scene, 225);
        if (!this.active || !this.body) return;
        this.body.setVelocityY(this.velocity * 0.05);
    }

    _addParticles(settings) {
        if (!settings) {
            return;
        }

        // todo add react particle speed x on updated speed from source fire or make it depends by multiplier from original speed 
        this._emitter = this.scene.add.particles(0, 0, 'explosion_particle', {
            blendMode: 'ADD',
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

    _isDead() {
        return this.isDead();
    }

    _onKilled() {
        this._emitter?.destroy();
    }
}
