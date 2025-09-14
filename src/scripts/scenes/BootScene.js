import { screenData, setEndpoints, tweenPromise } from '../Utils';
import { FONTS, SCENE_NAMES } from '../constants';
import { config } from '../main';
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
    
        this.load.image('boot_scene_bg', './assets/sprites/boot_scene_bg.png');
        this.load.image('eng', './assets/sprites/eng.png');
        this.load.image('ukr', './assets/sprites/ukr.png');
        this.load.image('button', './assets/sprites/button_lang.png');

        this.load.audio('click', `./assets/sounds/click.mp3`);
        this.load.audio('whoosh', `./assets/sounds/whoosh.mp3`);

        this.load.json('initial_texts', `./assets/texts/initial_texts.json`);
    }

    _createLogoAnimation() {
        const logo = this.add.image(this._centerDot.x, this._centerDot.y, 'boot_scene_bg').setAlpha(0);
        const scaleX = this.cameras.main.width / logo.width;
        const scaleY = this.cameras.main.height / logo.height;
        const scale = Math.max(scaleX, scaleY);
        logo.setScale(scale).setScrollFactor(0);

        return tweenPromise(this, {
            targets: logo,
            alpha: 1,
            ease: 'Linear',
            duration: 1500,
        });
    }

    _createPressLabel() {
        const textStyle = {
            font: `${config.width * 0.035}px ${FONTS['eng']}`,
            fill: '#f0f0f0',
        };
        
        const text = this.scene.scene.cache.json.get('initial_texts')['Press'];
        const label = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.05, text, textStyle).setOrigin(0.5, 1).setAlpha(0);
        const clickArea = this.add.rectangle(0, 0, config.width, config.height).setOrigin(0);
        const onComplete = () => this._launchPressLabelCTA(label, clickArea);

        return tweenPromise(this, {
            targets: label,
            alpha: 0.5,
            ease: 'Linear',
            duration: 350,
            onComplete,
        });
    }

    _launchPressLabelCTA(label, clickArea) {
        clickArea.setInteractive();
        clickArea.on('pointerdown', () => this._click());

        this.tweens.add({
            targets: label,
            scale: 1.15,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
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
            click: this.sound.add('click'),
            whoosh: this.sound.add('whoosh'),
        };
    }
}