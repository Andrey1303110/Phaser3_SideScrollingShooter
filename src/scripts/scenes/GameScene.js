import { getFontName, config, screenData, getLocalStorageItem } from '../main';
import { Player } from '../prefabs/Player';
import { Enemies } from '../prefabs/Enemies';
import { Boom } from '../prefabs/Boom';
import { SCENE_NAMES, DEPTH_LAYERS, EVENTS, JOYSTICK_GAP, JOYSTICK_RADIUS, LEVELS_EXP_MULTIPLIER, LEVEL_REQUIRED_SCORE, LEVEL_SCORE_MULTIPLIER, WEAPONS, ENEMIES } from '../constants';
import { CommonScene } from './CommonScene';
import { HealthBar } from '../classes/HealthBar';

export class GameScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.GAME);

        window.gameScene = this;
    }

    init(data) {
        super.init();

        this.info = data;
        this._currentLevelScene = this.info.index;
        this._currentScore = 0;
        this._blackBG = null;
    }

    create(data) {
        this.cursors = this.input.keyboard.createCursorKeys();

        this._createBg(data);
        this._createPlayer();
        this._createHealthBar();
        this._createEnemies();
        this._createCompleteEvents();
        this._setupOverlapping();
        this._createSounds();
        this._createScoreText();
        this._createMobileButtons();
        this._createPauseButton();
        this._createExpProgressBar();
        this._createFPSDebugText();
    }

    update() {
        this._sceneBG.tilePositionX += this._sceneBG.width / 10000 * this.speed;
        this._dumpJoyStickState();
        this._player.move();
        this._player.shooting();
        this._healthBar.setPosition(this._player.x, this._player.y - this._player.height * 0.5);
        this._updateFPSDebugText(this.game.loop.actualFps);
    }
    
    get joystick() {
        return this._joystick;
    }

    get player() {
        return this._player;
    }

    _createMobileButtons() {
        if (document.body.clientWidth > 1280) return;

        this._addJoystick();
        this._addFireButton();
    }

    _addJoystick(){
        const { left, bottom } = screenData;

        this._joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: left + JOYSTICK_RADIUS + JOYSTICK_GAP,
            y: bottom - JOYSTICK_RADIUS - JOYSTICK_GAP,
            radius: JOYSTICK_RADIUS,
            base: this.add.circle(0, 0, JOYSTICK_RADIUS).setStrokeStyle(3.5, 0x1a65ac).setAlpha(.75),
            thumb: this.add.circle(0, 0, JOYSTICK_RADIUS * 0.5, 0xcccccc).setAlpha(0.5),
            dir: '8dir',
        });

        this._joystick.thumb.setDepth(DEPTH_LAYERS.UI);
        this._joystick.base.setDepth(DEPTH_LAYERS.UI);
    }

    _dumpJoyStickState() {
        if (this._joystick) {
            this.cursorKeys = this._joystick.createCursorKeys();
        }
    }

    _addFireButton(){
        const { right } = screenData;

        this.fireButton = this.add.image(right - JOYSTICK_RADIUS - JOYSTICK_GAP, this._joystick.y, 'fire')
            .setAlpha(0.65)
            .setInteractive()
            .setActive(false)
            .setDepth(DEPTH_LAYERS.UI)
            .on('pointerup', () => {
                this.fireButton.active = false;
            }, this)
            .on('pointerdown', () => {
                this.fireButton.active = true;
                this._player.shooting();
            }, this);
    }

    _createBg(data) {
        const { levels: Levels, height, width} = config;

        const bg_image = data?.unlim ? `bg${Phaser.Math.Between(1, Levels.length)}` : `bg${data.index}`;

        const real_height = this.textures.list[bg_image].source[0].height;
        const scale = height/real_height;

        this.speed = Levels[this._currentLevelScene-1].velocity;

        if (scale !== 1) {
            this.speed /= scale;
        }

        this._sceneBG = this.add.tileSprite(0, 0, width, height, bg_image).setOrigin(0).setScale(scale).setAlpha(.65);
    }

    _createScoreText() {
        const { right, top } = screenData;
        const { width } = config;

        if (this.hiScoreText) {
            this.hiScoreText.destroy();
        }

        this.scoreText = this.add.text(right - width * .05, top + width * .02, this._currentScore, {
            font: `${width * .038}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(1, 0).setAlpha(.75).setDepth(DEPTH_LAYERS.UI);

        if (this.info?.unlim) {
            this.hiScoreText = this.add.text(this._center.x, top + width * .01, `${this._getText('TOP_HIGH_SCORE')} ${getLocalStorageItem('unlimHiScores', Number)}`, {
                font: `${width * .03}px ${getFontName()}`,
                fill: '#EA0000',
            }).setOrigin(0.5, 0).setAlpha(.75).setDepth(DEPTH_LAYERS.UI);
        }
    }

    _createFPSDebugText() {
        const { top } = screenData;
        const { width } = config;

        this.debugFPSText = this.add.text(this._center.x, top + width * .08, '', {
            font: `${width * .038}px ${getFontName()}`,
            fill: '#00A86B',
        }).setOrigin(0.5, 0.5).setAlpha(.9).setDepth(DEPTH_LAYERS.UI);
    }

    _createPlayer() {
        this._player = new Player({ scene: this });
        this._player.setDepth(DEPTH_LAYERS.UI);
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

    _setupOverlapping() {
        this._overlaps = [
            this._createOverlap(this._player, this._enemies),
            this._createOverlap(this._player.fires, this._enemies.fires),
            this._createOverlap(this._player.fires, this._enemies),
            this._createOverlap(this._enemies.fires, this._player),
        ];
    }

    _createOverlap(source, target) {
        return this.physics.add.overlap(source, target, this._onOverlap, undefined, this);
    }

    _removeOverlaps() {
        this._overlaps.forEach(overlap => overlap.destroy());
    }

    _onOverlap(source, target) {
        if (target.x > config.width + target.displayWidth * 0.5) {
            return;
        }

        if (source !== this._player && target !== this._player) {
            if (!this.info?.unlim) {
                let casualtiesName = target.texture.key;

                if (target.texture.key === ENEMIES.STRATEGIC_JET.texture) {
                    casualtiesName = ENEMIES.JET.texture;
                } else if (target.texture.key === WEAPONS.MISSILE_2.texture) {
                    casualtiesName = WEAPONS.MISSILE.texture;
                }

                let oldValue = getLocalStorageItem(`casualties_${casualtiesName}`, Number);
                localStorage.setItem(`casualties_${casualtiesName}`, ++oldValue);
            }

            const reward = Number((target.reward * Math.pow(LEVEL_SCORE_MULTIPLIER, this._currentLevelScene - 1)).toFixed(0));
            this._currentScore += reward;

            if (!this.info?.unlim) {
                const last_score = Number(config.totalScore);
                localStorage.setItem('totalScore', last_score + reward);
                config.totalScore = last_score + reward;
            }
            this.scoreText.text = this._currentScore;
            this._updateExpProgressBar();
        }

        if (source === this._player) {
            this._onPlayerHit(source, target);
        } else {
            source.setAlive(false);
        }

        target.setAlive(false);
        this.sounds.explosion_small.play();
        Boom.generate(this, target.x, target.y);
    }

    _onPlayerHit(source, target) {
        const damage = this._enemies.children.contains(target) ? this._player.maxHealth : target.damage;
        const shakeMagnitude = damage * 2 / this._player.maxHealth * 0.05;
        const duration = 125;
        const color = [255, 0, 0];

        this._player.currentHealth -= damage;

        this.cameras.main.flash(duration, ...color);
        this.cameras.main.shake(duration, shakeMagnitude);
        this._healthBar.updateHealthBar();

        if (this._player.currentHealth <= 0) {
            source.setAlive(false);
        }
    }

    _createCompleteEvents() {
        this._player.emit(EVENTS.KILLED);
        this._player.once(EVENTS.KILLED, this._onLevelComplete, this);
        this.events.once(EVENTS.ALL_ENEMIES_KILLED, this._onLevelComplete, this);
    }

    _onLevelComplete() {
        if (this._blackBG) {
            return;
        }

        this.game.sound.stopAll();
        this._removeOverlaps();

        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 0).setInteractive().setDepth(DEPTH_LAYERS.COVER_SCREEN);
        let finalText = this.add.text(this._blackBG.x, this._blackBG.y, '', {
            font: `${config.width * .03}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0).setDepth(DEPTH_LAYERS.MAX);

        const isWin = this._player.active;
        const soundKey = isWin ? this.sounds.win : this.sounds.died;
        soundKey.play();

        if (isWin) {
            finalText.text = this._getText('FINAL_TEXT_WIN');

            if (this.info.hiScore < this._currentScore) {
                let hiScores = getLocalStorageItem('hiScores').split(',');
                hiScores[this._currentLevelScene - 1] = this._currentScore;
                localStorage.setItem('hiScores', hiScores.join());
            }

            if (config.currentLevelScene <= this._currentLevelScene) {
                config.currentLevelScene++;
                localStorage.setItem('currentLevelScene', config.currentLevelScene);
            }
        } else {
            finalText.text = this._getText('FINAL_TEXT_LOSE');

            if (this.info.unlim) {
                if (getLocalStorageItem('unlimHiScores', Number) < this._currentScore) {
                    localStorage.setItem('unlimHiScores', this._currentScore);
                }
            }
        }

        this.tweens.add({
            targets: [this._blackBG, finalText],
            fillAlpha: 1,
            alpha: 1,
            scale: finalText.scale * 2,
            ease: 'Linear',
            duration: soundKey.duration * 1000 * 0.9,
            onComplete: () => {
                this.scene.start(this.info.unlim ? SCENE_NAMES.MAIN : SCENE_NAMES.CAMPAIGN);
                this.scene.stop();
            }
        })

        this._enemies.stopTimer();
        this._enemies.children.entries.forEach(enemy => {
            enemy.stopTimer();
        });
    }

    _createPauseButton() {
        this.add.image(screenData.left + config.width * .05, screenData.top + config.width * .05, 'pause')
            .setAlpha(0.65)
            .setScale(2)
            .setInteractive()
            .setDepth(DEPTH_LAYERS.UI)
            .on('pointerdown', () => {
                this.scene.launch('Pause');
                this.scene.pause();
            }, this);
    }

    _createHealthBar(){
        this._healthBar = new HealthBar(this);
        this.add.existing(this._healthBar);
    }

    _createExpProgressBar(){
        if (this.info?.unlim) {
            return;
        }

        this._progressExpBar = this.add.image(this._center.x, screenData.top + config.width * .0225, 'progress_bar')
            .setAlpha(0.95);
        this._progressExpBar.fillProgress = this.add.image(this._progressExpBar.x + this._progressExpBar.displayWidth * .1, this._progressExpBar.y + this._progressExpBar.displayHeight * .04, 'progress_bar_fill')
            .setAlpha(0.95);
        
        this._progressExpBar.levelText = this.add.text(this._progressExpBar.x - this._progressExpBar.displayWidth * .38, this._progressExpBar.y - this._progressExpBar.displayHeight * .035, config.currentLevelPlayer, {
            font: `${this._progressExpBar.displayHeight * .53}px ${getFontName()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0.75);

        this._updateExpProgressBar();
    }

    _updateExpProgressBar(){
        if (this.info?.unlim) {
            return;
        }

        let score = this._calculateScore();
        let currentProgress = (config.totalScore - score.start)/score.diff;
        
        if (config.currentLevelPlayer < 2) {
            currentProgress = config.totalScore/score.diff;
        } 
        
        if (currentProgress >= 1) {
            this._increaseLevel();
            score = this._calculateScore();
            currentProgress = 1 - (-1 * (config.totalScore - score.end)/score.diff);
        }

        this._progressExpBar.fillProgress.frame.cutWidth = this._progressExpBar.fillProgress.displayWidth * currentProgress;
        this._progressExpBar.fillProgress.frame.updateUVs();
        this._progressExpBar.text = config.currentLevelPlayer;
    }

    _calculateScore() {
        return{
            start: this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1),
            end: this._getRequiredScoreOnLevel(config.currentLevelPlayer),
            diff: this._getRequiredScoreOnLevel(config.currentLevelPlayer) - this._getRequiredScoreOnLevel(config.currentLevelPlayer - 1)
        }
    }

    _increaseLevel(){
        this.sounds.level_up.play({volume: .5});
        config.currentLevelPlayer++;
        localStorage.setItem('currentLevelPlayer', config.currentLevelPlayer);

        const levelTextLabel = this.add.text(this._center.x, this._center.y, config.currentLevelPlayer, {
            font: `${config.width * .25}px ${getFontName()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: levelTextLabel,
            alpha: 1,
            x: this._progressExpBar.levelText.x,
            y: this._progressExpBar.levelText.y,
            scale: this._progressExpBar.levelText.displayWidth/levelTextLabel.displayWidth,
            ease: 'Linear',
            duration: 500,
            onComplete: () => {
                levelTextLabel.destroy();
                this._progressExpBar.levelText.text = config.currentLevelPlayer;
            }
        });

        this._increaseMoney();
    }

    _getRequiredScoreOnLevel(level){
        let result = 0;
        for (let i = 0; i < level; i++) {
            result += Number((LEVEL_REQUIRED_SCORE * Math.pow(LEVELS_EXP_MULTIPLIER, i)).toFixed(0));
        }
        return result;
    }

    _increaseMoney(){
        ++config.money;
        localStorage.setItem('money', config.money);
    }

    _updateFPSDebugText(value) {
        if (!this.debugFPSText) {
            return;
        }

        this.debugFPSText.text = `FPS: ${Math.round(value)}`;
    }
}