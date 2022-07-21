class PreloadScene extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        this.load.atlas('dragon', 'assets/sprites/dragon.png', 'assets/sprites/dragon.json');
        this.load.atlas('enemy', 'assets/sprites/enemy.png', 'assets/sprites/enemy.json');
        this.load.atlas('boom', 'assets/sprites/boom.png', 'assets/sprites/boom.json');
        this.load.image('fire', 'assets/sprites/fire.png');
        this.load.image('rocket', 'assets/sprites/rocket.png');
        this.load.audio('rocket_launch', 'assets/sounds/rocket_launch.mp3');
        this.load.audio('fire_launch', 'assets/sounds/fire_launch.mp3');
        this.load.audio('explosion_small', 'assets/sounds/explosion_small.mp3');
        this.load.audio('wings', 'assets/sounds/wings.mp3');
    }

    create() {
        this.scene.start('Start');
    }
}