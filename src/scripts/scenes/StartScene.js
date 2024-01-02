import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { config, screenEndpoints } from '/src/scripts/main';

export class StartScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.start);
    }

    create(data) {
        this._createBG(data);
        this._createStartText();
        if (data.score !== undefined) {
            this._createStats(data);
        }
    }

    _createBG(data) {
        super._createBG();
        
        this._sceneBG.on('pointerdown', () => {
            this.scene.start(SCENE_NAMES.game, data);
        }, this);
    }

    _createStats(data) {
        this.add.graphics()
            .fillStyle('#000', 0.5)
            .fillRoundedRect(config.width / 2 - config.width * .15, config.height / 2 - config.height * .25, config.width * .3, config.height * .5, config.width*.03);

        const textTitle = data.completed ? 'Level completed!' : 'Game over';
        const textScore = `Score: ${data.score}`;
        const textStyle = {
            font: `${config.width*.03}px ${config.fonts[config.lang]}`,
            fill: '#f0f0f0',
        };

        this.add.text(config.width / 2, config.height / 2 - config.height * .125, textTitle, textStyle).setOrigin(0.5);
        this.add.text(config.width / 2, config.height / 2 + config.height * .125, textScore, textStyle).setOrigin(0.5);
    }

    _createStartText() {
        this._startText = this.add.text(config.width / 2, screenEndpoints.bottom - config.height * .05, 'Tap to start', {
            font: `${config.width*.04}px ${config.fonts[config.lang]}`,
            fill: '#f0f0f0',
        }).setOrigin(0.5);

        const initScale = this._startText.scale;

        const timeline = this.add.timeline(
            {
                at: 0,
                targets: this._startText,
                scale: initScale + .18,
                ease: 'Power2',
                duration: 550,
            },
            {
                targets: this._startText,
                scale: initScale,
                ease: 'Power2',
                duration: 550,
            }
        );

        timeline.loop = -1;

        timeline.play();
    }
}