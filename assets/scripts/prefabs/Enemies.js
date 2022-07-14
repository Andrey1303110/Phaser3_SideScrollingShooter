class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super();
        this.scene = scene;
    }
    createEnemy(){
        let enemy = Enemy.generate(this.scene);
        this.add(enemy);
        enemy.move();
    }
}