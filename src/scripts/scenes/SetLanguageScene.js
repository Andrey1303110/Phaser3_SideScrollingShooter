import { INPUT_EVENTS, LIFECYCLE_EVENTS, SOUND_KEYS, TEXTURE_KEYS } from '../identifiers';
import { screenData, setEndpoints } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';

export class SetLanguageScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.SET_LANGUAGE);
    }

    preload() {
        for (const key of [TEXTURE_KEYS.UKR, TEXTURE_KEYS.ENG, TEXTURE_KEYS.COMMANDER, TEXTURE_KEYS.SKILL_PREVIEW_BG]) {
            this.load.image(key, './assets/sprites/' + key + '.png');
        }
        this.load.audio(SOUND_KEYS.CLICK, './assets/sounds/click.mp3');
    }

    create() {
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK) };
        this._choosing = false;
        this._render();
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, this._render, this);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, this._render, this));
    }

    _render() {
        setEndpoints();
        this._layout?.destroy();
        const root = this._layout = this.add.container();
        const { left, top, width, height, bottom } = screenData;
        const u = Math.min(width / 960, height / 500);
        const cx = left + width / 2, cy = top + height / 2;
        const vista = this.add.image(cx, cy, TEXTURE_KEYS.SKILL_PREVIEW_BG);
        vista.setScale(Math.max(width / vista.width, height / vista.height));
        const portrait = this.add.image(left + width * 0.81, bottom, TEXTURE_KEYS.COMMANDER).setOrigin(0.5, 1);
        portrait.setScale(Math.min(width * 0.43 / portrait.width, height * 0.90 / portrait.height));
        root.add([vista, this.add.rectangle(cx, cy, width, height, 0x0b2324, 0.44), portrait]);
        const x = left + width * 0.075, w = Math.min(width * 0.50, 510 * u);
        const label = (tx, ty, value, size, color, bold = false) => {
            const item = this.add.text(tx, ty, value, { fontFamily: 'Arial', fontSize: size * u,
                color, fontStyle: bold ? 'bold' : 'normal' }).setOrigin(0, 0.5);
            root.add(item);
            return item;
        };
        root.add(this.add.rectangle(x, cy - 154 * u, 56 * u, 3 * u, 0xe2ba7e).setOrigin(0, 0.5));
        label(x, cy - 123 * u, 'VOICE LANGUAGE', 19, '#f1d197', true).setLetterSpacing(3 * u);
        label(x, cy - 75 * u, 'Мова озвучення', 46, '#fff3dc', true);
        [[TEXTURE_KEYS.UKR, 'Українська'], [TEXTURE_KEYS.ENG, 'English']].forEach(([key, title], i) => {
            const y = cy + (6 + 88 * i) * u;
            const panel = this.add.rectangle(x, y, w, 72 * u, 0x152e30, 0.96).setOrigin(0, 0.5)
                .setStrokeStyle(u, 0x698079).setInteractive({ useHandCursor: true });
            const flag = this.add.image(x + 43 * u, y, key).setDisplaySize(42 * u, 28 * u);
            root.add([panel, flag]);
            label(x + 86 * u, y, title, 26, '#f6ecd6', true);
            label(x + w - 38 * u, y, '›', 32, '#e2ba7e');
            panel.on(INPUT_EVENTS.POINTEROVER, () => panel.setFillStyle(0x31524b).setStrokeStyle(2 * u, 0xe2ba7e));
            panel.on(INPUT_EVENTS.POINTEROUT, () => panel.setFillStyle(0x152e30, 0.96).setStrokeStyle(u, 0x698079));
            panel.on(INPUT_EVENTS.POINTERUP, () => {
                if (this._choosing) return;
                this._choosing = true;
                this.model.setLang(key);
                this.sounds.click.play({ volume: 0.2 });
                this.scene.start(SCENE_NAMES.PRELOAD);
            });
        });
    }
}
