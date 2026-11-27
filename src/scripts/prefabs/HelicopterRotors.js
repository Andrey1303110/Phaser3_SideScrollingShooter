import { LIFECYCLE_EVENTS } from '../identifiers';
import { ACTOR_ART_DENSITY } from '../actorArt';
// Hub coordinates in logical pixels; the atlas uses twice this resolution.
const ROTORS = {
    '1': [
        { x: 73, y: 7, radius: 62, depth: 3, blades: 3, speed: 42 },
        { x: 73, y: 22, radius: 64, depth: 3, blades: 3, speed: -42 },
    ],
    '2': [
        { x: 77, y: 5, radius: 65, depth: 3, blades: 3, speed: 42 },
        { x: 77, y: 20, radius: 67, depth: 3, blades: 3, speed: -42 },
    ],
    '3': [
        { x: 68, y: 5, radius: 66, depth: 3, blades: 5, speed: 42 },
    ],
    '4': [
        { x: 64, y: 8, radius: 64, depth: 3, blades: 5, speed: 42 },
    ],
};

export class HelicopterRotors extends Phaser.GameObjects.Graphics {
    constructor(scene, helicopter) {
        super(scene);
        this.helicopter = helicopter;
        this._elapsed = Math.random() * Math.PI * 2;
        scene.add.existing(this);

        // Physics commits sprite positions in POST_UPDATE. Follow afterwards so
        // the rotor stays attached even when the helicopter moves quickly.
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
        const remove = () => this.destroy();
        helicopter.once(LIFECYCLE_EVENTS.DESTROY, remove);
        this.once(LIFECYCLE_EVENTS.DESTROY, () => {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
            helicopter.off(LIFECYCLE_EVENTS.DESTROY, remove);
        });
        this.update(0, 0);
    }

    update(time, delta) {
        const helicopter = this.helicopter;
        this._elapsed += delta / 1000;
        this.setPosition(helicopter.x, helicopter.y)
            .setRotation(helicopter.rotation)
            .setScale(helicopter.scaleX * ACTOR_ART_DENSITY * (helicopter.flipX ? -1 : 1),
                helicopter.scaleY * ACTOR_ART_DENSITY * (helicopter.flipY ? -1 : 1))
            .setAlpha(helicopter.alpha)
            .setVisible(helicopter.visible)
            .setDepth(helicopter.depth + 0.01);
        this.clear();

        for (const rotor of ROTORS[helicopter.frame.name]) {
            const x = rotor.x - helicopter.displayOriginX / ACTOR_ART_DENSITY;
            const y = rotor.y - helicopter.displayOriginY / ACTOR_ART_DENSITY;
            this.fillStyle(0xbac9c7, 0.16);
            this.fillEllipse(x, y, rotor.radius * 2, rotor.depth * 2);
            this.lineStyle(1.5, 0x35433f, 0.75);
            for (let blade = 0; blade < rotor.blades; blade++) {
                const angle = this._elapsed * rotor.speed + blade * Math.PI * 2 / rotor.blades;
                this.lineBetween(x, y, x + Math.cos(angle) * rotor.radius, y + Math.sin(angle) * rotor.depth);
            }
            this.fillStyle(0x35433f, 0.9).fillCircle(x, y, 2);
        }
    }
}
