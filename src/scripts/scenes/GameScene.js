import { TIMING } from '../timing';
import { ACTOR_ART_DENSITY } from '../actorArt';
import { INPUT_EVENTS, PLUGIN_KEYS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS, resourceKey } from '../identifiers';
import { config } from '../main';
import { Player } from '../prefabs/Player';
import { Enemies } from '../prefabs/Enemies';
import { Boom } from '../prefabs/Boom';
import { SCENE_NAMES, DEPTH_LAYERS, EVENTS, JOYSTICK_GAP, JOYSTICK_RADIUS, LEVEL_REQUIRED_SCORE_MULTIPLIER, LEVEL_REQUIRED_SCORE, LEVEL_SCORE_MULTIPLIER, WEAPONS, ENEMIES, CAMPAIGN_LEVELS, LEVEL_BACKGROUNDS, LEVEL_HI_SCORES_SEPARATOR, GAME_ACTOR_SCALE_MULTIPLIER } from '../constants';
import { CommonScene } from './CommonScene';
import { UI, uiUnit, uiText, createButton } from '../ui';
import { HealthBar } from '../classes/HealthBar';
import { getFontName, getSceneTexts, screenData, tweenPromise } from '../Utils';
import { BRANCH, CAMPAIGN_SKILL_BALANCE as SKILLS, CAMPAIGN_SKILL_MISSIONS } from '../campaignSkills';
import { createSkillBeam, dragonMouth, playLifeDrain, playSkillPulse, poseSkillBeam, skillImage } from '../skillEffects';

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
        this._offerBranch = false;
        const branch = this.info.isUnlim ? '' : this.model.campaignSkillBranch;
        const tier = this.model.campaignSkillTier;
        this.fireSkillTier = branch === BRANCH.FIRE ? tier : 0;
        this._survivalSkillTier = branch === BRANCH.SURVIVAL ? tier : 0;
        this._vampirismKills = 0;
        this._shield = null;
        this._beamTimer = null;
        this._xpPulse = null;
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
        this._createCampaignSkillHud();

        this._setupEvents();
        this._setupOverlapping();
    }

    update(time, delta) {
        if (this._blackBG || !this._player.active) return;
        this._updateBackground(delta);
        this._player.move();
        this._player.shooting();
        this._updateHealthBarPosition();
        this._updateCampaignSkillHud();
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

        this._joystick = this.plugins.get(PLUGIN_KEYS.REXVIRTUALJOYSTICKPLUGIN).add(this, {
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

        this.fireButton = this.add.image(right - JOYSTICK_RADIUS - JOYSTICK_GAP, this._joystick.y, TEXTURE_KEYS.FIRE_BUTTON)
            .setAlpha(this.model.fireButtonOpacity)
            .setActive(false)
            .setDepth(DEPTH_LAYERS.UI);

        // Keep the touch target available even when the button is fully transparent.
        this._fireButtonHitArea = this.add.zone(this.fireButton.x, this.fireButton.y,
            this.fireButton.displayWidth, this.fireButton.displayHeight)
            .setInteractive()
            .setDepth(DEPTH_LAYERS.UI)
            .on(INPUT_EVENTS.POINTERUP, () => {
                this.fireButton.active = false;
            }, this)
            .on(INPUT_EVENTS.POINTEROUT, () => { this.fireButton.active = false; })
            .on(INPUT_EVENTS.POINTERDOWN, () => {
                this.fireButton.active = true;
                this._player.shooting();
            }, this);
    }

    _createBg(data) {
        const { height, width } = config;

        this._backgroundLevel = data?.isUnlim ? Phaser.Math.Between(1, CAMPAIGN_LEVELS.length) : data.index;
        const atmosphere = LEVEL_BACKGROUNDS[this._backgroundLevel - 1];

        this.speed = CAMPAIGN_LEVELS[this._currentLevelScene-1].velocity;

        const layers = [
            { texture: resourceKey.background(this._backgroundLevel), speedMultiplier: 1, depth: -5 },
            { texture: atmosphere.clouds, speedMultiplier: 0.45, depth: -3 },
            { texture: TEXTURE_KEYS.TREES_MID, speedMultiplier: 1.5, depth: -2 },
            { texture: TEXTURE_KEYS.TREES_NEAR, speedMultiplier: 2.2, depth: -1 },
        ];

        this._backgroundLayers = layers.map(({ texture, speedMultiplier, depth }) => {
            const source = this.textures.get(texture).getSourceImage();
            const sprite = this.add.tileSprite(0, 0, width, height, texture)
                .setOrigin(0)
                .setTileScale(height / source.height)
                .setDepth(depth);

            return { sprite, speedMultiplier };
        });

        this._celestialBody = null;
        if (atmosphere.celestial) {
            this._celestialBody = this.add.image(width * 0.7, height * 0.19, atmosphere.celestial)
                .setDisplaySize(height * 0.17, height * 0.17)
                .setDepth(-4);
        }
    }

    _updateBackground(delta) {
        const distance = config.width / 10000 * this.speed * delta / (1000 / 60);

        this._backgroundLayers.forEach(({ sprite, speedMultiplier }) => {
            // Tile offsets use texture pixels; keep the visible speed independent of scale.
            sprite.tilePositionX = (sprite.tilePositionX + distance * speedMultiplier / sprite.tileScaleX)
                % sprite.displayFrame.width;
        });

        if (this._celestialBody) {
            const body = this._celestialBody;
            body.x -= distance * 0.1;
            // Only one sun or moon is visible; wrap once it has fully left the screen.
            const halfWidth = body.displayWidth / 2;
            const span = config.width + body.displayWidth;
            body.x = ((body.x + halfWidth) % span + span) % span - halfWidth;
        }
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
            const topScoreText = this._getText(TEXT_KEYS.TOP_HIGH_SCORE);
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
        this._player.setScale(this.model.player.scale * GAME_ACTOR_SCALE_MULTIPLIER / ACTOR_ART_DENSITY);
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
            fire_launch: this.sound.add(SOUND_KEYS.FIRE_LAUNCH),
            explosion_small: this.sound.add(SOUND_KEYS.EXPLOSION_SMALL),
            wings: this.sound.add(SOUND_KEYS.WINGS),
            level_up: this.sound.add(SOUND_KEYS.LEVEL_UP),
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
        if (this._blackBG || !source.active || !target.active) return;
        // Arcade may supply group members before the individual player object.
        if (target === this._player) [source, target] = [target, source];
        if (target.x > config.width + target.displayWidth * 0.25) {
            return;
        }

        if (source === this._player) {
            this._onPlayerHit(source, target);
        } else {
            if (this.fireSkillTier >= 2) {
                playSkillPulse(this, 'impact', target.x, target.y, target.displayWidth * 0.75, SKILLS.beamFadeMs, DEPTH_LAYERS.DEFAULT);
            }
            if (--source.targetsRemaining === 0) source.setAlive(false);
            this._onTargetHit(target);
        }
        if (source !== this._player) {
            if (this._enemies.contains(target)) this.sounds.explosion_small.play();
            else this.sound.play(SOUND_KEYS.MISSILE_INTERCEPT, { volume: 0.36 });
        } else if (this._enemies.contains(target)) {
            this.sounds.explosion_small.play();
        }
        this._destroyTarget(target);
    }

    _onTargetHit(target) {
        this.model.achievements.recordHit(target.texture.key, this._enemies.contains(target), this.info.isUnlim);
        const reward = Number((target.reward * Math.pow(LEVEL_SCORE_MULTIPLIER, this._currentLevelScene - 1)).toFixed(0));
        this._currentScore += reward;
        this.scoreText.text = this._currentScore;
        if (!this.info.isUnlim) {
            let casualtiesName = target.texture.key;
            if (casualtiesName === ENEMIES.STRATEGIC_JET.texture) casualtiesName = ENEMIES.JET.texture;
            if (casualtiesName === WEAPONS.MISSILE_2.texture) casualtiesName = WEAPONS.MISSILE.texture;
            this.model.increaseCasualties(casualtiesName);
            this.model.addTotalScore(reward, this._survivalSkillTier >= 3 ? SKILLS.experienceMultiplier : 1);
            this._updateExpProgressBar();
            if (this._survivalSkillTier >= 3 && !this._xpPulse?.active) {
                const bar = this._progressExpBar;
                this._xpPulse = playSkillPulse(this, 'xp', bar.x + bar.displayWidth * 0.58, bar.y + 3 * uiUnit(),
                    34 * uiUnit(), 520, DEPTH_LAYERS.UI);
            }
        }
        if (this._survivalSkillTier >= 2 && this._enemies.contains(target)) this._countVampirismKill(target.x, target.y);
    }

    _destroyTarget(target) {
        const { x, y } = target;
        Boom.generate(this, x, y);
        target.setAlive(false);
    }

    _onPlayerHit(source, target) {
        const aircraft = this._enemies.contains(target);
        if (!aircraft && this._shield?.visible) {
            this._shield.setVisible(false);
            this.sound.play(SOUND_KEYS.SHIELD_BREAK, { volume: 0.52 });
            playSkillPulse(this, 'shatter', source.x, source.y, source.displayWidth * 1.28, SKILLS.healFadeMs, DEPTH_LAYERS.DEFAULT);
            return;
        }
        const damage = aircraft ? this._player.maxHealth : target.damage;
        const shakeMagnitude = damage * 2 / this._player.maxHealth * 0.05;
        const duration = TIMING.GAME_SCENE.ON_PLAYER_HIT_DURATION_MS;
        const color = [255, 0, 0];

        this._player.currentHealth -= damage;
        if (this._player.currentHealth > 0) this.sound.play(SOUND_KEYS.DRAGON_HURT, { volume: 0.54 });

        this.cameras.main.flash(duration, ...color);
        this.cameras.main.shake(duration, shakeMagnitude);
        this._healthBar.updateHealthBar();

        if (this._player.currentHealth <= 0) {
            source.setAlive(false);
        }
    }

    _createCampaignSkillHud() {
        const u = uiUnit();
        this._skillTexts = getSceneTexts(this, 'Skills');
        this._skillHud = null;
        if (this._survivalSkillTier > 0) {
            const shield = skillImage(this, 'shield').setPosition(this._player.x, this._player.y)
                .setDisplaySize(this._player.displayWidth * 1.22 + 12 * u, this._player.displayHeight * 1.25 + 10 * u)
                .setDepth(DEPTH_LAYERS.DEFAULT).setAlpha(0.94);
            this.tweens.add({ targets: shield, alpha: 0.74, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
            this._shield = shield;
            this._player.once(Phaser.GameObjects.Events.DESTROY, () => shield.destroy());
        }
        if (this.fireSkillTier >= 3) {
            this._beamTimer = this.time.addEvent({
                delay: SKILLS.beamIntervalMs,
                loop: true,
                callback: () => this._fireBeam(),
            });
        }
        if (this._beamTimer || this._survivalSkillTier >= 2) {
            this._skillHud = this.add.text((screenData.left + screenData.right) / 2,
                screenData.bottom - 16 * u, '', uiText(UI.type.caption, UI.colors.accent))
                .setOrigin(0.5, 1).setDepth(DEPTH_LAYERS.UI);
            this._updateCampaignSkillHud();
        }
    }

    _updateCampaignSkillHud() {
        this._shield?.setPosition(this._player.x, this._player.y);
        if (!this._skillHud) return;
        let text = this._beamTimer
            ? this._skillTexts.BEAM_TIMER.replace('{seconds}', Math.ceil(this._beamTimer.getRemaining() / 1000))
            : this._skillTexts.VAMPIRISM_COUNTER.replace('{count}', this._vampirismKills).replace('{total}', SKILLS.vampirismKills);
        if (this._survivalSkillTier >= 3) text += '   ·   ' + this._skillTexts.XP_SHORT + ' ×2';
        this._skillHud.setText(text);
    }

    _countVampirismKill(fromX = this._player.x, fromY = this._player.y) {
        if (++this._vampirismKills < SKILLS.vampirismKills) return;
        this._vampirismKills = 0;
        const player = this._player;
        if (player.currentHealth >= player.maxHealth) return;
        player.currentHealth = Math.min(player.maxHealth, player.currentHealth + player.maxHealth * SKILLS.vampirismHealFraction);
        this._healthBar.updateHealthBar(true);
        this.sound.play(SOUND_KEYS.VAMPIRISM_HEAL, { volume: 0.28 });
        playLifeDrain(this, fromX, fromY, player, 520, DEPTH_LAYERS.DEFAULT);
    }

    _fireBeam() {
        if (this._blackBG || !this._player.active) return;
        const { x, y } = dragonMouth(this._player);
        const width = this.cameras.main.worldView.right - x;
        if (width <= 0) return;
        const band = new Phaser.Geom.Rectangle(x, y - SKILLS.beamWidth / 2, width, SKILLS.beamWidth);
        const beam = createSkillBeam(this).setDepth(this._player.depth - 0.1);
        const state = { progress: 0 };
        const draw = () => {
            if (!this._player.active) { beam.setVisible(false); return; }
            const { x, y } = dragonMouth(this._player);
            const width = this.cameras.main.worldView.right - x;
            poseSkillBeam(beam, x, y, width, SKILLS.beamWidth, 1 - state.progress);
        };
        draw();
        this.sound.play(SOUND_KEYS.DRAGON_FIRE_BEAM, { volume: 0.52 });
        this.tweens.add({ targets: state, progress: 1, duration: SKILLS.beamFadeMs,
            onUpdate: draw, onComplete: () => beam.destroy() });
        let hitAircraft = false;
        let hitProjectile = false;
        for (const target of [...this._enemies.fires.getChildren(), ...this._enemies.getChildren()]) {
            if (this._blackBG) break;
            if (!target.active || !target.body) continue;
            const body = target.body;
            if (body.right <= band.left || body.left >= band.right || body.bottom <= band.top || body.top >= band.bottom) continue;
            playSkillPulse(this, 'impact', target.x, target.y, target.displayWidth * 0.95, SKILLS.healFadeMs, DEPTH_LAYERS.DEFAULT);
            this._onTargetHit(target);
            if (this._enemies.contains(target)) hitAircraft = true;
            else hitProjectile = true;
            this._destroyTarget(target);
        }
        if (hitAircraft) this.sounds.explosion_small.play();
        else if (hitProjectile) this.sound.play(SOUND_KEYS.MISSILE_INTERCEPT, { volume: 0.36 });
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
        this._player.stopControls();
        if (this.fireButton) this.fireButton.active = false;
        const sound = this._playTransitionSound(isWin ? SOUND_KEYS.WIN : SOUND_KEYS.LOSE);

        this._blackBG = this.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 0).setInteractive().setDepth(DEPTH_LAYERS.COVER_SCREEN);
        let finalTextLabel = this.add.text(this._blackBG.x, this._blackBG.y, '', {
            ...uiText(26, '#ffcf87'), align: 'center',
            wordWrap: { width: screenData.width * 0.45 },
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
            label.text = this._getText(TEXT_KEYS.FINAL_TEXT_WIN);
            return;
        }
        label.text = this._getText(TEXT_KEYS.FINAL_TEXT_WIN);

        this.model.achievements.recordVictory(this._player.currentHealth, this._player.maxHealth);
        if (this.model.getLevelHiScore(this._currentLevelScene) < this._currentScore) {
            const hiScores = this.model.hiScores.split(LEVEL_HI_SCORES_SEPARATOR);
            hiScores[this._currentLevelScene - 1] = this._currentScore;
            this.model.setHiScores(hiScores.join());
        }

        if (this.model.currentLevelScene <= this._currentLevelScene) {
            this.model.increaseSceneLevel();
            this._offerBranch = this._currentLevelScene === CAMPAIGN_SKILL_MISSIONS[0] && this.model.canChooseCampaignSkillBranch;
        }
    }

    _failureLevelComplete(label) {
        label.text = this._getText(TEXT_KEYS.FINAL_TEXT_LOSE);

        if (this.info.isUnlim) {
            const lastHiScore = this.model.unlimHiScores;
            if (this._currentScore > lastHiScore) {
                this.model.setUnlimHiScores(this._currentScore);
            }
        }
    }

    async _completeLevelTween(finalTextLabel, sound) {
        const duration = sound.duration * TIMING.GAME_SCENE.SOUND_SECONDS_TO_MS * TIMING.GAME_SCENE.END_TRANSITION_SOUND_FRACTION;
        const scale = finalTextLabel.scale * 2;
        const targets = [this._blackBG, finalTextLabel];
        
        await tweenPromise(this, {
            targets,
            fillAlpha: 1,
            alpha: 1,
            scale,
            ease: 'Linear',
            duration,
        });
        if (this._offerBranch) {
            this.scene.start(SCENE_NAMES.UPGRADE, { showSkills: true, fromCampaign: true });
            return;
        }
        this.scene.start(this.info?.isUnlim ? SCENE_NAMES.MAIN_MENU : SCENE_NAMES.CAMPAIGN);
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
        this._pauseButton.root.setDepth(DEPTH_LAYERS.UI).add(this.add.image(0, 0, TEXTURE_KEYS.PAUSE)
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

        const u = uiUnit();
        this._progressExpBar = this.add.image(this.scene.scene.cameras.main.midPoint.x, screenData.top + 32 * u, TEXTURE_KEYS.PROGRESS_BAR)
            .setDisplaySize(192 * u, 45 * u)
            .setAlpha(0.95);
        this._progressExpBar.fillProgress = this.add.image(this._progressExpBar.x + this._progressExpBar.displayWidth * 0.1, this._progressExpBar.y + this._progressExpBar.displayHeight * 0.04, TEXTURE_KEYS.PROGRESS_BAR_FILL)
            .setDisplaySize(141 * u, 17 * u)
            .setAlpha(0.95);
        
        this._progressExpBar.levelText = this.add.text(this._progressExpBar.x - this._progressExpBar.displayWidth * 0.38, this._progressExpBar.y - this._progressExpBar.displayHeight * 0.035, this.model.currentLevelPlayer, {
            ...uiText(UI.type.section), fontStyle: 'bold',
        }).setOrigin(0.5);

        this._updateExpProgressBar();
    }

    _updateExpProgressBar(){
        if (this.info?.isUnlim) {
            return;
        }

        let score = this._calculateScore();
        const experience = this.model.campaignExperience;
        let currentProgress = (experience - score.start) / score.diff;
        while (currentProgress >= 1) {
            this._increaseLevel();
            score = this._calculateScore();
            currentProgress = (experience - score.start) / score.diff;
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

    async _increaseLevel(){
        this.sounds.level_up.play({volume: 0.5});
        this.model.increasePlayerLevel();
        this.model.increaseMoney();

        const levelTextLabel = this.add.text(this.scene.scene.cameras.main.midPoint.x, this.scene.scene.cameras.main.midPoint.y, this.model.currentLevelPlayer, {
            font: `${config.width * 0.25}px ${getFontName()}`,
            fill: '#FFFFFF',
        }).setOrigin(0.5).setAlpha(0);

        const scale = this._progressExpBar.levelText.displayWidth/levelTextLabel.displayWidth;

        await tweenPromise(this, {
            targets: levelTextLabel,
            alpha: 1,
            scale,
            x: this._progressExpBar.levelText.x,
            y: this._progressExpBar.levelText.y,
            ease: 'Linear',
            duration: TIMING.GAME_SCENE.INCREASE_LEVEL_DURATION_MS,
        });
        levelTextLabel.destroy();
        this._progressExpBar.levelText.text = this.model.currentLevelPlayer;
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
