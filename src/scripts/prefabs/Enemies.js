import { Fires } from "./Fires";
import { Enemy } from "./Enemy";
import { EVENTS, GAME_ACTOR_SCALE_MULTIPLIER } from "../constants";

export class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.scene = scene;
        this.fires = new Fires(this.scene);
        this.countMax = this.scene.info.isUnlim ? Infinity : this.scene.info.enemies;
        this.killed = 0;
        this.createdCount = 0;
        this.stopped = false;
        this.timer = this.scene.time.addEvent({
            delay: this.scene.info.enemiesDelay,
            loop: true,
            callback: () => this.tick(),
        });
    }

    tick() {
        this.scene.time.addEvent({
            delay: this.scene.info.enemiesDelay * (Phaser.Math.Between(50, 150) * 0.01),
            callback: () => this.createEnemy(),
        });
    }

    stopTimer(){
        this.stopped = true;
        this.timer.remove();
    }
    
    createEnemy() {
        if (this.stopped) return;
        if (this.createdCount >= this.countMax) {
            this.stopTimer();
            return;
        }

        const enemy = Enemy.generate(this.scene, this.fires);
        enemy.setScale(enemy.scaleX * GAME_ACTOR_SCALE_MULTIPLIER);
        enemy.on(EVENTS.KILLED, this.onEnemyKilled, this);
        this.add(enemy);
        enemy.move();
        this.createdCount++;
    }

    onEnemyKilled() {
        this.killed++;
        if (this.killed >= this.countMax) {
            this.scene.events.emit(EVENTS.ALL_ENEMIES_KILLED);
        }
    }
}
