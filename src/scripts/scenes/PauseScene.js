import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { config } from '../main';
import { createScreenBlackRectangle, screenData, tweenPromise } from '../Utils';

const DEFAULT_BUTTON_ALPHA = 0.85;

export class PauseScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.PAUSE);
    }

    create() {
        this._createBg();
        this._createButtons();
        this._toggleMenu();
    }

    _createBg() {
        this._blackBG = createScreenBlackRectangle(this);
        this._sceneBG = this.add.image(this.scene.scene.cameras.main.midPoint.x, config.height * -1, 'pause_bg').setOrigin(0.5);

        return tweenPromise(this, {
            targets: this._blackBG,
            y: this.scene.scene.cameras.main.midPoint.y,
            ease: 'Linear',
            duration: 750,
        });
    }

    _createButtons() {
        this._buttons = [
            this._createButton(this._sceneBG.x, this._sceneBG.y, 0.8, 'play'),
            this._createButton(this._sceneBG.x + this._sceneBG.displayWidth * 0.25, this._sceneBG.y, 1.25, 'restart'),
            this._createButton(this._sceneBG.x - this._sceneBG.displayWidth * 0.25, this._sceneBG.y, 1.25, 'return'),
        ]
    }

    _createButton(x, y, scale, name) {
        const button =  this.add.image(x, y, name)
            .setAlpha(DEFAULT_BUTTON_ALPHA)
            .setScale(scale)
            .setOrigin(0.5);
        button.setInteractive()
            .on('pointerdown', () => this._toggleMenu(name))
            .on('pointerover', () => button.setAlpha(1))
            .on('pointerout', () => button.setAlpha(DEFAULT_BUTTON_ALPHA));
        
        return button;
    }

    async _toggleMenu(command) {
        const duration = 750;
        const y = this._sceneBG.y < 0 ? screenData.top + this._sceneBG.displayHeight * 0.5 : config.height * -1;

        await Promise.all([
            tweenPromise(this, {
                targets: this._sceneBG,
                y,
                ease: 'Linear',
                duration,
            }),
            tweenPromise(this, {
                targets: this._buttons,
                y: y + this._sceneBG.displayHeight * 0.06085,
                ease: 'Linear',
                duration,
            }),
        ]);

        this._handleScreen(command);
    }

    _handleScreen(command) {
        switch (command) {
            case 'play':
                this.scene.resume(SCENE_NAMES.GAME);
            break;
            case 'restart':
                this.scene.start(SCENE_NAMES.GAME);
            break;
            case 'return':
                //todo store last scene and return to the menu or map
                this.scene.stop(SCENE_NAMES.GAME);
                this.scene.launch(SCENE_NAMES.CAMPAIGN);
            break;
        }
    }
}