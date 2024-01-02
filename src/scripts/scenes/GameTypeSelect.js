import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { config } from '/src/scripts/main';

export class GameTypeSelect extends CommonScene {
    constructor() {
        super(SCENE_NAMES.main);
    }

    init(){
        super.init();

        this._buttons = {};
        this._buttons_num = 0;
    }

    create() {
        this._createBG();
        this._createSounds();

        this._createButton('campaign', .275);
        this._createButton('unlim', .5);
        this._createButton('upgrade', .725);
    }

    _addButtonEventListeners(button) {
        button.on('pointerover', () => button.setAlpha(1));
        button.on('pointerout', () => button.setAlpha(.75));
        button.on('pointerdown', () => this._gameSelect(button));
    }

    async _createButton(name, y){
        this._buttons_num++;

        this._createButtonSprite(name, y)
        this._createButtonText(this._buttons[name], name);
        await this._createButtonTweens(this._buttons[name]);
        this._addButtonEventListeners(this._buttons[name]);
    }

    _createButtonText(button, text) {
        const textTitle = text.toUpperCase();
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };
        button.buttonText = this.add.text(button.x, button.y, textTitle, textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonSprite(buttonName, y) {
        this._buttons[buttonName] = this.add.sprite(config.width / 2, config.height * y, 'button_' + buttonName)
        .setScale(5)
        .setAlpha(0)
        .setOrigin(.5)
        .setInteractive();

        this._buttons[buttonName].name = buttonName;
    }

    async _createButtonTweens(button) {
        Promise.race([
            new Promise(resolve => {
                this.tweens.add({
                    targets: [ button, button.buttonText ],
                    delay: 375 * this._buttons_num,
                    alpha: .675,
                    scale: .65,
                    ease: 'Linear',
                    duration: 225,
                    onStart: () => this.sounds.whoosh.play({ volume: .33 }),
                    onComplete: () => resolve()
                })
            }),
            new Promise(resolve => {
                this.tweens.add({
                    targets: button.buttonText,
                    delay: 375 * this._buttons_num,
                    alpha: .9,
                    scale: 1,
                    ease: 'Linear',
                    duration: 225,
                    onComplete: () => resolve()
                })
            })
        ]);
    }

    _gameSelect(button){
        this.sounds.click.play({ volume: .2 });

        this.tweens.add({
            targets: [button, button.buttonText],
            alpha: 0,
            scale: 7,
            ease: 'Linear',
            duration: 750,
            onComplete: () => this._startNewScene(button.name),
        });
    }

    _startNewScene(buttonName) {
        switch (buttonName) {
            case 'campaign':
                this.scene.start(SCENE_NAMES.campain);
                break;
            case 'unlim':
                this.scene.start(SCENE_NAMES.game, config.unlim);
                break;
            case 'upgrade':
                this.scene.start(SCENE_NAMES.upgrade);
                break;
        }
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