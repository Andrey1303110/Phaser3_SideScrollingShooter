import { LIFECYCLE_EVENTS } from '../identifiers';
// Hub coordinates are local pixels in each helicopter atlas frame.
const ROTORS = {
    '1': [
        { x: 72, y: 12, radius: 66, depth: 4, blades: 3, speed: 42 },
        { x: 72, y: 21, radius: 64, depth: 4, blades: 3, speed: -42 },
    ],
    '2': [
        { x: 78, y: 10, radius: 77, depth: 4, blades: 5, speed: 42 },
        { x: 181, y: 22, radius: 9, depth: 9, blades: 3, speed: 66 },
    ],
    '3': [
        { x: 62, y: 6, radius: 79, depth: 4, blades: 5, speed: 42 },
        { x: 185, y: 16, radius: 9, depth: 9, blades: 3, speed: 66 },
    ],
    '4': [
        { x: 64, y: 7, radius: 70, depth: 4, blades: 5, speed: 42 },
        { x: 169, y: 13, radius: 8, depth: 8, blades: 4, speed: 66 },
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
            .setScale(helicopter.scaleX * (helicopter.flipX ? -1 : 1),
                helicopter.scaleY * (helicopter.flipY ? -1 : 1))
            .setAlpha(helicopter.alpha)
            .setVisible(helicopter.visible)
            .setDepth(helicopter.depth + 0.01);
        this.clear();

        for (const rotor of ROTORS[helicopter.frame.name]) {
            const x = rotor.x - helicopter.displayOriginX;
            const y = rotor.y - helicopter.displayOriginY;
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
