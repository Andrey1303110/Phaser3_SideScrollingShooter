import { SCENE_NAMES } from '../constants';
import { screenEndpoints, setEndpoints, setLang } from '../main';
import { CommonScene } from './CommonScene';
import { config } from '/src/scripts/main';

export class BootScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.boot);
    }

    init(){
        super.init();
        setEndpoints();

        this._buttons = {};
        this._buttons_num = 0;
    }

    async create() {
        this._createBG();
        this._createSounds();

        await this._createLogoAnimation();

        if (localStorage.getItem('lang')) this._createPressLabel();
        else this._createButtons();
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

    _createButtons() {
        this._createButton('ukr', .35);
        this._createButton('eng', .65);
    }

    async _createButton(name, y){
        this._buttons_num++;

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
            font: `${config.width*.04}px ${config.fonts['eng']}`,
            fill: '#f0f0f0',
        };
        button.buttonText = this.add.text(button.x - config.width * 0.06, button.y, textTitle, textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonFlagSprite(button, name) {
        button.buttonFlag = this.add.sprite(button.x + config.width * 0.095, button.y, name)
        .setAlpha(0);
    }

    _createButtonSprite(buttonName, y) {
        this._buttons[buttonName] = this.add.sprite(config.width / 2, config.height * y, 'button')
        .setScale(5)
        .setAlpha(0)
        .setOrigin(.5)
        .setInteractive();

        this._buttons[buttonName].name = buttonName;
    }

    async _createButtonTweens(button) {
        await new Promise(resolve => {
            this.tweens.add({
                targets: [ button, button.buttonText ],
                delay: 375 * this._buttons_num,
                alpha: .675,
                scale: .85,
                ease: 'Linear',
                duration: 225,
                onStart: () => this.sounds.whoosh.play({ volume: .33 }),
                onComplete: () => resolve()
            });
            this.tweens.add({
                targets: button.buttonFlag,
                delay: 375 * this._buttons_num,
                alpha: .675,
                scale: .4,
                ease: 'Linear',
                duration: 225,
                onStart: () => this.sounds.whoosh.play({ volume: .33 }),
                onComplete: () => resolve()
            })
        })
    }

    async _createLogoAnimation() {
        const logo = this.add.sprite(config.width / 2, config.height / 2, 'pervious_logo').setAlpha(0);
        const scaleX = this.cameras.main.width / logo.width;
        const scaleY = this.cameras.main.height / logo.height;
        const scale = Math.max(scaleX, scaleY);
        logo.setScale(scale).setScrollFactor(0);

        const yoyo = localStorage.getItem('lang') ? false : true;

        await new Promise((resolve) => {
            this.tweens.add({
                targets: logo,
                alpha: 1,
                ease: 'Linear',
                duration: 1750,
                yoyo,
                onComplete: () => resolve()
            });
        });
    }

    async _createPressLabel() {
        const textStyle = {
            font: `${config.width*.035}px ${config.fonts['eng']}`,
            fill: '#f0f0f0',
        };
        
        const label = this.add.text(config.width / 2, screenEndpoints.bottom, 'PRESS ANYWHERE TO CONTINUE', textStyle).setOrigin(0.5, 1.5).setAlpha(0);
        const cliackArea = this.add.rectangle(0, 0, config.width, config.height).setOrigin(0);

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

        cliackArea.setInteractive();
        cliackArea.on('pointerdown', () => this._click());
    }

    _langSelect(button) {
        this._click();

        setLang(button.name);
    }

    _click() {
        this.sounds.click.play({ volume: .2 });
        this.scene.start(SCENE_NAMES.preload);
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