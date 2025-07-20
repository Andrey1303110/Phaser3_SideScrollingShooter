import { config } from '../main';
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

    move(){
        if (this.texture.key === 'missile' || this.texture.key === 'missile_2') {
            this.body.setVelocityY(250);
            this.body.setVelocityX(this.velocity/10);
            setTimeout(() => {
                this.body.setVelocityY(this.velocity/50);
                this.body.setVelocityX(this.velocity);
            }, 175);
        } else {
            this.body.setVelocityX(this.velocity);
        }
    }

    reset() {
        return false;
    }

    isDead() {
        return (this.x > config.width + this.displayWidth || this.x < -this.displayWidth);
    }
}
