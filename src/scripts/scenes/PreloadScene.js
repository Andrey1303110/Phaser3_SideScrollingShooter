import { ATLAS_FILES, AUDIO_FILES, CAMPAIGN_LEVELS, IMAGE_FILES, SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { LoadingBar } from '../classes/LoadingBar';
import { tweenPromise } from '../Utils';

export class PreloadScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PRELOAD);
    }

    async preload(){
        this._createBg();

        this._preloadTexts();
        this._preloadResources();
        this._preloadPlugins();
        this._preloadDialoguesAudio();

        this._setupLoadingBar();
    }

    _preloadTexts() {
        this.load.json('texts', `./assets/texts/${this.model.lang}.json`);
    }

    _preloadPlugins(){
        this.load.plugin('rexvirtualjoystickplugin', './assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    _preloadDialoguesAudio() {
        for (let i = 0; i <= CAMPAIGN_LEVELS.at(-1).index; i++) {
            const texts = this.scene.scene.cache.json.get(`dialogues${i}`);
            for (let j = 0; j < texts.length; j++) {
                const name = `level${i}_text${j}_${this.model.lang}`;
                const path = `./assets/voices/${this.model.lang}/${i}/${j}.mp3`;
                this.load.audio(name, path);
            }
        }
    }

    _preloadResources() {
        CAMPAIGN_LEVELS.forEach(level => this.load.image(`bg${level.index}`, `./assets/sprites/bg${level.index}.png`));

        ATLAS_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }

    _setupLoadingBar() {
        this._loadingBar = new LoadingBar(this);
        this.scene.scene.load.on('complete', () => this._onLoadComplete());
    }

    _onLoadComplete() {
        return tweenPromise(this.scene.scene, {
            targets: this._loadingBar.graphicsElements,
            alpha: 0,
            ease: 'Power3',
            duration: 400,
            onComplete: this.scene.start(SCENE_NAMES.MAIN_MENU),
        });
    }
}