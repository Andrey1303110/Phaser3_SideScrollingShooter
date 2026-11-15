import { TIMING } from '../../timing';
import { INPUT_EVENTS, TEXTURE_KEYS, TEXT_KEYS } from '../../identifiers';
import { CAMPAIGN_LEVELS } from '../../constants';

const KYIV_MISSIONS = [1, 4, 7];

export class CampaignMap extends Phaser.GameObjects.Container {
    constructor(scene, view, selected, onSelect, onCluster, celebrate) {
        super(scene);
        scene.add.existing(this);
        this.markers = [];
        const u = scene._unit;
        const image = scene.add.image(view.x + view.width / 2, view.y + view.height / 2, TEXTURE_KEYS.MAP);
        image.setScale(Math.min(view.width / image.width, view.height / image.height))
            .setTint(0x8cbaad).setAlpha(0.9);
        this.add(image);
        const groups = [CAMPAIGN_LEVELS.filter(level => KYIV_MISSIONS.includes(level.index)),
            ...CAMPAIGN_LEVELS.filter(level => !KYIV_MISSIONS.includes(level.index)).map(level => [level])];
        // Keep the active and selected markers above nearby locked missions.
        const priority = group => Number(group.some(level => level.index === selected.index)) * 2
            + Number(group.some(level => level.index === scene.model.currentLevelScene));
        groups.sort((a, b) => priority(a) - priority(b));
        for (const levels of groups) {
            const x = image.x - image.displayWidth / 2
                + levels.reduce((sum, level) => sum + level.x, 0) / levels.length / 1000 * image.displayWidth;
            const y = image.y - image.displayHeight / 2
                + levels.reduce((sum, level) => sum + level.y, 0) / levels.length / 1000 * image.displayWidth;
            const current = levels.some(level => level.index === scene.model.currentLevelScene);
            const completed = levels.every(level => level.index < scene.model.currentLevelScene);
            const available = levels.some(level => level.index <= scene.model.currentLevelScene);
            const chosen = levels.some(level => level.index === selected.index);
            const marker = scene.add.container(x, y);
            if (current) {
                const pulse = scene.add.circle(0, 0, 15 * u).setStrokeStyle(2 * u, 0xe5ba70, 0.8);
                marker.add(pulse);
                scene.tweens.add({ targets: pulse, scale: 1.4, alpha: 0.15,
                    duration: TIMING.CAMPAIGN_MAP.MARKER_PULSE_DURATION_MS, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
            }
            if (chosen) marker.add(scene.add.circle(0, 0, 19 * u).setStrokeStyle(u, 0xf3e7cb, 0.8));
            if (completed) {
                const flag = scene.add.image(0, 2 * u, TEXTURE_KEYS.FLAG).setDisplaySize(14 * u, 22 * u).setOrigin(0.4, 0.8);
                marker.add(flag);
                if (celebrate && levels.some(level => level.index === scene.model.currentLevelScene - 1)) {
                    scene.tweens.add({ targets: flag, alpha: { from: 0, to: 1 },
                        y: { from: 10 * u, to: 2 * u }, duration: TIMING.CAMPAIGN_MAP.MARKER_ENTER_DURATION_MS, ease: 'Cubic.Out' });
                }
            } else {
                marker.add(scene.add.circle(0, 0, (available ? 10 : 7) * u, available ? 0x367e58 : 0x29464c)
                    .setStrokeStyle(1.5 * u, current ? 0xe5ba70 : available ? 0x9ac29e : 0x63848b));
            }
            if (levels.length > 1) {
                marker.add(scene.add.text(0, -25 * u, scene._getText(TEXT_KEYS.KYIV_CLUSTER), { fontFamily: 'Arial', fontSize: 11 * u,
                    color: '#f5e9d2', backgroundColor: '#27483d', padding: { x: 4 * u, y: 2 * u } }).setOrigin(0.5));
            }
            const clustered = levels.length > 1;
            const hitArea = scene.add.zone(0, clustered ? -6 * u : 0,
                (clustered ? 64 : 44) * u, (clustered ? 60 : 44) * u).setInteractive({ useHandCursor: true });
            let pointerId = null;
            hitArea.on(INPUT_EVENTS.POINTERDOWN, pointer => { pointerId = pointer.id; });
            hitArea.on(INPUT_EVENTS.POINTEROUT, () => { pointerId = null; });
            hitArea.on(INPUT_EVENTS.POINTERUP, pointer => {
                if (pointerId !== pointer.id) return;
                pointerId = null;
                if (levels.length > 1) onCluster(levels);
                else onSelect(levels[0]);
            });
            marker.add(hitArea);
            this.add(marker);
            this.markers.push({ levels, hitArea });
        }
    }
}
