class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, spriteName, spriteNum){
        super(scene, x, y, spriteName, spriteNum);
        this.init();
    }

    static generateAttr(scene){
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight/2, screenEndpoints.bottom - scene.maxEnemyFrameHeight/2);
        const spriteNum = Phaser.Math.Between(1, 4);
        const spriteName = 'enemy';
        return {x, y, spriteNum, spriteName};
    }

    static generate(scene) {
        const data = Enemy.generateAttr(scene);
        return new Enemy(scene, data.x, data.y, data.spriteName, data.spriteName + data.spriteNum);
    }

    init(){
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.velocity = config.levels[this.scene.currentLevel].enemyVelocity;
        this.move();
        this.scene.events.on('update', this.update, this);
    }

    reset(){
        const data = Enemy.generateAttr(this.scene);
        this.x = data.x;
        this.y = data.y;
        this.setFrame(data.spriteName + data.spriteNum);

        this.setAlive(true);
    }

    update(){
        if (this.active && this.x < -this.displayWidth){
            this.setAlive(false);
        }
    }

    setAlive(status){
        this.body.enable = status;
        this.setVisible(status)
        this.setActive(status)
    }

    move(){
        this.body.setVelocityX(this.velocity * -1);
    }
}
