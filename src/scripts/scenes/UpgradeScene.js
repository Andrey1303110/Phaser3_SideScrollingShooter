import { createCrystal } from './components/crystal';
import { StorageService } from '../StorageService';
import { TIMING } from '../timing';
import { ANIMATION_KEYS, FRAME_KEYS, LIFECYCLE_EVENTS, STORAGE_KEYS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS } from '../identifiers';
import { FIRE_WEAPON_DEFAULT_SCALE, SCENE_NAMES, UPGRADE_MULTIPLIER } from '../constants';
import { CommonScene } from './CommonScene';
import { delayInMSec, getFontName, getSceneTexts, screenData, setEndpoints } from '../Utils';
import { UI, uiText, createButton } from '../ui';
import { BRANCH, CAMPAIGN_SKILL_BRANCHES, CAMPAIGN_SKILL_MISSIONS } from '../campaignSkills';
import { coverSkillArt, renderCampaignSkillPreview } from './components/CampaignSkillPreview';
import { refreshDragonAppearance } from '../dragonAppearance';

const TREE_GOLD = 0xe2ba7e;
const TREE_TEXT = '#f7e8cf';
const TREE_MUTED = '#adc7bf';

const STATS = {
    health: TEXT_KEYS.HEALTH_TITLE, reload: TEXT_KEYS.RELOAD_TITLE,
    velocity: TEXT_KEYS.VELOCITY_TITLE, scale: TEXT_KEYS.SCALE_TITLE,
};

// Match the dominant colors of the corresponding icon textures.
const UPGRADE_COLORS = {
    health: 0xee000d,
    reload: 0x9cdd05,
    velocity: 0xffdc45,
    scale: 0x0291f7,
};

export class UpgradeScene extends CommonScene {
    constructor() { super(SCENE_NAMES.UPGRADE); }

    init(data = {}) {
        super.init();
        this._cooldown = false;
        this._showSkills = data.showSkills ?? (StorageService.get(STORAGE_KEYS.UPGRADE_TAB, 'stats') === 'skills');
        if (data.showSkills !== undefined) this._rememberTab();
        this._fromCampaign = Boolean(data.fromCampaign);
        this._skillSelection = { branch: this.model.campaignSkillBranch || BRANCH.FIRE, index: 0 };
        this._confirmBranch = false;
        this._skillTexts = getSceneTexts(this, 'Skills');
    }

    _rememberTab() {
        StorageService.set(STORAGE_KEYS.UPGRADE_TAB, this._showSkills ? 'skills' : 'stats');
    }

