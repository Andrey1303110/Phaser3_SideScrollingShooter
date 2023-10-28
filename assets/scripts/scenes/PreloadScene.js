import { LoadingBar } from "../classes/LoadingBar.js";
import { config } from "../main.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("Preload");
    }

    preload(){
        this.createBG();
        new LoadingBar(this);
        this.preloadAssets();
    }

    createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / this.sceneBG.width;
        const scaleY = this.cameras.main.height / this.sceneBG.height;
        const scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    preloadAtalses(){
        this.load.atlas('dragon', 'assets/sprites/dragon.png', 'assets/sprites/dragon.json');
        this.load.atlas('jet', 'assets/sprites/jet.png', 'assets/sprites/jet.json');
        this.load.atlas('strategic_jet', 'assets/sprites/strategic_jet.png', 'assets/sprites/strategic_jet.json');
        this.load.atlas('helicopter', 'assets/sprites/helicopter.png', 'assets/sprites/helicopter.json');
        this.load.atlas('boom', 'assets/sprites/boom.png', 'assets/sprites/boom.json');
    }

    preloadImages(){
        for (let i = 1; i <= config.Levels.length; i++) {
            this.load.image(`bg${i}`, `assets/sprites/bg${i}.png`);
        }
        this.load.image('fire', 'assets/sprites/fire.png');
        this.load.image('flag', 'assets/sprites/flag.png');
        this.load.image('rocket', 'assets/sprites/rocket.png');
        this.load.image('missile', 'assets/sprites/missile.png');
        this.load.image('missile_2', 'assets/sprites/missile_2.png');
        this.load.image('button_campaign', 'assets/sprites/button_campaign.png');
        this.load.image('button_unlim', 'assets/sprites/button_unlim.png');
        this.load.image('button_upgrade', 'assets/sprites/button_upgrade.png');
        this.load.image('map', 'assets/sprites/map.png');
        this.load.image('battle', 'assets/sprites/battle.png');
        this.load.image('ruby', 'assets/sprites/ruby.png');
        this.load.image('flag', 'assets/sprites/flag.png');
        this.load.image('frame', 'assets/sprites/frame.png');
        this.load.image('stamp', 'assets/sprites/stamp.png');
        this.load.image('close', 'assets/sprites/close.png');
        this.load.image('return', 'assets/sprites/return.png');
        this.load.image('pause', 'assets/sprites/pause.png');
        this.load.image('pause_bg', 'assets/sprites/pause_bg.png');
        this.load.image('restart', 'assets/sprites/restart.png');
        this.load.image('play', 'assets/sprites/play.png');
        this.load.image('scale', 'assets/sprites/scale.png');
        this.load.image('reload', 'assets/sprites/reload.png');
        this.load.image('velocity', 'assets/sprites/velocity.png');
        this.load.image('progressBar', 'assets/sprites/progressBar.png');
        this.load.image('progressBarFill', 'assets/sprites/progressBarFill.png');
    }

    preloadAudios(){
        this.load.audio('select', 'assets/sounds/select.wav');
        this.load.audio('error', 'assets/sounds/error.mp3');
        this.load.audio('rocket_launch', 'assets/sounds/rocket_launch.mp3');
        this.load.audio('fire_launch', 'assets/sounds/fire_launch.mp3');
        this.load.audio('missile_launch', 'assets/sounds/missile_launch.mp3');
        this.load.audio('missile_2_launch', 'assets/sounds/missile_2_launch.mp3');
        this.load.audio('explosion_small', 'assets/sounds/explosion_small.mp3');
        this.load.audio('wings', 'assets/sounds/wings.mp3');
        this.load.audio('stamp', 'assets/sounds/stamp.mp3');
        this.load.audio('ready', 'assets/sounds/ready.mp3');
        this.load.audio('died', 'assets/sounds/died.mp3');
        this.load.audio('win', 'assets/sounds/win.mp3');
        this.load.audio('upgrade', 'assets/sounds/upgrade.mp3');
        this.load.audio('level_up', 'assets/sounds/level_up.mp3');
    }

    preloadOther(){
        this.load.plugin('rexvirtualjoystickplugin', 'assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    preloadAssets() {
        this.preloadAtalses();
        this.preloadImages();
        this.preloadAudios();
        this.preloadOther();
    }
}