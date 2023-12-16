import { ATLASES_FILES, AUDIO_FILES, IMAGE_FILES, SCENE_NAMES } from "../constants";
import { LoadingBar } from "/src/scripts/classes/LoadingBar";
import { config } from "/src/scripts/main";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super(SCENE_NAMES.preload);
    }

    preload(){
        this._createBG();
        new LoadingBar(this);
        this._preloadResources();
        this._preloadOther()
    }

    _createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / this.sceneBG.width;
        const scaleY = this.cameras.main.height / this.sceneBG.height;
        const scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    _preloadOther(){
        this.load.plugin('rexvirtualjoystickplugin', './assets/plugins/rexvirtualjoystickplugin.min.js', true);
        this.load.json('dialogues0', `./assets/dialogues/0.json`);
    }

    _preloadResources() {
        config.Levels.forEach(level => this.load.image(`bg${level.level}`, `./assets/sprites/bg${level.level}.png`));

        ATLASES_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }
}