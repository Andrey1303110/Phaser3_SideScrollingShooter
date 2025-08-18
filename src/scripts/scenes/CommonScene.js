import { GameModel } from '../GameModel';
import { getFontName, getSceneTexts, screenData, setEndpoints } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { config } from '../main';

export class CommonScene extends Phaser.Scene {
    constructor(name) {
        super(name);
        window[`${name}Scene`] = this; // todo remove

        this.name = name;
        this.model = GameModel.getInstance();
    }

    init() {
        this._createCenterDot();

        if (!this.scale.isFullscreen) {
            switch (this.scene.key) {
                case SCENE_NAMES.BOOT:
                case SCENE_NAMES.DISCLAIMER:
                case SCENE_NAMES.SET_LANGUAGE:
                case SCENE_NAMES.PRELOAD:
                    return;
            }
            this.scale.startFullscreen();
        }

        setEndpoints();
        this._createTranslations();
    }

    _createCenterDot() {
        this._centerDot = {
            x: this.scale.width * 0.5,
            y: this.scale.height * 0.5,
        }
    }

    preload() {
        this.load.image('bg', './assets/sprites/bg.png');
    }

    _createAvailableMoney(){
        const style = {
            font: `${config.width * 0.038}px ${getFontName()}`,
            fill: '#FFFFFF',
        };

        this._moneyIcon = this.add.image(screenData.right - config.height * 0.075, screenData.top + config.height * 0.075, 'ruby')
            .setScale(.25)
            .setAlpha(0)
            .setInteractive()
            .on('pointerdown', () => this._onMoneyButtonClick());
        this._moneyValueText = this.add.text(this._moneyIcon.x - this._moneyIcon.displayWidth, this._moneyIcon.y, this.model.money, style)
            .setOrigin(.5)
            .setAlpha(0);

        this._addAvailableMoneyTween();
    }

    async _addAvailableMoneyTween() {
        return new Promise(resolve => {
            this.scene.scene.tweens.add({
                targets: [this._moneyIcon, this._moneyValueText],
                alpha: 0.85,
                ease: 'Linear',
                duration: 350,
                onComplete: () => resolve(),
            });
        });
    }

    _createBg() {
        const bg = this.add.image(this._centerDot.x, this._centerDot.y, 'bg')
            .setAlpha(.925)
            .setOrigin(.5)
            .setInteractive();

        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
    }

    _createReturnButton() {
        const button = this.add.image(screenData.left + config.width * 0.03, screenData.top + config.height * 0.05, 'return')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', () => this._onReturnButtonClick());
    }

    _onReturnButtonClick() {
        this.scene.start(SCENE_NAMES.MAIN_MENU);
        this.sounds.click.play({ volume: .2 });
    }

    _onMoneyButtonClick() {
        this.scene.start(SCENE_NAMES.UPGRADE);
    }

    _createTranslations() {
        this._translationTexts = getSceneTexts(this);
    }

    _getText(key) {
        return this._translationTexts[key];
    }
}