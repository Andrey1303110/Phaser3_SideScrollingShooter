import { SCENE_NAMES } from '../constants';
import { getFont, config, screenData, setWeaponConf } from '../main';
import { CommonScene } from './CommonScene';
import { Player } from '/src/scripts/prefabs/Player';

const STATS_MAP = {
    reload: {
        text: 'RELOAD_TITLE'
    },
    velocity: {
        text: 'VELOCITY_TITLE'
    },
    scale: {
        text: 'SCALE_TITLE'
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

    createUpgradeAnimation(name, level){
        this.sounds.upgrade.play({volume: .2});
        const objects_nums = 10 + level;

        for (let i = 0; i < objects_nums; i++) {
            const x = (this._player.x - this._player.displayWidth * .6) + this._player.displayWidth * 1.2 / objects_nums * i;
            const y = Phaser.Math.Between((this._player.y - this._player.displayHeight * .5) * 100, (this._player.y + this._player.displayHeight * .5) * 100) / 100;
            const scale = config.height * .075 * (Phaser.Math.Between(25 + level, 50 + level) / 100);

            const data = {
                x,
                y,
                scale,
                alpha: Phaser.Math.Between(75, 100) / 100,
                duration: Phaser.Math.Between(750, 1250),
            }

            const plus_symbol = this.add.text(data.x, data.y, '+', {
                font: `${data.scale}px ${getFont()}`,
                fill: `#${config.upgradeColors[name]}`,
            }).setOrigin(0.5).setAlpha(data.alpha).setStroke('#fafafa33', 4);

            this.tweens.add({
                targets: plus_symbol,
                y: screenData.top,
                alpha: 0,
                ease: 'Linear',
                duration: data.duration,
                onComplete: () => { plus_symbol.destroy() }
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

        const infoText = this.add.text(this.game.scale.width * 0.5, this.game.scale.height * 0.75, this._getText('BOTTOM_DESCRIPTION'), style)
            .setAlpha(0)
            .setOrigin(.5);

        const weaponStats = Object.keys(config.Weapons.fire);
        const height = this._center.y;

        for (let i = 0; i < weaponStats.length; i++) {
            const key = weaponStats[i];

            let multiplier = 1;
            if (key === 'scale') {
                multiplier = 100;
            }

            const value = (Math.round(config.Weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);

            const x = config.width * .57;
            const y = (this._center.y - height * 0.5) + (height / weaponStats.length) * i;

            const level = localStorage.getItem(`playerWeapon_${key}`);
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
                onComplete: ()=>{
                    if (i >= weaponStats.length - 1) {
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

            this._createUpgredeButton({x, y, key, level});
        }
    }

    _checkAvailability(button){
        this._checkPrice(button);

        let alpha = .9;
        if (config.money < button.cost) {
            button.active = false;
            alpha = .5;
        }
        button.setAlpha(alpha);
        button.textCost.setAlpha(alpha)
        button.crystal.setAlpha(alpha);
    }

    _checkPrice(button){
        button.cost = Math.floor(button.level/10) + 1;
        button.textCost.text = button.cost;
    }

    _createUpgredeButton(data){
        this.buttons[data.key] = this.add.image(data.x + config.width * .3, data.y, 'button_campaign')
            .setOrigin(0.5, 0.125)
            .setScale(.33)
            .setInteractive()
            .on('pointerdown', this._upgarde);

        this.buttons[data.key].name = data.key;
        this.buttons[data.key].level = data.level;
        
        this.buttons[data.key].cost = Math.floor(this.buttons[data.key].level/10) + 1;

        const style = {
            font: `${config.width * .023}px ${getFont()}`,
            fill: '#FFFFFF',
        };
        this.buttons[data.key].textCost = this.add.text(this.buttons[data.key].x, this.buttons[data.key].y, '1', style).setOrigin(0.5, -0.125);

        this.buttons[data.key].crystal = this.add.image(this.buttons[data.key].x, this.buttons[data.key].y, 'ruby')
            .setOrigin(0.5, .05)
            .setScale(.15);

        this.buttons[data.key].textCost.x -= this.buttons[data.key].crystal.displayWidth * 0.5;
        this.buttons[data.key].crystal.x += this.buttons[data.key].crystal.displayWidth * 0.5;

        this.buttons[data.key].clicked = false;

        this._checkAvailability(this.buttons[data.key]);
    }

    _decreaseMoney(value){
        if (config.money) {
            config.money -= value;
            localStorage.setItem('money', config.money);
            this._moneyText.text = config.money;
        }
        else {
            return false;
        }
    }

    _upgarde(){
        if (this._clicked || !this.active) {
            if (!this.active) {
                this.scene.sounds.error.play({volume: .3});
            }
            return
        }

        let value = localStorage.getItem(`playerWeapon_${this.name}`);

        if (this.scene._decreaseMoney(this.cost) === false) {
            return;
        }

        localStorage.setItem(`playerWeapon_${this.name}`, ++value);
        this.level = value;

        let returnedValue = setWeaponConf({init: false, key: this.name});

        let multiplier = 1;
        if (this.name === 'scale') {
            multiplier = 100;
        }
        returnedValue = (Math.round(config.Weapons.fire[this.name] * multiplier) / multiplier * multiplier).toFixed(0);

        this.scene.statsText[this.name].text = `${this._getText(STATS_MAP[key]['text'])} ${returnedValue}`;
        this.scene.statsLevel[this.name].text = `${this._getText('LEVEL_TEXT')} ${localStorage.getItem(`playerWeapon_${this.name}`)}`;

        this._clicked = true;
        this.setAlpha(1);
        this.scene.tweens.add({
            targets: this,
            ease: 'Linear',
            alpha: .5,
            duration: 1000,
            onComplete: ()=>{ 
                this._clicked = false;
                for (let i = 0; i < Object.keys(config.Weapons.fire).length; i++) {
                    const name = Object.keys(config.Weapons.fire)[i];
                    this.scene._checkAvailability(this.scene.buttons[name]);
                }
            }
        })

        this.scene.createUpgradeAnimation(this.name, value);
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