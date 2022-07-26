class Fires extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
    }

    createFire(source) {
        let fire = Fire.generate(this.scene, source);
        fire.setScale(source.weapon.scale);
        this.add(fire);

        fire.move();
        this.createdCount++;
        fire.createSound(source);
    }
}
