class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.fires = new Fires(this.scene);
        this.countMax = config.levels[scene.currentLevel].enemies;
        this.killed = 0;
        this.createdCount = 1;
        this.timer = this.scene.time.addEvent({
            delay: config.levels[scene.currentLevel].enemiesDelay,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });
    }

    tick(){
        if (this.createdCount < this.countMax) {
            this.scene.time.addEvent({
                delay: config.levels[this.scene.currentLevel].enemiesDelay * (Math.random() + 1),
                callback: this.createEnemy,
                callbackScope: this,
            });

        } else {
            this.timer.remove();
        }
    }

    createEnemy(){
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
    }

    onEnemyKilled(){
        this.killed++;
        if(this.killed >= this.countMax) {
            this.scene.events.emit('enemies-killed');
        }
    }
}
