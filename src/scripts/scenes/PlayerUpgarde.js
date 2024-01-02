import { SCENE_NAMES } from '../constants';
import { CommonScene } from './CommonScene';
import { config, screenEndpoints, setWeaponConf } from '/src/scripts/main';
import { Player } from '/src/scripts/prefabs/Player';

export class UpgradeScene extends CommonScene {
    constructor() {
        super(SCENE_NAMES.upgrade);
    }

    init(){
        super.init();

        this.buttons = {};
    }

    create() {
        this._createBG();
        this._createPlayer();
        this._addReturnButton();
        this._createSounds();
        this._addAvailableMoney();
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
                font: `${data.scale}px DishOut`,
                fill: `#${config.upgradeColors[name]}`,
            }).setOrigin(0.5).setAlpha(data.alpha).setStroke('#fafafa33', 4);

            this.tweens.add({
                targets: plus_symbol,
                y: screenEndpoints.top,
                alpha: 0,
                ease: 'Linear',
                duration: data.duration,
                onComplete: () => { plus_symbol.destroy() }
            });
        }
    }

    // TODO add this to common scene class
    _addAvailableMoney(){
        const style = {
            font: `${config.width * .031}px DishOut`,
            fill: '#FFFFFF',
        };

        const moneyIcon = this.add.sprite(screenEndpoints.right - config.height * .075, screenEndpoints.top + config.height * .075, 'ruby').setScale(.25);
        this._moneyText = this.add.text(moneyIcon.x - moneyIcon.displayWidth, moneyIcon.y, config.money, style).setOrigin(.5).setAlpha(1);
    }

    _createPlayer(){
        this._player = new Player({ scene: this });

        this.tweens.add({
            targets: this._player,
            x: config.width * .125,
            ease: 'Linear',
            duration: 1250,
            onComplete: this._createStats,
            callbackScope: this,
        });
    }

    _createStats(){
        this.statsText = {};
        this.statsIcon = {};
        this.statsLevel = {};

        const style = {
            font: `${config.width * .031}px DishOut`,
            fill: '#000000',
        };

        const infoText = this.add.text(config.width/2, screenEndpoints.bottom - config.height * .075, 'Every level increse your ability on +5%', style).setOrigin(.5).setAlpha(0);

        const weaponStats = Object.keys(config.Weapons.fire);
        const height = config.height / 2.5;

        for (let i = 0; i < weaponStats.length; i++) {
            const key = weaponStats[i];

            let multiplier = 1;
            if (key === 'scale') {
                multiplier = 100;
            }

            const value = (Math.round(config.Weapons.fire[key] * multiplier) / multiplier * multiplier).toFixed(0);

            const x = config.width * .57;
            const y = (config.height/2 - height/2) + (height / weaponStats.length) * i;

            const level = localStorage.getItem(`playerWeapon_${key}`);
            const text = `${key.toUpperCase()} (${config.weapons_units[key]}): ${value}`;
            const levelText = 'Lvl. ' + level;

            this.statsText[key] = this.add.text(x, y, text, style).setOrigin(1, 0).setAlpha(0);
            this.statsIcon[key] = this.add.sprite(x + config.width * .06, y, key).setOrigin(0.5, 0.15).setAlpha(0).setDisplaySize(config.width * .045, config.width * .045);
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
        this.buttons[data.key] = this.add.sprite(data.x + config.width * .3, data.y, 'button_campaign')
            .setOrigin(0.5, 0.125)
            .setScale(.33)
            .setInteractive()
            .on('pointerdown', this._upgarde);

        this.buttons[data.key].name = data.key;
        this.buttons[data.key].level = data.level;
        
        this.buttons[data.key].cost = Math.floor(this.buttons[data.key].level/10) + 1;

        const style = {
            font: `${config.width * .023}px DishOut`,
            fill: '#FFFFFF',
        };
        this.buttons[data.key].textCost = this.add.text(this.buttons[data.key].x, this.buttons[data.key].y, '1', style).setOrigin(0.5, -0.125);

        this.buttons[data.key].crystal = this.add.sprite(this.buttons[data.key].x, this.buttons[data.key].y, 'ruby')
            .setOrigin(0.5, .05)
            .setScale(.15);

        this.buttons[data.key].textCost.x -= this.buttons[data.key].crystal.displayWidth/2;
        this.buttons[data.key].crystal.x += this.buttons[data.key].crystal.displayWidth/2;

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

        this.scene.statsText[this.name].text = `${this.name.toUpperCase()} (${config.weapons_units[this.name]}): ${returnedValue}`;
        this.scene.statsLevel[this.name].text = 'Lvl. ' + localStorage.getItem(`playerWeapon_${this.name}`);

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

    // TODO add to common class
    _addReturnButton(){
        this.add.sprite(screenEndpoints.left + config.width * .015, screenEndpoints.top + config.width * .015, 'return')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', ()=>{this.scene.start(SCENE_NAMES.main)}, this);
    }

    _createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            wings: this.sound.add('wings'),
            upgrade: this.sound.add('upgrade'),
            error: this.sound.add('error'),
        };
    }
}