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
        this.remaining = this.countMax;
        this.createdCount = 0;
        this.stopped = false;
        this.timer = this.scene.time.addEvent({
            delay: FIRST_ENEMY_DELAY,
            callback: () => this.tick(),
        });
    }

    tick() {
        if (this.stopped) return;
        const maxGroup = this.scene.info.isUnlim ? 1 : Math.ceil(this.scene.info.index / 3);
        const count = Phaser.Math.Between(1, Math.min(maxGroup, this.countMax - this.createdCount));
        for (let lane = 0; lane < count; lane++) this.createEnemy(lane, count);
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
    
    createEnemy(lane = 0, lanes = 1) {
        if (this.createdCount >= this.countMax) {
            this.stopTimer();
            return;
        }

        const enemy = Enemy.generate(this.scene, this.fires);
        enemy.setScale(enemy.scaleX * GAME_ACTOR_SCALE_MULTIPLIER);
        if (lanes > 1) {
            const laneHeight = screenData.height * 0.8 / lanes;
            enemy.y = screenData.top + screenData.height * 0.1 + (lane + Phaser.Math.FloatBetween(0.25, 0.75)) * laneHeight;
        }
        if (this.createdCount === 0 || enemy.flight || lanes > 1) {
            // Enter immediately instead of crossing the offscreen spawn gap.
            enemy.x = screenData.right + enemy.displayWidth * 0.5;
        }
        enemy.once(EVENTS.KILLED, this.onEnemyRemoved, this);
        this.add(enemy);
        enemy.move(this);
        this.createdCount++;
    }

    onEnemyRemoved() {
        if (this.scene.info.isUnlim) return;
        this.remaining--;
        this.emit(EVENTS.ENEMIES_REMAINING, this.remaining);
        if (this.remaining === 0) {
            this.scene.events.emit(EVENTS.ALL_ENEMIES_KILLED);
        }
    }
}
