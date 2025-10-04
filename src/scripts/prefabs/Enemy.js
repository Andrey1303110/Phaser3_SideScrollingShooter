import { screenData } from "../Utils";
import { ENEMIES } from "../constants";
import { MovableObject } from "./MovableObject";

export class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenData.right + screenData.width * 0.25;
        const y = Phaser.Math.Between(screenData.top + screenData.height * 0.1, screenData.bottom - screenData.height * 0.1);

        const configs = Object.values(ENEMIES).filter(enemy => enemy.entryLevel <= scene.info.index);
        const config = configs[Phaser.Math.Between(0, configs.length-1)];
        const frame = Phaser.Math.Between(0, config.frames);

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
        this._addTimer();
    }

    stopTimer(){
        this._firesActivate = false;
    }

    reset() {
        const data = Enemy.generateAttr(this.scene);
        super.reset(data.x, data.y);
        this.setWeapon();
        this.setFrame(data.frame);
    }

    isDead() {
        return (this.x < -this.displayWidth);
    }

    _addTimer() {
        this.timer = this.scene.time.addEvent({
            delay: this.weapon.reload * (Phaser.Math.Between(70, 130) * 0.01),
            loop: true,
            callback: () => this._shooting(),
        });
    }

    _setInitialData(data) {
        const { fires } = data;

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
