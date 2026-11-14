import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { getFontName, screenData, setEndpoints } from '../Utils';

export class PauseScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PAUSE);
    }

    preload() {}

    create() {
        this._info = { ...this.scene.get(SCENE_NAMES.GAME).info };
        this.sounds = { click: this.sound.add('click') };
        this._transitioning = true;
        this._exiting = false;
        this._createMenu();
        this._panel.setAlpha(0).setScale(0.96);
        this.tweens.add({
            targets: this._panel, alpha: 1, scale: 1, duration: 160, ease: 'Cubic.Out',
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
        this.scale.on('resize', resize);
        this.events.once('shutdown', () => this.scale.off('resize', resize));
    }

    _createMenu() {
        const unit = screenData.width / document.body.clientWidth;
        const width = Math.min(420 * unit, screenData.width - 32 * unit);
        const height = Math.min(252 * unit, screenData.height - 24 * unit);
        this._unit = unit;
        this._blackBG = this.add.rectangle((screenData.left + screenData.right) / 2,
            (screenData.top + screenData.bottom) / 2, screenData.width, screenData.height,
            0x101c21, 0.65).setInteractive();
        this._panel = this.add.container((screenData.left + screenData.right) / 2,
            (screenData.top + screenData.bottom) / 2);

        const background = this.add.graphics();
        background.fillStyle(0x071014, 0.2).fillRoundedRect(-width / 2 + 4 * unit,
            -height / 2 + 6 * unit, width, height, 18 * unit);
        background.fillStyle(0xf6edda).lineStyle(1.5 * unit, 0xd9c8a8)
            .fillRoundedRect(-width / 2, -height / 2, width, height, 18 * unit)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, 18 * unit);
        this._panel.add(background);

        const title = this.add.text(0, -height / 2 + 22 * unit, this._getText('TITLE'), {
            font: `${32 * unit}px ${getFontName()}`, color: '#243c43',
        }).setOrigin(0.5, 0);
        const context = this._info.isUnlim ? this._getText('SURVIVAL')
            : `${this._getText('CAMPAIGN')} · ${this._getText('LEVEL')} ${this._info.index}`;
        const subtitle = this.add.text(0, -height / 2 + 68 * unit, context, {
            fontFamily: 'Arial', fontSize: 15 * unit, color: '#687268',
        }).setOrigin(0.5, 0);
        this._panel.add([title, subtitle]);

        const buttonWidth = width - 48 * unit;
        const secondaryWidth = (buttonWidth - 12 * unit) / 2;
        this._buttons = [
            this._createButton(0, -height / 2 + 122 * unit, buttonWidth, 54 * unit,
                this._getText('RESUME'), 'play', true),
            this._createButton(-(secondaryWidth + 12 * unit) / 2, -height / 2 + 192 * unit,
                secondaryWidth, 50 * unit, this._getText('RESTART'), 'restart'),
            this._createButton((secondaryWidth + 12 * unit) / 2, -height / 2 + 192 * unit,
                secondaryWidth, 50 * unit, this._getText(this._info.isUnlim ? 'TO_MENU' : 'TO_CAMPAIGN'), 'return'),
        ];
    }

    _createButton(x, y, width, height, text, command, primary = false) {
        const graphics = this.add.graphics();
        const draw = pressed => {
            graphics.clear().fillStyle(primary ? (pressed ? 0x28613b : 0x367c4b) : (pressed ? 0xd4c5a9 : 0xe6dac1))
                .fillRoundedRect(x - width / 2, y - height / 2, width, height, 10 * this._unit);
        };
        draw(false);
        const label = this.add.text(x, y, text, {
            fontFamily: 'Arial', fontSize: (primary ? 20 : 17) * this._unit,
            fontStyle: primary ? 'bold' : 'normal', color: primary ? '#ffffff' : '#243c43',
        }).setOrigin(0.5);
        const hitArea = this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true });
        let pressedPointer = null;
        hitArea.on('pointerdown', pointer => {
            if (this._transitioning) return;
            pressedPointer = pointer.id;
            draw(true);
        });
        hitArea.on('pointerout', () => { pressedPointer = null; draw(false); });
        hitArea.on('pointerup', pointer => {
            if (pressedPointer !== pointer.id) return;
            pressedPointer = null;
            draw(false);
            this._close(command);
        });
        this._panel.add([graphics, label, hitArea]);
        return { hitArea, label, command };
    }

    _close(command) {
        if (this._transitioning) return;
        this._transitioning = true;
        this._exiting = true;
        this.sounds.click.play({ volume: 0.2 });
        this.tweens.add({
            targets: this._panel, alpha: 0, scale: 0.96, duration: 100, ease: 'Cubic.In',
            onComplete: () => this._handleScreen(command),
        });
    }

    _handleScreen(command) {
        switch (command) {
            case 'play':
                this.scene.resume(SCENE_NAMES.GAME);
                this.scene.stop();
            break;
            case 'restart':
                this.scene.start(SCENE_NAMES.GAME, { ...this._info });
            break;
            case 'return':
                const destination = this._info.isUnlim ? SCENE_NAMES.MAIN_MENU : SCENE_NAMES.CAMPAIGN;
                this.scene.stop(SCENE_NAMES.GAME);
                this.scene.start(destination);
            break;
        }
    }
}
