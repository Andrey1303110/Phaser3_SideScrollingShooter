class Fire extends MovableObject {
    static generate(scene, player) {
        const data = {
            scene: scene,
            x: player.x + player.displayWidth * .5,
            y: player.y,
            texture: 'fire',
            velocity: config.player.fireVelocity,
        };

        return new Fire(data);
    }

    isDead(){
        return (this.x > config.width + this.displayWidth || this.x < -this.displayWidth);
    }
}
