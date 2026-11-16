import { TIMING } from '../timing';
import { ANIMATION_KEYS, FRAME_KEYS, LIFECYCLE_EVENTS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS } from '../identifiers';
import { FIRE_WEAPON_DEFAULT_SCALE, SCENE_NAMES, UPGRADE_MULTIPLIER } from '../constants';
import { CommonScene } from './CommonScene';
import { screenData, setEndpoints } from '../Utils';
import { UI, uiText, createButton } from '../ui';

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

    init() {
        super.init();
        this._cooldown = false;
    }

    create() {
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK), upgrade: this.sound.add(SOUND_KEYS.UPGRADE) };
        this._render();
        const resize = () => { setEndpoints(); this._render(); };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize));
    }

    _render() {
        this.tweens.killAll();
        this.children.removeAll(true);
        this._createBg();
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
            this.cameras.main.width, this.cameras.main.height, 0x102323, 0.88);
        const u = screenData.width / document.body.clientWidth;
        this._unit = u;
        this._createReturnButton();
        this.add.text(screenData.left + 56 * u, screenData.top + 12 * u,
            this._getText(TEXT_KEYS.TITLE), uiText(UI.type.title));
        this._moneyValueText = this.add.text(screenData.right - 16 * u, screenData.top + 24 * u,
            String(this.model.money), uiText(UI.type.button, UI.colors.accent)).setOrigin(1, 0.5);
        this._moneyIcon = this.add.image(this._moneyValueText.getBounds().left - 16 * u,
            screenData.top + 24 * u, TEXTURE_KEYS.RUBY).setDisplaySize(18 * u, 18 * u);
        const compact = screenData.height / u <= 360;
        const left = screenData.left + screenData.width * 0.33;
        const width = screenData.right - left - 16 * u;
        const top = screenData.top + (compact ? 54 : 62) * u;
        const gap = (compact ? 4 : 8) * u;
        const height = Math.max(52 * u, Math.min(64 * u, (screenData.height - 116 * u - gap * 3) / 4));
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
            const icon = this.add.image(left + 24 * u, y + height / 2, key).setDisplaySize(24 * u, 24 * u);
            this._upgradeEffects[key] = { highlight, icon };
            const textWidth = width - 144 * u;
            this.add.text(left + 48 * u, y + height / 2 - 10 * u, this._getText(title), {
                ...uiText(UI.type.body), wordWrap: { width: textWidth },
            }).setOrigin(0, 0.5);
            this.statsText[key] = this.add.text(left + 48 * u, y + height / 2 + 13 * u, '', uiText(UI.type.caption, UI.colors.muted)).setOrigin(0, 0.5);
            const button = createButton(this, {
                x: left + width - 44 * u, y: y + height / 2, width: 76 * u, text: '',
                variant: 'primary', onPress: () => this._upgrade(key),
            });
            button.root.add(this.add.image(18 * u, 0, TEXTURE_KEYS.RUBY).setDisplaySize(18 * u, 18 * u));
            this.buttons[key] = button;
        });
        const areaWidth = left - screenData.left - 32 * u;
        const x = screenData.left + 16 * u + areaWidth / 2;
        const y = top + (height * 4 + gap * 3) / 2;
        if (!this.anims.exists(ANIMATION_KEYS.MENU_FLY)) {
            this.anims.create({ key: ANIMATION_KEYS.MENU_FLY, frames: this.anims.generateFrameNames(TEXTURE_KEYS.DRAGON,
                { prefix: TEXTURE_KEYS.DRAGON, start: 1, end: 6 }), frameRate: TIMING.UPGRADE_SCENE.RENDER_FRAME_RATE_FPS, repeat: -1 });
        }
        this._player = this.add.sprite(x, y, TEXTURE_KEYS.DRAGON, FRAME_KEYS.DRAGON1)
            .setScale(Math.min(180 * u, areaWidth * 0.9) / 153).play(ANIMATION_KEYS.MENU_FLY);
        this.tweens.add({ targets: this._player, y: y - 4 * u, duration: TIMING.UPGRADE_SCENE.RENDER_DURATION_MS, yoyo: true,
            repeat: -1, ease: 'Sine.InOut' });
        if (!compact) {
            this.add.text((screenData.left + screenData.right) / 2, screenData.bottom - 16 * u,
                this._getText(TEXT_KEYS.BOTTOM_DESCRIPTION).replace('{percent}', Math.round(UPGRADE_MULTIPLIER * 100)),
                { ...uiText(UI.type.caption, UI.colors.muted), align: 'center',
                    wordWrap: { width: screenData.width - 32 * u } }).setOrigin(0.5, 1);
        }
        this._refresh();
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

    _upgrade(key) {
        const button = this.buttons[key];
        if (!button.active || this._cooldown) return;
        if (!this.model.decreaseMoney(button.cost)) return;
        this.model.upgradePlayerAbility(key);
        this._cooldown = true;
        this.sounds.upgrade.play({ volume: 0.2 });
        this._refresh();
        this._playUpgradeEffect(key);
        this.time.delayedCall(TIMING.UPGRADE_SCENE.UPGRADE_DELAY_MS, () => { this._cooldown = false; this._refresh(); });
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
