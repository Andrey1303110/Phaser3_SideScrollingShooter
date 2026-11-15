import { TIMING } from '../timing';
import { ANIMATION_KEYS, TEXTURE_KEYS } from '../identifiers';
const ANIMATION_NAME = ANIMATION_KEYS.EXPLOSION;
const FRAME_NAME = TEXTURE_KEYS.BOOM;

export class Boom extends Phaser.GameObjects.Sprite {
    static generate(scene, x, y) {
        return new Boom({scene, x, y});
    }

    constructor(data){
        super(data.scene, data.x, data.y);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;

        this._createAnimation();

        this.play(ANIMATION_NAME);

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.destroy();
        });
    }

    _createAnimation() {
        if (this.scene.anims.anims.entries[ANIMATION_NAME]) {
            return;
        }

        const frames = this.scene.anims.generateFrameNames(FRAME_NAME,{
            prefix: FRAME_NAME,
            start: 1,
            end: 7,
        });

        this.scene.anims.create({
            key: ANIMATION_NAME,
            frames,
            frameRate: TIMING.BOOM.CREATE_ANIMATION_FRAME_RATE_FPS,
            repeat: 0,
        });
    }
}
