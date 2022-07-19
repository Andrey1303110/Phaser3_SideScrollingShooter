var player;
class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init() {
        this.currentLevel = 1;
    }

    create() {
        this.createBG();
        this.getMaxEnemyHeightFrame();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createPlayer();
        this.enemies = new Enemies(this);
    }

    update() {
        this.sceneBG.tilePositionX += this.sceneBG.width / 10000 * this.speed;
        this.player.move();
        this.player.shooting();
    }

    createBG() {
        this.sceneBG = this.add.tileSprite(0, 0, config.width, config.height, 'scene_bg').setOrigin(0);
        this.speed = config.levels[this.currentLevel].enemyVelocity * .075;
    }

    createPlayer() {
        this.player = new Player({scene: this});
        player = this.player;
    }

    getMaxEnemyHeightFrame(){
        let max_frame_height = 0;
        let frames = this.textures.list.enemy.frames;

        Object.keys(frames).forEach(function(key) {
            if (frames[key].cutHeight > max_frame_height) {
                max_frame_height = frames[key].cutHeight;
            }
        });
        this.maxEnemyFrameHeight = max_frame_height;
    }
}