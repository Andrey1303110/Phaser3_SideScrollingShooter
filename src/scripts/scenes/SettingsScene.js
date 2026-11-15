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
        const width = Math.min(760 * u, screenData.width - 104 * u);
        const height = Math.min(352 * u, screenData.height - 24 * u);
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

        const columnWidth = (width - 56 * u) / 2;
        const columnX = [left + UI.padding * u, left + width / 2 + 12 * u];
        const gap = (height - 110 * u) / 3;
        const rowY = index => top + 52 * u + gap * index;
        ['SOUND', 'FPS', 'LANGUAGE'].forEach((key, index) => {
            this.add.text(columnX[0], rowY(index), this._getText(key), {
                ...uiText(15),
            });
        });
        const controlX = columnX[0] + columnWidth / 2;
        this._soundButton = this._button(controlX, rowY(0) + 40 * u, columnWidth,
            this._getText(this.model.soundEnabled ? 'ON' : 'OFF'), () => this._toggleSound());
        this._fpsButton = this._button(controlX, rowY(1) + 40 * u, columnWidth,
            this._getText(this.model.showFPS ? 'ON' : 'OFF'), () => {
                this.model.setShowFPS(!this.model.showFPS);
                this._status = this._getText('SAVED');
                this._render();
            });
        this._languageButtons = {};
        for (const [index, lang] of ['ukr', 'eng'].entries()) {
            const buttonWidth = (columnWidth - 8 * u) / 2;
            this._languageButtons[lang] = this._button(controlX + (index ? 1 : -1) * (buttonWidth + 8 * u) / 2,
                rowY(2) + 40 * u, buttonWidth, lang === 'ukr' ? 'УКР' : 'ENG',
                () => this._changeLanguage(lang), this.model.lang === lang ? 0x367c4b : 0x526b70);
        }
        this.add.text(columnX[1], rowY(0), this._getText('AUTO_FIRE'), uiText(15));
        this._autoFireButton = this._button(columnX[1] + columnWidth / 2, rowY(0) + 40 * u,
            columnWidth, this._getText(this.model.autoFireEnabled ? 'ON' : 'OFF'), () => {
                this.model.setAutoFireEnabled(!this.model.autoFireEnabled);
                this._status = this._getText('SAVED');
                this._render();
            });
        this._opacitySliders = {
            joystick: this._createOpacitySlider(columnX[1], rowY(1), columnWidth,
                'JOYSTICK_OPACITY', this.model.joystickOpacity, value => this.model.setJoystickOpacity(value)),
            fire: this._createOpacitySlider(columnX[1], rowY(2), columnWidth,
                'FIRE_BUTTON_OPACITY', this.model.fireButtonOpacity, value => this.model.setFireButtonOpacity(value)),
        };
        const footerY = top + height - 34 * u;
        this.add.text(columnX[0], footerY, this._getText('PROGRESS'), uiText()).setOrigin(0, 0.5);
        this._resetButton = this._button(columnX[1] + columnWidth / 2, footerY, columnWidth,
            this._getText('RESET'), () => {
                this._confirmingReset = true;
                this._render();
            }, 0xa34537);
        this._statusText = this.add.text(left + width - 16 * u, top + 30 * u, this._status, {
            ...uiText(UI.type.caption, UI.colors.accent),
        }).setOrigin(1, 0.5);
        if (this._confirmingReset) this._createResetDialog();
    }

    _createOpacitySlider(x, y, width, textKey, value, onChange) {
        const u = this._unit;
        this.add.text(x, y, this._getText(textKey), uiText(UI.type.caption));
        const valueText = this.add.text(x + width, y, '', uiText(UI.type.caption, UI.colors.accent))
            .setOrigin(1, 0);
        const trackY = y + 36 * u;
        const trackX = x + 10 * u;
        const trackWidth = width - 20 * u;
        const track = this.add.graphics();
        const thumb = this.add.circle(0, trackY, 9 * u, 0xe4c284);
        const draw = () => {
            track.clear().fillStyle(UI.colors.secondary)
                .fillRoundedRect(trackX, trackY - 3 * u, trackWidth, 6 * u, 3 * u);
            if (value > 0) track.fillStyle(UI.colors.primary)
                .fillRoundedRect(trackX, trackY - 3 * u, trackWidth * value, 6 * u, 3 * u);
            thumb.x = trackX + trackWidth * value;
            valueText.setText(`${Math.round(value * 100)}%`);
        };
        const hitArea = this.add.zone(x + width / 2, trackY, width, 44 * u)
            .setInteractive({ useHandCursor: true });
        this.input.setDraggable(hitArea);
        const update = pointer => {
            if (this._changingLanguage || this._confirmingReset) return;
            const next = Math.round(Phaser.Math.Clamp((pointer.worldX - trackX) / trackWidth, 0, 1) * 100) / 100;
            if (next === value) return;
            value = next;
            onChange(value);
            draw();
            this._status = this._getText('SAVED');
            this._statusText.setText(this._status);
        };
        hitArea.on('pointerdown', update);
        hitArea.on('drag', update);
        draw();
        return { hitArea, thumb, valueText };
    }

    _createBackArrow() {
        this._backButton = createBackArrow(this, { canPress: () => !this._changingLanguage });
    }

    _button(x, y, width, text, action, color = UI.colors.primary, parent) {
        return createButton(this, {
            x, y, width, height: 40 * this._unit, text, parent,
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
