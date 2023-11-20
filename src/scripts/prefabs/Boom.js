const ANIMATION_NAME = 'explosion';

export class Boom extends Phaser.GameObjects.Sprite {
    static generate(scene, x, y) {
        return new Boom({scene, x, y});
    }

    constructor(data){
        super(data.scene, data.x, data.y);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;

        this.createAnimation();

        this.play(ANIMATION_NAME);

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, ()=>{
            this.destroy();
        });
    }

    createAnimation() {
        if (this.scene.anims.anims.entries[ANIMATION_NAME]) return;

        const frames = this.scene.anims.generateFrameNames('boom',{
            prefix: 'boom',
            start: 1,
            end: 7,
        });

        this.scene.anims.create({
            key: ANIMATION_NAME,
            frames,
            frameRate: 8,
            repeat: 0,
        });
    }
}
