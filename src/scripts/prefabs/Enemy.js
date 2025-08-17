import { ENEMIES } from "../constants";
import { screenData } from "../main";
import { MovableObject } from "./MovableObject";

export class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenData.right + screenData.width * 0.25;
        const y = Phaser.Math.Between(screenData.top + screenData.height * 0.1, screenData.bottom - screenData.height * 0.1);

        let typeNum = 0;

        if (scene.info.index > 4) {
            typeNum = 1;
            if (scene.info.index > 8) {
                typeNum = 2;
            }
        }

        const config = ENEMIES[Object.keys(ENEMIES)[Phaser.Math.Between(0, typeNum)]];
        const enemyTexture = `enemy${Phaser.Math.Between(1, config.textureNum)}`;

        return { x, y, enemyTexture, config };
    }

    static generate(scene, fires) {
        const data = Enemy.generateAttr(scene);
        return new Enemy({
            scene,
            fires,
            x: data.x,
            y: data.y,
            frame: data.enemyTexture,
            ...data.config,
            velocity: data.config.velocity * -1,
        });
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
            callback: this._shooting,
            callbackScope: this,
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
