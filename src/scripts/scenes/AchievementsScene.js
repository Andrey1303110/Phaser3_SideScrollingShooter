import { createCrystal } from './components/crystal';
import { ACHIEVEMENTS } from '../achievements';
import { SCENE_NAMES } from '../constants';
import { LIFECYCLE_EVENTS, SOUND_KEYS } from '../identifiers';
import { getSceneTexts, screenData, setEndpoints } from '../Utils';
import { UI, createButton, uiText, uiUnit } from '../ui';
import { CommonScene } from './CommonScene';
import { drawAchievementArt } from './components/achievementArt';

const groups = [...new Set(ACHIEVEMENTS.map(entry => entry.group))];

export class AchievementsScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.ACHIEVEMENTS);
    }

    create() {
        this.sounds = { click: this.sound.add(SOUND_KEYS.CLICK) };
        this.group = groups[0];
        this.page = 0;
        this.renderBook();
        const resize = () => {
            setEndpoints();
            this.renderBook();
        };
        this.scale.on(LIFECYCLE_EVENTS.RESIZE, resize);
        this.events.once(LIFECYCLE_EVENTS.SHUTDOWN, () => this.scale.off(LIFECYCLE_EVENTS.RESIZE, resize));
    }

    renderBook() {
        this.tweens.killAll();
        this.children.removeAll(true);
        this._createBg();
        const u = uiUnit();
        const { top, bottom, left, width, height } = screenData;
        this.add.rectangle(left, top, width, height, 0x0e2423, 0.95).setOrigin(0);
        this._createReturnButton();
        const words = this._translationTexts;
        const book = this.model.achievements;
        const boardWidth = Math.min(1020 * u, width - 36 * u);
        const boardLeft = left + (width - boardWidth) / 2;
        this.add.text(Math.max(left + 51 * u, boardLeft), top + 24 * u, words.title,
            { ...uiText(26), fontStyle: 'bold' }).setOrigin(0, 0.5);
        this._wallet = this.add.text(boardLeft + boardWidth, top + 24 * u, String(this.model.money),
            uiText(18, UI.colors.accent)).setOrigin(1, 0.5);
        this._walletGem = createCrystal(this, this._wallet.getBounds().left - 14 * u, this._wallet.y, 21 * u);
        this.add.text(this._walletGem.x - 18 * u, top + 24 * u,
            words.collected.replace('{n}', book.unlocked.size).replace('{total}', ACHIEVEMENTS.length),
            uiText(15, UI.colors.accent)).setOrigin(1, 0.5);

        const gap = 8 * u;
        const tabWidth = (boardWidth - gap * (groups.length - 1)) / groups.length;
        groups.forEach((group, i) => {
            createButton(this, {
                x: boardLeft + tabWidth / 2 + i * (tabWidth + gap), y: top + 70 * u,
                width: tabWidth, height: 40 * u, text: words.groups[group], fontSize: 15,
                onPress: () => this.navigate(group, 0),
            }).setSelected(this.group === group);
        });

        const entries = ACHIEVEMENTS.filter(entry => entry.group === this.group);
        const gridTop = top + 102 * u;
        const gridHeight = bottom - 57 * u - gridTop;
        const columns = boardWidth >= 650 * u ? 2 : 1;
        const rows = Math.max(1, Math.min(4, Math.floor((gridHeight + gap) / (108 * u + gap))));
        const perPage = rows * columns;
        const pages = Math.ceil(entries.length / perPage);
        this.page = Math.min(this.page, pages - 1);
        const cardWidth = (boardWidth - (columns - 1) * gap) / columns;
        const cardHeight = Math.min(144 * u, (gridHeight - (rows - 1) * gap) / rows);
        entries.slice(this.page * perPage, (this.page + 1) * perPage).forEach((entry, i) => {
            this.drawCard(entry, boardLeft + (i % columns) * (cardWidth + gap),
                gridTop + Math.floor(i / columns) * (cardHeight + gap), cardWidth, cardHeight);
        });
        if (pages <= 1) return;
        const center = left + width / 2;
        this.add.text(center, bottom - 27 * u, `${this.page + 1} / ${pages}`,
            uiText(16, UI.colors.muted)).setOrigin(0.5);
        for (const direction of [-1, 1]) {
            const next = this.page + direction;
            createButton(this, { x: center + direction * 72 * u, y: bottom - 27 * u,
                width: 54 * u, height: 40 * u, text: direction < 0 ? '‹' : '›', fontSize: 24,
                enabled: next >= 0 && next < pages, onPress: () => this.navigate(this.group, next) });
        }
    }

    navigate(group, page) {
        this.group = group;
        this.page = page;
        this.sounds.click.play({ volume: 0.2 });
        this.renderBook();
    }

    drawCard(entry, x, y, width, height) {
        const u = uiUnit();
        const book = this.model.achievements;
        const words = this._translationTexts;
        const earned = book.unlocked.has(entry.id);
        const progress = book.progress(entry);
        const root = this.add.container(x, y);
        const surface = this.add.graphics().fillStyle(earned ? 0x294538 : 0x1d3534)
            .lineStyle(u, earned ? 0xc69d59 : 0x3a524d)
            .fillRoundedRect(0, 0, width, height, 9 * u).strokeRoundedRect(0, 0, width, height, 9 * u);
        root.add(surface);
        const pad = 12 * u;
        const size = Math.min(104 * u, height - pad * 2, width * 0.24);
        drawAchievementArt(this, root, entry, pad + size / 2, height / 2, size);
        const start = size + pad * 2;
        const available = width - start - pad;
        const title = this.add.text(start, pad, words.names[entry.id], {
            ...uiText(19, earned ? '#f2d392' : UI.colors.text), fontStyle: 'bold', wordWrap: { width: available },
        });
        let description = words.conditions[entry.metric].replace('{n}', entry.goal);
        if (entry.metric === 'mission') {
            description = entry.location ? description.replace('{city}',
                getSceneTexts(this, SCENE_NAMES.CAMPAIGN)[`LEVEL_${entry.goal}_NAME`]) : words.finale;
        }
        root.add([title, this.add.text(start, title.y + title.height + 3 * u, description, {
            ...uiText(14, UI.colors.muted), wordWrap: { width: available },
        })]);
        if (earned) {
            const claimed = this.model.claimedAchievements.has(entry.id);
            const label = this.add.text(start, height - pad, claimed ? words.claimed : words.claim,
                { ...uiText(15, claimed ? UI.colors.muted : '#ffe1a1'), fontStyle: 'bold' }).setOrigin(0, 1);
            root.add(label);
            if (!claimed) {
                const hit = this.add.zone(0, 0, width, height).setOrigin(0).setInteractive({ useHandCursor: true });
                root.add(hit);
                hit.once('pointerup', () => {
                    if (!this.model.claimAchievement(entry.id)) return;
                    hit.disableInteractive();
                    label.setText(words.claimed).setColor(UI.colors.muted);
                    this._wallet.setText(String(this.model.money));
                    this._walletGem.x = this._wallet.getBounds().left - 14 * u;
                    this.sounds.click.play({ volume: 0.2 });
                    const crystal = createCrystal(this, x + pad + size / 2, y + height / 2, size * 0.75);
                    this.tweens.add({ targets: crystal, y: crystal.y - 18 * u, duration: 210, ease: 'Sine.Out',
                        onComplete: () => this.tweens.add({ targets: crystal, x: this._walletGem.x, y: this._walletGem.y,
                            scaleX: this._walletGem.scaleX, scaleY: this._walletGem.scaleY,
                            duration: 650, ease: 'Cubic.InOut', onComplete: () => crystal.destroy() }) });
                });
            }
            return;
        }
        const barWidth = available - 57 * u;
        const barY = height - 17 * u;
        surface.fillStyle(0x0c2221).fillRect(start, barY, barWidth, 5 * u);
        surface.fillStyle(earned ? 0xe6bd72 : 0x83c9a1).fillRect(start, barY, barWidth * progress, 5 * u);
        root.add(this.add.text(width - pad, barY + 2 * u,
            Math.floor((progress + Number.EPSILON) * 100) + '%',
            uiText(14, earned ? UI.colors.accent : UI.colors.text)).setOrigin(1, 0.5));
    }
}
