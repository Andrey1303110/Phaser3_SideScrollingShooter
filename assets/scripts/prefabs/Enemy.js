class Enemy extends MovableObject {
    static generateAttr(scene){
        const x = screenEndpoints.right + config.width * .25;
        const y = Phaser.Math.Between(screenEndpoints.top + scene.maxEnemyFrameHeight/2, screenEndpoints.bottom - scene.maxEnemyFrameHeight/2);
        return {x, y, frame: `enemy${Phaser.Math.Between(1, 4)}`};
    }

    static generate(scene) {
        const data = Enemy.generateAttr(scene);
        return new Enemy({
            scene,
            x: data.x,
            y: data.y,
            texture: 'enemy',
            frame: data.frame,
            velocity: config.levels[scene.currentLevel].enemyVelocity * -1,
        });
    }

    reset(){
        const data = Enemy.generateAttr(this.scene);
        super.reset(data.x, data.y);
        this.setFrame(data.frame);
    }

    isDead(){
        return (this.x < -this.displayWidth);
    }
}
