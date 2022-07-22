class Fire extends MovableObject {
    static generate(scene, source) {
        const data = {
            scene: scene,
            x: source.x + source.displayWidth / 2 * source.weapon.origin.x,
            y: source.y,
            texture: source.weapon.texture,
            velocity: config.Weapons[source.weapon.texture].velocity,
            scale: config.Weapons[source.weapon.texture].scale,
            reward: config.Weapons[source.weapon.texture].reward,
        };
        return new Fire(data);
    }

    createSound(source) {
        this.launch_sound = source.scene.sound.add(`${source.weapon.texture}_launch`);
        this.launch_sound.play({volume: 0.35});
    }

    isDead() {
        return (this.x > config.width + this.displayWidth || this.x < -this.displayWidth);
    }
}
