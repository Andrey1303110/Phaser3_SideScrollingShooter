import { config } from '../main';
import { Player } from '../prefabs/Player';
import { Enemies } from '../prefabs/Enemies';
import { Boom } from '../prefabs/Boom';
import { SCENE_NAMES, DEPTH_LAYERS, EVENTS, JOYSTICK_GAP, JOYSTICK_RADIUS, LEVEL_REQUIRED_SCORE_MULTIPLIER, LEVEL_REQUIRED_SCORE, LEVEL_SCORE_MULTIPLIER, WEAPONS, ENEMIES, CAMPAIGN_LEVELS, LEVEL_HI_SCORES_SEPARATOR } from '../constants';
import { CommonScene } from './CommonScene';
import { HealthBar } from '../classes/HealthBar';
import { getFontName, screenData } from '../Utils';

export class GameScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.GAME);
    }

    init(data) {
        super.init();

        this.info = data;
        this._currentLevelScene = this.info.index;
        this._currentScore = 0;
        this._blackBG = null;

        window.gameScene = this;
    }

    create(data) {
        this.cursors = this.input.keyboard.createCursorKeys();

        this._createBg(data);
        this._createPlayer();
        this._createHealthBar();
        this._createEnemies();
        this._createSounds();
        this._createScoreText();
        this._createMobileButtons();
        this._createPauseButton();
        this._createExpProgressBar();
        this._createFPSDebugText();

        this._setupEvents();
        this._setupOverlapping();
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
        const { height, width} = config;

        const bgImage = data?.isUnlim ? `bg${Phaser.Math.Between(1, CAMPAIGN_LEVELS.length)}` : `bg${data.index}`;

        const realHeight = this.textures.list[bgImage].source[0].height;
        const scale = height/realHeight;

        this.speed = CAMPAIGN_LEVELS[this._currentLevelScene-1].velocity;

        if (scale !== 1) {
            this.speed /= scale;
        }

        this._sceneBG = this.add.tileSprite(0, 0, width, height, bgImage).setOrigin(0).setScale(scale).setAlpha(.65);
    }

    _createScoreText() {
        const { right, top } = screenData;
        const { width } = config;

        if (this.hiScoreText) {
            this.hiScoreText.destroy();
        }

        this.scoreText = this.add.text(right - width * 0.05, top + width * 0.02, this._currentScore, {
            font: `${width * 0.038}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(1, 0).setAlpha(.75).setDepth(DEPTH_LAYERS.UI);

        if (this.info?.isUnlim) {
            const topScoreText = this._getText('TOP_HIGH_SCORE');
            this.hiScoreText = this.add.text(this._centerDot.x, top + width * 0.01, `${topScoreText} ${this.model.unlimHiScores}`, {
                font: `${width * 0.03}px ${getFontName()}`,
                fill: '#EA0000',
            }).setOrigin(0.5, 0).setAlpha(.75).setDepth(DEPTH_LAYERS.UI);
        }
    }

    _createFPSDebugText() {
        const { top } = screenData;
        const { width } = config;

        this.debugFPSText = this.add.text(this._centerDot.x, top + width * 0.08, '', {
            font: `${width * 0.038}px ${getFontName()}`,
            fill: '#00A86B',
        }).setOrigin(0.5, 0.5).setAlpha(.9).setDepth(DEPTH_LAYERS.UI);
    }

    _createPlayer() {
        this._player = new Player({ scene: this });
        this._player.setDepth(DEPTH_LAYERS.UI);

        this._player.emit(EVENTS.KILLED);
        this._player.once(EVENTS.KILLED, () => this._onLevelComplete());
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
            missile_2_launch: this.sound.add('missile_2_launch'),
            explosion_small: this.sound.add('explosion_small'),
            wings: this.sound.add('wings'),
            lose: this.sound.add('lose'),
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
        if (target.x > config.width + target.displayWidth * 0.25) {
            return;
        }

        if (source !== this._player && target !== this._player) {
            if (!this.info?.isUnlim) {
                let casualtiesName = target.texture.key;

                if (target.texture.key === ENEMIES.STRATEGIC_JET.texture) {
                    casualtiesName = ENEMIES.JET.texture;
                } else if (target.texture.key === WEAPONS.MISSILE_2.texture) {
                    casualtiesName = WEAPONS.MISSILE.texture;
                }

                this.model.increaseCasualties(casualtiesName);
            }

            const reward = Number((target.reward * Math.pow(LEVEL_SCORE_MULTIPLIER, this._currentLevelScene - 1)).toFixed(0));
            this._currentScore += reward;

            if (!this.info?.isUnlim) {
                this.model.addTotalScore(reward);
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

    _setupEvents() {
        this.events.once(EVENTS.ALL_ENEMIES_KILLED, () => this._onLevelComplete());
    }

    _onLevelComplete() {
        if (this._blackBG) {
            return;
        }

        this.game.sound.stopAll();
        this._removeOverlaps();

        const isWin = this._player.active;
        const sound = isWin ? this.sounds.win : this.sounds.lose;
        sound.play();

        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 0).setInteractive().setDepth(DEPTH_LAYERS.COVER_SCREEN);
        let finalTextLabel = this.add.text(this._blackBG.x, this._blackBG.y, '', {
            font: `${config.width * 0.03}px ${getFontName()}`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0).setDepth(DEPTH_LAYERS.MAX);

        if (isWin) {
            this._successLevelComplete(finalTextLabel);
        } else {
            this._failureLevelComplete(finalTextLabel);
        }
        this._completeLevelTween(finalTextLabel, sound);

        this._enemies.stopTimer();
        this._enemies.children.entries.forEach(enemy => {
            enemy.stopTimer();
        });
    }

    _successLevelComplete(label) {
        label.text = this._getText('FINAL_TEXT_WIN');

        if (this.info.hiScore < this._currentScore) {
            const hiScores = this.model.hiScores.split(LEVEL_HI_SCORES_SEPARATOR);
            hiScores[this._currentLevelScene - 1] = this._currentScore;
            this.model.setHiScores(hiScores.join());
        }

        if (this.model.currentLevelScene <= this._currentLevelScene) {
            this.model.increaseSceneLevel();
        }
    }

    _failureLevelComplete(label) {
        label.text = this._getText('FINAL_TEXT_LOSE');

        if (this.info.isUnlim) {
            const lastHiScore = this.model.unlimHiScores;
            if (this._currentScore > lastHiScore) {
                this.model.setUnlimHiScores(this._currentScore);
            }
        }
    }

    _completeLevelTween(finalTextLabel, sound) {
        this.tweens.add({
            targets: [this._blackBG, finalTextLabel],
            fillAlpha: 1,
            alpha: 1,
            scale: finalTextLabel.scale * 2,
            ease: 'Linear',
            duration: sound.duration * 1000 * 0.85,
            onComplete: () => {
                this.scene.start(this.info?.isUnlim ? SCENE_NAMES.MAIN_MENU : SCENE_NAMES.CAMPAIGN);
                this.scene.stop();
            }
        })
    }

    _createPauseButton() {
        this.add.image(screenData.left + config.width * 0.05, screenData.top + config.width * 0.05, 'pause')
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
        this._healthBar.setDepth(DEPTH_LAYERS.UI);
    }

    _createExpProgressBar(){
        if (this.info?.isUnlim) {
            return;
        }

        this._progressExpBar = this.add.image(this._centerDot.x, screenData.top + config.width * 0.0225, 'progress_bar')
            .setAlpha(0.95);
        this._progressExpBar.fillProgress = this.add.image(this._progressExpBar.x + this._progressExpBar.displayWidth * 0.1, this._progressExpBar.y + this._progressExpBar.displayHeight * 0.04, 'progress_bar_fill')
            .setAlpha(0.95);
        
        this._progressExpBar.levelText = this.add.text(this._progressExpBar.x - this._progressExpBar.displayWidth * 0.38, this._progressExpBar.y - this._progressExpBar.displayHeight * 0.035, this.model.currentLevelPlayer, {
            font: `${this._progressExpBar.displayHeight * 0.53}px ${getFontName()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0.75);

        this._updateExpProgressBar();
    }

    _updateExpProgressBar(){
        if (this.info?.isUnlim) {
            return;
        }

        let score = this._calculateScore();
        let currentProgress = (this.model.totalScore - score.start)/score.diff;
        
        if (this.model.currentLevelPlayer < 2) {
            currentProgress = this.model.totalScore/score.diff;
        } 
        
        if (currentProgress >= 1) {
            this._increaseLevel();
            score = this._calculateScore();
            currentProgress = 1 - (-1 * (this.model.totalScore - score.end)/score.diff);
        }

        this._progressExpBar.fillProgress.frame.cutWidth = this._progressExpBar.fillProgress.displayWidth * currentProgress;
        this._progressExpBar.fillProgress.frame.updateUVs();
        this._progressExpBar.text = this.model.currentLevelPlayer;
    }

    _calculateScore() {
        return{
            start: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer - 1),
            end: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer),
            diff: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer) - this._getRequiredScoreOnLevel(this.model.currentLevelPlayer - 1)
        }
    }

    _increaseLevel(){
        this.sounds.level_up.play({volume: .5});
        this.model.increasePlayerLevel();

        const levelTextLabel = this.add.text(this._centerDot.x, this._centerDot.y, this.model.currentLevelPlayer, {
            font: `${config.width * 0.25}px ${getFontName()}`,
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
                this._progressExpBar.levelText.text = this.model.currentLevelPlayer;
            }
        });

        this.model.increaseMoney();
    }

    _getRequiredScoreOnLevel(level){
        let result = 0;
        for (let i = 0; i < level; i++) {
            result += Number((LEVEL_REQUIRED_SCORE * Math.pow(LEVEL_REQUIRED_SCORE_MULTIPLIER, i)).toFixed(0));
        }
        return result;
    }

    _updateFPSDebugText(value) {
        if (!this.debugFPSText) {
            return;
        }

        this.debugFPSText.text = `FPS: ${Math.round(value)}`;
    }
}