import { config, setEndpoints } from "../main.js";

export class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    init() {
        setEndpoints();
    }

    preload() {
        this.load.image('bg', 'assets/sprites/bg.png');
        this.load.image('pervious_logo', 'assets/sprites/pervious_logo.png');
    }

    create() {
        this.createBG();

        this.pervious_logo = this.add.sprite(config.width / 2, config.height / 2, 'pervious_logo').setAlpha(0);
        const scaleX = this.cameras.main.width / this.pervious_logo.width;
        const scaleY = this.cameras.main.height / this.pervious_logo.height;
        const scale = Math.max(scaleX, scaleY);
        this.pervious_logo.setScale(scale).setScrollFactor(0);

        this.tweens.add({
            delay: 250,
            targets: this.pervious_logo,
            alpha: 1,
            ease: 'Linear',
            duration: 1750,
            yoyo: true,
            onComplete: () => {
                this.scene.start('Preload');
            }
        })
    }

    createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / this.sceneBG.width;
        const scaleY = this.cameras.main.height / this.sceneBG.height;
        const scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }
}