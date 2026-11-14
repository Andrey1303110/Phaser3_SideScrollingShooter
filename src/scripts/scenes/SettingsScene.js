import { CommonScene } from './CommonScene';
import { SCENE_NAMES } from '../constants';
import { screenData, setEndpoints } from '../Utils';
import { UI, uiText, createButton, createBackArrow } from '../ui';

export class SettingsScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.SETTINGS);
    }

    create() {
        this.sounds = { click: this.sound.add('click') };
        this._confirmingReset = false;
        this._changingLanguage = false;
        this._status = '';
        this._render();
        const resize = () => {
            setEndpoints();
            this._render();
        };
        this.scale.on('resize', resize);
        this.events.once('shutdown', () => this.scale.off('resize', resize));
    }

    _render() {
        this.children.removeAll(true);
        this._createBg();
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
            this.cameras.main.width, this.cameras.main.height, 0x102323, 0.88);
        const u = screenData.width / document.body.clientWidth;
        this._unit = u;
        const width = Math.min(480 * u, screenData.width - 104 * u);
        const height = Math.min(288 * u, screenData.height - 32 * u);
        const x = (screenData.left + screenData.right) / 2;
        const y = (screenData.top + screenData.bottom) / 2;
        const left = x - width / 2;
        const top = y - height / 2;
        this._panel = { x, y, width, height };
        const panel = this.add.graphics();
        panel.fillStyle(UI.colors.panel, 0.98).lineStyle(1.5 * u, UI.colors.border)
            .fillRoundedRect(left, top, width, height, UI.panelRadius * u)
            .strokeRoundedRect(left, top, width, height, UI.panelRadius * u);
        this.add.text(left + UI.padding * u, top + UI.padding * u, this._getText('TITLE'), {
            ...uiText(UI.type.title),
        });
        this._createBackArrow();

        const gap = (height - 120 * u) / 3;
        const rowY = index => top + 78 * u + gap * index;
        ['SOUND', 'FPS', 'LANGUAGE', 'PROGRESS'].forEach((key, index) => {
            this.add.text(left + UI.padding * u, rowY(index), this._getText(key), {
                ...uiText(),
            }).setOrigin(0, 0.5);
        });
        const controlX = left + width - 106 * u;
        this._soundButton = this._button(controlX, rowY(0), 180 * u,
            this._getText(this.model.soundEnabled ? 'ON' : 'OFF'), () => this._toggleSound());
        this._fpsButton = this._button(controlX, rowY(1), 180 * u,
            this._getText(this.model.showFPS ? 'ON' : 'OFF'), () => {
                this.model.setShowFPS(!this.model.showFPS);
                this._status = this._getText('SAVED');
                this._render();
            });
        this._languageButtons = {};
        for (const [index, lang] of ['ukr', 'eng'].entries()) {
            this._languageButtons[lang] = this._button(controlX + (index ? 47 : -47) * u,
                rowY(2), 86 * u, lang === 'ukr' ? 'УКР' : 'ENG',
                () => this._changeLanguage(lang), this.model.lang === lang ? 0x367c4b : 0x526b70);
        }
        this._resetButton = this._button(controlX, rowY(3), 180 * u,
            this._getText('RESET'), () => {
                this._confirmingReset = true;
                this._render();
            }, 0xa34537);
        this.add.text(left + width - 16 * u, top + 30 * u, this._status, {
            ...uiText(UI.type.caption, UI.colors.accent),
        }).setOrigin(1, 0.5);
        if (this._confirmingReset) this._createResetDialog();
    }

    _createBackArrow() {
        this._backButton = createBackArrow(this, { canPress: () => !this._changingLanguage });
    }

    _button(x, y, width, text, action, color = UI.colors.primary, parent) {
        return createButton(this, {
            x, y, width, text, parent,
            variant: color === 0xa34537 ? 'danger' : color === 0x526b70 ? 'secondary' : 'primary',
            canPress: () => !this._changingLanguage,
            onPress: () => { this.sounds.click.play({ volume: 0.2 }); action(); },
        });
    }

    _toggleSound() {
        this.model.setSoundEnabled(!this.model.soundEnabled);
        this.sound.mute = !this.model.soundEnabled;
        this._status = this._getText('SAVED');
        this._render();
    }

    _changeLanguage(lang) {
        if (lang === this.model.lang) return;
        this._changingLanguage = true;
        this.model.setLang(lang);
        this.scene.start(SCENE_NAMES.PRELOAD, { returnTo: SCENE_NAMES.SETTINGS });
    }

    _createResetDialog() {
        const { x, y, width } = this._panel;
        const u = this._unit;
        const layer = this.add.container().setDepth(10);
        const cover = this.add.rectangle(x, y, screenData.width, screenData.height, 0x101c21, 0.75)
            .setInteractive();
        const background = this.add.graphics().fillStyle(UI.colors.panel)
            .fillRoundedRect(x - width / 2, y - 112 * u, width, 224 * u, UI.panelRadius * u);
        const title = this.add.text(x, y - 84 * u, this._getText('CONFIRM_TITLE'), {
            ...uiText(UI.type.title), fontStyle: 'bold',
        }).setOrigin(0.5);
        const message = this.add.text(x, y - 43 * u, this._getText('CONFIRM_BODY'), {
            ...uiText(), align: 'center',
            wordWrap: { width: width - 40 * u },
        }).setOrigin(0.5, 0);
        layer.add([cover, background, title, message]);
        const buttonWidth = (width - 52 * u) / 2;
        this._cancelButton = this._button(x - (buttonWidth + 12 * u) / 2, y + 74 * u,
            buttonWidth, this._getText('CANCEL'), () => {
                this._confirmingReset = false;
                this._render();
            }, 0x526b70, layer);
        this._confirmButton = this._button(x + (buttonWidth + 12 * u) / 2, y + 74 * u,
            buttonWidth, this._getText('RESET'), () => {
                this.model.resetProgress();
                this._confirmingReset = false;
                this._status = this._getText('RESET_DONE');
                this._render();
            }, 0xa34537, layer);
    }
}
