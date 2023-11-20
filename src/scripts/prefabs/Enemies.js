import { Fires } from '/src/scripts/prefabs/Fires.js';
import { Enemy } from '/src/scripts/prefabs/Enemy.js';

export class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.fires = new Fires(this.scene);
        this.countMax = this.scene.info.enemies;
        this.killed = 0;
        this.createdCount = 0;
        this.timer = this.scene.time.addEvent({
            delay: this.scene.info.enemiesDelay,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });
    }

    tick() {
        this.scene.time.addEvent({
            delay: this.scene.info.enemiesDelay * (Phaser.Math.Between(50, 150) * .01),
            callback: this.createEnemy,
            callbackScope: this,
        });
    }

    stopTimer(){
        this.timer.remove();
    }
    
    createEnemy() {
        if (this.countMax > this.createdCount) {
            const enemy = Enemy.generate(this.scene, this.fires);
            enemy.on('killed', this.onEnemyKilled, this);
            this.add(enemy);
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
