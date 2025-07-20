import { Fire } from "./Fire";

export class Fires extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
    }

    createFire(source) {
        if (!source.active) {
            return;
        }
        const fire = Fire.generate(this.scene, source);
        fire.setScale(source.weapon.scale);
        this.add(fire);

        fire.move();
        this.createdCount++;
        fire.createSound(source);
    }
}
