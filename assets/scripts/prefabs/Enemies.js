class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super();
        this.scene = scene;
        this.count = config.levels[scene.currentLevel].enemies;
        this.timer = this.scene.time.addEvent({
            delay: config.levels[scene.currentLevel].enemiesDelay,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });
    }

    tick(){
        if (this.getLength() < this.count) {
            this.createEnemy();
        } else {
            this.timer.remove();
        }
    }

    createEnemy(){
        let enemy = Enemy.generate(this.scene);
        this.add(enemy);
        enemy.move();
    }
}
