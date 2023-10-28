import { config, screenEndpoints, setWeaponConf } from "../main.js";
import { Player } from "../prefabs/Player.js";

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super("Upgrade");
    }

    init(){
        this.buttons = {};
    }

    create() {
        this.createBG();
        this.createPlayer();
        this.addReturnButton();
        this.createSounds();
        this.addAvailableMoney();
    }

    createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5);

        let scaleX = this.cameras.main.width / this.sceneBG.width;
        let scaleY = this.cameras.main.height / this.sceneBG.height;
        let scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    addAvailableMoney(){
        const style = {
            font: `${config.width * .031}px DishOut`,
            fill: '#FFFFFF',
        };

        this.moneyIcon = this.add.sprite(screenEndpoints.right - config.height * .075, screenEndpoints.top + config.height * .075, 'ruby').setScale(.25);
        this.moneyText = this.add.text(this.moneyIcon.x - this.moneyIcon.displayWidth, this.moneyIcon.y, config.money, style).setOrigin(.5).setAlpha(1);
    }

    createPlayer(){
        this.player = new Player({ scene: this });

        this.tweens.add({
            targets: this.player,
            x: config.width * .125,
            ease: 'Linear',
            duration: 1250,
            onComplete: this.createStats,
            callbackScope: this,
        });
    }

    createStats(){
        this.statsText = {};
        this.statsIcon = {};
        this.statsLevel = {};

        const style = {
            font: `${config.width * .031}px DishOut`,
            fill: '#000000',
        };

        const infoText = this.add.text(config.width/2, screenEndpoints.bottom - config.height * .075, 'Every level increse your ability on +5%', style).setOrigin(.5).setAlpha(0);

        let weaponStats = Object.keys(config.Weapons.fire);
        let height = config.height / 2.5;

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

            this.createUpgredeButton({x, y, key, level});
        }
    }

    checkAvailable(button){
        this.checkPrice(button);

        let alpha = .9;
        if (config.money < button.cost) {
            button.active = false;
            alpha = .5;
        }
        button.setAlpha(alpha);
        button.textCost.setAlpha(alpha)
        button.crystal.setAlpha(alpha);
    }

    checkPrice(button){
        button.cost = Math.floor(button.level/10) + 1;
        button.textCost.text = button.cost;
    }

    createUpgredeButton(data){
        this.buttons[data.key] = this.add.sprite(data.x + config.width * .3, data.y, 'button_campaign')
            .setOrigin(0.5, 0.125)
            .setScale(.33)
            .setInteractive()
            .on('pointerdown', this.upgarde);

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

        this.checkAvailable(this.buttons[data.key]);
    }

    decreaseMoney(value){
        if (config.money) {
            config.money -= value;
            localStorage.setItem('money', config.money);
            this.moneyText.text = config.money;
        }
        else {
            return false;
        }
    }

    upgarde(){
        if (this.clicked || !this.active) {
            if (!this.active) {
                this.scene.sounds.error.play({volume: .3});
            }
            return
        }

        let value = localStorage.getItem(`playerWeapon_${this.name}`);

        if (this.scene.decreaseMoney(this.cost) === false) {
            return;
        }

        localStorage.setItem(`playerWeapon_${this.name}`, ++value);
        this.level = value;

        let returned_value = setWeaponConf({init: false, key: this.name});

        let multiplier = 1;
        if (this.name === 'scale') {
            multiplier = 100;
        }
        returned_value = (Math.round(config.Weapons.fire[this.name] * multiplier) / multiplier * multiplier).toFixed(0);

        this.scene.statsText[this.name].text = `${this.name.toUpperCase()} (${config.weapons_units[this.name]}): ${returned_value}`;
        this.scene.statsLevel[this.name].text = 'Lvl. ' + localStorage.getItem(`playerWeapon_${this.name}`);

        this.clicked = true;
        this.setAlpha(1);
        this.scene.tweens.add({
            targets: this,
            ease: 'Linear',
            alpha: .5,
            duration: 1000,
            onComplete: ()=>{ 
                this.clicked = false;
                for (let i = 0; i < Object.keys(config.Weapons.fire).length; i++) {
                    const name = Object.keys(config.Weapons.fire)[i];
                    this.scene.checkAvailable(this.scene.buttons[name]);
                }
            }
        })

        this.scene.createUpgradeAnimation(this.name);
    }

    createUpgradeAnimation(name){
        this.sounds.upgrade.play({volume: .2});
        let objects_nums = 20;
        for (let i = 0; i < objects_nums; i++) {
            let data = {
                x: (this.player.x - this.player.displayWidth * .6) + this.player.displayWidth * 1.2 / objects_nums * i,
                y: Phaser.Math.Between((this.player.y - this.player.displayHeight * .5) * 100, (this.player.y + this.player.displayHeight * .5) * 100) / 100,
                scale: config.height * .075 * (Phaser.Math.Between(50, 150) / 100),
                alpha: Phaser.Math.Between(75, 100) / 100,
                duration: Phaser.Math.Between(750, 1250),
            }

            let plus_symbol = this.add.text(data.x, data.y, '+', {
                font: `${data.scale}px DishOut`,
                fill: `#${config.upgradeColors[name]}`,
            }).setOrigin(0.5).setAlpha(data.alpha);

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

    addReturnButton(){
        this.add.sprite(screenEndpoints.left + config.width * .015, screenEndpoints.top + config.width * .015, 'return')
            .setAlpha(0.65)
            .setInteractive()
            .on('pointerdown', ()=>{this.scene.start('Levels')}, this);
    }

    createSounds() {
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