import { TIMING } from '../timing';
import { ANIMATION_KEYS, FRAME_KEYS, INPUT_EVENTS, LIFECYCLE_EVENTS, SOUND_KEYS, TEXTURE_KEYS, TEXT_KEYS } from '../identifiers';
import { screenData, setEndpoints } from '../Utils';
import { SCENE_NAMES, UNLIMITED_LEVEL, CAMPAIGN_LEVELS } from '../constants';
import { CommonScene } from './CommonScene';
import { UI, createButton } from '../ui';

const ACTIONS = [
    { text: TEXT_KEYS.CAMPAIGN, scene: SCENE_NAMES.CAMPAIGN, icon: TEXTURE_KEYS.FLAG, primary: true },
    { text: TEXT_KEYS.UNLIM, scene: SCENE_NAMES.GAME, icon: 'infinity', caption: TEXT_KEYS.SURVIVAL_HINT },
    { text: TEXT_KEYS.UPGRADE, scene: SCENE_NAMES.UPGRADE, icon: SOUND_KEYS.UPGRADE, caption: TEXT_KEYS.UPGRADE_HINT },
];

export class GameTypeSelect extends CommonScene {
    constructor() {
        super(SCENE_NAMES.MAIN_MENU);
    }

    init() {
        super.init();
        this._transitioning = false;
    }

