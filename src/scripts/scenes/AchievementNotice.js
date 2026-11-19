import { GameModel } from '../GameModel';
import { SCENE_NAMES } from '../constants';
import { getSceneTexts, screenData } from '../Utils';
import { UI, uiText, uiUnit } from '../ui';
import { drawAchievementArt } from './components/achievementArt';

// A separate scene lets queued awards finish even when the sortie or workshop closes.
export class AchievementNotice extends Phaser.Scene {
    constructor() {
        super(SCENE_NAMES.ACHIEVEMENT_NOTICE);
    }

    create() {
        this.book = GameModel.getInstance().achievements;
        this.input.enabled = false;
        this.banner = null;
    }

    update() {
        if (this.banner || !this.book.pending.length) return;
        const words = getSceneTexts(this, SCENE_NAMES.ACHIEVEMENTS);
        if (!words.names) return;
        const entry = this.book.pending.shift();
        this.scene.bringToTop();
        const u = uiUnit();
        const width = Math.min(328 * u, screenData.width - 16 * u);
        const x = (screenData.left + screenData.right - width) / 2;
        const y = screenData.top + 8 * u;
        const banner = this.add.container(x, y - 12 * u).setAlpha(0);
        this.banner = banner;
        banner.add(this.add.graphics().fillStyle(0x112b28, 0.98).lineStyle(1.5 * u, 0xe3b967)
            .fillRoundedRect(0, 0, width, 62 * u, 9 * u).strokeRoundedRect(0, 0, width, 62 * u, 9 * u));
        drawAchievementArt(this, banner, entry, 32 * u, 31 * u, 48 * u);
        banner.add(this.add.text(65 * u, 8 * u, words.unlocked, uiText(13, UI.colors.accent)));
        banner.add(this.add.text(65 * u, 30 * u, words.names[entry.id], {
            ...uiText(17), fontStyle: 'bold',
        }));
        this.tweens.add({ targets: banner, alpha: 1, y, duration: 180, hold: 2550, yoyo: true,
            onComplete: () => {
                banner.destroy();
                this.banner = null;
            },
        });
    }
}
