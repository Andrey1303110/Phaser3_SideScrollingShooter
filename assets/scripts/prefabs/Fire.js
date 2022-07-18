class Fire extends Phaser.GameObjects.Sprite {
    constructor(data){
        super(data.scene, data.x, data.y, data.texture);
        this.init(data);
    }

    static generate(scene, player) {
        const data = {
            scene: scene,
            x: player.x + player.displayWidth * .5,
            y: player.y,
            texture: 'fire',
            velocity: 1250,
        };

        return new Fire(data);
    }

    init(data){
        this.scene.add.existing(this);
        this.velocity = data.velocity;
        this.scene.events.on('update', this.update, this);
    }

    reset(source){
        this.x = source.x + source.displayWidth / 2;
        this.y = source.y;
        this.setAlive(true);
    }
    
    update(){
        if (this.active && (this.x > config.width + this.width || this.x < -this.width)){
            this.setAlive(false);
        }
    }
    
    setAlive(status){
        this.body.enable = status;
        this.setVisible(status)
        this.setActive(status)
    }
    

    move(){
        this.body.setVelocityX(this.velocity);
    }
}
