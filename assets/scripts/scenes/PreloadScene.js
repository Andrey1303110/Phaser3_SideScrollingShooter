class PreloadScene extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload() {
        for (let i = 1; i <= config.Levels.length; i++) {
            this.load.image(`bg${i}`, `assets/sprites/bg${i}.png`);
        }
        this.load.atlas('dragon', 'assets/sprites/dragon.png', 'assets/sprites/dragon.json');
        this.load.atlas('jet', 'assets/sprites/jet.png', 'assets/sprites/jet.json');
        this.load.atlas('helicopter', 'assets/sprites/helicopter.png', 'assets/sprites/helicopter.json');
        this.load.atlas('boom', 'assets/sprites/boom.png', 'assets/sprites/boom.json');
        
        this.load.image('fire', 'assets/sprites/fire.png');
        this.load.image('flag', 'assets/sprites/flag.png');
        this.load.image('rocket', 'assets/sprites/rocket.png');
        this.load.image('missile', 'assets/sprites/missile.png');
        this.load.image('button_campaign', 'assets/sprites/button_campaign.png');
        this.load.image('button_unlim', 'assets/sprites/button_unlim.png');
        this.load.image('map', 'assets/sprites/map.png');
        this.load.image('battle', 'assets/sprites/battle.png');
        this.load.image('flag', 'assets/sprites/flag.png');
        this.load.image('frame', 'assets/sprites/frame.png');
        this.load.image('stamp', 'assets/sprites/stamp.png');
        this.load.image('close', 'assets/sprites/close.png');
        this.load.image('return', 'assets/sprites/return.png');
        this.load.image('pause', 'assets/sprites/pause.png');
        this.load.image('pause_bg', 'assets/sprites/pause_bg.png');
        this.load.image('restart', 'assets/sprites/restart.png');
        this.load.image('play', 'assets/sprites/play.png');
        
        this.load.audio('select', 'assets/sounds/select.wav');
        this.load.audio('error', 'assets/sounds/error.mp3');
        this.load.audio('rocket_launch', 'assets/sounds/rocket_launch.mp3');
        this.load.audio('fire_launch', 'assets/sounds/fire_launch.mp3');
        this.load.audio('missile_launch', 'assets/sounds/missile_launch.mp3');
        this.load.audio('explosion_small', 'assets/sounds/explosion_small.mp3');
        this.load.audio('wings', 'assets/sounds/wings.mp3');
        this.load.audio('stamp', 'assets/sounds/stamp.mp3');
        this.load.audio('ready', 'assets/sounds/ready.mp3');
        this.load.audio('died', 'assets/sounds/died.mp3');
        this.load.audio('win', 'assets/sounds/win.mp3');
    }

    create() {
        this.scene.start('Levels');
    }
}