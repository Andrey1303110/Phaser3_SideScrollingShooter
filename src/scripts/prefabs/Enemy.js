import { TIMING } from '../timing';
import { screenData } from "../Utils";
import { ENEMIES } from "../constants";
import { MovableObject } from "./MovableObject";
import { HelicopterRotors } from "./HelicopterRotors";
import { HelicopterFlight } from "./HelicopterFlight";
import { AircraftEngines } from './AircraftEngines';

export class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenData.right + screenData.width * 0.25;
        const y = Phaser.Math.Between(screenData.top + screenData.height * 0.1, screenData.bottom - screenData.height * 0.1);

        const configs = Object.values(ENEMIES).filter(enemy => enemy.entryLevel <= scene.info.index);
        const config = configs[Phaser.Math.Between(0, configs.length-1)];
        const frame = String(Phaser.Math.Between(1, config.frames));

        return { x, y, config, frame };
    }

    static generate(scene, fires) {
        const { x, y, frame, config } = Enemy.generateAttr(scene);
        return new Enemy({ scene, fires, x, y, frame, ...config });
    }

    init(data) {
        super.init(data);
        this._setInitialData(data);
        this._setWeapon(data);
        if (data.texture === ENEMIES.HELICOPTER.texture) {
            const flightConfig = this.scene.info.helicopter;
            this.velocity = -flightConfig.speed;
            this.weapon.reload = flightConfig.rocketInterval;
            this.flight = new HelicopterFlight(this, flightConfig);
            this.rotors = new HelicopterRotors(this.scene, this);
        } else {
            this._addTimer();
            if (data.texture === ENEMIES.STRATEGIC_JET.texture) {
                this.engines = new AircraftEngines(this.scene, this);
            }
        }
    }

    move(group) {
        if (this.flight) this.flight.start(group);
        else super.move();
    }

    update(time, delta) {
        super.update();
        if (!this.active || !this._firesActivate) return;
        this._reactToFire(time);
        if (this.flight) this.flight.update(delta);
        else if (time >= this._dodgeEnds && this.body.velocity.y !== 0) this.body.setVelocity(this.velocity, 0);
    }

    _reactToFire(time) {
        if (time < this._nextThreatCheck || this.x > screenData.right) return;
        this._nextThreatCheck = time + 140;
        const threatened = this.scene.player.fires.getChildren().some(shot => {
            if (!shot.active || !shot.body || shot.x >= this.x) return false;
            const closingSpeed = shot.body.velocity.x - this.body.velocity.x;
            if (closingSpeed <= 0) return false;
            const seconds = (this.x - shot.x) / closingSpeed;
            const miss = shot.y - this.y + (shot.body.velocity.y - this.body.velocity.y) * seconds;
            return seconds < 0.75 && Math.abs(miss) < (this.displayHeight + shot.displayHeight) / 2;
        });
        if (!threatened) return;

        this._nextThreatCheck = time + Phaser.Math.Between(1400, 2400);
        if (Phaser.Math.Between(1, 100) > 65) return;
        const distance = Phaser.Math.Between(54, 100);
        const top = screenData.top + this.displayHeight / 2;
        const bottom = screenData.bottom - this.displayHeight / 2;
        let offset = Phaser.Math.Between(0, 1) ? distance : -distance;
        if (this.y + offset < top || this.y + offset > bottom) offset = -offset;
        const y = Phaser.Math.Clamp(this.y + offset, top, bottom);
        if (this.flight) this.flight.evade(y);
        else {
            const verticalSpeed = Math.abs(this.velocity) * 0.6;
            this.body.setVelocity(this.velocity * 0.8, Math.sign(y - this.y) * verticalSpeed);
            this._dodgeEnds = time + Math.abs(y - this.y) / verticalSpeed * 1000;
        }
    }

    stopTimer(){
        this._firesActivate = false;
        this.timer?.remove();
        this.flight?.stop();
    }

    reset() {
        const data = Enemy.generateAttr(this.scene);
        super.reset(data.x, data.y);
        this._setWeapon(data.config);
        this.setFrame(data.frame);
    }

    isDead() {
        return (this.x < -this.displayWidth);
    }

    _addTimer() {
        this.timer = this.scene.time.addEvent({
            delay: this.weapon.reload * (Phaser.Math.Between(TIMING.ENEMY.RELOAD_INTERVAL_MIN_PERCENT, TIMING.ENEMY.RELOAD_INTERVAL_MAX_PERCENT) * TIMING.ENEMY.PERCENT_TO_RATIO),
            loop: true,
            callback: () => this._shooting(),
        });
    }

    _setInitialData(data) {
        const { fires } = data;

        this._nextThreatCheck = 0;
        this._dodgeEnds = 0;
        this._firesActivate = true;
        this.fires = fires;
    }

    _setWeapon({ weapon }) {
        this.weapon = {
            ...weapon,
            origin: {x: -1, y: 0.5},
        }
    }

    _shooting() {
        if (this._firesActivate) {
            this.fires.createFire(this);
        }
    }
}
