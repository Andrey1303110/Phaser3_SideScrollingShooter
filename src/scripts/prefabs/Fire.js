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
        const skillShot = data.texture === TEXTURE_KEYS.FIRE && direction !== 0;
        super(skillShot ? { ...data, texture: TEXTURE_KEYS.SKILL_FX, frame: targets > 1 ? 'pierce' : 'volley' } : data);

        this._weaponTexture = data.texture;
        this._spreadDirection = direction;
        this.targetsRemaining = targets;
        this._setup(data);
        if (skillShot) {
            // The painted wake trails behind the original projectile hitbox.
            const hit = this.scene.textures.getFrame(TEXTURE_KEYS.FIRE);
            this.setOrigin(0.82, 0.5);
            this.body.setSize(hit.realWidth, hit.realHeight, false)
                .setOffset(this.displayOriginX - hit.realWidth / 2, this.displayOriginY - hit.realHeight / 2);
        }
        const particles = skillShot
            ? { ...data.particlesSetting, frame: 'impact', quantity: 2, followOffset: { x: -6, y: 0 },
                speedX: { min: -95, max: -25 }, speedY: { min: -22, max: 22 },
                scale: { start: 0.055, end: 0.008 }, lifespan: { min: 80, max: 200 },
                tint: targets > 1 ? [0xffd062, 0xfff4c6] : [0xff722b, 0xffca57] }
            : data.particlesSetting;
        if (data.texture !== TEXTURE_KEYS.ROCKET) {
            this._addParticles(particles, skillShot ? TEXTURE_KEYS.SKILL_FX : TEXTURE_KEYS.EXPLOSION_PARTICLE);
        }
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

        switch (this._weaponTexture) {
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

    update() {
        super.update();
        if (this.active && this._spreadDirection) this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    _setup({ sourceVelocity, maxSpeed, sound }) {
        this.body.setVelocityX(sourceVelocity);
        this.body.setMaxSpeed(Math.abs(maxSpeed));

        if (this._weaponTexture !== WEAPONS.FIRE.texture) {
            this._projectileSound = this.scene.sound.add(sound);
        }
    }

    _playLaunchSound() {
        (this._projectileSound ?? this.scene.sounds.fire_launch).play();
    }

    _fireMove() {
        const angle = CAMPAIGN_SKILL_BALANCE.doubleFireAngle * this._spreadDirection;
        const dx = Math.cos(angle), dy = Math.sin(angle);
        this.rotation = angle;
        this.body.setVelocity(dx * this.velocity * 0.3, dy * this.velocity * 0.3);
        this.body.setAcceleration(dx * this.acceleration, dy * this.acceleration);
    }

    _rocketMove() {
        const player = this.scene.player;
        // Commit to the launch bearing so a player who moves can dodge.
        const angle = player.active && player.x < this.x
            ? Phaser.Math.Clamp(Math.atan2(player.y - this.y, this.x - player.x), -Math.PI / 5, Math.PI / 5)
            : 0;
        const launchSpeed = Math.abs(this.body.velocity.x) || Math.abs(this.velocity) * 0.3;
        const dx = -Math.cos(angle);
        const dy = Math.sin(angle);
        this.body.setVelocity(dx * launchSpeed, dy * launchSpeed);
        this.body.setAcceleration(dx * Math.abs(this.acceleration), dy * Math.abs(this.acceleration));
        this.body.setMaxSpeed(Math.abs(this.maxSpeed));
        this.rotation = -angle;
        const nozzle = this.displayWidth * 0.47;
        this._addParticles({
            ...WEAPONS.ROCKET.particlesSetting,
            followOffset: { x: -dx * nozzle, y: -dy * nozzle },
            angle: { min: this.angle - 10, max: this.angle + 10 },
        }, TEXTURE_KEYS.EXPLOSION_PARTICLE);
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

    _addParticles(settings, texture) {
        if (!settings) {
            return;
        }

        // todo add react particle speed x on updated speed from source fire or make it depends by multiplier from original speed 
        this._emitter = this.scene.add.particles(0, 0, texture, {
            blendMode: TEXT_KEYS.ADD,
            follow: this,
            followOffset: {
                x: this.width * 0.225
            },
            ...settings
        });
        this._emitter.tintFill = texture === TEXTURE_KEYS.EXPLOSION_PARTICLE;
    }

    isDead() {
        return !this.active || !this.body || this._isOffscreen();
    }

    _isOffscreen() {
        return this.x > config.width + this.displayWidth || this.x < -this.displayWidth
            || this.y < -this.displayHeight || this.y > config.height + this.displayHeight;
    }

    _releaseLaunchSound() {
        const sound = this._projectileSound;
        if (!sound?.isPlaying || !this._isOffscreen() || !this.scene.sys.isActive()) {
            sound?.destroy();
            return;
        }

        const { events, tweens } = this.scene;
        const dispose = () => {
            events.off(LIFECYCLE_EVENTS.SHUTDOWN, dispose);
            sound.destroy();
        };
        events.once(LIFECYCLE_EVENTS.SHUTDOWN, dispose);
        tweens.add({ targets: sound, volume: 0, duration: TIMING.FIRE.OFFSCREEN_SOUND_FADE_MS, onComplete: dispose });
    }

    _onKilled() {
        this._releaseLaunchSound();
        this._emergeTween?.stop();
        this._emitter?.destroy();
    }
}
