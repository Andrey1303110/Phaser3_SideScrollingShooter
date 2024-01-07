import { SCENE_NAMES } from '../constants';
import { getSceneTexts } from '../main';
import { config, setEndpoints, screenEndpoints } from '/src/scripts/main';

export class CommonScene extends Phaser.Scene {
    constructor(name) {
        super(name);

        this.name = name;
    }

    init() {
        if(!this.scale.isFullscreen) {
            switch (this.scene.key) {
                case SCENE_NAMES.boot:
                case SCENE_NAMES.preload:
                    return;
            }
            this.scale.startFullscreen();
        }

        setEndpoints();
        this.game.sound.stopAll();

        this._createTranslations();
    }

    preload() {
        this.load.image('bg', './assets/sprites/bg.png');
    }

    _createAvailableMoney(){
        const style = {
            font: `${config.width * .031}px ${config.fonts[config.lang]}`,
            fill: '#FFFFFF',
        };

        this.moneyIcon = this.add.sprite(screenEndpoints.right - config.height * .075, screenEndpoints.top + config.height * .075, 'ruby')
            .setScale(.25)
            .setInteractive()
            .on('pointerdown', ()=> this.scene.start(SCENE_NAMES.upgrade));
        this.moneyText = this.add.text(this.moneyIcon.x - this.moneyIcon.displayWidth, this.moneyIcon.y, config.money, style).setOrigin(.5).setAlpha(1);
    }

    _createBG() {
        const bg = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
    }

    _createTranslations() {
        this._translationTexts = getSceneTexts(this);
    }

    _getText(key) {
        return this._translationTexts[key];
    }
}