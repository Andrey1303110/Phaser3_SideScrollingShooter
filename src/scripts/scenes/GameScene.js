import { getFont, config, screenEndpoints } from '../main';
import { Player } from '/src/scripts/prefabs/Player';
import { Enemies } from '/src/scripts/prefabs/Enemies';
import { Boom } from '/src/scripts/prefabs/Boom';
import { DEPTH_LAYERS, SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';

export class GameScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.game);
    }

    init(data) {
        super.init();

        if (localStorage.getItem('firstTimePlay') !== '0') {
            localStorage.setItem('firstTimePlay', '0');
        }
        this.info = data;
        this._currentLevelScene = this.info.index;
        this._currentScore = 0;
        this._black_bg = null;
    }

    create(data) {
        this.cursors = this.input.keyboard.createCursorKeys();

        this._createBG(data);
        this._getMaxEnemyHeightFrame();
        this._createPlayer();
        this._createEnemies();
        this._createCompleteEvents();
        this._addOverlap();
        this._createScoreText();
        this._createSounds();
        this._addPauseButton();
        this._addMobileButtons();
        this._addJoystick();
        this._addFireButton();
        if (!this.info?.unlim) {
            this._addProgressBar();
        }
    }

    update() {
        this._sceneBG.tilePositionX += this._sceneBG.width / 10000 * this.speed;
        this._dumpJoyStickState();
        this._player.move();
        this._player.shooting();
    }

    _addMobileButtons() {
        if (document.body.clientWidth > 1280) return;

        this._addJoystick();
        this._addFireButton();
    }

    _addJoystick(){
        this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: screenEndpoints.left + config.joystick.radius + config.joystick.gap,
            y: screenEndpoints.bottom - config.joystick.radius - config.joystick.gap,
            radius: config.joystick.radius,
            base: this.add.circle(0, 0, config.joystick.radius).setStrokeStyle(3.5, 0x1a65ac).setAlpha(.75),
            thumb: this.add.circle(0, 0, config.joystick.radius * 0.5, 0xcccccc).setAlpha(0.5),
            dir: '8dir',
        });
    }

    _dumpJoyStickState() {
        if (this.joyStick) {
            this.cursorKeys = this.joyStick.createCursorKeys();
        }
    }

    _addFireButton(){
        this.fireButton = this.add.sprite(screenEndpoints.right - config.joystick.radius - config.joystick.gap, this.joyStick.y, 'fire')
                        .setAlpha(0.65)
                        .setInteractive()
                        .setActive(false)
                        .on('pointerup', () => {
                            this.fireButton.active = false;
                        }, this)
                        .on('pointerdown', () => {
                            this.fireButton.active = true;
                            this._player.shooting();
                        }, this);
    }

    _createBG(data) {
        const bg_image = data?.unlim ? `bg${Phaser.Math.Between(1, config.Levels.length)}` : `bg${data.index}`;

        const real_height = this.textures.list[bg_image].source[0].height;
        const scale = config.height/real_height;

        this.speed = config.Levels[this._currentLevelScene-1].velocity;

        if (scale !== 1) {
            this.speed /= scale;
        }

        this._sceneBG = this.add.tileSprite(0, 0, config.width, config.height, bg_image).setOrigin(0).setScale(scale).setAlpha(.65);
    }

    _createScoreText() {
        if (this.hiScoreText) {
            this.hiScoreText.destroy();
        }

        this.scoreText = this.add.text(screenEndpoints.right - config.width * .01, screenEndpoints.top + config.width * .01, this._currentScore, {
            font: `${config.width * .03}px ${getFont()}`,
            fill: '#EA0000',
        }).setOrigin(1, 0).setAlpha(.75);

        if (this.info?.unlim) {
            this.hiScoreText = this.add.text(config.width * 0.5, screenEndpoints.top + config.width * .01, `${this._getText('TOP_HIGH_SCORE')} ${localStorage.getItem('unlimHiScores')}`, {
                font: `${config.width * .03}px ${getFont()}`,
                fill: '#EA0000',
            }).setOrigin(0.5, 0).setAlpha(.75);
        }
    }

    _createPlayer() {
        this._player = new Player({ scene: this });
    }

    _createEnemies() {
        this._enemies = new Enemies(this);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            rocket_launch: this.sound.add('rocket_launch'),
            fire_launch: this.sound.add('fire_launch'),
            missile_launch: this.sound.add('missile_launch'),
            explosion_small: this.sound.add('explosion_small'),
            wings: this.sound.add('wings'),
            died: this.sound.add('died'),
            win: this.sound.add('win'),
            level_up: this.sound.add('level_up'),
        };
    }

    _addOverlap() {
        this.physics.add.overlap(this._player.fires, this._enemies, this._onOverlap, undefined, this);
        this.physics.add.overlap(this._enemies.fires, this._player, this._onOverlap, undefined, this);
        this.physics.add.overlap(this._player.fires, this._enemies.fires, this._onOverlap, undefined, this);
        this.physics.add.overlap(this._player, this._enemies, this._onOverlap, undefined, this);
    }

    _onOverlap(source, target) {
        if (target.x > config.width + target.displayWidth * 0.5) {
            return;
        }

        if (source !== this._player && target !== this._player) {
            if (!this.info?.unlim) {
                let losses_name = target.texture.key;
                if (target.texture.key === 'strategic_jet') {
                    losses_name = 'jet';
                } else if (target.texture.key === 'missile_2') {
                    losses_name = 'missile';
                }
                let old_value = Number(localStorage.getItem(`losses_${losses_name}`));
                localStorage.setItem(`losses_${losses_name}`, ++old_value);
            }
            let reward = Number((target.reward * Math.pow(config.level.scoreCof, this._currentLevelScene - 1)).toFixed(0));
            this._currentScore += reward;

            if (!this.info?.unlim) {
                const last_score = Number(config.totalScore);
                localStorage.setItem('totalScore', last_score + reward);
                config.totalScore = last_score + reward;
            }
            this.scoreText.text = this._currentScore;
            this._updateProgressBar();
        }

        Boom.generate(this, target.x, target.y);

        source.setAlive(false);
        target.setAlive(false);
        this.sounds.explosion_small.play();
    }

    _createCompleteEvents() {
        this._player.emit('killed');
        this._player.once('killed', this._onComplete, this);
        this.events.once('enemies-killed', this._onComplete, this);
    }

    _onComplete() {
        if (this._black_bg) {
            return;
        }

        this._black_bg = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 0).setInteractive().setDepth(DEPTH_LAYERS.COVER_SCREEN);
        let final_text = this.add.text(this._black_bg.x, this._black_bg.y, '', {
            font: `${config.width * .03}px ${getFont()}`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0).setDepth(DEPTH_LAYERS.MAX);
        this.game.sound.stopAll();

        if (this._player.active) {
            this.sounds.win.play();
            final_text.text = this._getText('FINAL_TEXT_WIN');

            if (this.info.hiScore < this._currentScore) {
                let hiScores = localStorage.getItem('hiScores').split(',');
                hiScores[this._currentLevelScene - 1] = this._currentScore;
                localStorage.setItem('hiScores', hiScores.join());
            }

            if (config.currentLevelScene <= this._currentLevelScene) {
                config.currentLevelScene++;
                localStorage.setItem('currentLevelScene', config.currentLevelScene);
            }
        } else {
            final_text.text = this._getText('FINAL_TEXT_LOSE');
            this.sounds.died.play();

            if (this.info.unlim) {
                if (localStorage.getItem('unlimHiScores') < this._currentScore) {
                    localStorage.setItem('unlimHiScores', this._currentScore);
                }
            }
        }

        this.tweens.add({
            targets: [this._black_bg, final_text],
            fillAlpha: 1,
            alpha: 1,
            scale: final_text.scale * 2,
            ease: 'Linear',
            duration: this.sounds.died.duration * 1000 * .75,
            onComplete: () => {
                if (this.info.unlim) {
                    this.scene.start(SCENE_NAMES.main);
                } else {
                    this.scene.start(SCENE_NAMES.campaign);
                }
                this.scene.stop();
            }
        })

        this._enemies.stopTimer();
        this._enemies.children.entries.forEach(enemy => {
            enemy.stopTimer();
        });
    }

    _addPauseButton() {
        this.add.sprite(screenEndpoints.left + config.width * .015, screenEndpoints.top + config.width * .015, 'pause')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.launch('Pause');
                this.scene.pause();
            }, this);
    }

    _addProgressBar(){
        this._progressBar = this.add.sprite(config.width/2, screenEndpoints.top + config.width * .0225, 'progress_bar')
            .setAlpha(0.95);
        this._progressBar.fillProgress = this.add.sprite(this._progressBar.x + this._progressBar.displayWidth * .1, this._progressBar.y + this._progressBar.displayHeight * .04, 'progress_bar_fill')
            .setAlpha(0.95);
        
        this._progressBar.levelText = this.add.text(this._progressBar.x - this._progressBar.displayWidth * .38, this._progressBar.y - this._progressBar.displayHeight * .035, config.currentLevelPlayer, {
            font: `${this._progressBar.displayHeight * .545}px ${getFont()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0.75);

        this._updateProgressBar();
    }

    _updateProgressBar(){
        if (this.info?.unlim) {
            return;
        }
        let score = {
            start: this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1),
            end: this._getRequiredScoreOnLevel(config.currentLevelPlayer),
            diff: this._getRequiredScoreOnLevel(config.currentLevelPlayer) - this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1)
        };
        let currentProgress = (config.totalScore - score.start)/score.diff;
        if (config.currentLevelPlayer < 2) {
            currentProgress = config.totalScore/score.diff;
        }

        if (currentProgress >= 1) {
            this._increaseLevel();
            score = {
                start: this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1),
                end: this._getRequiredScoreOnLevel(config.currentLevelPlayer),
                diff: this._getRequiredScoreOnLevel(config.currentLevelPlayer) - this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1)
            };
            currentProgress = 1 - (-1 * (config.totalScore - score.end)/score.diff);
        }

        this._progressBar.fillProgress.frame.cutWidth = this._progressBar.fillProgress.displayWidth * currentProgress;
        this._progressBar.fillProgress.frame.updateUVs();
        this._progressBar.text = config.currentLevelPlayer;
    }

    _increaseLevel(){
        this.sounds.level_up.play({volume: .5});
        config.currentLevelPlayer++;
        localStorage.setItem('currentLevelPlayer', config.currentLevelPlayer);

        const levelTextLabel = this.add.text(config.width * 0.5, config.height * 0.5, config.currentLevelPlayer, {
            font: `${config.width * .25}px ${getFont()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: levelTextLabel,
            alpha: 1,
            x: this._progressBar.levelText.x,
            y: this._progressBar.levelText.y,
            scale: this._progressBar.levelText.displayWidth/levelTextLabel.displayWidth,
            ease: 'Linear',
            duration: 500,
            onComplete: () => {
                levelTextLabel.destroy();
                this._progressBar.levelText.text = config.currentLevelPlayer;
            }
        });

        this._increaseMoney();
    }

    _getRequiredScoreOnLevel(level){
        let result = 0;
        for (let i = 0; i < level; i++) {
            result += Number((config.level.score * Math.pow(config.level.levelCof, i)).toFixed(0));
        }
        return result;
    }

    _increaseMoney(){
        ++config.money;
        localStorage.setItem('money', config.money);
    }

    _getMaxEnemyHeightFrame() {
        let max_frame_height = 0;
        const frames = this.textures.list.helicopter.frames;

        Object.keys(frames).forEach(function (key) {
            if (frames[key].cutHeight > max_frame_height) {
                max_frame_height = frames[key].height;
            }
        });
        this.maxEnemyFrameHeight = max_frame_height;
    }
}