import { TIMING } from '../timing';
import { LIFECYCLE_EVENTS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS, UI_ACTIONS } from '../identifiers';
import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { screenData, setEndpoints } from '../Utils';
import { UI, uiText, createButton } from '../ui';

export class PauseScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PAUSE);
    }

    preload() {}

    create() {
        this._info = { ...this.scene.get(SCENE_NAMES.GAME).info };
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK) };
        this._transitioning = true;
        this._exiting = false;
        this._createMenu();
        this._panel.setAlpha(0).setScale(0.96);
        this.tweens.add({
            targets: this._panel, alpha: 1, scale: 1, duration: TIMING.PAUSE_SCENE.CREATE_DURATION_MS, ease: 'Cubic.Out',
            onComplete: () => { this._transitioning = false; },
        });

        const resize = () => {
            if (this._exiting) return;
            setEndpoints();
            this.tweens.killTweensOf(this._panel);
            this.children.removeAll(true);
            this._createMenu();
            this._transitioning = false;
        };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize));
    }

    _createMenu() {
        const unit = screenData.width / document.body.clientWidth;
        const width = Math.min(420 * unit, screenData.width - 32 * unit);
        const height = Math.min(200 * unit, screenData.height - 24 * unit);
        this._unit = unit;
        this._blackBG = this.add.rectangle((screenData.left + screenData.right) / 2,
            (screenData.top + screenData.bottom) / 2, screenData.width, screenData.height,
            0x101c21, 0.65).setInteractive();
        this._panel = this.add.container((screenData.left + screenData.right) / 2,
            (screenData.top + screenData.bottom) / 2);

        const background = this.add.graphics();
        background.fillStyle(0x071014, 0.2).fillRoundedRect(-width / 2 + 4 * unit,
            -height / 2 + 6 * unit, width, height, UI.panelRadius * unit);
        background.fillStyle(UI.colors.panel).lineStyle(1.5 * unit, UI.colors.border)
            .fillRoundedRect(-width / 2, -height / 2, width, height, UI.panelRadius * unit)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, UI.panelRadius * unit);
        this._panel.add(background);

        const title = this.add.text(0, -height / 2 + 22 * unit, this._getText(TEXT_KEYS.TITLE), {
            ...uiText(UI.type.title),
        }).setOrigin(0.5, 0);
        const context = this._info.isUnlim ? this._getText(TEXT_KEYS.SURVIVAL)
            : `${this._getText(TEXT_KEYS.CAMPAIGN)} · ${this._getText(TEXT_KEYS.LEVEL)} ${this._info.index}`;
        const subtitle = this.add.text(0, -height / 2 + 52 * unit, context, {
            ...uiText(UI.type.caption, UI.colors.muted),
        }).setOrigin(0.5, 0);
        this._panel.add([title, subtitle]);

        const buttonWidth = width - 32 * unit;
        const secondaryWidth = (buttonWidth - 12 * unit) / 2;
        this._buttons = [
            this._createButton(0, -height / 2 + 106 * unit, buttonWidth, 44 * unit,
                this._getText(TEXT_KEYS.RESUME), UI_ACTIONS.PLAY, true),
            this._createButton(-(secondaryWidth + 12 * unit) / 2, -height / 2 + 162 * unit,
                secondaryWidth, 44 * unit, this._getText(TEXT_KEYS.RESTART), UI_ACTIONS.RESTART),
            this._createButton((secondaryWidth + 12 * unit) / 2, -height / 2 + 162 * unit,
                secondaryWidth, 44 * unit, this._getText(this._info.isUnlim ? TEXT_KEYS.TO_MENU : TEXT_KEYS.TO_CAMPAIGN), TEXTURE_KEYS.RETURN),
        ];
    }

    _createButton(x, y, width, height, text, command, primary = false) {
        return { ...createButton(this, {
            x, y, width, height, text, parent: this._panel,
            variant: primary ? 'primary' : 'secondary',
            canPress: () => !this._transitioning,
            onPress: () => this._close(command),
        }), command };
    }

    _close(command) {
        if (this._transitioning) return;
        this._transitioning = true;
        this._exiting = true;
        this.sounds.click.play({ volume: 0.2 });
        this.tweens.add({
            targets: this._panel, alpha: 0, scale: 0.96, duration: TIMING.PAUSE_SCENE.CLOSE_DURATION_MS, ease: 'Cubic.In',
            onComplete: () => this._handleScreen(command),
        });
    }

    _handleScreen(command) {
        switch (command) {
            case UI_ACTIONS.PLAY:
                this.scene.resume(SCENE_NAMES.GAME);
                this.scene.stop();
            break;
            case UI_ACTIONS.RESTART:
                this.scene.start(SCENE_NAMES.GAME, { ...this._info });
            break;
            case TEXTURE_KEYS.RETURN:
                const destination = this._info.isUnlim ? SCENE_NAMES.MAIN_MENU : SCENE_NAMES.CAMPAIGN;
                this.scene.stop(SCENE_NAMES.GAME);
                this.scene.start(destination);
            break;
        }
    }
}
