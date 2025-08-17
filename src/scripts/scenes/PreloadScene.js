import { ATLAS_FILES, AUDIO_FILES, CAMPAIGN_LEVELS, IMAGE_FILES, SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { LoadingBar } from '../classes/LoadingBar';

export class PreloadScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PRELOAD);
    }

    async preload(){
        this._createBg();
        this._preloadTexts();
        this._preloadResources();
        this._preloadPlugins();
        this._preloadDialogues();

        new LoadingBar(this);
    }

    _preloadTexts() {
        this.load.json('texts', `./assets/texts/${this.model.lang}.json`);
    }

    _preloadPlugins(){
        this.load.plugin('rexvirtualjoystickplugin', './assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    _preloadDialogues() {
        this.load.json(`dialogues0`, `./assets/dialogues/${this.model.lang}/0.json`)
        CAMPAIGN_LEVELS.forEach(level => this.load.json(`dialogues${level.index}`, `./assets/dialogues/${this.model.lang}/${level.index}.json`));
    }

    _preloadResources() {
        CAMPAIGN_LEVELS.forEach(level => this.load.image(`bg${level.index}`, `./assets/sprites/bg${level.index}.png`));

        ATLAS_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }
}