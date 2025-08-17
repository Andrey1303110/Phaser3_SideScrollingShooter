import { SCENE_NAMES } from '../constants';
import { config, screenData, setEndpoints, setLang } from '../main';
import { CommonScene } from './CommonScene';

export class BootScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.BOOT);
    }

    init(){
        super.init();
        setEndpoints();

        this._buttons = {};
    }

    async create() {
        this._createBg();
        this._createSounds();
        await this._createLogoAnimation();
        this._createPressLabel();
    }

    preload() {
        super.preload();
    
        this.load.image('pervious_logo', './assets/sprites/pervious_logo.png');
        this.load.image('eng', './assets/sprites/eng.png');
        this.load.image('ukr', './assets/sprites/ukr.png');
        this.load.image('button', './assets/sprites/button_lang.png');

        this.load.audio('click', `./assets/sounds/click.mp3`);
        this.load.audio('whoosh', `./assets/sounds/whoosh.mp3`);
    }

    _addButtonEventListeners(button) {
        button.on('pointerover', () => button.setAlpha(1));
        button.on('pointerout', () => button.setAlpha(.75));
        button.on('pointerdown', () => this._langSelect(button));
    }

    async _createLogoAnimation() {
        const logo = this.add.image(this._center.x, this._center.y, 'pervious_logo').setAlpha(0);
        const scaleX = this.cameras.main.width / logo.width;
        const scaleY = this.cameras.main.height / logo.height;
        const scale = Math.max(scaleX, scaleY);
        logo.setScale(scale).setScrollFactor(0);

        await new Promise((resolve) => {
            this.tweens.add({
                targets: logo,
                alpha: 1,
                ease: 'Linear',
                duration: 1500,
                onComplete: () => resolve()
            });
        });
    }

    async _createPressLabel() {
        const textStyle = {
            font: `${config.width*.035}px ${config.fonts['eng']}`,
            fill: '#f0f0f0',
        };
        
        const label = this.add.text(config.width * 0.5, screenData.bottom, 'PRESS ANYWHERE TO CONTINUE', textStyle).setOrigin(0.5, 1.5).setAlpha(0);
        const clickArea = this.add.rectangle(0, 0, config.width, config.height).setOrigin(0);

        await new Promise((resolve) => {
            this.tweens.add({
                targets: label,
                alpha: 0.5,
                ease: 'Linear',
                duration: 350,
                onComplete: () => resolve()
            });
        });

        this.tweens.add({
            targets: label,
            scale: 1.15,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
            repeat: -1,
            yoyo: true,
        });

        clickArea.setInteractive();
        clickArea.on('pointerdown', () => this._click());
    }

    _langSelect(button) {
        this._click();

        setLang(button.name);
    }

    _click() {
        this.sounds.click.play({ volume: .2 });

        const nextScene = config.lang === '' ? SCENE_NAMES.SET_LANGUAGE : SCENE_NAMES.PRELOAD;
        this.scene.start(nextScene);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add('click'),
            whoosh: this.sound.add('whoosh'),
        };
    }
}