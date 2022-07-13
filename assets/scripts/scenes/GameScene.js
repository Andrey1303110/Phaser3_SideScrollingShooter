class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    create() {
        this.setEndpoints();
        this.createBG();
        this.createPlayer();
    }

    setEndpoints() {
        if (document.body.clientWidth >= document.body.clientHeight) {
            if (document.body.clientWidth / document.body.clientHeight < 16 / 9) {
                this.screenEndpoints = {
                    left: (config.width / 2) - document.body.clientWidth / 2 * (config.height / document.body.clientHeight) + (document.body.clientWidth * .1),
                    right: (config.width / 2) + document.body.clientWidth / 2 * (config.height / document.body.clientHeight) - (document.body.clientWidth * .1),
                    no_margin_left: (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
                    no_margin_right: (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
                };
            }
            else {
                this.screenEndpoints = {
                    left: (config.width * .075),
                    right: config.width - (config.width * .075),
                    no_margin_left: 0,
                    no_margin_right: config.width,
                };
            }
        }
        else {
            this.screenEndpoints = {
                left: (config.width / 2) - document.body.clientWidth / 2 * (config.height / document.body.clientHeight) + (document.body.clientWidth * .1),
                right: (config.width / 2) + document.body.clientWidth / 2 * (config.height / document.body.clientHeight) - (document.body.clientWidth * .1),
                no_margin_left: (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
                no_margin_right: (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
            };
        }
    }

    createBG(){
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'scene_bg');
    }

    createPlayer(){
        this.player = new Player(this, this.screenEndpoints.left, config.height / 2);
    }
}