class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    init() {
        setEndpoints();
    }

    preload() {
        for (let i = 0; i <= 12; i++) {
            this.load.image(`scene_bg_${i}`, `assets/sprites/background${i}.png`);
        }
    }

    create() {
        this.scene.start('Preload');
    }
}