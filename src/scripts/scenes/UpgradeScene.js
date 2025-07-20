import { SCENE_NAMES, UPGRADE_MULTIPLIER } from "../constants";
import { config, delayInMSec, getFontName, getPlayerAbilities, screenData } from "../main";
import { CommonScene } from "./CommonScene";
import { Player } from "../prefabs/Player";

const STATS_MAP = {
    health: {
        text: 'HEALTH_TITLE',
        color: 'ff2407',
    },
    reload: {
        text: 'RELOAD_TITLE',
        color: '66e210',
    },
    velocity: {
        text: 'VELOCITY_TITLE',
        color: 'ffdc45',
    },
    scale: {
        text: 'SCALE_TITLE',
        color: '0291f7',
    }
};

export class UpgradeScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.UPGRADE);
    }

    init(){
        super.init();

        this.buttons = {};
    }

    async create() {
        this._createBg();
        this._createSounds();
        this._createReturnButton();
        await this._createPlayer();
        this._createAvailableMoney();
        await this._createStats();
    }

    async _createPlayer(){
        this._player = new Player({ scene: this });

        await new Promise(resolve => {
        this.tweens.add({
            targets: this._player,
            x: config.width * .125,
            ease: 'Linear',
            duration: 1250,
                onComplete: () => resolve(),
            });
        });
    }

    async _createStats(){
        this.statsText = {};
        this.statsIcon = {};
        this.statsLevel = {};

        const style = {
            font: `${config.width * .031}px ${getFontName()}`,
            fill: '#000000',
        };

        const text = this._getText('BOTTOM_DESCRIPTION') + ` ${UPGRADE_MULTIPLIER * 100}%`;
        const infoText = this.add.text(this._center.x, screenData.bottom - config.height * .075, text, style).setOrigin(.5).setAlpha(0);

        const upgradableStats = Object.keys(config.currentUpgradableStats);
        const height = config.height * 0.4;

        for (let i = 0; i < upgradableStats.length; i++) {
            const key = upgradableStats[i];

            const returnedValue = this._setStatsText(key);

            const x = config.width * .57;
            const y = (this._center.y - height * 0.5) + (height / upgradableStats.length) * i;

            const level = localStorage.getItem(`playerAbilityLevel_${key}`);
            const statText = `${this._getText(STATS_MAP[key]['text'])} ${returnedValue}`;
            const levelText = `${this._getText('LEVEL_TEXT')} ${level}`;

            this.statsText[key] = this.add.text(x, y, statText, style).setOrigin(1, 0).setAlpha(0);
            this.statsIcon[key] = this.add.image(x + config.width * .06, y, key).setOrigin(0.5, 0.15).setAlpha(0).setDisplaySize(config.width * .045, config.width * .045);
            this.statsLevel[key] = this.add.text(x + config.width * .12, y, levelText, style).setOrigin(0, 0).setAlpha(0);

            await this._playShowStatsAnimation(key);
            this._createUpgradeButton({x, y, key, level});

            await delayInMSec(this.scene, 250);
        }

        
        await delayInMSec(this.scene, 350);
        this._playShowStatsBottomInfo(infoText);
    }

    _playShowStatsAnimation(key) {
        const duration = 325;

        return new Promise(resolve => {
            this.tweens.add({
                targets: [this.statsText[key], this.statsIcon[key], this.statsLevel[key]],
                ease: 'Linear',
                alpha: .75,
                duration,
                onComplete: resolve(),
            });
        });
    }

    _playShowStatsBottomInfo(infoText) {
        this.tweens.add({
            targets: infoText,
            ease: 'Linear',
            alpha: .75,
            duration: 350,
        })
    }

    _setStatsText(key, isUpdated = false) {
        let multiplier = 1;
        let value = isUpdated ? getPlayerAbilities(key) : 1;

        switch (key) {
            case 'health':
                value = (Math.round(config.player.maxHealth * multiplier) / multiplier * multiplier).toFixed(0);
                break;
            case 'reload':
                value = (Math.round(config.weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
                break;
            case 'scale':
                multiplier = 250;
                value = (Math.round(config.weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
            case 'velocity':
                value = (Math.round(config.weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
                break;
        }

        return value;
    }

    _checkAvailability(button){
        if (config.money < button.cost || config.money <= 0) {
            return this._toggleButton(button, false);
        }
        this._toggleButton(button, true);
    }

    _checkAvailabilityForAllButtons() {
        Object.keys(config.currentUpgradableStats).forEach(key => {
            this._checkAvailability(this.buttons[key]);
        });
    }

    _toggleButton(button, isActive) {
        let alpha = isActive ? 0.9 : 0.5;

        button.active = isActive;
        button.setAlpha(alpha);
        button.textCost.setAlpha(alpha)
        button.crystal.setAlpha(alpha);
    }

    _disableButtons() {
        Object.keys(this.buttons).forEach(key => {
            const button = this.buttons[key];
            this._toggleButton(button, false);
        });
    }

    _setPrice(button){
        button.cost = Math.floor(button.level / 10) + 1;
        button.textCost.text = button.cost;
    }

    _createUpgradeButton(data){
        const button = this.add.image(data.x + config.width * .323, data.y, 'button_campaign')
            .setOrigin(0.5, 0.125)
            .setScale(.33)
            .setAlpha(0)
            .setInteractive()
            .setVisible(false)
            .on('pointerdown', () => this._upgrade(button));

        button.name = data.key;
        button.level = data.level;
        
        button.cost = Math.floor(button.level/10) + 1;

        const style = {
            font: `${config.width * .023}px ${getFontName()}`,
            fill: '#FFFFFF',
        };
        button.textCost = this.add.text(button.x, button.y, '1', style).setOrigin(0.5, -0.125).setVisible(false);

        button.crystal = this.add.image(button.x, button.y, 'ruby')
            .setOrigin(0.5, .05)
            .setScale(.15)
            .setVisible(false);

        button.textCost.x -= button.crystal.displayWidth * 0.5;
        button.crystal.x += button.crystal.displayWidth * 0.5;

        button.clicked = false;

        this._checkAvailability(button);
        this._setPrice(button);

        const currentAlpha = button.alpha;
        button.alpha = 0;
        button.textCost.alpha = 0;
        button.crystal.alpha = 0;

        this.tweens.add({
            targets: [
                button,
                button.textCost,
                button.crystal,
            ],
            ease: 'Linear',
            alpha: currentAlpha,
            duration: 500,
            onStart: () => {
                button.setVisible(true);
                button.textCost.setVisible(true);
                button.crystal.setVisible(true);
            }
        });

        this.buttons[data.key] = button;
    }

    _decreaseMoney(value){
        if (config.money) {
            config.money -= value;
            localStorage.setItem('money', config.money);
            this._moneyValueText.text = config.money;
        }
        else {
            return false;
        }
    }

    _upgrade(button){
        if (button.clicked || !button.active) {
            if (!button.active) {
                this.sounds.error.play({volume: .3});
            }
            return
        }

        let value = localStorage.getItem(`playerAbilityLevel_${button.name}`);

        if (this._decreaseMoney(button.cost) === false) {
            return;
        }

        localStorage.setItem(`playerAbilityLevel_${button.name}`, ++value);
        button.level = value;

        const returnedValue = this._setStatsText(button.name, true);

        this.statsText[button.name].text = `${this._getText(STATS_MAP[button.name]['text'])} ${returnedValue}`;
        this.statsLevel[button.name].text = `${this._getText('LEVEL_TEXT')} ${localStorage.getItem(`playerAbilityLevel_${button.name}`)}`;

        button.clicked = true;
        button.setAlpha(1);

        this.tweens.add({
            targets: this,
            ease: 'Linear',
            alpha: .5,
            duration: 1000,
            onStart: () => { 
                this._disableButtons();
                this._setPrice(button);
            },
            onComplete: () => {
                button.clicked = false;
                this._checkAvailabilityForAllButtons();
            }
        })

        return this._createUpgradeAnimation(button.name, value);
    }

    async _createUpgradeAnimation(name, level) {
        this.sounds.upgrade.play({ volume: 0.2 });

        const maxDuration = 1000;
        const minDuration = 500;
        const maxCalculationsLevel = 50;

        let levelForCalculation = level > maxCalculationsLevel ? maxCalculationsLevel : level;
        let objectsNum = 15 + levelForCalculation * 2;
        
        for (let i = 0; i < objectsNum; i++) {
            const x = Phaser.Math.Between(this._player.x - this._player.displayWidth * 0.57, this._player.x + this._player.displayWidth * 0.57);
            const y = Phaser.Math.Between(this._player.y - this._player.displayHeight * 0.57, this._player.y + this._player.displayHeight * 0.57);
            let scale = Phaser.Math.Between(50 + levelForCalculation * 2, 75 + levelForCalculation * 2) / 100;
            if (scale > 1) {
                scale = 1;
            }

            const font = `${config.height * 0.075 * scale}px ${getFontName()}`;
            const fill = `#${STATS_MAP[name]['color']}`;
            const duration = Phaser.Math.Between(minDuration, maxDuration);

            const plusSymbol = this.add.text(x, y, '+', { font, fill })
                .setOrigin(0.5)
                .setAlpha(0)
                .setStroke('#fafafa33', 4);

            this._playPlusUpgradeTweenAnimation(plusSymbol, duration);
        }

        const delay = (maxDuration + minDuration) * 2;
        return delayInMSec(this.scene, delay);
    }

    async _playPlusUpgradeTweenAnimation(symbol, duration) {
        this.tweens.add({
            targets: symbol,
            alpha: 1,
            ease: 'Back.Out(1.5)',
            duration,
        });
        await delayInMSec(this.scene, duration * 0.5);
            this.tweens.add({
            targets: symbol,
                y: screenData.top,
                alpha: 0,
            ease: 'Back.In',
                duration,
            onComplete: () => symbol.destroy(),
            });
    }

    _addReturnButton(){
        this.add.sprite(screenData.left + config.width * .015, screenData.top + config.width * .015, 'return')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', () => this.scene.start(SCENE_NAMES.MAIN), this);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            click: this.sound.add('click'),
            wings: this.sound.add('wings'),
            upgrade: this.sound.add('upgrade'),
            error: this.sound.add('error'),
        };
    }

    _onMoneyButtonClick() {}
}