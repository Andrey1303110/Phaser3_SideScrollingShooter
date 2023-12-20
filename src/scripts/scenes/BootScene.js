import { SCENE_NAMES } from "../constants";
import { CommonScene } from "./CommonScene";
import { config } from "/src/scripts/main";

export class BootScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.boot);
    }

    preload() {
        super.preload();
        this.load.image('pervious_logo', './assets/sprites/pervious_logo.png');
    }

    create() {
        this._createBG();

        const logo = this.add.sprite(config.width / 2, config.height / 2, 'pervious_logo').setAlpha(0);
        const scaleX = this.cameras.main.width / logo.width;
        const scaleY = this.cameras.main.height / logo.height;
        const scale = Math.max(scaleX, scaleY);
        logo.setScale(scale).setScrollFactor(0);

        this.tweens.add({
            delay: 250,
            targets: logo,
            alpha: 1,
            ease: 'Linear',
            duration: 1750,
            yoyo: true,
            onComplete: () => {
                this.scene.start(SCENE_NAMES.preload);
            }
        })
    }
}