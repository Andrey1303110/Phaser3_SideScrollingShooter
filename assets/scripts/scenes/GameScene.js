class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init(){

    }

    create() {
        this.setEndpoints();
        this.createBG();
        this.cursors = this.input.keyboard.createCursorKeys();
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

    update(){
        this.player.move();
        this.sceneBG.tilePositionX += this.sceneBG.width / 10000 * this.speed;
    }

    createBG(){
        this.sceneBG = this.add.tileSprite(0, 0, config.width, config.height, 'scene_bg').setOrigin(0);
        this.speed = 25;
    }

    createPlayer(){
        this.player = new Player(this, this.screenEndpoints.left, config.height / 2);
    }
}