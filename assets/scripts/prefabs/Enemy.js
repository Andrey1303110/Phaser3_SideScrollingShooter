class Enemy extends MovableObject {
    static generateAttr(scene) {
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight / 2, screenEndpoints.bottom - scene.maxEnemyFrameHeight / 2);
        return { x, y, frame: `enemy${Phaser.Math.Between(1, 4)}` };
    }

    static generate(scene, fires) {
        const data = Enemy.generateAttr(scene);
        return new Enemy({
            scene,
            fires,
            x: data.x,
            y: data.y,
            texture: 'enemy',
            frame: data.frame,
            velocity: config.levels[scene.currentLevel].enemyVelocity * -1,
            weapon: {
                texture: 'rocket',
                delay: config.Enemy.fireReload,
                velocity: config.Enemy.fireVelocity,
                scale: config.Enemy.fireScale,
                origin: {x: -1, y: 0.5},
            },
            reward: config.reward.enemy,
        });
    }

    init(data) {
        super.init(data);
        this.fires = data.fires;
        this.timer = this.scene.time.addEvent({
            delay: data.weapon.delay * (Math.random() + 1),
            loop: true,
            callback: this.shooting,
            callbackScope: this,
        });
        this.weapon = data.weapon;
    }

    shooting() {
        this.fires.createFire(this);
    }

    reset() {
        const data = Enemy.generateAttr(this.scene);
        super.reset(data.x, data.y);
        this.setFrame(data.frame);
    }

    isDead() {
        return (this.x < -this.displayWidth);
    }
}
