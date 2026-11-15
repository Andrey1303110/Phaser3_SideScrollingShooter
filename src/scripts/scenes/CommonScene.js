import { LIFECYCLE_EVENTS, TEXTURE_KEYS } from '../identifiers';
import { GameModel } from '../GameModel';
import { getSceneTexts, setEndpoints } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { createBackArrow } from '../ui';

export class CommonScene extends Phaser.Scene {
    constructor(name) {
        super(name);

        this.name = name;
        this.model = GameModel.getInstance();
    }

    init() {
        this.sound.mute = !this.model.soundEnabled;
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => {
            Object.values(this.sounds ?? {}).forEach(sound => sound.destroy());
            this.sounds = null;
        });
        if (!this.scale.isFullscreen) {
            switch (this.scene.key) {
                case SCENE_NAMES.BOOT:
                case SCENE_NAMES.DISCLAIMER:
                case SCENE_NAMES.SET_LANGUAGE:
                case SCENE_NAMES.PRELOAD:
                    return;
            }
            this.scale.startFullscreen();
        }

        setEndpoints();
        this._createTranslations();
    }

    preload() {
        this.load.image(TEXTURE_KEYS.BG, './assets/sprites/bg.png');
    }

    _playTransitionSound(key) {
        // These one-shot cues belong to the global sound manager, not the
        // scene's sounds collection, so scene shutdown cannot cut them short.
        const sound = this.sound.add(key);
        sound.once(Phaser.Sound.Events.COMPLETE, sound.destroy, sound);
        if (!sound.play()) sound.destroy();
        return sound;
    }

    _createBg() {
        const bg = this.add.image(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y, TEXTURE_KEYS.BG)
            .setAlpha(0.925)
            .setOrigin(0.5)
            .setInteractive();

        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
    }

    _createReturnButton() {
        this._backButton = createBackArrow(this);
    }

    _onReturnButtonClick() {
        this.scene.start(SCENE_NAMES.MAIN_MENU);
        this.sounds.click.play({ volume: 0.2 });
    }

    _createTranslations() {
        this._translationTexts = getSceneTexts(this);
    }

    _getText(key) {
        return this._translationTexts[key];
    }
}
