import { TEXTURE_KEYS } from '../identifiers';
import { ACTOR_ART_DENSITY } from '../actorArt';

// Coordinates in logical atlas pixels. Frame 2 is the Tu-95.
const TU95_FRAME = '2';
const EXHAUSTS = { '1': [184, 42], '3': [278, 43], '4': [244, 43] };

export class AircraftEngines extends Phaser.GameObjects.Container {
    constructor(scene, aircraft) {
        super(scene);
        this.aircraft = aircraft;
        this.elapsed = 0;
        scene.add.existing(this);
        this.effect = scene.add.graphics();
        this.add(this.effect);
        this.frameName = null;
        scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
        const remove = () => this.destroy();
        aircraft.once('destroy', remove);
        this.once('destroy', () => {
            scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
            aircraft.off('destroy', remove);
        });
        this.update(0, 0);
    }

    update(time, delta) {
        const plane = this.aircraft;
        this.elapsed += delta / 1000;
        const frame = String(plane.frame.name);
        const isTu95 = frame === TU95_FRAME;
        this.setPosition(plane.x, plane.y).setRotation(plane.rotation)
            .setScale(plane.scaleX * ACTOR_ART_DENSITY * (plane.flipX ? -1 : 1),
                plane.scaleY * ACTOR_ART_DENSITY * (plane.flipY ? -1 : 1))
            .setAlpha(plane.alpha).setVisible(plane.visible)
            .setDepth(plane.depth + (isTu95 ? 0.01 : -0.01));
        const ox = plane.displayOriginX / ACTOR_ART_DENSITY;
        const oy = plane.displayOriginY / ACTOR_ART_DENSITY;

        if (frame !== this.frameName) {
            this.emitter?.destroy();
            this.emitter = null;
            this.frameName = frame;
            if (!isTu95 && EXHAUSTS[frame]) {
                this.emitter = this.scene.add.particles(0, 0, TEXTURE_KEYS.EXPLOSION_PARTICLE, {
                    frequency: 28, quantity: 1, lifespan: { min: 120, max: 260 },
                    speedX: { min: 65, max: 115 }, speedY: { min: -4, max: 4 },
                    scaleX: { start: 0.22, end: 0.04 }, scaleY: { start: 0.07, end: 0.01 },
                    alpha: { start: 0.65, end: 0 }, tint: [0xb5eaff, 0x6aafff, 0xffbd77],
                    blendMode: Phaser.BlendModes.ADD,
                });
                this.add(this.emitter);
            }
        }
        const g = this.effect.clear();
        if (isTu95) {
            // Side-on contra-rotating propeller discs on both visible nacelles.
            for (const [hx, hy] of [[65, 48], [81, 49]]) {
                const x = hx - ox, y = hy - oy;
                g.fillStyle(0xd8e7e8, 0.15).fillEllipse(x, y, 8, 51);
                for (const spin of [-1, 1]) {
                    for (let blade = 0; blade < 4; blade++) {
                        const angle = this.elapsed * 47 * spin + blade * Math.PI / 2;
                        g.lineStyle(1.5, 0x667575, 0.8).lineBetween(x + spin, y,
                            x + spin + Math.cos(angle) * 3, y + Math.sin(angle) * 25);
                    }
                }
                g.fillStyle(0xd5dcce, 0.9).fillEllipse(x, y, 5, 4);
            }
        } else if (!isTu95 && EXHAUSTS[frame]) {
            const [hx, hy] = EXHAUSTS[frame];
            const x = hx - ox, y = hy - oy;
            const pulse = 1 + Math.sin(this.elapsed * 39) * 0.12;
            g.fillStyle(0x528dff, 0.2).fillEllipse(x + 13, y, 37 * pulse, 9);
            g.fillStyle(0x8bd5ff, 0.55).fillTriangle(x, y - 3, x + 30 * pulse, y, x, y + 3);
            g.fillStyle(0xfff0cc, 0.9).fillTriangle(x, y - 1.5, x + 14 * pulse, y, x, y + 1.5);
            this.emitter.setPosition(x + 4, y);
            this.emitter.emitting = plane.active && plane.visible;
        }
    }
}
