import { TIMING } from '../timing';
import { CACHE_KEYS, INPUT_EVENTS, SOUND_KEYS, TEXTURE_KEYS } from '../identifiers';
import { delayInMSec, screenData, tweenPromise } from '../Utils';
import { FONTS, SCENE_NAMES } from '../constants';
import { config } from '../main';
import { CommonScene } from './CommonScene';

export class DisclaimerScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.DISCLAIMER);
    }

    async create() {
        this._createBg();
        this._createSounds();
        await this._createTextLabel();
        await delayInMSec(this.scene, TIMING.DISCLAIMER_SCENE.CREATE_DELAY_MS);
        await this._createPressLabel();
        this._createInteractivity();
    }

    preload() {
        super.preload();

        this.load.audio(SOUND_KEYS.CLICK, `./assets/sounds/click.mp3`);
    }

    _createBg() {
        super._createBg();
        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 1);
    }

    _createTextLabel() {
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['Disclaimer'];
        this._textLabel = this.add.text(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y - config.width * 0.035, text, {
            font: `${config.width * 0.0225}px ${FONTS[TEXTURE_KEYS.ENG]}`,
            fill: '#d9d9d9',
            align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        return tweenPromise(this, {
            targets: this._textLabel,
            alpha: 0.85,
            ease: 'Linear',
            duration: TIMING.DISCLAIMER_SCENE.CREATE_TEXT_LABEL_DURATION_MS,
        });
    }

    _createPressLabel() {
        const textStyle = {
            align: 'center',
            font: `${config.width * 0.035}px ${FONTS[TEXTURE_KEYS.ENG]}`,
            fill: '#C40000',
        };
        
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['DisclaimerPress'];
        this._pressLabel = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.01, text, textStyle).setOrigin(0.5, 1).setAlpha(0);

        return tweenPromise(this, {
            targets: this._pressLabel,
            alpha: 0.5,
            ease: 'Linear',
            duration: TIMING.DISCLAIMER_SCENE.CREATE_PRESS_LABEL_DURATION_MS,
            onComplete: () => this._playCTA(),
        });
    }

    _playCTA() {
        return tweenPromise(this, {
            targets: this._pressLabel,
            scale: 1.15,
            alpha: 1,
            ease: 'Linear',
            duration: TIMING.DISCLAIMER_SCENE.PLAY_CTA_DURATION_MS,
            repeat: -1,
            yoyo: true,
        });
    }

    async _onClick() {
        this.sounds.click.play({ volume: 0.2 });

        await this._tweenHideScene();

        const nextScene = this.model.lang === '' ? SCENE_NAMES.SET_LANGUAGE : SCENE_NAMES.PRELOAD;
        this.scene.start(nextScene);
    }

    _tweenHideScene() {
        return tweenPromise(this, {
            targets: [this._blackBG, this._textLabel, this._pressLabel],
            alpha: 0,
            ease: 'Power3',
            duration: TIMING.DISCLAIMER_SCENE.TWEEN_HIDE_SCENE_DURATION_MS,
        });
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add(SOUND_KEYS.CLICK),
        };
    }

    _createInteractivity() {
        this._blackBG.setInteractive();
        this._blackBG.once(INPUT_EVENTS.POINTERDOWN, () => this._onClick());
    }
}