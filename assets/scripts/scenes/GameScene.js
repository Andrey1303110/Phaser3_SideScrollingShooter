class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    create() {
        this.createBG();
    }

    createBG(){
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'scene_bg');
    }
}