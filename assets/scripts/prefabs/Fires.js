class Fires extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
    }

    createFire(source) {
        let fire = this.getFirstDead();
        //let name = source.constructor.name;

        if (!fire) {
            fire = Fire.generate(this.scene, source);
            fire.setScale(source.weapon.scale);
            this.add(fire);
        } else {
            fire.reset(source.x + source.displayWidth / 2 * source.weapon.origin.x, source.y);
        }

        fire.move();
        this.createdCount++;
        fire.createSound(source);
    }
}
