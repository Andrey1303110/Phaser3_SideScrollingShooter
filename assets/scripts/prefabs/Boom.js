export class Boom extends Phaser.GameObjects.Sprite {
    static generate(scene, x, y) {
        return new Boom({scene, x, y});
    }

    constructor(data){
        super(data.scene, data.x, data.y, 'boom', 'boom1');

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;

        const frames = this.scene.anims.generateFrameNames('boom',{
            prefix: 'boom',
            start: 1,
            end: 7,
        });

        this.scene.anims.create({
            key: 'boom',
            frames,
            frameRate: 8,
            repeat: 0,
        });

        this.play('boom');

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, ()=>{
            this.destroy();
        });
    }
}
