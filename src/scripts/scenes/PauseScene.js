import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { config, screenData } from '/src/scripts/main';

export class PauseScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.pause);
    }

    create() {
        this._createBg();
        this._createButtons();
        this._toggleMenu();
    }

    _createBg() {
        this._black_bg = this.add.rectangle(this._center.x, this._center.y, config.width, config.height, '0x000000', 0);
        this._sceneBG = this.add.image(this._center.x, config.height * -1, 'pause_bg').setOrigin(.5);

        this.tweens.add({
            targets: this._sceneBG,
            y: this._center.x,
            ease: 'Linear',
            duration: 750,
        })
    }

    _createButtons() {
        this._play_button = this.add.image(this._sceneBG.x, this._sceneBG.y, 'play')
            .setOrigin(.5)
            .setScale(.8)
            .setAlpha(.85)
            .setInteractive()
            .on('pointerdown', () => this._toggleMenu('resume'), this)
            .on('pointerover', () => this._play_button.setAlpha(1))
            .on('pointerout', () => this._play_button.setAlpha(.85));

        this._restart_button = this.add.image(this._sceneBG.x + this._sceneBG.displayWidth * .25, this._sceneBG.y, 'restart')
            .setOrigin(.5)
            .setScale(1.25)
            .setAlpha(.65)
            .setInteractive()
            .on('pointerdown', () => this._toggleMenu('restart'), this)
            .on('pointerover', () => this._restart_button.setAlpha(1))
            .on('pointerout', () => this._restart_button.setAlpha(.65));

        this._return_button = this.add.image(this._sceneBG.x - this._sceneBG.displayWidth * .25, this._sceneBG.y, 'return')
            .setOrigin(.5)
            .setScale(1.25)
            .setAlpha(.65)
            .setInteractive()
            .on('pointerdown', () => this._toggleMenu('return'), this)
            .on('pointerover', () => this._return_button.setAlpha(1))
            .on('pointerout', () => this._return_button.setAlpha(.65));
    }

    _toggleMenu(command) {
        const tween_duration = 750;
        const y = this._sceneBG.y < 0 ? screenData.top + this._sceneBG.displayHeight * 0.5 : config.height * -1;

        this.tweens.add({
            targets: this._sceneBG,
            y: y,
            ease: 'Linear',
            duration: tween_duration,
            onComplete: () => {
                switch (command) {
                    case 'resume':
                        this.scene.resume(SCENE_NAMES.game);
                    break;
                    case 'restart':
                        this.scene.start(SCENE_NAMES.game);
                    break;
                    case 'return':
                        this.scene.stop(SCENE_NAMES.game);
                        this.scene.launch(SCENE_NAMES.campaign);
                    break;
                }
            }
        })
        this.tweens.add({
            targets: [this._play_button, this._restart_button, this._return_button],
            y: y + this._sceneBG.displayHeight * .06085,
            ease: 'Linear',
            duration: tween_duration,
        })
    }
}