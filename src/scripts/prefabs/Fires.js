import { Fire } from "./Fire";
import { GAME_ACTOR_SCALE_MULTIPLIER } from "../constants";
import { CAMPAIGN_SKILL_BALANCE } from '../campaignSkills';

export class Fires extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createdCount = 0;
    }

    createFire(source, options) {
        if (!source.active) {
            return;
        }
        const fire = Fire.generate(this.scene, source, options);
        const scale = options?.direction ? CAMPAIGN_SKILL_BALANCE.doubleFireScale : 1;
        fire.setScale(source.weapon.scale * GAME_ACTOR_SCALE_MULTIPLIER * scale);
        this.add(fire);
        fire.move();
        this.createdCount++;
    }
}
