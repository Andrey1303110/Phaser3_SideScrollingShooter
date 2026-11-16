import { TIMING } from '../timing';
import { CACHE_KEYS, LIFECYCLE_EVENTS, PLUGIN_KEYS, TEXTURE_KEYS, resourceKey } from '../identifiers';
import { ATLAS_FILES, AUDIO_FILES, CAMPAIGN_LEVELS, IMAGE_FILES, PARALLAX_IMAGE_FILES, SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { LoadingBar } from '../classes/LoadingBar';
import { tweenPromise } from '../Utils';

export class PreloadScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PRELOAD);
    }

    init(data) {
        super.init();
        this._destination = data?.returnTo ?? SCENE_NAMES.MAIN_MENU;
    }

    preload(){
        this._createBg();

        this._preloadTexts();
        this._preloadDialogues();
        this._preloadResources();
        this._preloadPlugins();
        this._preloadDialoguesAudio();

        this._setupLoadingBar();
    }

    _preloadTexts() {
        this.cache.json.remove(CACHE_KEYS.TEXTS);
        this.load.json(CACHE_KEYS.TEXTS, `./assets/texts/${this.model.lang}.json`);
    }

    _preloadPlugins(){
        this.load.plugin(PLUGIN_KEYS.REXVIRTUALJOYSTICKPLUGIN, './assets/plugins/rexvirtualjoystickplugin.min.js', true);
    }

    _preloadDialoguesAudio() {
        for (let i = 0; i <= CAMPAIGN_LEVELS.at(-1).index; i++) {
            this.load.once(resourceKey.dialogueLoaded(i), (key, type, texts) => {
                for (let j = 0; j < texts.length; j++) {
                    if (texts[j].audio === false) continue;
                    const name = resourceKey.voice(i, j, this.model.lang);
                    const path = `./assets/voices/${this.model.lang}/${i}/${j}.mp3`;
                    this.load.audio(name, path);
                }
            });
        }
    }

    _preloadDialogues() {
        for (let i = 0; i <= CAMPAIGN_LEVELS.length; i++) {
            this.cache.json.remove(resourceKey.dialogues(i));
            this.load.json(resourceKey.dialogues(i), `./assets/dialogues/${this.model.lang}/${i}.json`);
        }
    }

    _preloadResources() {
        this.load.image(TEXTURE_KEYS.SKILL_PREVIEW_BG, './assets/sprites/skill_preview_bg.png');
        this.load.image(TEXTURE_KEYS.SKILL_ICONS, './assets/sprites/skill_icons.png');
        CAMPAIGN_LEVELS.forEach(level => this.load.image(resourceKey.background(level.index), `./assets/sprites/bg${level.index}.png`));

        ATLAS_FILES.forEach(name => this.load.atlas(name, `./assets/sprites/${name}.png`, `./assets/sprites/${name}.json`));
        IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        PARALLAX_IMAGE_FILES.forEach(name => this.load.image(name, `./assets/sprites/${name}.png`));
        AUDIO_FILES.forEach(name => this.load.audio(name, `./assets/sounds/${name}.mp3`));
    }

    _setupLoadingBar() {
        this._loadingBar = new LoadingBar(this);
        this.load.once(LIFECYCLE_EVENTS.COMPLETE, () => this._onLoadComplete());
    }

    _onLoadComplete() {
        return tweenPromise(this.scene.scene, {
            targets: this._loadingBar.graphicsElements,
            alpha: 0,
            ease: 'Power3',
            duration: TIMING.PRELOAD_SCENE.ON_LOAD_COMPLETE_DURATION_MS,
            onComplete: () => this.scene.start(this._destination),
        });
    }
}
