class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.fires = new Fires(this.scene);
        this.countMax = config.Levels[scene.currentLevel].enemies;
        this.killed = 0;
        this.createdCount = 0;
        this.timer = this.scene.time.addEvent({
            delay: config.Levels[scene.currentLevel].enemiesDelay,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });
    }

    tick() {
        if (this.createdCount < this.countMax) {
            this.scene.time.addEvent({
                delay: config.Levels[this.scene.currentLevel].enemiesDelay * (Phaser.Math.Between(5, 15) * .1),
                callback: this.createEnemy,
                callbackScope: this,
            });

        } else {
            this.timer.remove();
        }
    }

    stopTimer(){
        this.timer.remove();
    }

    createEnemy() {
        this.createdCount++;
        let enemy = this.getFirstDead();

        if (!enemy) {
            enemy = Enemy.generate(this.scene, this.fires);
            enemy.on('killed', this.onEnemyKilled, this);
            this.add(enemy);
        } else {
            enemy.reset();
        }
        enemy.move();
    }

    onEnemyKilled() {
        this.killed++;
        if (this.killed >= this.countMax) {
            this.scene.events.emit('enemies-killed');
        }
    }
}
