import { TIMING } from '../timing';
import { CACHE_KEYS, INPUT_EVENTS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS } from '../identifiers';
import { delayInMSec, screenData, setEndpoints, tweenPromise } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { config } from '../main';
import { uiText } from '../ui';
import { CommonScene } from './CommonScene';

export class SetLanguageScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.SET_LANGUAGE);
    }

    init(){
        super.init();
        setEndpoints();

        this._buttons = {};
    }

    async create() {
        this._createBg();
        this._createSounds();
        await this._createButtons();
        await this._createPressLabel();
    }

    preload() {
        super.preload();

        this.load.image(TEXTURE_KEYS.ENG, './assets/sprites/eng.png');
        this.load.image(TEXTURE_KEYS.UKR, './assets/sprites/ukr.png');
        this.load.image(TEXTURE_KEYS.BUTTON, './assets/sprites/button_lang.png');

        this.load.audio(SOUND_KEYS.CLICK, `./assets/sounds/click.mp3`);
        this.load.audio(SOUND_KEYS.WHOOSH, `./assets/sounds/whoosh.mp3`);
    }

    _addButtonEventListeners(button) {
        button.on(INPUT_EVENTS.POINTEROVER, () => button.setAlpha(1));
        button.on(INPUT_EVENTS.POINTEROUT, () => button.setAlpha(0.75));
        button.once(INPUT_EVENTS.POINTERDOWN, () => this._langSelect(button));
    }

    async _createButtons() {
        const delay = TIMING.SET_LANGUAGE_SCENE.CREATE_BUTTONS_DELAY_MS;
        await delayInMSec(this.scene, delay);

        await this._createButton(TEXTURE_KEYS.UKR, 0.35);
        await this._createButton(TEXTURE_KEYS.ENG, 0.65);
    }

    async _createButton(name, y){
        this._createButtonSprite(name, y)
        this._createButtonText(this._buttons[name], name);
        this._createButtonFlagSprite(this._buttons[name], name);
        await this._createButtonTweens(this._buttons[name]);
        this._addButtonEventListeners(this._buttons[name]);
    }

    _createButtonText(button, name) {
        let textTitle;
        switch (name) {
            case TEXTURE_KEYS.UKR:
                textTitle = TEXT_KEYS.UKRAINIAN;
                break;
            case TEXTURE_KEYS.ENG:
                textTitle = TEXT_KEYS.ENGLISH;
                break;
        }

        const textStyle = {
            ...uiText(24), align: 'center',
        };
        button.buttonText = this.add.text(button.x - config.width * 0.06, button.y, textTitle, textStyle).setScale(3).setOrigin(0.5).setAlpha(0);
    }

    _createButtonFlagSprite(button, name) {
        button.buttonFlag = this.add.image(button.x + config.width * 0.095, button.y, name).setAlpha(0);
    }

    _createButtonSprite(buttonName, y) {
        this._buttons[buttonName] = this.add.image(config.width * 0.5, config.height * y, TEXTURE_KEYS.BUTTON)
            .setOrigin(0.5)
            .setScale(5)
            .setAlpha(0)
            .setInteractive();

        this._buttons[buttonName].name = buttonName;
    }

    async _createButtonTweens(button) {
        this.sounds.whoosh.play({ volume: 0.33 });

        const duration = TIMING.SET_LANGUAGE_SCENE.CREATE_BUTTON_TWEENS_DURATION_MS;
        return Promise.all([
            tweenPromise(this, {
                targets: [ button, button.buttonText ],
                alpha: 1,
                scale: 0.85,
                ease: 'Linear',
                duration,
            }),
            tweenPromise(this, {
                targets: button.buttonFlag,
                alpha: 1,
                scale: 0.4,
                ease: 'Linear',
                duration,
            }),
        ]);
    }

    _createPressLabel() {
        const textStyle = {
            ...uiText(22), align: 'center', wordWrap: { width: screenData.width * 0.85 },
        };
        
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['SelectLanguage'];
        const label = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.025, text, textStyle).setOrigin(0.5, 1).setAlpha(0);

        return tweenPromise(this, {
            targets: label,
            alpha: 0.85,
            ease: 'Linear',
            duration: TIMING.SET_LANGUAGE_SCENE.CREATE_PRESS_LABEL_DURATION_MS,
            onComplete: () => this._playLabelCTA(label),
        });
    }

    _playLabelCTA(label) {
        this.tweens.add({
            targets: label,
            scale: 1.05,
            alpha: 1,
            ease: 'Linear',
            duration: TIMING.SET_LANGUAGE_SCENE.PLAY_LABEL_CTA_DURATION_MS,
            repeat: -1,
            yoyo: true,
        });
    }

    _langSelect(button) {
        this.model.setLang(button.name);
        this._onButtonClick();
    }

    _onButtonClick() {
        this.sounds.click.play({ volume: 0.2 });
        this.scene.start(SCENE_NAMES.PRELOAD);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add(SOUND_KEYS.CLICK),
            whoosh: this.sound.add(SOUND_KEYS.WHOOSH),
        };
    }
}
