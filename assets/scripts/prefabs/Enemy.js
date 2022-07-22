class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight / 2, screenEndpoints.bottom - scene.maxEnemyFrameHeight / 2);
        return { x, y, frame: `enemy${Phaser.Math.Between(1, 4)}`, enemy_type: config.Enemies.names[Phaser.Math.Between(0, 1)] };
    }

    static generate(scene, fires) {
        const data = Enemy.generateAttr(scene);

        return new Enemy({
            scene,
            fires,
            x: data.x,
            y: data.y,
            texture: data.enemy_type,
            frame: data.frame,
            velocity: config.Enemies[data.enemy_type].velocity * -1,
        });
    }

    init(data) {
        super.init(data);
        this.weapon = this.setWeapon(data.texture);
        this.reward = config.reward[data.texture];
        this.fires = data.fires;
        this.timer = this.scene.time.addEvent({
            delay: config.Weapons[this.weapon.texture].reload * (Math.random() + 1),
            loop: true,
            callback: this.shooting,
            callbackScope: this,
        });
    }

    setWeapon(enemy_type){
        return {
            texture: config.Enemies[enemy_type].weapon,
            delay: config.Weapons[config.Enemies[enemy_type].weapon].reload,
            velocity: config.Weapons[config.Enemies[enemy_type].weapon].velocity,
            scale: config.Weapons[config.Enemies[enemy_type].weapon].scale,
            origin: {x: -1, y: 0.5},
        };
    }

    shooting() {
        this.fires.createFire(this);
    }

    reset() {
        const data = Enemy.generateAttr(this.scene);
        super.reset(data.x, data.y);
        this.setFrame(data.frame);
        this.setWeapon(data.enemy_type);
        console.log(data);
    }

    isDead() {
        return (this.x < -this.displayWidth);
    }
}
