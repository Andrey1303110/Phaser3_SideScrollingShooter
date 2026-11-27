import { TIMING } from '../timing';
import { Fires } from "./Fires";
import { Enemy } from "./Enemy";
import { EVENTS, GAME_ACTOR_SCALE_MULTIPLIER } from "../constants";
import { screenData } from "../Utils";

const FIRST_ENEMY_DELAY = TIMING.ENEMIES.DEFAULT_FIRST_ENEMY_DELAY_MS;

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
            delay: FIRST_ENEMY_DELAY,
            callback: () => this.tick(),
        });
    }

    tick() {
        if (this.stopped) return;
        this.createEnemy();
        if (this.createdCount >= this.countMax) {
            this.stopTimer();
            return;
        }
        this.timer = this.scene.time.addEvent({
            delay: this.scene.info.enemiesDelay * (Phaser.Math.Between(TIMING.ENEMIES.SPAWN_INTERVAL_MIN_PERCENT, TIMING.ENEMIES.SPAWN_INTERVAL_MAX_PERCENT) * TIMING.ENEMIES.PERCENT_TO_RATIO),
            callback: () => this.tick(),
        });
    }

    stopTimer(){
        this.stopped = true;
        this.timer.remove();
    }
    
    createEnemy() {
        if (this.createdCount >= this.countMax) {
            this.stopTimer();
            return;
        }

        const enemy = Enemy.generate(this.scene, this.fires);
        enemy.setScale(enemy.scaleX * GAME_ACTOR_SCALE_MULTIPLIER);
        if (this.createdCount === 0 || enemy.flight) {
            // Enter immediately instead of crossing the offscreen spawn gap.
            enemy.x = screenData.right + enemy.displayWidth * 0.5;
        }
        enemy.on(EVENTS.KILLED, this.onEnemyKilled, this);
        this.add(enemy);
        enemy.move(this);
        this.createdCount++;
    }

    onEnemyKilled() {
        this.killed++;
        if (this.killed >= this.countMax) {
            this.scene.events.emit(EVENTS.ALL_ENEMIES_KILLED);
        }
    }
}
