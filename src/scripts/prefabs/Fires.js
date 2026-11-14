import { Fire } from "./Fire";
import { GAME_ACTOR_SCALE_MULTIPLIER } from "../constants";

export class Fires extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createdCount = 0;
    }

    createFire(source) {
        if (!source.active) {
            return;
        }
        const fire = Fire.generate(this.scene, source);
        fire.setScale(source.weapon.scale * GAME_ACTOR_SCALE_MULTIPLIER);
        this.add(fire);
        fire.move();
        this.createdCount++;
    }
}
