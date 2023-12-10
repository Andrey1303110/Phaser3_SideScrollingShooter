import { SCENE_NAMES } from "../constants";
import { config, setEndpoints } from "/src/scripts/main";

export class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_NAMES.boot);
    }

    init() {
        setEndpoints();
    }

    preload() {
        this.load.image('bg', './assets/sprites/bg.png');
        this.load.image('pervious_logo', './assets/sprites/pervious_logo.png');
    }

    create() {
        this._createBG();

        this._pervious_logo = this.add.sprite(config.width / 2, config.height / 2, 'pervious_logo').setAlpha(0);
        const scaleX = this.cameras.main.width / this._pervious_logo.width;
        const scaleY = this.cameras.main.height / this._pervious_logo.height;
        const scale = Math.max(scaleX, scaleY);
        this._pervious_logo.setScale(scale).setScrollFactor(0);

        this.tweens.add({
            delay: 250,
            targets: this._pervious_logo,
            alpha: 1,
            ease: 'Linear',
            duration: 1750,
            yoyo: true,
            onComplete: () => {
                this.scene.start(SCENE_NAMES.preload);
            }
        })
    }

    // TODO move to common class
    _createBG() {
        this._sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / this._sceneBG.width;
        const scaleY = this.cameras.main.height / this._sceneBG.height;
        const scale = Math.max(scaleX, scaleY);
        this._sceneBG.setScale(scale).setScrollFactor(0);
    }
}