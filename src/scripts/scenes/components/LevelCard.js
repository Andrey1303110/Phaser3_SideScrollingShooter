import { createScreenBlackRectangle, getFontName, tweenPromise } from "../../Utils";
import { DEPTH_LAYERS } from "../../constants";
import { config } from "../../main";

export class LevelCard extends Phaser.GameObjects.Container {
    constructor(scene, info, model, sounds, onStart) {
        super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);

        this.scene = scene;
        this.info = info;
        this.model = model;
        this.sounds = sounds;
        this.onStart = onStart;

        this.setDepth(DEPTH_LAYERS.COVER_SCREEN);

        this._createBackground();
        this._createFrame();
        this._createTexts();
        this._createStartButton();
        this._createCloseButton();

        scene.add.existing(this);

        this._animateBackground();
        this._createStamp();

        window.levelCard = this;
    }

    _createBackground() {
        this.bgRect = createScreenBlackRectangle(this.scene);
        this.bgRect.setOrigin(1);
        this.bgRect.setInteractive();
        this.add(this.bgRect);
    }

    _createFrame() {
        this.frame = this.scene.add.image(0, 0, 'frame');
        this.frame.displayHeight = config.height * 0.795;
        this.frame.texts = [];
        this.add(this.frame);
    }

    _createTexts() {
        const { info } = this;
        const hiScore = this.model.getLevelHiScore(info.index);
        info.hiScore = hiScore;

        const texts = [
            {
                text: this._getText('MISSION_CARD_MAIN_TITLE'),
                yFactor: 0.086,
                fontSize: 0.13,
                color: '#0a0a0a',
                alpha: 0.55,
            },
            {
                text: `${this._getText('MISSION_CARD_LEVEL')} ${info.index}`,
                yFactor: 0.25,
                fontSize: 0.0925,
                color: '#0a0a0a',
                alpha: 0.8,
            },
            {
                text: this._getText('MISSION_CARD_CITY'),
                yFactor: 0.37,
                fontSize: 0.055,
                color: '#0a0a0a',
                alpha: 0.8,
            },
            {
                text: this._getText(`LEVEL_${info.index}_NAME`),
                yFactor: 0.44,
                fontSize: 0.06175,
                color: '#0a0a0a',
                alpha: 0.8,
            },
            {
                text: `${this._getText('MISSION_CARD_ENEMIES')} ${info.enemies}`,
                yFactor: 0.71,
                fontSize: 0.051,
                color: '#EA0000',
                alpha: 0.8,
            },
        ];

        if (hiScore > 0) {
            texts.push({
                text: `${this._getText('MISSION_CARD_SCORE')} ${hiScore}`,
                yFactor: 0.58,
                fontSize: 0.049,
                color: '#E2B80D',
                alpha: 0.8,
            });
        }

        texts.forEach(t => {
            const textObj = this.scene.add.text(this.frame.x, -this.frame.displayHeight * 0.5 + this.frame.displayHeight * t.yFactor, t.text, {
                font: `${this.frame.displayWidth * t.fontSize}px ${getFontName()}`,
                fill: t.color,
            }).setOrigin(0.5).setAlpha(t.alpha);

            this.add(textObj);
            this.frame.texts.push(textObj);
        });
    }

    async _createStamp() {
        this.sounds.stamp.play();
        const randAngle = Phaser.Math.Between(-45, 45);

        this.stamp = this.scene.add.image(this.frame.x, this.frame.y, 'stamp')
            .setAlpha(0)
            .setAngle(randAngle)
            .setScale(2.5);

        this.add(this.stamp);

        const randX = this.frame.displayWidth * 0.5 - this.frame.displayWidth * Phaser.Math.Between(25, 40) / 100;
        const randY = this.frame.displayWidth * 0.5 - this.frame.displayHeight * Phaser.Math.Between(28, 40) / 100;

        await tweenPromise(this.scene, {
            targets: this.stamp,
            alpha: 0.85,
            scale: 0.26,
            x: randX,
            y: randY,
            ease: 'Power3',
            duration: 350,
        });
        await tweenPromise(this.scene, {
            targets: this.stamp,
            scale: 0.305,
            alpha: 0.55,
            ease: 'Power2',
            duration: 250,
        });
    }

    _createStartButton() {
        this.startButton = this.scene.add.text(this.frame.x, this.frame.displayHeight * 0.5 - this.frame.displayHeight * 0.09, this._getText('MISSION_CARD_START'), {
            font: `${this.frame.displayWidth * 0.105}px ${getFontName()}`,
            fill: '#51E04A',
        })
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setInteractive()
            .once('pointerdown', () => this.onStart?.(this.info))
            .on('pointerover', () => this.startButton.setAlpha(0.9))
            .on('pointerout', () => this.startButton.setAlpha(0.7));

        this.add(this.startButton);
    }

    _createCloseButton() {
        this.closeButton = this.scene.add.image(this.frame.displayWidth * 0.5 - config.width * 0.033, -this.frame.displayHeight * 0.5 + config.width * 0.037, 'close')
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setInteractive()
            .once('pointerdown', () => this._handleClose())
            .on('pointerover', () => this.closeButton.setAlpha(0.9))
            .on('pointerout', () => this.closeButton.setAlpha(0.7));

        this.add(this.closeButton);
    }

    _animateBackground() {
        return tweenPromise(this.scene, {
            targets: this.bgRect,
            fillAlpha: 0.5,
            ease: 'Linear',
            duration: 600,
        });
    }

    _handleClose() {
        this.destroy();
    }

    _getText(key) {
        return this.scene._getText(key);
    }
}
