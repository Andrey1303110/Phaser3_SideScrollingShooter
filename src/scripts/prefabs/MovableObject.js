import { EVENTS } from '../constants';

export class MovableObject extends Phaser.GameObjects.Sprite {
    constructor(data){
        super(data.scene, data.x, data.y, data.texture, data.frame);
        this.init(data);
    }

    init(data){
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;

        this.velocity = data.velocity;
        this.reward = data.reward;
        this.damage = data.damage;
        this.move();

        this.scene.events.on(EVENTS.update, this.update, this);
    }

    reset(x, y){
        this.x = x;
        this.y = y;
        this.setAlive(true);
    }

    update(){
        if (this.active && this.isDead()){
            this.setAlive(false);
        }
    }

    setAlive(status){
        this.body.enable = status;
        this.setVisible(status);
        this.setActive(status);

        if (this.timer) {
            this.timer.paused = !status;
        }

        if (status) {
            return;
        }

        this.emit('killed');
    
        if (this.launch_sound) {
            this.launch_sound.destroy();
        }
    }

    isDead(){
        return !this.body.enable;
    }

    move(){
        this.body.setVelocityX(this.velocity);
    }
}