import { delayInMSec, screenData, setEndpoints, tweenPromise } from '../Utils';
import { FONTS, SCENE_NAMES } from '../constants';
import { config } from '../main';
import { CommonScene } from './CommonScene';

export class SetLanguageScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.SET_LANGUAGE);
    }

    init(){
        super.init();
        setEndpoints();

        this._buttons = {};
    }

    async create() {
        this._createBg();
        this._createSounds();
        await this._createButtons();
        await this._createPressLabel();
    }

    preload() {
        super.preload();

        this.load.image('eng', './assets/sprites/eng.png');
        this.load.image('ukr', './assets/sprites/ukr.png');
        this.load.image('button', './assets/sprites/button_lang.png');

        this.load.audio('click', `./assets/sounds/click.mp3`);
        this.load.audio('whoosh', `./assets/sounds/whoosh.mp3`);
    }

    _addButtonEventListeners(button) {
        button.on('pointerover', () => button.setAlpha(1));
        button.on('pointerout', () => button.setAlpha(0.75));
        button.on('pointerdown', () => this._langSelect(button));
    }

    async _createButtons() {
        const delay = 350;
        await delayInMSec(this.scene, delay);

        await this._createButton('ukr', 0.35);
        await this._createButton('eng', 0.65);
    }

    async _createButton(name, y){
        this._createButtonSprite(name, y)
        this._createButtonText(this._buttons[name], name);
        this._createButtonFlagSprite(this._buttons[name], name);
        await this._createButtonTweens(this._buttons[name]);
        this._addButtonEventListeners(this._buttons[name]);
    }

    _createButtonText(button, name) {
        let textTitle;
        switch (name) {
            case 'ukr':
                textTitle = 'UKRAINIAN';
                break;
            case 'eng':
                textTitle = 'ENGLISH';
                break;
        }

        const textStyle = {
            font: `${config.width * 0.04}px ${FONTS['eng']}`,
            fill: '#f0f0f0',
        };
        button.buttonText = this.add.text(button.x - config.width * 0.06, button.y, textTitle, textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonFlagSprite(button, name) {
        button.buttonFlag = this.add.image(button.x + config.width * 0.095, button.y, name).setAlpha(0);
    }

    _createButtonSprite(buttonName, y) {
        this._buttons[buttonName] = this.add.image(config.width * 0.5, config.height * y, 'button')
            .setOrigin(0.5)
            .setScale(5)
            .setAlpha(0)
            .setInteractive();

        this._buttons[buttonName].name = buttonName;
    }

    async _createButtonTweens(button) {
        this.sounds.whoosh.play({ volume: 0.33 });

        const duration = 300;
        return Promise.all([
            tweenPromise(this, {
                targets: [ button, button.buttonText ],
                alpha: 0.675,
                scale: 0.85,
                ease: 'Linear',
                duration,
            }),
            tweenPromise(this, {
                targets: button.buttonFlag,
                alpha: 0.675,
                scale: 0.4,
                ease: 'Linear',
                duration,
            }),
        ]);
    }

    _createPressLabel() {
        const textStyle = {
            font: `${config.width * 0.035}px ${FONTS['eng']}`,
            fill: '#f0f0f0',
        };
        
        const text = this.scene.scene.cache.json.get('initial_texts')['SelectLanguage'];
        const label = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.025, text, textStyle).setOrigin(0.5, 1).setAlpha(0);

        return tweenPromise(this, {
            targets: label,
            alpha: 0.5,
            ease: 'Linear',
            duration: 350,
            onComplete: () => this._playLabelCTA(label),
        });
    }

    _playLabelCTA(label) {
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

    _langSelect(button) {
        this._onButtonClick();
        this.model.setLang(button.name);
    }

    _onButtonClick() {
        this.sounds.click.play({ volume: 0.2 });
        this.scene.start(SCENE_NAMES.PRELOAD);
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