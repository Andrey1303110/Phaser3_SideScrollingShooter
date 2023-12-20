import { config, setEndpoints } from "/src/scripts/main";

export class CommonScene extends Phaser.Scene {
    constructor(name) {
        super(name);
    }

    init() {
        if(!this.scale.isFullscreen) this.scale.startFullscreen();

        this.game.sound.stopAll();
        setEndpoints();
    }

    preload() {
        this.load.image('bg', './assets/sprites/bg.png');
    }

    _createBG() {
        const bg = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
    }
}