import { delayInMSec, getFontName, screenData } from '../Utils';
import { DialogBoxController } from '../classes/DialogBoxController';
import { CAMPAIGN_LEVELS, SCENE_NAMES } from '../constants';
import { config } from '../main';
import { CommonScene } from './CommonScene';

const INIT_DIALOG_DELAY = 1000;
const BRIEF_DIALOG_DELAY = 2500;

const CASUALTIES_MAP = {
    jet: {
        text: 'TOTAL_CASUALTIES_JEST',
    },
    helicopter: {
        text: 'TOTAL_CASUALTIES_HELICOPTERS',
    },
    rocket: {
        text: 'TOTAL_CASUALTIES_ROCKETS',
    },
    missile: {
        text: 'TOTAL_CASUALTIES_MISSILES'
    }
}

export class CampaignScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.CAMPAIGN);
    }

    preload() {
        this._createBg(); // needs to smooth transition between scenes
        this._preloadDictateTextAudio();
    }

    async create() {
        this._createControllers();
        this._createSounds();
        this._createMap();
        this._createReturnButton();
        await this._createDots();
        this._playBackgroundSound();
        await this._createCasualties();
        this._createAvailableMoney();
        this._createInitialDialogs();
    }

    _createMap() {
        this._map = this.add.image(this._centerDot.x, this._centerDot.y, 'map')
            .setAlpha(.65)
            .setOrigin(.5)
            .setScale(1.25);
    }

    async _playBackgroundSound() {
        if (this.model.currentLevelScene > CAMPAIGN_LEVELS.length) {
            await delayInMSec(this.scene, 1000);
            this._addCampaignCompleteSound();
            return;
        }

        this._addFireSound();
    }

    _addFireSound() {
        this.sounds.fire_effect.play({ volume: .05 })
        this.sounds.fire_effect.loop = true;
    }

    _addCampaignCompleteSound() {
        this.sounds.campaign_complete_song.play({ volume: .25 })
        this.sounds.campaign_complete_song.loop = true;
    }

    _stopBackgroundSound() {
        this.sounds.fire_effect.stop();
        this.sounds.campaign_complete_song.stop();
    }

    async _createDots() {
        this._dots = [];

        for (let i = CAMPAIGN_LEVELS.length; i > 0; i--) {
            const level = CAMPAIGN_LEVELS[i-1];
            await this._createDot(level);
        }
    }

    async _createDot(level) {
        const x = (config.width - this._map.displayWidth) * 0.5 + (level.x / 1000 * this._map.displayWidth);
        const y = (config.height - this._map.displayHeight) * 0.5 + (level.y / 1000 * this._map.displayWidth);
        const dot = this.add.image(x, y, 'battle')
            .setAlpha(0)
            .setScale(6)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this._selectLevel(dot));
        dot.info = level;
        dot.isCurrent = false;

        let params = {
            alpha: 1,
            scale: 1
        };

        if (level.index > this.model.currentLevelScene) {
            dot.on('pointerdown', () => { this.sounds.error.play({ volume: .33 }) });
            dot.active = false;

            params.alpha = 0.7;
            params.scale = 0.75;
        } else {
            dot.setAlpha(1).on('pointerdown', () => this._onDotClick);
            dot.active = true;

            if (this.model.currentLevelScene > level.index) {
                dot.setTexture('flag').setOrigin(0, 1);
            } else {
                dot.isCurrent = true;
            }
        }

        this._dots.push(dot);

        this._createDotTween(dot, params);
        return delayInMSec(this.scene, 100);
    }

    _onDotClick() {
        this.sounds.select.play({ volume: .33 });
        this._startDialogs(level.index, BRIEF_DIALOG_DELAY);
    }

    _createDotTween(dot, params) {
        this.scene.scene.tweens.add({
            targets: dot,
            alpha: params.alpha,
            scale: params.scale,
            ease: 'easeInCirc',
            duration: 250,
            onStart: () => this.sounds.whoosh_map.play({ volume: .1 }),
            onComplete: () => {
                if (dot.isCurrent) this._addDotCTAAnimation(dot);
            }
        });
    }

    _addDotCTAAnimation(object) {
        object.setScale(1);
        this.tweens.add({
            targets: object,
            scale: 1.5,
            duration: 425,
            yoyo: true,
            repeat: -1,
        });
    }

    async _createLevelCard(info) {
        const bgRect = this.add.rectangle(this._centerDot.x, this._centerDot.y, config.width, config.height, '0x000000', 0).setInteractive(); // todo move it to transition
        
        const currentLevelHiScore = this.model.getLevelHiScore(info.index);
        info.hiScore = currentLevelHiScore;

        const frame = this.add.image(this._centerDot.x, this._centerDot.y, 'frame');
        frame.displayHeight = config.height * 0.795;
        frame.texts = [];

        frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.086, this._getText('MISSION_CARD_MAIN_TITLE'), {
            font: `${frame.displayWidth * 0.13}px ${getFontName()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.55));

        frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.25, `${this._getText('MISSION_CARD_LEVEL')} ${info.index}`, {
            font: `${frame.displayWidth * 0.0925}px ${getFontName()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.37, this._getText('MISSION_CARD_CITY'), {
            font: `${frame.displayWidth * 0.055}px ${getFontName()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.44, this._getText(`LEVEL_${info.index}_NAME`), {
            font: `${frame.displayWidth * 0.06175}px ${getFontName()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        if (currentLevelHiScore > 0) {
            frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.58, `${this._getText('MISSION_CARD_SCORE')} ${currentLevelHiScore}`, {
                font: `${frame.displayWidth * 0.049}px ${getFontName()}`,
                fill: '#E2B80D',
            }).setOrigin(0.5).setAlpha(0.8));
        }

        frame.texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * 0.71, `${this._getText('MISSION_CARD_ENEMIES')} ${info.enemies}`, {
            font: `${frame.displayWidth * 0.051}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0.8));

        await this._createStamp(frame);
        this._createCardStartButton(frame, info);
        this._createCardCloseButton(frame, bgRect);
    }

    async _createStamp(frame) {
        this.sounds.stamp.play();
        const randAngle = Phaser.Math.Between(-45, 45);

        frame.stamp = this.add.image(frame.x, frame.y, 'stamp').setAlpha(0).setAngle(randAngle).setScale(2.5);

        const randX = frame.x + frame.displayWidth * 0.5 - frame.displayWidth * Phaser.Math.Between(25, 40) / 100;
        const randY = frame.y + frame.displayWidth * 0.5 - frame.displayHeight * Phaser.Math.Between(28, 40) / 100;

        await new Promise(resolve => {
            this.scene.scene.tweens.add({
                targets: frame.stamp,
                scale: .26,
                x: randX,
                y: randY,
                alpha: 0.85,
                ease: 'Power3',
                duration: 350,
                onComplete: () => resolve()
            });
        });
        await new Promise(resolve => {
            this.scene.scene.tweens.add({
                targets: frame.stamp,
                scale: .305,
                alpha: 0.55,
                ease: 'Power2',
                duration: 250,
                onComplete: () => resolve()
            });
        });
    }

    _createCardStartButton(frame, info) {
        frame.startButton = this.add.text(frame.x, frame.y + frame.displayHeight * 0.5 - frame.displayHeight * 0.09, this._getText('MISSION_CARD_START'), {
            font: `${frame.displayWidth * 0.105}px ${getFontName()}`,
            fill: '#51E04A',
        })
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setInteractive()
            .on('pointerdown', () => { 
                this._gameStart(info);
                this._stopBackgroundSound();
            })
            .on('pointerover', () => { frame.startButton.setAlpha(0.9) })
            .on('pointerout', () => { frame.startButton.setAlpha(0.7) });
    }

    _createCardCloseButton(frame, bgRect) {
        frame.closeButton = this.add.image(frame.x + frame.displayWidth * 0.5 - config.width * 0.033, frame.y - frame.displayHeight * 0.5 + config.width * 0.037, 'close')
            .setOrigin(0.5)
            .setAlpha(0.7)
            .setInteractive()
            .on('pointerdown', () => this._cardClose({ bgRect, frame }))
            .on('pointerover', () => frame.closeButton.setAlpha(0.9))
            .on('pointerout', () => frame.closeButton.setAlpha(0.7));
    }

    _createCasualties() {
        if (this._casualtiesText) {
            this._casualtiesText.forEach(element => {
                element.destroy();
            });
        }

        let position = {
            x: screenData.left + config.width * 0.033,
            y: config.height * 0.635,
        }

        this._casualtiesText = [];

        const title = this.add.text(position.x, position.y, this._getText('TOTAL_CASUALTIES'), {
            font: `${config.width * 0.025}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(0, 0.5).setAlpha(0.75);

        this._casualtiesText.push(title);

        Object.keys(this.model.casualties).forEach(async name => {
            const casualtyText = `${this._getText(CASUALTIES_MAP[name].text)} ${this.model.casualties[name]}`;
            position.y += config.width * 0.0285;
            const label = this.add.text(position.x, position.y, casualtyText, {
                font: `${config.width * 0.0215}px ${getFontName()}`,
                fill: '#000000',
            }).setOrigin(0, 0.5).setAlpha(0);
            this._casualtiesText.push(label);
        });

        return this._addCasualtiesTween();
    }

    async _addCasualtiesTween() {
        for (let i = 0; i < this._casualtiesText.length; i++) {
            const text = this._casualtiesText[i];
            await delayInMSec(this.scene, 125);

            this.scene.scene.tweens.add({
                targets: text,
                alpha: 0.7,
                ease: 'Linear',
                duration: 350,
            });
        }
    }

    _createControllers() {
        this._dialogBoxController = new DialogBoxController(this);
    }

    _createInitialDialogs() {
        const isInitial = this.model.currentLevelScene === 1 && this.model.totalScore === 0;

        if (!isInitial) {
            return;
        }
        this._startDialogs(0); 
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add('click'),
            select: this.sound.add('select'),
            error: this.sound.add('error'),
            stamp: this.sound.add('stamp'),
            ready: this.sound.add('ready'),
            whoosh_map: this.sound.add('whoosh_map'),
            fire_effect: this.sound.add('fire_effect'),
            campaign_complete_song: this.sound.add('campaign_complete_song'),
        };
    }

    _cardClose(data) {
        this.sounds.click.play({ volume: .2 });

        data.bgRect.destroy();
        data.frame.destroy();
        data.frame.stamp.destroy();
        data.frame.startButton.destroy();
        data.frame.closeButton.destroy();
        data.frame.texts.forEach(element => {
            element.destroy();
        });
    }

    _gameStart(info) {
        this.sounds.ready.play();

        const bgRect = this.add.rectangle(this._centerDot.x, this._centerDot.y, config.width, config.height, '0x000000', 0).setInteractive();

        this.tweens.add({
            targets: bgRect,
            fillAlpha: 1,
            ease: 'Linear',
            duration: this.sounds.ready.duration * 1000 * 0.85,
            onComplete: () => this.scene.start(SCENE_NAMES.GAME, info),
        });
    }

    _preloadDictateTextAudio() {
        for (let i = 0; i < CAMPAIGN_LEVELS.length; i++) {
            const texts = this.scene.scene.cache.json.get(`dialogues${i}`)

            if (!texts) {
                return;
            }

            for (let j = 0; j < texts.length; j++) {
                const name = `level${i}_text${j}_${this.model.lang}`;
                this.load.audio(name, `./assets/voices/${this.model.lang}/${i}/${j}.mp3`);
            }
        }
    }

    _selectLevel({active, info}) {
        if (!active) {
            return;
        }
        
        this._createLevelCard(info);
    }

    async _startDialogs(levelIndex, delay = INIT_DIALOG_DELAY) {
        await delayInMSec(this.scene, delay);
        await this._dialogBoxController.flowShow(levelIndex);
    }

    _onReturnButtonClick() {
        super._onReturnButtonClick();
        this._stopBackgroundSound();
    }

    _onMoneyButtonClick() {
        super._onMoneyButtonClick();
        this._stopBackgroundSound();
    }
}