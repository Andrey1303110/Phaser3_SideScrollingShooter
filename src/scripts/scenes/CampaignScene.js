import { DialogBoxController } from '../classes/DialogBoxController';
import { SCENE_NAMES } from '../constants';
import { getFont, delay, config, screenData, delayInMSec } from '../main';
import { CommonScene } from './CommonScene';

const INIT_DIALOG_DELAY = 1000;
const BRIEF_DIALOG_DELAY = 2500;

const LOSSES_MAP = {
    jet: {
        text: 'TOTAL_LOSSES_JEST',
    },
    helicopter: {
        text: 'TOTAL_LOSSES_HELICOPTERS',
    },
    rocket: {
        text: 'TOTAL_LOSSES_ROCKETS',
    },
    missile: {
        text: 'TOTAL_LOSSES_MISSILES'
    }
}

export class CampaignScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.campaign);
    }

    preload() {
        this._createBg(); // needs to smooth transition between scenes
        this._preloadDictateTextAudio();
    }

    async create() {
        this._createSounds();
        this._createMap();
        this._createMissions();
        this._createLosses();
        this._createReturnButton();
        this._createControllers();
        this._createAvailableMoney();
        this._createInitialDialogs(); // todo as initial dialogs
    }

    _createMap() {
        this._map = this.add.image(this._center.x, this._center.y, 'map')
            .setAlpha(.65)
            .setOrigin(.5)
            .setScale(1.25);
    }

    _createMissions() {
        const timelineEvents = [];
        config.Levels.forEach((element, i) => {
            timelineEvents.push({
                at: i * 100,
                run: () => this._createDot(element)
            })
        });

        const timeline = this.add.timeline(timelineEvents);
        timeline.play(); 
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

        if (level.index > config.currentLevelScene) {
            dot.on('pointerdown', () => { this.sounds.error.play({ volume: .33 }) });
            dot.active = false;

            params.alpha = 0.7;
            params.scale = 0.75;
        } else {
            dot.setAlpha(1)
                .on('pointerdown', () => { 
                    this.sounds.select.play({ volume: .33 });
                    this._startDialogs(level.index, BRIEF_DIALOG_DELAY);
                });
            dot.active = true;

            if (config.currentLevelScene > level.index) {
                dot.setTexture('flag').setOrigin(0, 1);
            } else {
                dot.isCurrent = true;
            }
        }

        this._createDotTween(dot, params);
    }

    _createDotTween(dot, params) {
        this.tweens.add({
            targets: dot,
            alpha: params.alpha,
            scale: params.scale,
            ease: 'easeInCirc',
            duration: 250,
            onStart: () => this.sounds.whoosh_map.play({ volume: .15 }),
            onComplete: () => { 
                if (dot.isCurrent) this._addDotAnim(dot);
            }
        })
    }

    _addDotAnim(object) {
        object.setScale(1);
        this.tweens.add({
            targets: object,
            scale: 1.5,
            duration: 425,
            yoyo: true,
            repeat: -1,
        });
        this.sounds.fire_effect.play({ volume: .1 })
        this.sounds.fire_effect.loop = true;
    }

    _createLevelCard(info) {
        const bg_rect = this.add.rectangle(this._center.x, this._center.y, config.width, config.height, '0x000000', 0).setInteractive();
        
        const currentLevelHiScore = localStorage.getItem('hiScores').split(',')[info.index - 1];
        info.hiScore = currentLevelHiScore;

        const first_anim_duration = 365;

        const frame = this.add.image(this._center.x, this._center.y, 'frame');
        frame.displayHeight = config.height * .795;

        let texts = []
        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .086, this._getText('MISSION_CARD_MAIN_TITLE'), {
            font: `${frame.displayWidth * .13}px ${getFont()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.55));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .25, `${this._getText('MISSION_CARD_LEVEL')} ${info.index}`, {
            font: `${frame.displayWidth * .0925}px ${getFont()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .37, this._getText('MISSION_CARD_CITY'), {
            font: `${frame.displayWidth * .055}px ${getFont()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .44, this._getText(`LEVEL_${info.index}_NAME`), {
            font: `${frame.displayWidth * .06175}px ${getFont()}`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        if (currentLevelHiScore > 0) {
            texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .58, `${this._getText('MISSION_CARD_SCORE')} ${currentLevelHiScore}`, {
                font: `${frame.displayWidth * .049}px ${getFont()}`,
                fill: '#E2B80D',
            }).setOrigin(0.5).setAlpha(0.8));
        }

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight * 0.5 + frame.displayHeight * .71, `${this._getText('MISSION_CARD_ENEMIES')} ${info.enemies}`, {
            font: `${frame.displayWidth * .051}px ${getFont()}`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0.8));

        this.sounds.stamp.play();

        const stamp = this.add.image(frame.x, frame.y, 'stamp').setAlpha(0).setAngle(31).setScale(2.5);

        const randX = frame.x + frame.displayWidth * 0.5 - frame.displayWidth * Phaser.Math.Between(25, 35) / 100;
        const randY = frame.y + frame.displayWidth * 0.5 - frame.displayHeight * Phaser.Math.Between(26, 30) / 100;

        const timeline = this.add.timeline([
            {
                tween: {
                    targets: stamp,
                    scale: .26,
                    x: randX,
                    y: randY,
                    alpha: 0.85,
                    ease: 'Power3',
                    duration: first_anim_duration,
                }
            },
            {
                at: first_anim_duration,
                tween: {
                    targets: stamp,
                    scale: .305,
                    alpha: 0.55,
                    ease: 'Power2',
                    duration: first_anim_duration * .75,
                },
            },
            {
                at: first_anim_duration + first_anim_duration * .75,
                run: () => {
                    const start_button = this.add.text(frame.x, frame.y + frame.displayHeight * 0.5 - frame.displayHeight * .09, this._getText('MISSION_CARD_START'), {
                        font: `${frame.displayWidth * .105}px ${getFont()}`,
                        fill: '#51E04A',
                    })
                        .setOrigin(0.5)
                        .setAlpha(0.7)
                        .setInteractive()
                        .on('pointerdown', () => { 
                            this._gameStart(info);
                            this.sounds.fire_effect.stop();
                        })
                        .on('pointerover', () => { start_button.setAlpha(0.9) })
                        .on('pointerout', () => { start_button.setAlpha(0.7) });
                    texts.push(start_button);
                    
                    const close_button = this.add.image(frame.x + frame.displayWidth * 0.5 - config.width * 0.033, frame.y - frame.displayHeight * 0.5 + config.width * 0.037, 'close')
                        .setOrigin(0.5)
                        .setAlpha(0.7)
                        .setInteractive()
                        .on('pointerdown', () => { this._cardClose({ bg_rect, frame, texts, stamp, close_button }) })
                        .on('pointerover', () => { close_button.setAlpha(0.9) })
                        .on('pointerout', () => { close_button.setAlpha(0.7) });
                }
            }
        ]);

        timeline.play();
    }

    _createLosses() {
        if (this.losses_text) {
            this.losses_text.forEach(element => {
                element.destroy();
            });
        }

        let points = {
            x: screenData.left + config.width * .033,
            y: config.height * .635,
        }

        this.losses_text = [];

        this.losses_text.push(this.add.text(points.x, points.y, this._getText('TOTAL_LOSSES'), {
            font: `${config.width * .025}px ${getFont()}`,
            fill: '#EA0000',
        }).setOrigin(0, 0.5).setAlpha(0.75));

        Object.keys(config.Losses).forEach(name => {
            points.y += config.width * .0285;
            this.losses_text.push(this.add.text(points.x, points.y, `${this._getText(LOSSES_MAP[name].text)} ${localStorage.getItem(`losses_${name}`)}`, {
                font: `${config.width * .0215}px ${getFont()}`,
                fill: '#000000',
            }).setOrigin(0, 0.5).setAlpha(0.75));
        });
    }

    _createControllers() {
        this._dialogBoxController = new DialogBoxController(this);
    }


    _createInitialDialogs() {
        const isInitial = config.currentLevelScene === 1 && !localStorage.getItem('isFirstTimePlay');
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
        };
    }

    _cardClose(data) {
        this.sounds.click.play({ volume: .2 });

        data.bg_rect.destroy();
        data.frame.destroy();
        data.stamp.destroy();
        data.close_button.destroy();
        data.texts.forEach(element => {
            element.destroy();
        });
    }

    _gameStart(info) {
        this.sounds.ready.play();

        const bg_rect = this.add.rectangle(this._center.x, this._center.y, config.width, config.height, '0x000000', 0).setInteractive();

        this.tweens.add({
            targets: bg_rect,
            fillAlpha: 1,
            ease: 'Linear',
            duration: this.sounds.ready.duration * 1000 * .7,
            onComplete: () => this.scene.start(SCENE_NAMES.game, info),
        });
    }

    _preloadDictateTextAudio() {
        for (let i = 0; i < config.Levels.length; i++) {
            const texts = this.scene.scene.cache.json.get(`dialogues${i}`)

            if (!texts) {
                return;
            }

            for (let j = 0; j < texts.length; j++) {
                const name = `level${i}_text${j}_${config.lang}`;
                this.load.audio(name, `./assets/voices/${config.lang}/${i}/${j}.mp3`);
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
        await delayInMSec(delay);
        await this._dialogBoxController.flowShow(levelIndex);
    }
}