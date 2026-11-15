import { config } from '../main';
import { Player } from '../prefabs/Player';
import { Enemies } from '../prefabs/Enemies';
import { Boom } from '../prefabs/Boom';
import { SCENE_NAMES, DEPTH_LAYERS, EVENTS, JOYSTICK_GAP, JOYSTICK_RADIUS, LEVEL_REQUIRED_SCORE_MULTIPLIER, LEVEL_REQUIRED_SCORE, LEVEL_SCORE_MULTIPLIER, WEAPONS, ENEMIES, CAMPAIGN_LEVELS, LEVEL_HI_SCORES_SEPARATOR, GAME_ACTOR_SCALE_MULTIPLIER } from '../constants';
import { CommonScene } from './CommonScene';
import { UI, uiUnit, uiText, createButton } from '../ui';
import { HealthBar } from '../classes/HealthBar';
import { getFontName, screenData, tweenPromise } from '../Utils';

export class GameScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.GAME);
    }

    init(data) {
        super.init();

        this.info = { ...data };
        this._joystick = null;
        this.cursorKeys = null;
        this.fireButton = null;
        this._currentLevelScene = this.info.index;
        this._currentScore = 0;
        this._blackBG = null;
        this.debugFPSText = null;
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

    update(time, delta) {
        if (this._blackBG || !this._player.active) return;
        this._updateBackground(delta);
        this._player.move();
        this._player.shooting();
        this._updateHealthBarPosition();
        this._updateFPSDebugText(this.game.loop.actualFps);
    }
    
    get joystick() {
        return this._joystick;
    }

    get player() {
        return this._player;
    }

    _createMobileButtons() {
        this._addJoystick();
        this._addFireButton();
    }

    _addJoystick(){
        const { left, bottom } = screenData;

        this._joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: left + JOYSTICK_RADIUS + JOYSTICK_GAP,
            y: bottom - JOYSTICK_RADIUS - JOYSTICK_GAP,
            radius: JOYSTICK_RADIUS,
            base: this.add.circle(0, 0, JOYSTICK_RADIUS).setStrokeStyle(3.5, 0x1a65ac, this.model.joystickOpacity),
            thumb: this.add.circle(0, 0, JOYSTICK_RADIUS * 0.5, 0xcccccc).setAlpha(this.model.joystickOpacity * 2 / 3),
            dir: '8dir',
        });

        this._joystick.thumb.setDepth(DEPTH_LAYERS.UI);
        this._joystick.base.setDepth(DEPTH_LAYERS.UI);
        this.cursorKeys = this._joystick.createCursorKeys();
    }

    _addFireButton(){
        const { right } = screenData;

        this.fireButton = this.add.image(right - JOYSTICK_RADIUS - JOYSTICK_GAP, this._joystick.y, 'fire_button')
            .setAlpha(this.model.fireButtonOpacity)
            .setActive(false)
            .setDepth(DEPTH_LAYERS.UI);

        // Keep the touch target available even when the button is fully transparent.
        this._fireButtonHitArea = this.add.zone(this.fireButton.x, this.fireButton.y,
            this.fireButton.displayWidth, this.fireButton.displayHeight)
            .setInteractive()
            .setDepth(DEPTH_LAYERS.UI)
            .on('pointerup', () => {
                this.fireButton.active = false;
            }, this)
            .on('pointerout', () => { this.fireButton.active = false; })
            .on('pointerdown', () => {
                this.fireButton.active = true;
                this._player.shooting();
            }, this);
    }

    _createBg(data) {
        const { height, width } = config;

        const bgImage = data?.isUnlim ? `bg${Phaser.Math.Between(1, CAMPAIGN_LEVELS.length)}` : `bg${data.index}`;

        this.speed = CAMPAIGN_LEVELS[this._currentLevelScene-1].velocity;

        const layers = [
            { texture: bgImage, speedMultiplier: 1 },
            { texture: 'trees_mid', speedMultiplier: 2 },
            { texture: 'trees_near', speedMultiplier: 3.5 },
        ];

        this._backgroundLayers = layers.map(({ texture, speedMultiplier }, index) => {
            const source = this.textures.get(texture).getSourceImage();
            const sprite = this.add.tileSprite(0, 0, width, height, texture)
                .setOrigin(0)
                .setTileScale(height / source.height)
                .setDepth(DEPTH_LAYERS.NONE - layers.length + index);

            return { sprite, speedMultiplier };
        });
    }

    _updateBackground(delta) {
        const distance = config.width / 10000 * this.speed * delta / (1000 / 60);

        this._backgroundLayers.forEach(({ sprite, speedMultiplier }) => {
            // Tile offsets use texture pixels; keep the visible speed independent of scale.
            sprite.tilePositionX = (sprite.tilePositionX + distance * speedMultiplier / sprite.tileScaleX)
                % sprite.displayFrame.width;
        });
    }

    _createScoreText() {
        const { right, top } = screenData;
        const u = uiUnit();

        if (this.hiScoreText) {
            this.hiScoreText.destroy();
        }
        this._hiScoreBackground?.destroy();

        this.scoreText = this.add.text(right - 20 * u, top + 16 * u, this._currentScore, {
            ...uiText(28), fontStyle: 'bold',
        }).setOrigin(1, 0).setDepth(DEPTH_LAYERS.UI);

        if (this.info?.isUnlim) {
            const topScoreText = this._getText('TOP_HIGH_SCORE');
            const x = this.cameras.main.centerX;
            this.hiScoreText = this.add.text(x, top + 20 * u,
                `${topScoreText} ${this.model.unlimHiScores}`, {
                    ...uiText(UI.type.section), fontStyle: 'bold',
                }).setOrigin(0.5, 0).setDepth(DEPTH_LAYERS.UI + 0.01);
            this._hiScoreBackground = this.add.graphics().setDepth(DEPTH_LAYERS.UI);
            this._hiScoreBackground.fillStyle(UI.colors.panel, 0.96).lineStyle(u, UI.colors.border)
                .fillRoundedRect(x - this.hiScoreText.width / 2 - 12 * u, top + 12 * u,
                    this.hiScoreText.width + 24 * u, this.hiScoreText.height + 16 * u, UI.radius * u)
                .strokeRoundedRect(x - this.hiScoreText.width / 2 - 12 * u, top + 12 * u,
                    this.hiScoreText.width + 24 * u, this.hiScoreText.height + 16 * u, UI.radius * u);
        }
    }

    _createFPSDebugText() {
        if (!this.model.showFPS) return;
        const u = uiUnit();
        this.debugFPSText = this.add.text(this.cameras.main.centerX, screenData.top + 56 * u, '', {
            ...uiText(UI.type.caption), backgroundColor: '#203a38',
            padding: { x: 8 * u, y: 4 * u },
        }).setOrigin(0.5, 0).setDepth(DEPTH_LAYERS.UI + 0.01);
    }

    _createPlayer() {
        this._player = new Player({ scene: this });
        this._player.setScale(this.model.player.scale * GAME_ACTOR_SCALE_MULTIPLIER);
        this._player.setDepth(DEPTH_LAYERS.UI);

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
        if (!source.active || !target.active) return;
        // Arcade may supply group members before the individual player object.
        if (target === this._player) [source, target] = [target, source];
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

        const { x, y } = target;
        target.setAlive(false);
        this.sounds.explosion_small.play();
        Boom.generate(this, x, y);
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

        Object.values(this.sounds).forEach(sound => sound.stop());
        this._removeOverlaps();

        const isWin = this._player.active;
        const sound = this._playTransitionSound(isWin ? 'win' : 'lose');

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
        if (this.info.isUnlim) {
            this._failureLevelComplete(label);
            label.text = this._getText('FINAL_TEXT_WIN');
            return;
        }
        label.text = this._getText('FINAL_TEXT_WIN');

        if (this.model.getLevelHiScore(this._currentLevelScene) < this._currentScore) {
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
        const duration = sound.duration * 1000 * 0.85;
        const scale = finalTextLabel.scale * 2;
        const targets = [this._blackBG, finalTextLabel];
        
        return tweenPromise(this, {
            targets,
            fillAlpha: 1,
            alpha: 1,
            scale,
            ease: 'Linear',
            duration,
            onComplete: () => {
                this.scene.start(this.info?.isUnlim ? SCENE_NAMES.MAIN_MENU : SCENE_NAMES.CAMPAIGN);
                this.scene.stop();
            },
        });
    }

    _createPauseButton() {
        const u = uiUnit();
        this._pauseButton = createButton(this, {
            x: screenData.left + 48 * u, y: screenData.top + 48 * u, width: 44 * u, text: '',
            canPress: () => !this._blackBG,
            onPress: () => {
                if (this.fireButton) this.fireButton.active = false;
                this.scene.launch(SCENE_NAMES.PAUSE);
                this.scene.pause();
            },
        });
        this._pauseButton.root.setDepth(DEPTH_LAYERS.UI).add(this.add.image(0, 0, 'pause')
            .setDisplaySize(20 * u, 20 * u).setTintFill(0xf3eddd));
    }

    _createHealthBar(){
        this._healthBar = new HealthBar(this);
        this._healthBar.setDepth(DEPTH_LAYERS.UI);
        this._updateHealthBarPosition();
    }

    _updateHealthBarPosition() {
        this._healthBar.setPosition(this._player.x, this._player.y - this._player.displayHeight * 0.5);
        const bounds = this._healthBar.getBounds();
        const margin = 4 * uiUnit();
        this._healthBar.x += Math.max(0, screenData.left + margin - bounds.left)
            - Math.max(0, bounds.right - screenData.right + margin);
    }

    _createExpProgressBar(){
        if (this.info?.isUnlim) {
            return;
        }

        this._progressExpBar = this.add.image(this.scene.scene.cameras.main.midPoint.x, screenData.top + config.width * 0.0225, 'progress_bar')
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
        
        while (currentProgress >= 1) {
            this._increaseLevel();
            score = this._calculateScore();
            currentProgress = (this.model.totalScore - score.start) / score.diff;
        }

        const fill = this._progressExpBar.fillProgress;
        fill.setCrop(0, 0, fill.width * Math.max(0, Math.min(1, currentProgress)), fill.height);
        this._progressExpBar.levelText.setText(this.model.currentLevelPlayer);
    }

    _calculateScore() {
        return{
            start: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer - 1),
            end: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer),
            diff: this._getRequiredScoreOnLevel(this.model.currentLevelPlayer) - this._getRequiredScoreOnLevel(this.model.currentLevelPlayer - 1)
        }
    }

    _increaseLevel(){
        this.sounds.level_up.play({volume: 0.5});
        this.model.increasePlayerLevel();
        this.model.increaseMoney();

        const levelTextLabel = this.add.text(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y, this.model.currentLevelPlayer, {
            font: `${config.width * 0.25}px ${getFontName()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0);

        const scale = this._progressExpBar.levelText.displayWidth/levelTextLabel.displayWidth;

        return tweenPromise(this, {
            targets: levelTextLabel,
            alpha: 1,
            scale,
            x: this._progressExpBar.levelText.x,
            y: this._progressExpBar.levelText.y,
            ease: 'Linear',
            duration: 500,
            onComplete: () => {
                levelTextLabel.destroy();
                this._progressExpBar.levelText.text = this.model.currentLevelPlayer;
            }
        });
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
