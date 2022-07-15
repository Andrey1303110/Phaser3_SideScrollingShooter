class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, spriteName, spriteNum){
        super(scene, x, y, spriteName, spriteNum);
        this.init();
    }

    static generate(scene) {
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight/2, screenEndpoints.bottom - scene.maxEnemyFrameHeight/2);
        const spriteNum = Phaser.Math.Between(1, 4);
        const spriteName = 'enemy';
        return new Enemy(scene, x, y, spriteName, spriteName + spriteNum);
    }

    init(){
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.velocity = config.levels[this.scene.currentLevel].enemyVelocity;
        this.move();
    }

    move(){
        this.body.setVelocityX(this.velocity * -1);
    }
}
