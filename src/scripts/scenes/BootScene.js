import { TIMING } from '../timing';
import { CACHE_KEYS, INPUT_EVENTS, SOUND_KEYS, TEXTURE_KEYS } from '../identifiers';
import { screenData, setEndpoints, tweenPromise } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { config } from '../main';
import { uiText } from '../ui';
import { CommonScene } from './CommonScene';

export class BootScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.BOOT);
    }

    init(){
        super.init();
        setEndpoints();

        this._buttons = {};

        this.model.initGameData();
    }

    async create() {
        this._createBg();
        this._createSounds();
        await this._createLogoAnimation();
        await this._createPressLabel();
    }

    preload() {
        super.preload();
    
        this.load.image(TEXTURE_KEYS.BOOT_SCENE_BG, './assets/sprites/boot_scene_bg.png');
        this.load.image(TEXTURE_KEYS.ENG, './assets/sprites/eng.png');
        this.load.image(TEXTURE_KEYS.UKR, './assets/sprites/ukr.png');
        this.load.image(TEXTURE_KEYS.BUTTON, './assets/sprites/button_lang.png');

        this.load.audio(SOUND_KEYS.CLICK, `./assets/sounds/click.mp3`);
        this.load.audio(SOUND_KEYS.WHOOSH, `./assets/sounds/whoosh.mp3`);

        this.load.json(CACHE_KEYS.INITIAL_TEXTS, `./assets/texts/initial_texts.json`);
    }

    _createLogoAnimation() {
        const logo = this.add.image(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y, TEXTURE_KEYS.BOOT_SCENE_BG).setAlpha(0);
        const scaleX = this.cameras.main.width / logo.width;
        const scaleY = this.cameras.main.height / logo.height;
        const scale = Math.max(scaleX, scaleY);
        logo.setScale(scale).setScrollFactor(0);

        return tweenPromise(this, {
            targets: logo,
            alpha: 1,
            ease: 'Linear',
            duration: TIMING.BOOT_SCENE.CREATE_LOGO_ANIMATION_DURATION_MS,
        });
    }

    async _createPressLabel() {
        const textStyle = {
            ...uiText(22), align: 'center', wordWrap: { width: screenData.width * 0.85 },
        };
        
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['Press'];
        const label = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.05, text, textStyle).setOrigin(0.5, 1).setAlpha(0);
        const clickArea = this.add.rectangle(0, 0, config.width, config.height).setOrigin(0);

        await tweenPromise(this, {
            targets: label,
            alpha: 0.85,
            ease: 'Linear',
            duration: TIMING.BOOT_SCENE.CREATE_PRESS_LABEL_DURATION_MS,
        });
        this._launchPressLabelCTA(label, clickArea);
    }

    _launchPressLabelCTA(label, clickArea) {
        clickArea.setInteractive();
        clickArea.once(INPUT_EVENTS.POINTERDOWN, () => this._click());

        this.tweens.add({
            targets: label,
            scale: 1.05,
            alpha: 1,
            ease: 'Linear',
            duration: TIMING.BOOT_SCENE.LAUNCH_PRESS_LABEL_CTA_DURATION_MS,
            repeat: -1,
            yoyo: true,
        });
    }

    _click() {
        this.sounds.click.play({ volume: 0.2 });
        this.scene.start(SCENE_NAMES.DISCLAIMER);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add(SOUND_KEYS.CLICK),
            whoosh: this.sound.add(SOUND_KEYS.WHOOSH),
        };
    }
}
