class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init(){

    }

    create() {
        this.createBG();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createPlayer();
        this.enemies = new Enemies(this);
        this.enemies.createEnemy();
        this.enemies.createEnemy();
        this.enemies.createEnemy();
    }

    update(){
        this.sceneBG.tilePositionX += this.sceneBG.width / 10000 * this.speed;
        this.player.move();
    }

    createBG(){
        this.sceneBG = this.add.tileSprite(0, 0, config.width, config.height, 'scene_bg').setOrigin(0);
        this.speed = 25;
    }

    createPlayer(){
        this.player = new Player(this, screenEndpoints.left, config.height / 2);
    }
}