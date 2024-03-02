import { SCENE_NAMES } from '../constants';
import { getFont, config } from '../main';
import { CommonScene } from './CommonScene';

const BUTTONS_MAP = [
    {
        sprite: 'button_campaign',
        y: 0.275,
        text: 'CAMPAIGN',
        startScene: SCENE_NAMES.campaign,
    },
    {
        sprite: 'button_unlim',
        y: 0.5,
        text: 'UNLIM',
        startScene: SCENE_NAMES.game,
    },
    {
        sprite: 'button_upgrade',
        y: 0.725,
        text: 'UPGRADE',
        startScene: SCENE_NAMES.upgrade,
    },
];

export class GameTypeSelect extends CommonScene {
    constructor() {
        super(SCENE_NAMES.main);
    }

    init(){
        super.init();

        this._buttons = [];
        this._buttons_num = 0;
    }

    create() {
        this._createBG();
        this._createSounds();
        this._createButtons();
    }

    _addButtonEventListeners(button, startScene) {
        button.on('pointerover', () => button.setAlpha(1));
        button.on('pointerout', () => button.setAlpha(.75));
        button.on('pointerdown', () => this._gameSelect(button, startScene));
    }

    _createButtons() {
        BUTTONS_MAP.forEach(data => this._createButton(data));
    }

    async _createButton(data){
        this._buttons_num++;

        const button = this._createButtonSprite(data.sprite, data.y);
        this._createButtonText(button, data.text);
        await this._createButtonTweens(button);
        this._addButtonEventListeners(button, data.startScene);
    }

    _createButtonText(button, textKey) {
        const textStyle = {
            font: `${config.width*.03}px ${getFont()}`,
            fill: '#f0f0f0',
        };
        button.buttonText = this.add.text(button.x, button.y, this._getText(textKey), textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonSprite(spriteKey, y) {
        const button = this.add.sprite(config.width * 0.5, config.height * y, spriteKey)
        .setScale(5)
        .setAlpha(0)
        .setOrigin(.5)
        .setInteractive();

        this._buttons.push(button);
        return button;
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

    _gameSelect(button, startScene){
        this.sounds.click.play({ volume: .2 });

        this.tweens.add({
            targets: [button, button.buttonText],
            alpha: 0,
            scale: 7,
            ease: 'Linear',
            duration: 750,
            onComplete: () => this._startNewScene(startScene),
        });
    }

    _startNewScene(sceneName) {
        if (sceneName === SCENE_NAMES.game) {
            this.scene.start(SCENE_NAMES.game, config.unlim);
        } else {
            this.scene.start(sceneName);
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