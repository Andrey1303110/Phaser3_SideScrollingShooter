class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'dragon', 'dragon1');
        this.scene.add.existing(this);
        //this.setOrigin(0.5);
    }
}
