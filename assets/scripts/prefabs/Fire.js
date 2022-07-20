class Fire extends MovableObject {
    static generate(scene, source) {
        const data = {
            scene: scene,
            x: source.x + source.displayWidth / 2 * source.weapon.origin.x,
            y: source.y,
            texture: source.weapon.texture,
            velocity: source.weapon.velocity,
            scale: source.weapon.scale,
        };
        return new Fire(data);
    }

    isDead(){
        return (this.x > config.width + this.displayWidth || this.x < -this.displayWidth);
    }
}
