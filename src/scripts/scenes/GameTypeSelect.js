import { SCENE_NAMES } from '../constants';
import { getFontName, config } from '../main';
import { CommonScene } from './CommonScene';

const BUTTONS_MAP = [
    {
        sprite: 'button_campaign',
        y: 0.275,
        text: 'CAMPAIGN',
        startScene: SCENE_NAMES.CAMPAIGN,
    },
    {
        sprite: 'button_unlim',
        y: 0.5,
        text: 'UNLIM',
        startScene: SCENE_NAMES.GAME,
    },
    {
        sprite: 'button_upgrade',
        y: 0.725,
        text: 'UPGRADE',
        startScene: SCENE_NAMES.UPGRADE,
    },
];

export class GameTypeSelect extends CommonScene {
    constructor() {
        super(SCENE_NAMES.MAIN);
    }

    init(){
        super.init();

        this._buttons = [];
    }

    create() {
        this._createBg();
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
        const button = this._createButtonSprite(data.sprite, data.y);
        this._createButtonText(button, data.text);
        await this._createButtonTweens(button);
        this._addButtonEventListeners(button, data.startScene);
    }

    _createButtonText(button, textKey) {
        const textStyle = {
            font: `${config.width * .03}px ${getFontName()}`,
            fill: '#f0f0f0',
        };
        button.buttonText = this.add.text(button.x, button.y, this._getText(textKey), textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonSprite(spriteKey, y) {
        const button = this.add.image(this._center.x, config.height * y, spriteKey)
            .setOrigin(.5)
            .setScale(5)
            .setAlpha(0)
            .setInteractive();

        this._buttons.push(button);
        return button;
    }

    async _createButtonTweens(button) {
        const delay = 375 * this._buttons.length;
        Promise.all([
            new Promise(resolve => {
                this.tweens.add({
                    targets: [ button, button.buttonText ],
                    delay,
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
                    delay,
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
        if (sceneName === SCENE_NAMES.GAME) {
            this.scene.start(SCENE_NAMES.GAME, config.unlim);
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