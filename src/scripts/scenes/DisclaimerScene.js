import { TIMING } from '../timing';
import { CACHE_KEYS, INPUT_EVENTS, LIFECYCLE_EVENTS, SOUND_KEYS } from '../identifiers';
import { screenData, setEndpoints, tweenPromise } from '../Utils';
import { SCENE_NAMES } from '../constants';
import { uiText, uiUnit } from '../ui';
import { config } from '../main';
import { CommonScene } from './CommonScene';

export class DisclaimerScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.DISCLAIMER);
    }

    async create() {
        setEndpoints();
        this._createBg();
        this._createSounds();
        const resize = () => { setEndpoints(); this._layoutText(); };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => {
            this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize);
            this._textLabel?.clearMask(true);
        });
        this._createTextLabel();
        this._createPressLabel();
        this._createInteractivity();
        await tweenPromise(this, {
            targets: this._textLabel, alpha: 1, duration: TIMING.DISCLAIMER_SCENE.CREATE_TEXT_LABEL_DURATION_MS,
        });
        await tweenPromise(this, {
            targets: this._pressLabel, alpha: 1, ease: 'Sine.easeInOut',
            duration: TIMING.DISCLAIMER_SCENE.CREATE_PRESS_LABEL_DURATION_MS,
        });
        this._playCTA();
    }

    preload() {
        super.preload();

        this.load.audio(SOUND_KEYS.CLICK, `./assets/sounds/click.mp3`);
    }

    _createBg() {
        super._createBg();
        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 1);
    }

    _createTextLabel() {
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['Disclaimer'];
        this._textLabel = this.add.text(0, 0, text, {
            ...uiText(18, '#f3eddd'),
            align: 'center',
        }).setOrigin(0.5).setAlpha(0);
        this._maskShape = this.add.graphics().setVisible(false);
        this._textLabel.setMask(this._maskShape.createGeometryMask());
        this._layoutText();
        this._scrollOffset = 0;
        const inside = pointer => pointer.y >= this._viewTop && pointer.y < this._viewBottom;
        this.input.on('wheel', (pointer, objects, dx, dy) => {
            if (inside(pointer)) this._scrollText(dy * uiUnit());
        });
        this.input.on(INPUT_EVENTS.POINTERMOVE, pointer => {
            if (pointer.isDown && pointer.getDistance() > 8 * uiUnit()) {
                this._dragged = true;
                if (inside(pointer)) this._scrollText(pointer.prevPosition.y - pointer.y);
            }
        });
    }

    _createPressLabel() {
        const textStyle = {
            ...uiText(20, '#ffcf87'),
            align: 'center',
        };
        
        const text = this.scene.scene.cache.json.get(CACHE_KEYS.INITIAL_TEXTS)['DisclaimerPress'];
        this._pressLabel = this.add.text(config.width * 0.5, screenData.bottom - config.width * 0.01, text, textStyle).setOrigin(0.5, 1).setAlpha(0);
        this._layoutText();
    }

    _playCTA() {
        this.tweens.add({
            targets: this._pressLabel,
            alpha: 0.9,
            scale: 1.012,
            ease: 'Sine.easeInOut',
            duration: TIMING.DISCLAIMER_SCENE.PLAY_CTA_DURATION_MS,
            repeat: -1,
            yoyo: true,
        });
    }

    async _onClick() {
        this.input.enabled = false;
        this.tweens.killTweensOf([this._textLabel, this._pressLabel]);
        this.sounds.click.play({ volume: 0.2 });

        await this._tweenHideScene();

        const nextScene = this.model.lang === '' ? SCENE_NAMES.SET_LANGUAGE : SCENE_NAMES.PRELOAD;
        this.scene.start(nextScene);
    }

    _tweenHideScene() {
        return tweenPromise(this, {
            targets: [this._blackBG, this._textLabel, this._pressLabel],
            alpha: 0,
            ease: 'Sine.easeInOut',
            duration: TIMING.DISCLAIMER_SCENE.TWEEN_HIDE_SCENE_DURATION_MS,
        });
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add(SOUND_KEYS.CLICK),
        };
    }

    _createInteractivity() {
        this.input.enabled = true;
        this._blackBG.setInteractive({ useHandCursor: true });
        let pressed = null;
        this._blackBG.on(INPUT_EVENTS.POINTERDOWN, pointer => {
            pressed = pointer.id;
            this._dragged = false;
        });
        this._blackBG.on(INPUT_EVENTS.POINTERUP, pointer => {
            if (pressed === pointer.id && !this._dragged && pointer.getDistance() <= 8 * uiUnit()) this._onClick();
            pressed = null;
        });
    }

    _layoutText() {
        if (!this._textLabel) return;
        const u = uiUnit();
        const center = (screenData.left + screenData.right) / 2;
        this._viewTop = screenData.top + 16 * u;
        this._pressLabel?.setStyle(uiText(20, '#ffcf87')).setWordWrapWidth(screenData.width - 32 * u)
            .setPosition(center, screenData.bottom - 12 * u);
        this._viewBottom = screenData.bottom - (this._pressLabel?.height || 24 * u) - 28 * u;
        const font = Phaser.Math.Clamp(Math.round(screenData.width / u / 36), 20, 32);
        this._textLabel.setStyle(uiText(font)).setWordWrapWidth(screenData.width - 40 * u);
        this._maskShape.clear().fillStyle(0xffffff).fillRect(screenData.left,
            this._viewTop, screenData.width, this._viewBottom - this._viewTop);
        this._textLabel.setX(center).setOrigin(0.5, 0);
        this._scrollOffset = 0;
        this._scrollText(0);
    }

    _scrollText(delta) {
        const height = this._viewBottom - this._viewTop;
        const maxScroll = Math.max(0, this._textLabel.height - height);
        this._scrollOffset = Phaser.Math.Clamp((this._scrollOffset || 0) + delta, 0, maxScroll);
        this._textLabel.y = this._viewTop + Math.max(0, (height - this._textLabel.height) / 2) - this._scrollOffset;
    }
}
