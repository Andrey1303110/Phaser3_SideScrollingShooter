import { SCENE_NAMES } from '../constants';
import { getFont, getSceneTexts, config, screenData } from '../main';

export class CommonScene extends Phaser.Scene {
    constructor(name) {
        super(name);

        this.name = name;
    }

    init() {
        this._createCenter();

        if (!this.scale.isFullscreen) {
            switch (this.scene.key) {
                case SCENE_NAMES.boot:
                case SCENE_NAMES.preload:
                    return;
            }
            this.scale.startFullscreen();
        }

        // setEndpoints();
        //TODO remove endpoints
        this._createTranslations();
    }

    _createCenter() {
        this._center = {
            x: this.scale.width * 0.5,
            y: this.scale.height * 0.5,
        }
    }

    preload() {
        this.load.image('bg', './assets/sprites/bg.png');
    }

    _createAvailableMoney(){
        const style = {
            font: `${config.width * .031}px ${getFont()}`,
            fill: '#FFFFFF',
        };

        this._moneyIcon = this.add.image(screenData.right - config.height * .075, screenData.top + config.height * .075, 'ruby')
            .setScale(.25)
            .setInteractive()
            .on('pointerdown', ()=> this.scene.start(SCENE_NAMES.upgrade));
        this._moneyValueText = this.add.text(this._moneyIcon.x - this._moneyIcon.displayWidth, this._moneyIcon.y, config.money, style)
            .setOrigin(.5)
            .setAlpha(1);
    }

    _createBg() {
        const bg = this.add.image(this._center.x, this._center.y, 'bg')
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
            .on('pointerdown', () => {
                this.scene.start(SCENE_NAMES.main);
                this.sounds.click.play({ volume: .2 });
            });
    }

    _createTranslations() {
        this._translationTexts = getSceneTexts(this);
    }

    _getText(key) {
        return this._translationTexts[key];
    }
}