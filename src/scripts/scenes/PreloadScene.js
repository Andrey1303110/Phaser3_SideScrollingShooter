import { ATLASES_FILES, AUDIO_FILES, IMAGE_FILES, SCENE_NAMES } from "../constants";
import { CommonScene } from "./CommonScene";
import { LoadingBar } from "/src/scripts/classes/LoadingBar";
import { config } from "/src/scripts/main";

export class PreloadScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.preload);
    }

    preload(){
        this._createBG();
        this._preloadResources();
        this._preloadOther();
        this._preloadDialogues();
        new LoadingBar(this);
    }

    _preloadOther(){
        this.load.plugin('rexvirtualjoystickplugin', './assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    _preloadDialogues() {
        this.load.json('dialogues0', `./assets/dialogues/${config.lang}/0.json`);
    }

    _preloadResources() {
        config.Levels.forEach(level => this.load.image(`bg${level.level}`, `./assets/sprites/bg${level.level}.png`));

        ATLASES_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }
}