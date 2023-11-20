import { config, screenEndpoints } from "/src/scripts/main";
import { MovableObject } from "/src/scripts/prefabs/MovableObject";

export class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight / 2, screenEndpoints.bottom - scene.maxEnemyFrameHeight / 2);

        let enemy_nums = 0;

        if (scene.info.level > 4) {
            enemy_nums = 1;
            if (scene.info.level > 8) {
                enemy_nums = 2;
            }
        }

        const enemy_type = Object.keys(config.Enemies)[Phaser.Math.Between(0, enemy_nums)];
        const enemy_frame = `enemy${Phaser.Math.Between(1, 4)}`;

        return { x, y, enemy_frame, enemy_type };
    }

    static generate(scene, fires) {
        const data = Enemy.generateAttr(scene);

        return new Enemy({
            scene,
            fires,
            x: data.x,
            y: data.y,
            enemy_type: data.enemy_type,
            texture: data.enemy_type,
            frame: data.enemy_frame,
            velocity: config.Enemies[data.enemy_type].velocity * -1,
        });
    }

    init(data) {
        super.init(data);
        this.enemy_type = data.enemy_type;
        this.fires_activate = true;
        this.setWeapon();
        this.reward = config.reward[data.texture];
        this.fires = data.fires;
        this.timer = this.scene.time.addEvent({
            delay: config.Weapons[this.weapon.texture].reload * (Phaser.Math.Between(75, 125) * .01),
            loop: true,
            callback: this.shooting,
            callbackScope: this,
        });
    }

    setWeapon(){
        this.weapon = {
            texture: config.Enemies[this.enemy_type].weapon,
            delay: config.Weapons[config.Enemies[this.enemy_type].weapon].reload,
            velocity: config.Weapons[config.Enemies[this.enemy_type].weapon].velocity,
            scale: config.Weapons[config.Enemies[this.enemy_type].weapon].scale,
            origin: {x: -1, y: 0.5},
        }
    }

    stopTimer(){
        this.fires_activate = false;
    }

    shooting() {
        if (this.fires_activate) {
            this.fires.createFire(this);
        }
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
}
