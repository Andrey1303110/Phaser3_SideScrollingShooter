import { INPUT_EVENTS, LIFECYCLE_EVENTS, SOUND_KEYS, TEXT_KEYS } from '../identifiers';
import { CommonScene } from './CommonScene';
import { CAMPAIGN_LEVELS, SCENE_NAMES, UPGRADE_MULTIPLIER } from '../constants';
import { screenData, setEndpoints } from '../Utils';
import { UI, uiText, createButton, createBackArrow } from '../ui';

const SECTIONS = [TEXT_KEYS.ABOUT, TEXT_KEYS.CONTROLS, TEXT_KEYS.MODES, TEXT_KEYS.UPGRADES];
const COLORS = { ink: UI.colors.text, muted: UI.colors.muted };

export class InfoScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.INFO);
    }

    _createBg() {
        super._createBg();
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
            this.cameras.main.width, this.cameras.main.height, 0x102323, 0.88);
    }

    create() {
        this._createBg();
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK) };
        this._selectedSection = 0;
        this._createLayout();
        this._showSection(0);
        this._setupKeyboard();
        this._setupTouch();
        const resize = () => {
            setEndpoints();
            this._gesture = null;
            this._content.clearMask(true);
            this.children.removeAll(true);
            this._createBg();
            this._createLayout();
            this._showSection(this._selectedSection);
        };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => {
            this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize);
            this._content.clearMask(true);
        });
    }

    _createLayout() {
        // Screen-pixel sizes stay readable even though Phaser scales a 1280x720 canvas.
        const unit = screenData.width / document.body.clientWidth;
        this._unit = unit;
        const width = Math.min(screenData.width - 104 * unit, 680 * unit);
        const height = screenData.height - 20 * unit;
        const left = (screenData.left + screenData.right - width) / 2;
        const top = screenData.top + 10 * unit;
        const padding = UI.padding * unit;
        const buttonHeight = 44 * unit;

        this.add.graphics().fillStyle(UI.colors.panel, 0.98).lineStyle(unit, UI.colors.border)
            .fillRoundedRect(left, top, width, height, UI.panelRadius * unit)
            .strokeRoundedRect(left, top, width, height, UI.panelRadius * unit);

        this.add.text(left + padding, top + 12 * unit, this._getText(TEXT_KEYS.TITLE), {
            ...uiText(UI.type.title),
            wordWrap: { width: width - padding * 2 },
        });

        this._backButton = createBackArrow(this);

        const tabWidth = (width - padding * 2) / SECTIONS.length;
        const tabsTop = top + 58 * unit;
        this._tabs = SECTIONS.map((section, index) => {
            const x = left + padding + tabWidth * index;
            return this._createTouchButton(x + tabWidth / 2, tabsTop + buttonHeight / 2,
                tabWidth - 4 * unit, buttonHeight, this._getText(`${section}_TAB`),
                () => this._selectSection(index));
        });

        const contentTop = tabsTop + buttonHeight + 16 * unit;
        const footerY = top + height - buttonHeight / 2 - 8 * unit;
        this._view = {
            x: left + padding, y: contentTop, width: width - padding * 2,
            height: footerY - buttonHeight / 2 - 12 * unit - contentTop,
        };
        this._content = this.add.container(this._view.x, this._view.y);
        const maskShape = this.add.graphics().fillStyle(0xffffff)
            .fillRect(this._view.x, this._view.y, this._view.width, this._view.height).setVisible(false);
        this._content.setMask(maskShape.createGeometryMask());
        this._heading = this.add.text(0, 0, '', {
            ...uiText(UI.type.section),
            wordWrap: { width: this._view.width - 12 * unit },
        });
        this._body = this.add.text(0, 0, '', {
            fontFamily: 'Arial', fontSize: UI.type.body * unit, color: COLORS.ink,
            wordWrap: { width: this._view.width - 12 * unit }, lineSpacing: 5 * unit,
        });
        this._content.add([this._heading, this._body]);
        this._scrollTrack = this.add.rectangle(this._view.x + this._view.width - 3 * unit,
            this._view.y, 2 * unit, this._view.height, 0xc9b896).setOrigin(0.5, 0);
        this._scrollThumb = this.add.rectangle(this._scrollTrack.x, this._view.y,
            3 * unit, 24 * unit, UI.colors.primary).setOrigin(0.5, 0);
        this._createTouchButton(left + padding + buttonHeight / 2, footerY, buttonHeight, buttonHeight,
            '←', () => this._selectSection((this._selectedSection + SECTIONS.length - 1) % SECTIONS.length));
        this._createTouchButton(left + width - padding - buttonHeight / 2, footerY, buttonHeight, buttonHeight,
            '→', () => this._selectSection((this._selectedSection + 1) % SECTIONS.length));
        this._pageLabel = this.add.text(left + width / 2, footerY - 16 * unit, '', {
            fontFamily: 'Arial', fontSize: 16 * unit, color: COLORS.ink,
        }).setOrigin(0.5);
        this.add.text(left + width / 2, footerY + 9 * unit, this._getText(TEXT_KEYS.FOOTER), {
            fontFamily: 'Arial', fontSize: UI.type.caption * unit, color: COLORS.muted, align: 'center',
            wordWrap: { width: width - padding * 2 - 112 * unit },
        }).setOrigin(0.5);
    }

    _createTouchButton(x, y, width, height, text, callback) {
        return createButton(this, { x, y, width, height, text, onPress: callback });
    }

    _selectSection(index) {
        this.sounds.click.play({ volume: 0.2 });
        this._showSection(index);
    }

    _showSection(index) {
        this._selectedSection = index;
        const key = SECTIONS[index];
        this._heading.setText(this._getText(`${key}_TITLE`));
        this._body.setY(this._heading.height + 14 * this._unit);
        const body = this._getText(`${key}_BODY`)
            .replace('{levels}', CAMPAIGN_LEVELS.length)
            .replace('{percent}', Math.round(UPGRADE_MULTIPLIER * 100));
        this._body.setText(body);
        this._contentHeight = this._body.y + this._body.height;
        this._maxScroll = Math.max(0, this._contentHeight - this._view.height);
        this._scrollTo(0);
        this._pageLabel.setText(`${index + 1} / ${SECTIONS.length}`);
        this._tabs.forEach((tab, i) => {
            tab.setSelected(i === index);
        });
    }

    _scrollTo(offset) {
        this._scrollOffset = Math.max(0, Math.min(this._maxScroll, offset));
        this._content.y = this._view.y - this._scrollOffset;
        this._scrollTrack.setVisible(this._maxScroll > 0);
        this._scrollThumb.setVisible(this._maxScroll > 0);
        const height = Math.max(24 * this._unit, this._view.height * this._view.height / this._contentHeight);
        this._scrollThumb.setDisplaySize(3 * this._unit, Math.min(height, this._view.height));
        this._scrollThumb.y = this._view.y + (this._view.height - this._scrollThumb.displayHeight)
            * (this._maxScroll ? this._scrollOffset / this._maxScroll : 0);
    }

    _setupTouch() {
        const inside = pointer => pointer.x >= this._view.x && pointer.x <= this._view.x + this._view.width
            && pointer.y >= this._view.y && pointer.y <= this._view.y + this._view.height;
        const down = pointer => {
            if (inside(pointer)) this._gesture = { id: pointer.id, x: pointer.x, y: pointer.y, lastY: pointer.y };
        };
        const move = pointer => {
            const gesture = this._gesture;
            if (!gesture || gesture.id !== pointer.id || !pointer.isDown) return;
            const dx = Math.abs(pointer.x - gesture.x);
            const dy = Math.abs(pointer.y - gesture.y);
            if (!gesture.axis && Math.max(dx, dy) > 8 * this._unit) gesture.axis = dx > dy ? 'x' : 'y';
            if (gesture.axis === 'y') {
                this._scrollTo(this._scrollOffset + gesture.lastY - pointer.y);
            }
            gesture.lastY = pointer.y;
        };
        const up = pointer => {
            const gesture = this._gesture;
            if (!gesture || gesture.id !== pointer.id) return;
            this._gesture = null;
            const dx = pointer.x - gesture.x;
            if (gesture.axis === 'x' && Math.abs(dx) > 50 * this._unit) {
                this._selectSection((this._selectedSection + (dx < 0 ? 1 : SECTIONS.length - 1)) % SECTIONS.length);
            }
        };
        const cancel = () => { this._gesture = null; };
        const wheel = (pointer, objects, dx, dy) => {
            if (inside(pointer)) this._scrollTo(this._scrollOffset + dy * this._unit);
        };
        this.input.on(INPUT_EVENTS.POINTERDOWN, down);
        this.input.on(INPUT_EVENTS.POINTERMOVE, move);
        this.input.on(INPUT_EVENTS.POINTERUP, up);
        this.input.on('pointerupoutside', up);
        this.input.on(INPUT_EVENTS.GAMEOUT, cancel);
        this.input.on('wheel', wheel);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => {
            this._gesture = null;
            this.input.off(INPUT_EVENTS.POINTERDOWN, down);
            this.input.off(INPUT_EVENTS.POINTERMOVE, move);
            this.input.off(INPUT_EVENTS.POINTERUP, up);
            this.input.off('pointerupoutside', up);
            this.input.off(INPUT_EVENTS.GAMEOUT, cancel);
            this.input.off('wheel', wheel);
        });
    }

    _setupKeyboard() {
        const keyboard = this.input.keyboard;
        if (!keyboard) return;
        const back = () => this._onReturnButtonClick();
        const previous = () => this._showSection((this._selectedSection + SECTIONS.length - 1) % SECTIONS.length);
        const next = () => this._showSection((this._selectedSection + 1) % SECTIONS.length);
        keyboard.on('keydown-ESC', back);
        keyboard.on('keydown-LEFT', previous);
        keyboard.on('keydown-RIGHT', next);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => {
            keyboard.off('keydown-ESC', back);
            keyboard.off('keydown-LEFT', previous);
            keyboard.off('keydown-RIGHT', next);
        });
    }
}
