import { ATLASES_FILES, AUDIO_FILES, IMAGE_FILES, SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { LoadingBar } from '/src/scripts/classes/LoadingBar';
import { config } from '/src/scripts/main';

export class PreloadScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.preload);
    }

    preload(){
        this._createBG();
        this._preloadTexts();
        this._preloadResources();
        this._preloadPlugins();
        this._preloadDialogues();

        new LoadingBar(this);
    }

    _preloadTexts() {
        this.load.json('texts', `./assets/texts/${config.lang}.json`);
    }

    _preloadPlugins(){
        this.load.plugin('rexvirtualjoystickplugin', './assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    _preloadDialogues() {
        config.Levels.forEach(level => this.load.json(`dialogues${level.index}`, `./assets/dialogues/${config.lang}/${level.index}.json`));
    }

    _preloadResources() {
        config.Levels.forEach(level => this.load.image(`bg${level.index}`, `./assets/sprites/bg${level.index}.png`));

        ATLASES_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }
}