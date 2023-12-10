import { SCENE_NAMES } from "../constants";
import { config, screenEndpoints } from "/src/scripts/main";

export class StartScene extends Phaser.Scene {
    constructor() {
        super(SCENE_NAMES.start);
    }

    create(data) {
        this.createBG(data);
        this.createStartText();
        if (data.score !== undefined) {
            this.createStats(data);
        }
    }

    createBG(data) {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        const scaleX = this.cameras.main.width / this.sceneBG.width;
        const scaleY = this.cameras.main.height / this.sceneBG.height;
        const scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
        
        this.sceneBG.on('pointerdown', () => {
            this.scene.start(SCENE_NAMES.game, data);
        }, this);
    }

    createStats(data) {
        this.add.graphics()
            .fillStyle('#000', 0.5)
            .fillRoundedRect(config.width / 2 - config.width * .15, config.height / 2 - config.height * .25, config.width * .3, config.height * .5, config.width*.03);

        const textTitle = data.completed ? 'Level completed!' : 'Game over';
        const textScore = `Score: ${data.score}`;
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };

        this.add.text(config.width / 2, config.height / 2 - config.height * .125, textTitle, textStyle).setOrigin(0.5);
        this.add.text(config.width / 2, config.height / 2 + config.height * .125, textScore, textStyle).setOrigin(0.5);
    }

    createStartText() {
        this.startText = this.add.text(config.width / 2, screenEndpoints.bottom - config.height * .05, 'Tap to start', {
            font: `${config.width*.04}px DishOut`,
            fill: '#f0f0f0',
        }).setOrigin(0.5);

        const initScale = this.startText.scale;

        const timeline = this.add.timeline(
            {
                at: 0,
                targets: this.startText,
                scale: initScale + .18,
                ease: 'Power2',
                duration: 550,
            },
            {
                targets: this.startText,
                scale: initScale,
                ease: 'Power2',
                duration: 550,
            }
        );

        timeline.loop = -1;

        timeline.play();
    }
}