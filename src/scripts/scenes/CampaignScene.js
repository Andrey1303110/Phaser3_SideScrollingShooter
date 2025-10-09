import { createScreenBlackRectangle, delayInMSec, getFontName, screenData, tweenPromise } from '../Utils';
import { DialogBoxController } from '../classes/DialogBoxController';
import { CAMPAIGN_LEVELS, DEPTH_LAYERS, SCENE_NAMES } from '../constants';
import { config } from '../main';
import { CommonScene } from './CommonScene';
import { LevelCard } from './components/LevelCard';

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

    init() {
        super.init();
        this._createSounds();
        this._createControllers();
    }

    preload() {
        this._createBg(); // needs to smooth transition between scenes
        this._addDialoguesAudio();
    }

    async create() {
        this._createMap();
        this._createReturnButton();
        await this._createDots();
        this._playBackgroundSound();
        await this._createCasualties();
        this._createAvailableMoney();
        this._createInitialDialogs();
    }

    _createMap() {
        this._map = this.add.image(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y, 'map')
            .setAlpha(0.65)
            .setOrigin(0.5)
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
        this.sounds.fire_effect.play({ volume: 0.05 })
        this.sounds.fire_effect.loop = true;
    }

    _addCampaignCompleteSound() {
        // this.sounds.campaign_complete_song.play({ volume: 0.2 });
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
        dot.info = level;
        dot.isCurrent = false;

        let params = {
            alpha: 1,
            scale: 1
        };

        if (level.index > this.model.currentLevelScene) {
            dot.on('pointerdown', () => { this.sounds.error.play({ volume: 0.33 }) });
            dot.active = false;

            params.alpha = 0.7;
            params.scale = 0.75;
        } else {
            dot.setAlpha(1);
            dot.on('pointerdown', () => this._onDotClick(dot));
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

    async _onDotClick(dot) {
        dot.removeInteractive();
        this.sounds.select.play({ volume: 0.33 });
        await this._startDialogs(dot.info.index, 250);
        this._createLevelCard(dot.info);
        dot.setInteractive();
    }

    _createDotTween(dot, params) {
        this.sounds.whoosh_map.play({ volume: 0.1 });
        return tweenPromise(this.scene.scene, {
            targets: dot,
            alpha: params.alpha,
            scale: params.scale,
            ease: 'easeInCirc',
            duration: 250,
            onComplete: () => this._addDotCTAAnimation(dot),
        });
    }

    _addDotCTAAnimation(object) {
        if (!object.isCurrent) {
            return;
        }
        object.setScale(1);

        return tweenPromise(this, {
            targets: object,
            scale: 1.5,
            duration: 425,
            yoyo: true,
            repeat: -1,
        });
    }

    _createLevelCard(info) {
        const card = new LevelCard(
            this,
            info,
            this.model,
            this.sounds,
            (info) => {
                this._gameStart(info);
                this._stopBackgroundSound();
            }
        );
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

    _gameStart(info) {
        const bgRect = createScreenBlackRectangle(this);
        bgRect.setDepth(DEPTH_LAYERS.COVER_SCREEN);
        const duration = this.sounds.ready.duration * 1000 * 0.85;
        this.sounds.ready.play();

        return tweenPromise(this, {
            targets: bgRect,
            fillAlpha: 1,
            ease: 'Linear',
            duration,
            onComplete: () => this.scene.start(SCENE_NAMES.GAME, info),
        });
    }

    _addDialoguesAudio() {
        for (let i = 0; i <= CAMPAIGN_LEVELS.at(-1).index; i++) {
            const texts = this.scene.scene.cache.json.get(`dialogues${i}`)

            if (!texts) {
                return;
            }

            for (let j = 0; j < texts.length; j++) {
                const name = `level${i}_text${j}_${this.model.lang}`;
                this.sounds[name] = this.sound.add(name);
            }
        }
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