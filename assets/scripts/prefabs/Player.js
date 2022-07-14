class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'dragon', 'dragon1');
        this.init();
    }

    init(){
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.velocity = 500;
        this.spriteNum = 1;
    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta);
        this.spriteNum++;
        let sprite_num = Math.round(this.spriteNum / 4) % 5 + 1;
        this.setTexture('dragon', `dragon${sprite_num}`);
    }

    move(){
        this.body.setVelocity(0);

        if (this.scene.cursors.left.isDown) {
            this.body.setVelocityX(-this.velocity);
        } else if (this.scene.cursors.right.isDown) {
            this.body.setVelocityX(this.velocity);
        }

        if (this.scene.cursors.up.isDown) {
            this.body.setVelocityY(-this.velocity);
        } else if (this.scene.cursors.down.isDown) {
            this.body.setVelocityY(this.velocity);
        }
    }
}
