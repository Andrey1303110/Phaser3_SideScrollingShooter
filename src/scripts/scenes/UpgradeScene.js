import { SCENE_NAMES } from '../constants';
import { getFont, config, screenData, getPlayerAbilities } from '../main';
import { CommonScene } from './CommonScene';
import { Player } from '/src/scripts/prefabs/Player';

const STATS_MAP = {
    health: {
        text: 'HEALTH_TITLE',
        color: 'FF2407',
    },
    reload: {
        text: 'RELOAD_TITLE',
        color: '66E210',
    },
    velocity: {
        text: 'VELOCITY_TITLE',
        color: 'FFDC45',
    },
    scale: {
        text: 'SCALE_TITLE',
        color: '0291F7',
    }
};

export class UpgradeScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.upgrade);
    }

    init(){
        super.init();

        this.buttons = {};
    }

    create() {
        this._createBg();
        this._createPlayer();
        this._createReturnButton();
        this._createSounds();
        this._createAvailableMoney();
    }

    createUpgradeAnimation(name, level) {
        this.sounds.upgrade.play({ volume: 0.2 });

        const objects_nums = 10 + level;
        const duration = Phaser.Math.Between(750, 1250);

        for (let i = 0; i < objects_nums; i++) {
            const x = Phaser.Math.Between(this._player.x - this._player.displayWidth * 0.6, this._player.x + this._player.displayWidth * 0.6);
            const y = Phaser.Math.Between(this._player.y - this._player.displayHeight * 0.5, this._player.y + this._player.displayHeight * 0.5);
            const scale = Phaser.Math.Between(25 + level, 50 + level) / 100;

            const plus_symbol = this.add.text(x, y, '+', {
                font: `${config.height * 0.075 * scale}px ${getFont()}`,
                fill: `#${STATS_MAP[name].color}`,
            }).setOrigin(0.5).setAlpha(1).setStroke('#fafafa33', 4);

            this.tweens.add({
                targets: plus_symbol,
                y: screenData.top,
                alpha: 0,
                ease: 'Linear',
                duration: duration,
                onComplete: () => plus_symbol.destroy(),
            });
        }
    }

    _createPlayer(){
        this._player = new Player({ scene: this });

        this.tweens.add({
            targets: this._player,
            x: config.width * .125,
            ease: 'Linear',
            duration: 1250,
            onComplete: () => this._createStats(),
            callbackScope: this,
        });
    }

    _createStats(){
        this.statsText = {};
        this.statsIcon = {};
        this.statsLevel = {};

        const style = {
            font: `${config.width * .031}px ${getFont()}`,
            fill: '#000000',
        };

        const infoText = this.add.text(this._center.x, screenEndpoints.bottom - config.height * .075, this._getText('BOTTOM_DESCRIPTION'), style).setOrigin(.5).setAlpha(0);

        const upgradableStats = Object.keys(config.CurrentUpgradableStats);
        const height = config.height * 0.4;

        for (let i = 0; i < upgradableStats.length; i++) {
            const key = upgradableStats[i];

            let multiplier = 1;
            let value = 1;

            switch (key) {
                case 'health':
                    value = (Math.round(config.Player.maxHealth * multiplier) / multiplier * multiplier).toFixed(0);
                    break;
                case 'reload':
                    value = (Math.round(config.Weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
                    break;
                case 'scale':
                    multiplier = 100;
                    value = (Math.round(config.Weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
                case 'velocity':
                    value = (Math.round(config.Weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);
                    break;
            }

            const x = config.width * .57;
            const y = (this._center.y - height * 0.5) + (height / upgradableStats.length) * i;

            const level = localStorage.getItem(`playerAbilityLevel_${key}`);
            const statText = `${this._getText(STATS_MAP[key]['text'])} ${value}`;
            const levelText = `${this._getText('LEVEL_TEXT')} ${level}`;

            this.statsText[key] = this.add.text(x, y, statText, style).setOrigin(1, 0).setAlpha(0);
            this.statsIcon[key] = this.add.image(x + config.width * .06, y, key).setOrigin(0.5, 0.15).setAlpha(0).setDisplaySize(config.width * .045, config.width * .045);
            this.statsLevel[key] = this.add.text(x + config.width * .12, y, levelText, style).setOrigin(0, 0).setAlpha(0);

            this.tweens.add({
                targets: [this.statsText[key], this.statsIcon[key], this.statsLevel[key]],
                delay: i * 275,
                ease: 'Linear',
                alpha: .75,
                duration: 450,
                onComplete: () => {
                    this._createUpgredeButton({x, y, key, level});

                    if (i >= upgradableStats.length - 1) {
                        this.tweens.add({
                            targets: infoText,
                            delay: 275,
                            ease: 'Linear',
                            alpha: .75,
                            duration: 450,
                        })
                    }
                },
                callbackScope: this
            });
        }
    }

    _checkAvailability(button){
        this._setPrice(button);

        let alpha = 0.9;
        button.active = true;

        if (config.money < button.cost || config.money <= 0) {
            button.active = false;
            alpha = 0.5;
        } 

        button.setAlpha(alpha);
        button.textCost.setAlpha(alpha)
        button.crystal.setAlpha(alpha);
    }

    _setPrice(button){
        button.cost = Math.floor(button.level / 10) + 1;
        button.textCost.text = button.cost;
    }

    _createUpgredeButton(data){
        this.buttons[data.key] = this.add.image(data.x + config.width * .323, data.y, 'button_campaign')
            .setOrigin(0.5, 0.125)
            .setScale(.33)
            .setAlpha(0)
            .setInteractive()
            .setVisible(false)
            .on('pointerdown', () => this._upgrade(this.buttons[data.key]));

        this.buttons[data.key].name = data.key;
        this.buttons[data.key].level = data.level;
        
        this.buttons[data.key].cost = Math.floor(this.buttons[data.key].level/10) + 1;

        const style = {
            font: `${config.width * .023}px ${getFont()}`,
            fill: '#FFFFFF',
        };
        this.buttons[data.key].textCost = this.add.text(this.buttons[data.key].x, this.buttons[data.key].y, '1', style).setOrigin(0.5, -0.125).setVisible(false);

        this.buttons[data.key].crystal = this.add.image(this.buttons[data.key].x, this.buttons[data.key].y, 'ruby')
            .setOrigin(0.5, .05)
            .setScale(.15)
            .setVisible(false);

        this.buttons[data.key].textCost.x -= this.buttons[data.key].crystal.displayWidth * 0.5;
        this.buttons[data.key].crystal.x += this.buttons[data.key].crystal.displayWidth * 0.5;

        this.buttons[data.key].clicked = false;

        this._checkAvailability(this.buttons[data.key]);
        const currentAlpha = this.buttons[data.key].alpha;
        this.buttons[data.key].alpha = 0;
        this.buttons[data.key].textCost.alpha = 0;
        this.buttons[data.key].crystal.alpha = 0;

        this.tweens.add({
            targets: [
                this.buttons[data.key],
                this.buttons[data.key].textCost,
                this.buttons[data.key].crystal,
            ],
            ease: 'Linear',
            alpha: currentAlpha,
            duration: 500,
            onStart: () => {
                this.buttons[data.key].setVisible(true);
                this.buttons[data.key].textCost.setVisible(true);
                this.buttons[data.key].crystal.setVisible(true);
            }
        })
    }

    _decreaseMoney(value){
        if (config.money) {
            config.money -= value;
            localStorage.setItem('money', config.money);
            this.moneyText.text = config.money;
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

        let multiplier = 1;
        let returnedValue = getPlayerAbilities(button.name);

        switch (button.name) {
            case 'health':
                returnedValue = (Math.round(config.Player.maxHealth * multiplier) / multiplier * multiplier).toFixed(0);
                break;
            case 'reload':
                returnedValue = (Math.round(config.Weapons.fire[button.name] * multiplier) / multiplier * multiplier).toFixed(0);
                break;
            case 'scale':
                multiplier = 100;
                returnedValue = (Math.round(config.Weapons.fire[button.name] * multiplier) / multiplier * multiplier).toFixed(0);
                break;
            case 'velocity':
                returnedValue = (Math.round(config.Weapons.fire[button.name] * multiplier) / multiplier * multiplier).toFixed(0);
                break;
        }

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
                button.clicked = false;
                button.active = false;
                Object.keys(config.CurrentUpgradableStats).forEach(key => {
                    this._checkAvailability(this.buttons[key]);
                })
            }
        })

        this.createUpgradeAnimation(button.name, value);
    }

    _addReturnButton(){
        this.add.sprite(screenEndpoints.left + config.width * .015, screenEndpoints.top + config.width * .015, 'return')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', () => this.scene.start(SCENE_NAMES.main), this);
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
}