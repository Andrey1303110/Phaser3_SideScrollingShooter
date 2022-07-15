class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    init() {
        setEndpoints();
    }

    preload() {
        this.load.image('scene_bg', 'assets/sprites/background.png');
    }

    create() {
        this.scene.start('Preload');
    }
}