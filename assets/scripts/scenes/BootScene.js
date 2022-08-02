class BootScene extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    init() {
        setEndpoints();
    }

    preload() {
        this.load.image('bg', 'assets/sprites/bg.png');
    }

    create() {
        this.scene.start('Preload');
    }
}