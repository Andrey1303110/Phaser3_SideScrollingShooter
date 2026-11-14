import { screenData, setEndpoints, delayInMSec, tweenPromise } from '../Utils';
import { DialogBoxController } from '../classes/DialogBoxController';
import { CAMPAIGN_LEVELS, DEPTH_LAYERS, SCENE_NAMES, ENEMIES } from '../constants';
import { config } from '../main';
import { CommonScene } from './CommonScene';
import { UI, createButton, createBackArrow } from '../ui';
import { CampaignMap } from './components/CampaignMap';

const CASUALTIES = {
    jet: 'TOTAL_CASUALTIES_JEST',
    helicopter: 'TOTAL_CASUALTIES_HELICOPTERS',
    rocket: 'TOTAL_CASUALTIES_ROCKETS',
    missile: 'TOTAL_CASUALTIES_MISSILES',
};

export class CampaignScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.CAMPAIGN);
    }

    init() {
        super.init();
        this._selected = CAMPAIGN_LEVELS[Math.min(this.model.currentLevelScene, CAMPAIGN_LEVELS.length) - 1];
        this._lastBriefingLevel = null;
        this._showIntro = this.model.currentLevelScene === 1 && this.model.totalScore === 0;
        this._busy = this._showIntro;
        this._needsLayout = false;
        this._celebrate = this._lastProgress !== undefined && this.model.currentLevelScene > this._lastProgress;
        this._lastProgress = this.model.currentLevelScene;
    }

    create() {
        this._createSounds();
        this._render();
        this._dialogBoxController = new DialogBoxController(this);
        const music = this.model.currentLevelScene > CAMPAIGN_LEVELS.length
            ? this.sounds.campaign_complete_song : this.sounds.fire_effect;
        music.play({ loop: true, volume: music === this.sounds.fire_effect ? 0.04 : 0.2 });
        const resize = () => {
            setEndpoints();
            if (this._busy) this._needsLayout = true;
            else this._render();
        };
        this.scale.on('resize', resize);
        this.events.once('shutdown', () => this.scale.off('resize', resize));
        if (this._showIntro) this._playIntro();
    }

    _render() {
        this.tweens.killAll();
        this._ui?.destroy();
        this._closeModal();
        this._ui = this.add.container();
        this._unit = screenData.width / document.body.clientWidth;
        const u = this._unit;
        const background = this.add.image(config.width / 2, config.height / 2, 'bg');
        background.setScale(Math.max(config.width / background.width, config.height / background.height));
        this._ui.add([background, this.add.rectangle(0, 0, config.width, config.height, 0x102323, 0.9).setOrigin(0)]);
        const panelWidth = Math.min(300 * u, Math.max(224 * u, screenData.width * 0.32));
        this._panel = { x: screenData.right - panelWidth - 16 * u, y: screenData.top + 52 * u,
            width: panelWidth, height: screenData.height - 60 * u };
        this._mapView = { x: screenData.left + 16 * u, y: screenData.top + 66 * u,
            width: this._panel.x - screenData.left - 32 * u, height: screenData.height - 110 * u };
        this._createHeader();
        this._map = new CampaignMap(this, this._mapView, this._selected,
            level => this._selectMission(level), levels => this._openCluster(levels), this._celebrate);
        this._ui.add(this._map);
        this._createLegend();
        this._renderPanel();
        if (this._celebrate) {
            const toast = this._text(this._mapView.x + this._mapView.width / 2,
                screenData.top + 59 * u,
                this._getText(this.model.currentLevelScene > CAMPAIGN_LEVELS.length ? 'CAMPAIGN_COMPLETE' : 'MISSION_COMPLETE'),
                14, '#e4c284').setOrigin(0.5, 0).setWordWrapWidth(this._mapView.width - 12 * u).setAlign('center');
            this.tweens.add({ targets: toast, alpha: 0, delay: 2000, duration: 400 });
            this._celebrate = false;
        }
    }

    _text(x, y, text, size = 16, color = '#f2ead8', parent = this._ui) {
        const label = this.add.text(x, y, text, {
            fontFamily: 'Arial', fontSize: size * this._unit, color,
        });
        parent.add(label);
        return label;
    }

    _button(parent, x, y, width, height, text, action, enabled = true, primary = false) {
        return createButton(this, {
            x, y, width, height, text, parent, enabled,
            variant: primary ? 'primary' : 'secondary',
            canPress: () => !this._busy,
            onPress: () => { this.sounds.click.play({ volume: 0.2 }); action(); },
        });
    }

    _createHeader() {
        const u = this._unit;
        const left = screenData.left;
        const top = screenData.top;
        this._backButton = createBackArrow(this, { parent: this._ui, canPress: () => !this._busy });
        this._text(left + 56 * u, top + 9 * u, this._getText('TITLE'), UI.type.title);
        const completed = Math.min(this.model.currentLevelScene - 1, CAMPAIGN_LEVELS.length);
        this._text(left + 56 * u, top + 35 * u,
            this._getText('PROGRESS').replace('{done}', completed).replace('{total}', CAMPAIGN_LEVELS.length), 12, '#a3b9aa');
        const wallet = this._text(screenData.right - 16 * u, top + 26 * u,
            String(this.model.money), 16, '#efd99f').setOrigin(1, 0.5);
        const ruby = this.add.image(wallet.getBounds().left - 15 * u, top + 26 * u, 'ruby').setDisplaySize(18 * u, 18 * u);
        this._ui.add(ruby);
        this._reportButton = this._button(this._ui, ruby.x - 70 * u, top + 26 * u,
            100 * u, 44 * u, this._getText('REPORT'), () => this._openReport());
    }

    _createLegend() {
        const u = this._unit;
        const y = screenData.bottom - 18 * u;
        const items = [
            ['LIBERATED', 0x8fbb95], ['CURRENT', 0xe5ba70], ['LOCKED', 0x718c90],
        ];
        const step = this._mapView.width / items.length;
        items.forEach(([key, color], index) => {
            const x = this._mapView.x + index * step;
            this._ui.add(this.add.circle(x + 4 * u, y, 3.5 * u, color));
            this._text(x + 12 * u, y, this._getText(key), 12, '#a6bbae').setOrigin(0, 0.5);
        });
    }

    _renderPanel() {
        this._missionPanel?.destroy();
        const root = this.add.container();
        this._ui.add(root);
        this._missionPanel = root;
        const p = this._panel;
        const u = this._unit;
        const level = this._selected;
        const available = level.index <= this.model.currentLevelScene;
        const completed = level.index < this.model.currentLevelScene;
        const panel = this.add.graphics().fillStyle(0x203a38, 0.96).lineStyle(u, 0x47645b, 0.8)
            .fillRoundedRect(p.x, p.y, p.width, p.height, 14 * u)
            .strokeRoundedRect(p.x, p.y, p.width, p.height, 14 * u);
        root.add(panel);
        this._previousButton = this._button(root, p.x + 24 * u, p.y + 24 * u, 44 * u, 44 * u,
            '‹', () => this._selectMission(CAMPAIGN_LEVELS[level.index - 2]), level.index > 1);
        this._nextButton = this._button(root, p.x + p.width - 24 * u, p.y + 24 * u, 44 * u, 44 * u,
            '›', () => this._selectMission(CAMPAIGN_LEVELS[level.index]), level.index < CAMPAIGN_LEVELS.length);
        this._previousButton.label.setFontSize(24 * u);
        this._nextButton.label.setFontSize(24 * u);
        this._text(p.x + p.width / 2, p.y + 24 * u,
            this._getText('MISSION_NUMBER').replace('{level}', level.index).replace('{total}', CAMPAIGN_LEVELS.length),
            12, '#adc4b2', root).setOrigin(0.5);
        const title = this._text(p.x + 16 * u, p.y + 54 * u, this._getText('LEVEL_' + level.index + '_NAME'), UI.type.section, '#f3ead6', root);
        title.setWordWrapWidth(p.width - 32 * u);
        while (title.height > 48 * u && parseFloat(title.style.fontSize) > 16 * u) title.setFontSize(parseFloat(title.style.fontSize) - u);
        this._text(p.x + 16 * u, p.y + 104 * u,
            this._getText(!available ? 'LOCKED_HINT' : completed ? 'LIBERATED' : 'CURRENT')
                .replace('{level}', level.index - 1), 12, available ? '#d8ba7e' : '#93aaa0', root);
        const types = Object.values(ENEMIES).filter(enemy => enemy.entryLevel <= level.index)
            .map(enemy => this._getText('TYPE_' + enemy.texture.toUpperCase()));
        this._text(p.x + 16 * u, p.y + 124 * u, types.join(' · '), UI.type.caption, '#b3c9bc', root)
            .setWordWrapWidth(p.width - 32 * u);
        if (p.height >= 290 * u) {
            this._text(p.x + 16 * u, p.y + 172 * u,
                this._getText('TARGETS').replace('{count}', level.enemies), 14, '#d3dfd2', root);
            this._text(p.x + 16 * u, p.y + 195 * u,
                this._getText('RECORD').replace('{score}', this.model.getLevelHiScore(level.index)), 14, '#a3b9ab', root);
        }
        const width = p.width - 32 * u;
        this._briefingButton = this._button(root, p.x + p.width / 2, p.y + p.height - 80 * u,
            width, 44 * u, this._getText(this._lastBriefingLevel === level.index ? 'REPLAY_BRIEFING' : 'BRIEFING'),
            () => this._playBriefing(level.index, true), available);
        this._startButton = this._button(root, p.x + p.width / 2, p.y + p.height - 28 * u,
            width, 44 * u, this._getText(available ? 'START' : 'LOCKED'), () => this._startMission(), available, true);
    }

    async _selectMission(level) {
        if (this._busy) return;
        this._selected = level;
        this._render();
        if (level.index <= this.model.currentLevelScene) await this._playBriefing(level.index);
    }

    async _startMission() {
        if (this._busy || this._selected.index > this.model.currentLevelScene) return;
        const level = this._selected;
        if (await this._playBriefing(level.index)) this._gameStart(level);
    }

    async _playBriefing(index, force = false) {
        if (this._busy) return false;
        if (!force && this._lastBriefingLevel === index) return true;
        this._busy = true;
        this._closeModal();
        try {
            await delayInMSec(this, 200);
            await this._dialogBoxController.flowShow(index);
            if (!this.sys.isActive()) return false;
            this._lastBriefingLevel = index;
            return true;
        } finally {
            if (this.sys.isActive()) {
                this._busy = false;
                if (this._needsLayout) { this._needsLayout = false; this._render(); }
                else this._renderPanel();
            }
        }
    }

    async _playIntro() {
        await delayInMSec(this, 400);
        await this._dialogBoxController.flowShow(0);
        if (!this.sys.isActive()) return;
        this._busy = false;
        if (this._needsLayout) { this._needsLayout = false; this._render(); }
    }

    _modalFrame(title, height) {
        this._closeModal();
        const u = this._unit;
        const width = Math.min(440 * u, screenData.width - 32 * u);
        const x = (screenData.left + screenData.right) / 2;
        const y = (screenData.top + screenData.bottom) / 2;
        const root = this.add.container().setDepth(DEPTH_LAYERS.UI);
        this._modal = root;
        const cover = this.add.rectangle(x, y, screenData.width, screenData.height, 0x071616, 0.8).setInteractive();
        cover.on('pointerup', () => this._closeModal());
        const panel = this.add.rectangle(x, y, width, height, 0x203a38).setInteractive();
        root.add([cover, panel]);
        this._text(x - width / 2 + 18 * u, y - height / 2 + 18 * u, title, 20, '#f3ead6', root);
        this._modalClose = this._button(root, x + width / 2 - 24 * u, y - height / 2 + 25 * u,
            44 * u, 44 * u, '×', () => this._closeModal());
        this._modalClose.label.setFontSize(22 * u);
        return { root, left: x - width / 2, top: y - height / 2, width };
    }

    _closeModal() {
        this._modal?.destroy();
        this._modal = null;
    }

    _openCluster(levels) {
        if (this._busy) return;
        const u = this._unit;
        const frame = this._modalFrame(this._getText('KYIV_MISSIONS'), 232 * u);
        this._clusterButtons = levels.map((level, index) => this._button(frame.root,
            frame.left + frame.width / 2, frame.top + (82 + index * 52) * u,
            frame.width - 32 * u, 44 * u,
            level.index + ' · ' + this._getText('LEVEL_' + level.index + '_NAME'),
            () => this._selectMission(level), true, level.index === this._selected.index));
    }

    _openReport() {
        if (this._busy) return;
        const u = this._unit;
        const frame = this._modalFrame(this._getText('REPORT_TITLE'), 264 * u);
        Object.entries(CASUALTIES).forEach(([key, text], index) => {
            const y = frame.top + (76 + index * 36) * u;
            this._text(frame.left + 20 * u, y, this._getText(text), 15, '#b8cdbf', frame.root);
            this._text(frame.left + frame.width - 20 * u, y, String(this.model.casualties[key]), 18,
                '#efdab1', frame.root).setOrigin(1, 0);
        });
        this._text(frame.left + 20 * u, frame.top + 226 * u,
            this._getText('RECORD').replace('{score}', this.model.getLevelHiScore(this._selected.index)), 13, '#9cb5a6', frame.root);
    }

    _createSounds() {
        this.sounds = {
            click: this.sound.add('click'),
            fire_effect: this.sound.add('fire_effect'),
            campaign_complete_song: this.sound.add('campaign_complete_song'),
        };
        for (let i = 0; i <= CAMPAIGN_LEVELS.length; i++) {
            const lines = this.cache.json.get('dialogues' + i);
            lines.forEach((line, index) => {
                if (line.audio !== false) {
                    const name = 'level' + i + '_text' + index + '_' + this.model.lang;
                    this.sounds[name] = this.sound.add(name);
                }
            });
        }
    }

    _gameStart(info) {
        this._busy = true;
        this.sounds.fire_effect.stop();
        this.sounds.campaign_complete_song.stop();
        const cover = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height,
            0x071616, 0).setInteractive().setDepth(DEPTH_LAYERS.COVER_SCREEN);
        const sound = this._playTransitionSound('ready');
        return tweenPromise(this, {
            targets: cover, fillAlpha: 1, duration: sound.duration * 850,
            onComplete: () => this.scene.start(SCENE_NAMES.GAME, info),
        });
    }
}
