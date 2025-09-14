import { delayInMSec, screenData } from '../Utils';
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
        await delayInMSec(this.scene, 2500);
        this._createPressLabel();
        this._createInteractivity();
    }

    preload() {
        super.preload();

        this.load.audio('click', `./assets/sounds/click.mp3`);
    }

    _createBg() {
        super._createBg();
        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 1);
    }

    _createTextLabel() {
        const text = this.scene.scene.cache.json.get('initial_texts')['Disclaimer'];
        this._textLabel = this.add.text(this._centerDot.x, this._centerDot.y - config.width * 0.015, text, {
            font: `${config.width * 0.0225}px ${FONTS['eng']}`,
            fill: '#d9d9d9',
            align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        return new Promise((resolve) => {
            this.tweens.add({
                targets: this._textLabel,
                alpha: 0.85,
                ease: 'Linear',
                duration: 500,
                onComplete: () => resolve()
            });
        });
    }

    async _createPressLabel() {
        const textStyle = {
            font: `${config.width * 0.035}px ${FONTS['eng']}`,
            fill: '#C40000',
        };
        
        const text = this.scene.scene.cache.json.get('initial_texts')['DisclaimerPress'];
        this._pressLabel = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.03, text, textStyle).setOrigin(0.5, 1).setAlpha(0);

        await new Promise((resolve) => {
            this.tweens.add({
                targets: this._pressLabel,
                alpha: 0.5,
                ease: 'Linear',
                duration: 350,
                onComplete: () => resolve()
            });
        });

        this.tweens.add({
            targets: this._pressLabel,
            scale: 1.15,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
            repeat: -1,
            yoyo: true,
        });
    }

    async _onClick() {
        this.sounds.click.play({ volume: .2 });

        await this._tweenHideScene();

        const nextScene = this.model.lang === '' ? SCENE_NAMES.SET_LANGUAGE : SCENE_NAMES.PRELOAD;
        this.scene.start(nextScene);
    }

    _tweenHideScene() {
        return new Promise((resolve) => {
            this.tweens.add({
                targets: [this._blackBG, this._textLabel, this._pressLabel],
                alpha: 0,
                ease: 'Power3',
                duration: 500,
                onComplete: () => resolve()
            });
        });
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add('click'),
        };
    }

    _createInteractivity() {
        this._blackBG.setInteractive();
        this._blackBG.on('pointerdown', () => this._onClick());
    }
}