    create() {
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK) };
        this._build();
        const resize = () => {
            if (this._transitioning) return;
            setEndpoints();
            this.tweens.killAll();
            this.children.removeAll(true);
            this._build(false);
        };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize));
    }

    _build(animate = true) {
        const u = screenData.width / document.body.clientWidth;
        const margin = screenData.width * 0.055;
        const width = screenData.width - margin * 2;
        const actionWidth = Math.min(340 * u, width * 0.49);
        const left = screenData.left + margin;
        const actionX = screenData.right - margin - actionWidth;
        this._unit = u;
        this._buttons = [];
        this._createBg();
        this.add.rectangle(screenData.left, screenData.top, screenData.width, screenData.height,
            0x102323, 0.88).setOrigin(0);
        this._createHero(left, actionX - left - 24 * u);

        const cardHeight = Math.min(72 * u, (screenData.height - 120 * u) / 3);
        const stackHeight = cardHeight * 3 + 20 * u;
        const top = screenData.top + (screenData.height - 64 * u - stackHeight) / 2;
        ACTIONS.forEach((action, index) => {
            const button = this._createAction(actionX, top + index * (cardHeight + 10 * u),
                actionWidth, cardHeight, action);
            this._buttons.push(button);
            if (animate) {
                this.tweens.add({
                    targets: button, alpha: { from: 0, to: 1 },
                    y: { from: button.y + 12 * u, to: button.y },
                    duration: TIMING.GAME_TYPE_SELECT.BUILD_DURATION_MS, delay: index * TIMING.GAME_TYPE_SELECT.CARD_STAGGER_MS, ease: 'Cubic.Out',
                });
            }
        });
        this._createFooter(left);
    }

    _createHero(left, width) {
        const u = this._unit;
        const top = screenData.top + 26 * u;
        this.add.rectangle(left, top + 6 * u, 20 * u, 2 * u, 0xe0b36b).setOrigin(0, 0.5);
        this.add.text(left + 30 * u, top, this._getText(TEXT_KEYS.TAGLINE), {
            fontFamily: 'Arial', fontSize: 11 * u, fontStyle: 'bold', color: '#dfbe87',
        });
        const title = this.add.text(left - 2 * u, top + 24 * u, 'INVADERS\nMUST DIE', {
            fontFamily: 'Arial', fontSize: Math.min(44 * u, width * 0.145),
            fontStyle: 'bold', color: '#f6edda', lineSpacing: -2 * u,
        });
        const areaTop = title.getBounds().bottom + 6 * u;
        const areaBottom = screenData.bottom - 76 * u;
        const dragonWidth = Math.min(width * 0.88, (areaBottom - areaTop) * 153 / 119);
        const x = left + width * 0.53;
        const y = (areaTop + areaBottom) / 2;
        const glow = this.add.graphics();
        for (let i = 4; i >= 1; i--) {
            glow.fillStyle(0x86b787, 0.025).fillCircle(x, y, dragonWidth * (0.35 + i * 0.12));
        }
        this.add.ellipse(x, areaBottom + 3 * u, dragonWidth * 0.75, 9 * u, 0x071516, 0.45);
        if (!this.anims.exists(ANIMATION_KEYS.MENU_FLY)) {
            this.anims.create({
                key: ANIMATION_KEYS.MENU_FLY,
                frames: this.anims.generateFrameNames(TEXTURE_KEYS.DRAGON, { prefix: TEXTURE_KEYS.DRAGON, start: 1, end: 6 }),
                frameRate: TIMING.GAME_TYPE_SELECT.CREATE_HERO_FRAME_RATE_FPS, repeat: -1,
            });
        }
        this._dragon = this.add.sprite(x, y, TEXTURE_KEYS.DRAGON, FRAME_KEYS.DRAGON1)
            .setScale(dragonWidth / 153).play(ANIMATION_KEYS.MENU_FLY);
        this.tweens.add({
            targets: this._dragon, y: y - 4 * u, duration: TIMING.GAME_TYPE_SELECT.CREATE_HERO_DURATION_MS,
            yoyo: true, repeat: -1, ease: 'Sine.InOut',
        });
    }

    _createAction(x, y, width, height, action) {
        const u = this._unit;
        const button = this.add.container(x, y);
        const background = this.add.graphics();
        const draw = pressed => {
            background.clear();
            background.fillStyle(0x061718, 0.3)
                .fillRoundedRect(0, 4 * u, width, height, UI.radius * u);
            background.fillStyle(action.primary ? (pressed ? UI.colors.primaryPressed : UI.colors.primary)
                : (pressed ? UI.colors.secondaryPressed : UI.colors.secondary))
                .lineStyle(u, action.primary ? 0x79bb8b : 0x3d5754, pressed ? 1 : 0.7)
                .fillRoundedRect(0, 0, width, height, 13 * u)
                .strokeRoundedRect(0, 0, width, height, UI.radius * u);
        };
        draw(false);
        const title = this.add.text(64 * u, 13 * u, this._getText(action.text), {
            fontFamily: 'Arial', fontSize: UI.type.section * u,
            fontStyle: 'bold', color: '#f6f1e4',
        });
        const campaignCaption = this.model.currentLevelScene > CAMPAIGN_LEVELS.length
            ? this._getText(TEXT_KEYS.CAMPAIGN_DONE)
            : this._getText(TEXT_KEYS.MISSION_HINT)
                .replace('{level}', this.model.currentLevelScene)
                .replace('{total}', CAMPAIGN_LEVELS.length);
        const caption = this.add.text(64 * u, 40 * u,
            action.primary ? campaignCaption : this._getText(action.caption), {
                fontFamily: 'Arial', fontSize: 13 * u,
                color: action.primary ? '#d4e8d0' : '#a8bcb5',
            });
        const arrow = this.add.graphics().lineStyle(1.8 * u, 0xd4e1d1, 0.8);
        arrow.beginPath().moveTo(width - 24 * u, height / 2 - 5 * u)
            .lineTo(width - 19 * u, height / 2).lineTo(width - 24 * u, height / 2 + 5 * u).strokePath();
        button.add([background, title, caption, arrow]);
        this._drawIcon(button, action.icon, 31 * u, height / 2);
        const hitArea = this.add.zone(width / 2, height / 2, width, height)
            .setInteractive({ useHandCursor: true });
        this._bindPress(hitArea, () => this._gameSelect(button, action.scene), draw);
        button.add(hitArea);
        button.hitArea = hitArea;
        button.buttonText = title;
        button.caption = caption;
        return button;
    }

    _drawIcon(parent, icon, x, y) {
        const u = this._unit;
        const g = this.add.graphics().lineStyle(2 * u, 0xd9e7d0);
        if (icon === TEXTURE_KEYS.FLAG) {
            g.lineBetween(x - 7 * u, y + 11 * u, x - 7 * u, y - 11 * u);
            g.fillStyle(0xd9e7d0).fillTriangle(x - 7 * u, y - 11 * u,
                x + 12 * u, y - 5 * u, x - 7 * u, y + u);
        } else if (icon === SOUND_KEYS.UPGRADE) {
            for (const offset of [-5, 5]) {
                g.beginPath().moveTo(x - 9 * u, y + (offset + 3) * u)
                    .lineTo(x, y + (offset - 5) * u)
                    .lineTo(x + 9 * u, y + (offset + 3) * u).strokePath();
            }
        } else {
            parent.add(this.add.text(x, y - u, '∞', {
                fontFamily: 'Arial', fontSize: 34 * u, color: '#d9e7d0',
            }).setOrigin(0.5));
        }
        parent.add(g);
    }

    _bindPress(hitArea, action, draw = () => {}) {
        let pointerId = null;
        hitArea.on(INPUT_EVENTS.POINTEROVER, () => draw(true));
        hitArea.on(INPUT_EVENTS.POINTERDOWN, pointer => {
            if (this._transitioning) return;
            pointerId = pointer.id;
            draw(true);
        });
        hitArea.on(INPUT_EVENTS.POINTEROUT, () => { pointerId = null; draw(false); });
        hitArea.on(INPUT_EVENTS.POINTERUP, pointer => {
            if (pointer.id !== pointerId || this._transitioning) return;
            pointerId = null;
            draw(false);
            action();
        });
    }

    _createFooter(left) {
        const u = this._unit;
        const y = screenData.bottom - 32 * u;
        this._footerButtons = [];
        for (const [index, key] of [TEXT_KEYS.INFO, TEXT_KEYS.SETTINGS].entries()) {
            this._footerButtons.push(createButton(this, {
                x: left + (index ? 202 : 51) * u, y, width: (index ? 176 : 102) * u,
                text: this._getText(key), canPress: () => !this._transitioning,
                onPress: () => this._gameSelect(null, SCENE_NAMES[key]),
            }));
        }
        const wallet = this.add.text(screenData.right - screenData.width * 0.055, y, this.model.money, {
            fontFamily: 'Arial', fontSize: 15 * u, fontStyle: 'bold', color: '#f1deae',
        }).setOrigin(1, 0.5);
        const rubyX = wallet.getBounds().left - 16 * u;
        this.add.image(rubyX, y, TEXTURE_KEYS.RUBY).setDisplaySize(18 * u, 18 * u);
        this.add.text(rubyX - 24 * u, y,
            this._getText(TEXT_KEYS.PLAYER_LEVEL).replace('{level}', this.model.currentLevelPlayer), {
                fontFamily: 'Arial', fontSize: 13 * u, color: '#9db6a8',
            }).setOrigin(1, 0.5);
    }

    _gameSelect(button, sceneName) {
        if (this._transitioning) return;
        this._transitioning = true;
        this.sounds.click.play({ volume: 0.2 });
        this.tweens.killAll();
        this.tweens.add({
            targets: button ?? this._dragon, alpha: 0.55, duration: TIMING.GAME_TYPE_SELECT.GAME_SELECT_DURATION_MS,
            onComplete: () => this._startNewScene(sceneName),
        });
    }

    _startNewScene(sceneName) {
        this.scene.start(sceneName, sceneName === SCENE_NAMES.GAME ? UNLIMITED_LEVEL : undefined);
    }
}
