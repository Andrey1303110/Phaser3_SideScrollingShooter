import { config, screenData } from "../main";
import { MovableObject } from "./MovableObject";

export class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenData.right + config.width * .25;
        const y = Phaser.Math.Between(screenData.top + scene.maxEnemyFrameHeight * 0.5, screenData.bottom - scene.maxEnemyFrameHeight * 0.5);

        let typeNum = 0;

        if (scene.info.index > 4) {
            typeNum = 1;
            if (scene.info.index > 8) {
                typeNum = 2;
            }
        }

        const enemyType = Object.keys(config.enemies)[Phaser.Math.Between(0, typeNum)];
        const enemyTexture = `enemy${Phaser.Math.Between(1, config.enemies[enemyType].textureNum)}`;

        return { x, y, enemyTexture, enemyType };
    }

    static generate(scene, fires) {
        const data = Enemy.generateAttr(scene);

        return new Enemy({
            scene,
            fires,
            x: data.x,
            y: data.y,
            enemyType: data.enemyType,
            texture: data.enemyType,
            frame: data.enemyTexture,
            velocity: config.enemies[data.enemyType].velocity * -1,
        });
    }

    init(data) {
        super.init(data);

        this._setInitialData(data);
        this._setWeapon();
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
            delay: config.weapons[this.weapon.texture].reload * (Phaser.Math.Between(70, 130) * .01),
            loop: true,
            callback: this._shooting,
            callbackScope: this,
        });
    }

    _setInitialData(data) {
        const { enemyType, texture, fires } = data;

        this._enemyType = enemyType;
        this._firesActivate = true;
        this.reward = config.reward[texture];
        this.fires = fires;
        this.scale = config.enemies[enemyType].scale;
    }

    _setWeapon(){
        const type = this._enemyType;
        const enemyWeapon = config.enemies[type].weapon
        const { reload, velocity, scale, damage } = config.weapons[enemyWeapon];

        this.weapon = {
            texture: config.enemies[type].weapon,
            delay: reload,
            velocity,
            scale,
            damage: damage ?? 100,
            origin: {x: -1, y: 0.5},
        }
    }

    _shooting() {
        if (this._firesActivate) {
            this.fires.createFire(this);
        }
    }
}