    create() {
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK), upgrade: this.sound.add(SOUND_KEYS.UPGRADE) };
        this._prepareSkillIcons();
        this._render();
        const resize = () => { setEndpoints(); this._render(); };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize));
    }

    _render() {
        this.tweens.killAll();
        this.children.removeAll(true);
        if (this._showSkills) {
            coverSkillArt(this, screenData.left, screenData.top, screenData.width, screenData.height).setTint(0xb4bdab);
        } else {
            this._createBg();
        }
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
            this.cameras.main.width, this.cameras.main.height, 0x0a1c20, this._showSkills ? 0.53 : 0.88);
        const baseUnit = screenData.width / document.body.clientWidth;
        this._interfaceScale = Math.max(1, Math.min(1.8, screenData.height / baseUnit / 480));
        const u = baseUnit * this._interfaceScale;
        this._unit = u;
        const singleRow = screenData.width / u >= 760;
        const headerHeight = (singleRow ? 60 : 99) * u;
        this.add.graphics().fillStyle(0x0c1b1c, 0.88)
            .fillRect(screenData.left, screenData.top, screenData.width, headerHeight)
            .lineStyle(u, TREE_GOLD, 0.24)
            .lineBetween(screenData.left + 14 * u, screenData.top + headerHeight, screenData.right - 14 * u, screenData.top + headerHeight);
        this._createReturnButton();
        this._backButton.icon.setTintFill(TREE_GOLD);
        this.add.text(screenData.left + 52 * u, screenData.top + 24 * u,
            this._getText(TEXT_KEYS.TITLE), this._treeType(30, TREE_TEXT)).setOrigin(0, 0.5);
        this._moneyValueText = this.add.text(screenData.right - 16 * u, screenData.top + 24 * u,
            String(this.model.money), this._treeText(UI.type.button, UI.colors.accent)).setOrigin(1, 0.5);
        this._moneyIcon = createCrystal(this, this._moneyValueText.getBounds().left - 16 * u,
            screenData.top + 24 * u, 18 * u);
        const tabWidth = Math.min(176 * u, (screenData.width - 40 * u) / 2);
        [this._skillTexts.STATS, this._skillTexts.TREE].forEach((label, index) => {
            const showSkills = index === 1;
            this._treeButton({
                x: screenData.left + (singleRow ? 242 : 16) * u + (tabWidth + 8 * u) * index + tabWidth / 2,
                y: screenData.top + (singleRow ? 29 : 70) * u, width: tabWidth, height: 40 * u, text: label,
                color: TREE_GOLD, selected: this._showSkills === showSkills,
                onPress: () => {
                    if (this._showSkills === showSkills) return;
                    this._showSkills = showSkills;
                    this._rememberTab();
                    this._confirmBranch = false;
                    this.sounds.click.play({ volume: 0.2 });
                    this._render();
                },
            });
        });
        const top = screenData.top + headerHeight + 11 * u;
        if (this._showSkills) this._renderSkillTree(top);
        else this._renderStats(top);
    }

    _onReturnButtonClick() {
        this.sounds.click.play({ volume: 0.2 });
        this.scene.start(this._fromCampaign ? SCENE_NAMES.CAMPAIGN : SCENE_NAMES.MAIN_MENU);
    }

    _renderStats(top) {
        const u = this._unit;
        const compact = screenData.height / u <= 360;
        const left = screenData.left + screenData.width * 0.37;
        const width = screenData.right - left - 16 * u;
        const gap = (compact ? 4 : 8) * u;
        const bottomSpace = (compact ? 12 : 44) * u;
        const height = (screenData.bottom - top - bottomSpace - gap * 3) / 4;
        const iconSize = Math.min(44 * u, height * 0.62);
        const textX = left + 16 * u + iconSize + 10 * u;
        const buttonWidth = Math.min(width * 0.30, 126 * u);
        const buttonHeight = Math.min(66 * u, height * 0.82);
        this.buttons = {};
        this.statsText = {};
        this._upgradeEffects = {};
        Object.entries(STATS).forEach(([key, title], index) => {
            const y = top + index * (height + gap);
            const panel = this.add.graphics().fillStyle(UI.colors.panel).lineStyle(u, UI.colors.border, 0.8);
            panel.fillRoundedRect(left, y, width, height, UI.radius * u)
                .strokeRoundedRect(left, y, width, height, UI.radius * u);
            const color = UPGRADE_COLORS[key];
            const highlight = this.add.graphics().fillStyle(color, 0.3).lineStyle(3 * u, color)
                .fillRoundedRect(left, y, width, height, UI.radius * u)
                .strokeRoundedRect(left, y, width, height, UI.radius * u).setAlpha(0);
            const icon = this.add.image(left + 12 * u + iconSize / 2, y + height / 2, key).setDisplaySize(iconSize, iconSize);
            this._upgradeEffects[key] = { highlight, icon };
            const textWidth = left + width - buttonWidth - 18 * u - textX;
            const name = this.add.text(textX, y + height / 2 - 10 * u, this._getText(title),
                this._treeText(UI.type.body)).setOrigin(0, 0.5);
            name.setScale(Math.min(1, textWidth / name.width));
            this.statsText[key] = this.add.text(textX, y + height / 2 + 11 * u, '', this._treeText(UI.type.caption, UI.colors.muted)).setOrigin(0, 0.5);
            const button = createButton(this, {
                x: left + width - 8 * u - buttonWidth / 2, y: y + height / 2, width: buttonWidth, height: buttonHeight,
                fontSize: 21 * this._interfaceScale, text: '',
                variant: 'primary', onPress: () => this._upgrade(key),
            });
            button.root.add(createCrystal(this, buttonWidth * 0.24, 0, Math.min(29 * u, buttonHeight * 0.55)));
            this.buttons[key] = button;
        });
        const areaWidth = left - screenData.left - 32 * u;
        const x = screenData.left + 16 * u + areaWidth / 2;
        const statsHeight = height * 4 + gap * 3;
        const y = top + statsHeight * 0.36;
        if (!this.anims.exists(ANIMATION_KEYS.MENU_FLY)) {
            this.anims.create({ key: ANIMATION_KEYS.MENU_FLY, frames: this.anims.generateFrameNames(TEXTURE_KEYS.DRAGON,
                { prefix: TEXTURE_KEYS.DRAGON, start: 1, end: 12 }), frameRate: TIMING.UPGRADE_SCENE.RENDER_FRAME_RATE_FPS, repeat: -1 });
        }
        this._player = this.add.sprite(x, y, TEXTURE_KEYS.DRAGON, FRAME_KEYS.DRAGON1)
            .play(ANIMATION_KEYS.MENU_FLY);
        this._player.setScale(Math.min(areaWidth, statsHeight * 0.83) / this._player.width);
        this.tweens.add({ targets: this._player, y: y - 4 * u, duration: TIMING.UPGRADE_SCENE.RENDER_DURATION_MS, yoyo: true,
            repeat: -1, ease: 'Sine.InOut' });
        const texts = this._skillTexts;
        const branch = CAMPAIGN_SKILL_BRANCHES[this.model.campaignSkillBranch];
        const tier = this.model.campaignSkillTier;
        let summary = tier > 0 ? texts.CHOICE_AVAILABLE
            : texts.BRANCH_REWARD + '\n' + texts.AFTER_LEVEL.replace('{level}', CAMPAIGN_SKILL_MISSIONS[0]);
        if (branch && tier > 0) {
            const latest = texts[branch.skills[tier - 1]];
            const next = branch.skills[tier];
            summary = next ? latest + '\n' + texts.NEXT.replace('{skill}', texts[next]).replace('{level}', CAMPAIGN_SKILL_MISSIONS[tier])
                : latest + ' · ' + texts.ACTIVE;
        }
        this._skillLabel(x, top + statsHeight * 0.83, summary, areaWidth, UI.colors.accent);
        if (!compact) {
            this.add.text((screenData.left + screenData.right) / 2, screenData.bottom - 16 * u,
                this._getText(TEXT_KEYS.BOTTOM_DESCRIPTION).replace('{percent}', Math.round(UPGRADE_MULTIPLIER * 100)),
                { ...uiText(UI.type.caption, UI.colors.muted), align: 'center',
                    wordWrap: { width: screenData.width - 32 * u } }).setOrigin(0.5, 1);
        }
        this._refresh();
    }

    _skillLabel(x, y, label, width, color = UI.colors.text, size = UI.type.caption) {
        return this.add.text(x, y, label, {
            ...this._treeText(size, color), wordWrap: { width }, align: 'center',
        }).setOrigin(0.5);
    }

    _treeType(size, color = TREE_TEXT) {
        return { ...this._treeText(size, color), fontFamily: getFontName() || UI.font };
    }

    _treeText(size, color) {
        return uiText(size * this._interfaceScale, color);
    }

    _treeButton({ x, y, width, height, color, selected = false, featured = false, fontSize = 16, ...options }) {
        const u = this._unit;
        const button = createButton(this, { x, y, width, height, fontSize: fontSize * this._interfaceScale, ...options });
        button.background.setVisible(false);
        const skin = this.add.graphics();
        button.root.addAt(skin, 0);
        const r = 8 * u;
        const left = -width / 2;
        const top = -height / 2;
        const paint = hovered => {
            skin.clear().fillStyle(0x071214, 0.9).fillRoundedRect(left, top + 2 * u, width, height, r);
            skin.fillStyle(featured ? 0x365043 : 0x173034, 0.99).fillRoundedRect(left, top, width, height, r);
            skin.fillStyle(color, selected || featured ? 0.19 : hovered ? 0.12 : 0.05)
                .fillRoundedRect(left, top, width, height, r);
            skin.lineStyle((selected || hovered ? 2 : 1) * u, color, selected || featured || hovered ? 0.86 : 0.37)
                .strokeRoundedRect(left, top, width, height, r);
            if (selected || featured) {
                skin.lineStyle(u, color, 0.48).lineBetween(left + 9 * u, top + 4 * u, -left - 9 * u, top + 4 * u);
            }
        };
        paint(false);
        button.hitArea.on('pointerover', () => paint(true)).on('pointerout', () => paint(false));
        button.label.setColor(TREE_TEXT);
        return button;
    }

    _treePanel(x, y, width, height, color) {
        const u = this._unit;
        return this.add.graphics().fillStyle(0x080f11, 0.64)
            .fillRoundedRect(x, y + 3 * u, width, height, 14 * u)
            .fillStyle(0x102529, 0.92).fillRoundedRect(x, y, width, height, 14 * u)
            .lineStyle(u, color, 0.52).strokeRoundedRect(x, y, width, height, 14 * u)
            .lineStyle(u, color, 0.22).lineBetween(x + 12 * u, y + 4 * u, x + width - 12 * u, y + 4 * u);
    }

    _prepareSkillIcons() {
        if (!this.textures.exists(TEXTURE_KEYS.SKILL_ICONS)) return;
        const texture = this.textures.get(TEXTURE_KEYS.SKILL_ICONS);
        const source = texture.getSourceImage();
        const cellWidth = Math.floor(source.width / 3);
        const cellHeight = Math.floor(source.height / 2);
        Object.values(CAMPAIGN_SKILL_BRANCHES).forEach(({ skills }, row) => {
            skills.forEach((skill, col) => {
                if (!texture.has(skill)) texture.add(skill, 0, col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            });
        });
    }

    _renderSkillTree(top) {
        const u = this._unit;
        const texts = this._skillTexts;
        const left = screenData.left + 16 * u;
        const right = screenData.right - 16 * u;
        const treeWidth = (right - left) * 0.62;
        const detailLeft = left + treeWidth + 12 * u;
        const detailWidth = right - detailLeft;
        const height = screenData.bottom - top - 12 * u;
        const rootX = left + 25 * u;
        const nodeLeft = left + Math.min(116 * u, treeWidth * 0.285);
        const step = (left + treeWidth - 10 * u - nodeLeft) / 3;
        const head = 55 * u;
        const tracks = height - head;
        const rootY = top + head + tracks / 2;
        const tier = this.model.campaignSkillTier;
        const chosen = this.model.campaignSkillBranch;
        const cardHeight = Math.min(119 * u, tracks * 0.43);
        const pillWidth = nodeLeft - left - 29 * u;
        const pillX = nodeLeft - pillWidth / 2 - 7 * u;
        this._treePanel(left, top, treeWidth, height, TREE_GOLD);
        const links = this.add.graphics();
        this.add.circle(rootX, rootY, 19 * u, 0x102426).setStrokeStyle(1.5 * u, TREE_GOLD);
        this.add.sprite(rootX, rootY, TEXTURE_KEYS.DRAGON, FRAME_KEYS.DRAGON1).setDisplaySize(31 * u, 25 * u);
        this._skillLabel((nodeLeft + left + treeWidth) / 2, top + 13 * u,
            texts.FIRST_WINS, treeWidth, TREE_MUTED, 13);
        CAMPAIGN_SKILL_MISSIONS.forEach((mission, index) => {
            const x = nodeLeft + step * (index + 0.5);
            const badge = Math.min(step - 9 * u, 99 * u);
            this.add.graphics().fillStyle(0x1b3435, 0.95).lineStyle(u, TREE_GOLD, 0.38)
                .fillRoundedRect(x - badge / 2, top + 24 * u, badge, 25 * u, 9 * u)
                .strokeRoundedRect(x - badge / 2, top + 24 * u, badge, 25 * u, 9 * u);
            this._skillLabel(x, top + 36 * u, texts.LEVEL.replace('{level}', mission + 1), badge, TREE_TEXT, 14);
        });
        Object.entries(CAMPAIGN_SKILL_BRANCHES).forEach(([branch, data], row) => {
            const y = top + head + tracks * (row === 0 ? 0.25 : 0.75);
            const color = '#' + data.color.toString(16).padStart(6, '0');
            const dimmed = Boolean(chosen && chosen !== branch);
            links.lineStyle(6 * u, data.color, 0.11).beginPath().moveTo(rootX, rootY)
                .lineTo(rootX + 20 * u, y).lineTo(nodeLeft + step * 2.5, y).strokePath();
            links.lineStyle(2 * u, data.color, dimmed ? 0.36 : 0.87).beginPath().moveTo(rootX, rootY)
                .lineTo(rootX + 20 * u, y).lineTo(nodeLeft + step * 2.5, y).strokePath();
            this.add.graphics().fillStyle(0x173134).lineStyle(u, data.color, 0.76)
                .fillRoundedRect(pillX - pillWidth / 2, y - 13 * u, pillWidth, 26 * u, 8 * u)
                .strokeRoundedRect(pillX - pillWidth / 2, y - 13 * u, pillWidth, 26 * u, 8 * u);
            this._skillLabel(pillX, y, texts[data.title], pillWidth, color, 14).setStyle(this._treeType(15, color));
            data.skills.forEach((skill, index) => {
                const x = nodeLeft + step * (index + 0.5);
                const focused = this._skillSelection.branch === branch && this._skillSelection.index === index;
                const active = branch === chosen && index < tier;
                const compactLabel = skill === 'BEAM' || step < 116 * u;
                const title = (compactLabel && texts[skill + '_SHORT']) || texts[skill];
                const button = this._treeButton({
                    x, y, width: step - 6 * u, height: cardHeight, text: title, fontSize: step < 115 * u ? 14 : 16,
                    color: data.color, selected: focused,
                    onPress: () => {
                        this._skillSelection = { branch, index };
                        this._confirmBranch = false;
                        this.sounds.click.play({ volume: 0.2 });
                        this._render();
                    },
                });
                button.label.setColor(dimmed && !focused ? TREE_MUTED : TREE_TEXT);
                button.label.setY(cardHeight * 0.23);
                this._addSkillIcon(button.root, skill, -cardHeight * 0.2, Math.min(step * 0.68, cardHeight * 0.62), dimmed && !focused);
                if (active) {
                    const badgeX = step / 2 - 14 * u;
                    const badgeY = -cardHeight / 2 + 12 * u;
                    button.root.add(this.add.circle(badgeX, badgeY, 8 * u, 0x124139).setStrokeStyle(u, 0x91dbad));
                    button.root.add(this._skillLabel(badgeX, badgeY, '✓', 15 * u, '#c0f3cc', 12));
                } else if (index >= tier || dimmed) {
                    this._addSkillLock(button.root, step / 2 - 14 * u, -cardHeight / 2 + 12 * u, data.color);
                }
            });
        });
        this._renderSkillDetails(detailLeft, top, detailWidth, height);
    }

    _addSkillIcon(root, skill, y, size, dimmed) {
        if (this.textures.get(TEXTURE_KEYS.SKILL_ICONS).has(skill)) {
            const icon = this.add.image(0, y, TEXTURE_KEYS.SKILL_ICONS, skill);
            icon.setScale(size / Math.max(icon.width, icon.height)).setAlpha(dimmed ? 0.58 : 1);
            root.add(icon);
        }
    }

    _addSkillLock(root, x, y, color) {
        const u = this._unit;
        root.add(this.add.graphics().fillStyle(0x0a2226).fillCircle(x, y, 8 * u)
            .lineStyle(u, color, 0.75).beginPath().arc(x, y - u, 2.5 * u, Math.PI, Math.PI * 2).strokePath()
            .fillStyle(color, 0.8).fillRoundedRect(x - 3.6 * u, y - u, 7.2 * u, 5.4 * u, u));
    }

    _renderSkillDetails(x, y, width, height) {
        const u = this._unit;
        const texts = this._skillTexts;
        const { branch, index } = this._skillSelection;
        const branchInfo = CAMPAIGN_SKILL_BRANCHES[branch];
        const skill = branchInfo.skills[index];
        const xCenter = x + width / 2;
        const labelWidth = width - 22 * u;
        this._treePanel(x, y, width, height, branchInfo.color);
        const title = this.add.text(x + 11 * u, y + 11 * u,
            this._confirmBranch ? texts.CHOOSE_HEADER.replace('{branch}', texts[branchInfo.title]) : texts[skill],
            { ...this._treeType(width / u < 200 ? 19 : 23), wordWrap: { width: labelWidth } });
        const description = this.add.text(x + 11 * u, 0,
            this._confirmBranch ? texts.CHOICE_PERMANENT : texts[skill + '_DETAIL'],
            { ...this._treeText(width / u < 200 ? 13 : 15, TREE_TEXT), wordWrap: { width: labelWidth } });
        const chosen = this.model.campaignSkillBranch;
        const tier = this.model.campaignSkillTier;
        const canChoose = this.model.canChooseCampaignSkillBranch;
        const bottom = y + height - 29 * u;
        let descriptionBottom = y + height - (canChoose ? 56 : 11) * u;
        const status = this._confirmBranch ? ''
            : chosen === branch && index < tier ? texts.ACTIVE
            : chosen && chosen !== branch ? texts.OTHER_BRANCH
            : index >= tier ? texts.AFTER_LEVEL.replace('{level}', CAMPAIGN_SKILL_MISSIONS[index]) : '';
        if (status) {
            const state = this.add.text(x + 11 * u, descriptionBottom, status,
                { ...this._treeText(13, TREE_MUTED), wordWrap: { width: labelWidth } }).setOrigin(0, 1);
            descriptionBottom -= state.height + 6 * u;
        }
        description.setY(descriptionBottom - description.height);
        const previewTop = title.getBounds().bottom + 8 * u;
        renderCampaignSkillPreview(this, {
            x: x + 11 * u, y: previewTop, width: labelWidth, height: description.y - 9 * u - previewTop,
            skill, color: branchInfo.color, label: texts.PREVIEW, xpLabel: texts.XP_SHORT, unit: u,
        });
        if (!this._confirmBranch) {
            if (canChoose) {
                this._treeButton({
                    x: xCenter, y: bottom, width: labelWidth, height: 42 * u,
                    text: texts.CHOOSE_BRANCH.replace('{branch}', texts[branchInfo.title]),
                    color: branchInfo.color, featured: true, onPress: () => { this._confirmBranch = true; this._render(); },
                });
            }
            return;
        }
        const chooser = (offset, label, featured, onPress) => this._treeButton({
            x: xCenter + offset * labelWidth / 4, y: bottom, width: labelWidth / 2 - 4 * u,
            height: 42 * u, text: label, color: branchInfo.color, featured, fontSize: width < 195 * u ? 13 : 16, onPress,
        });
        chooser(-1, texts.CANCEL, false, () => { this._confirmBranch = false; this._render(); });
        chooser(1, texts.CONFIRM, true, () => {
            if (!this.model.chooseCampaignSkillBranch(branch)) return;
            this.sounds.upgrade.play({ volume: 0.2 });
            this._confirmBranch = false;
            this._skillSelection.index = this.model.campaignSkillTier - 1;
            this._render();
        });
    }

    _value(key) {
        if (key === TEXTURE_KEYS.HEALTH) return Math.round(this.model.player.maxHealth);
        if (key === TEXTURE_KEYS.SCALE) return Math.round(this.model.fireWeapon.scale * FIRE_WEAPON_DEFAULT_SCALE * 100);
        return Math.round(this.model.fireWeapon[key]);
    }

    _refresh() {
        const u = this._unit;
        this._moneyValueText.setText(String(this.model.money));
        this._moneyIcon.x = this._moneyValueText.getBounds().left - 16 * u;
        for (const key of Object.keys(STATS)) {
            const level = this.model.currentUpgradableStats[key];
            const button = this.buttons[key];
            button.cost = Math.floor(level / 10) + 1;
            button.active = !this._cooldown && this.model.money >= button.cost;
            button.clicked = this._cooldown;
            button.setText(String(button.cost)).setEnabled(button.active);
            button.label.setX(-6 * u);
            this.statsText[key].setText(this._value(key) + ' · ' + this._getText(TEXT_KEYS.LEVEL_TEXT).trim() + ' ' + level);
        }
    }

    async _upgrade(key) {
        const button = this.buttons[key];
        if (!button.active || this._cooldown) return;
        if (!this.model.decreaseMoney(button.cost)) return;
        this.model.upgradePlayerAbility(key);
        refreshDragonAppearance(this);
        this._cooldown = true;
        this.sounds.upgrade.play({ volume: 0.2 });
        this._refresh();
        this._playUpgradeEffect(key);
        await delayInMSec(this, TIMING.UPGRADE_SCENE.UPGRADE_DELAY_MS);
        this._cooldown = false;
        if (!this._showSkills) this._refresh();
    }

    _playUpgradeEffect(key) {
        const u = this._unit;
        const { highlight, icon } = this._upgradeEffects[key];
        const color = UPGRADE_COLORS[key];
        const textColor = '#' + color.toString(16).padStart(6, '0');
        const stats = this.statsText[key];
        const pulseDuration = TIMING.UPGRADE_SCENE.UPGRADE_DURATION_MS;
        const effectDuration = TIMING.UPGRADE_SCENE.EFFECT_DURATION_MS;
        this.tweens.add({ targets: highlight, alpha: { from: 1, to: 0 },
            duration: effectDuration, ease: 'Sine.In' });
        this.tweens.add({ targets: icon, scaleX: icon.scaleX * 1.25, scaleY: icon.scaleY * 1.25,
            duration: pulseDuration, yoyo: true, ease: 'Sine.InOut' });
        stats.setColor(textColor);
        this.tweens.add({ targets: stats, alpha: { from: 0.75, to: 1 }, duration: effectDuration,
            onComplete: () => stats.setColor(UI.colors.muted) });

        // Pulse the preview without interrupting its idle flight animation.
        this.tweens.add({ targets: this._player, scaleX: this._player.scaleX * 1.08,
            scaleY: this._player.scaleY * 1.08, duration: pulseDuration, yoyo: true, ease: 'Sine.InOut' });
        const x = this._player.x;
        const y = this._player.y;
        const radius = Math.min(72 * u, this._player.displayWidth * 0.45);
        const ring = this.add.circle(x, y, radius, color, 0.1).setStrokeStyle(4 * u, color);
        this.tweens.add({ targets: ring, scale: { from: 0.55, to: 1.25 }, alpha: { from: 1, to: 0 },
            duration: effectDuration, ease: 'Sine.In', onComplete: () => ring.destroy() });
        for (let index = 0; index < 12; index++) {
            const angle = index * Math.PI / 6;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius * 0.8;
            const spark = this.add.circle(x + dx * 0.4, y + dy * 0.4, 4.5 * u, color);
            this.tweens.add({ targets: spark, x: x + dx, y: y + dy,
                scale: 0.2, alpha: 0, duration: effectDuration, ease: 'Cubic.Out',
                onComplete: () => spark.destroy() });
        }
    }
}
