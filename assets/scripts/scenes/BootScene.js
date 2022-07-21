class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    init() {
        setEndpoints();
    }

    preload() {
        for (let i = 0; i <= 7; i++) {
            console.log(`scene_bg_${i}`);
            this.load.image(`scene_bg_${i}`, `assets/sprites/background${i}.png`);
        }
    }

    create() {
        this.scene.start('Preload');
    }
}