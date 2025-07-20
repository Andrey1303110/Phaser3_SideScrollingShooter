import { config, delayInMSec } from '../main';
import { MovableObject } from './MovableObject'

export class Fire extends MovableObject {
    static generate(scene, source) {
        const data = {
            scene: scene,
            x: source.x + source.displayWidth * 0.5 * source.weapon.origin.x,
            y: source.y,
            texture: source.weapon.texture,
            velocity: source.weapon.velocity,
            scale: source.weapon.scale,
            damage: source.weapon.damage,
            reward: config.reward[source.weapon.texture],
        };

        return new Fire(data);
    }

    createSound(source) {
        this.launch_sound = source.scene.sound.add(`${source.weapon.texture}_launch`);
        this.launch_sound.play({volume: 0.35});
    }

    async move(){
        switch (this.texture.key) {
            case 'rocket':
                this._rocketMove();
                break;
            case 'missile':
                this._missileMove();
                break;
            case 'missile_2':
                this._missile2Move();
                break;
            default:
                this.body.setVelocityX(this.velocity);
        }
    }

    async _rocketMove() {
        const randomDelay = Phaser.Math.Between(500, 1000);
        
        while (!this.isDead()) {
            const randomVelocityModifier = (Phaser.Math.Between(-20, 20) * 0.01);
        
            this.body.setVelocityX(this.velocity);
            await delayInMSec(this.scene, randomDelay);
            this.body.setVelocityY(this.velocity * randomVelocityModifier);
        }
    }

    async _missileMove() {
        this.body.setVelocityY(230);
        this.body.setVelocityX(this.velocity * 0);
        await delayInMSec(this.scene, 250);
        this.body.setVelocityY(this.velocity * 0.035);
        this.body.setVelocityX(this.velocity);
    }

    async _missile2Move() {
        this.body.setVelocityY(280);
        this.body.setVelocityX(this.velocity * 0.1);
        await delayInMSec(this.scene, 250);
        this.body.setVelocityY(this.velocity * 0.05);
        this.body.setVelocityX(this.velocity);
    }

    reset() {
        return false;
    }

    isDead() {
        return (this.x > config.width + this.displayWidth || this.x < -this.displayWidth);
    }
}
