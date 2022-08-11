class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.fires = new Fires(this.scene);
        this.countMax = config.Levels[scene.currentLevel-1].enemies;
        this.killed = 0;
        this.createdCount = 0;
        this.timer = this.scene.time.addEvent({
            delay: config.Levels[scene.currentLevel-1].enemiesDelay,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });
    }

    tick() {
        this.scene.time.addEvent({
            delay: config.Levels[this.scene.currentLevel-1].enemiesDelay * (Phaser.Math.Between(50, 150) * .01),
            callback: this.createEnemy,
            callbackScope: this,
        });
    }

    stopTimer(){
        this.timer.remove();
    }

    createEnemy() {
        if (this.countMax > this.createdCount) {
            let enemy = this.getFirstDead();

            if (!enemy) {
                enemy = Enemy.generate(this.scene, this.fires);
                enemy.on('killed', this.onEnemyKilled, this);
                this.add(enemy);
            } else {
                enemy.reset();
            }
            enemy.move();
            this.createdCount++;
        } else {
            this.timer.remove();
        }
    }

    onEnemyKilled() {
        this.killed++;
        if (this.killed >= this.countMax) {
            this.scene.events.emit('enemies-killed');
        }
    }
}
