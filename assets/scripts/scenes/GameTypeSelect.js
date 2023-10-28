import { config } from "../main.js";

export class GameTypeSelect extends Phaser.Scene {
    constructor() {
        super("Levels");
    }

    init(){
        this.buttons = [];
        this.buttons_num = 0;
    }

    create() {
        this.createBG();
        this.createButton('campaign', .275);
        this.createButton('unlim', .5);
        this.createButton('upgrade', .725);
    }

    createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        let scaleX = this.cameras.main.width / this.sceneBG.width;
        let scaleY = this.cameras.main.height / this.sceneBG.height;
        let scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    createButton(name, y_pos){
        this.buttons[name] = this.add.sprite(config.width / 2, config.height * y_pos, 'button_' + name)
        .setScale(5)
        .setAlpha(0)
        .setOrigin(.5)
        .setInteractive()
        .on('pointerdown', this.gameSelect);
        this.buttons[name].name = name;

        this.buttons_num++;

        const textTitle = name.toUpperCase();
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };
        this.buttons[name].buttonText = this.add.text(this.buttons[name].x, this.buttons[name].y, textTitle, textStyle).setScale(3).setOrigin(0.5).setAlpha(0);

        this.buttons[name].on('pointerover', ()=>{this.buttons[name].setAlpha(1)});
        this.buttons[name].on('pointerout', ()=>{this.buttons[name].setAlpha(.75)});

        this.tweens.add({
            targets: this.buttons[name],
            delay: 250 * this.buttons_num,
            alpha: .675,
            scale: .65,
            ease: 'Linear',
            duration: 333,
        })

        this.tweens.add({
            targets: this.buttons[name].buttonText,
            delay: 250 * this.buttons_num,
            alpha: .9,
            scale: 1,
            ease: 'Linear',
            duration: 333,
        })
    }

    gameSelect(){
        switch (this.name) {
            case 'campaign':
                this.scene.scene.start('Map');
                break;
            case 'unlim':
                this.scene.scene.start('Game', config.unlim);
                break;
            case 'upgrade':
                this.scene.scene.start('Upgrade');
                break;
        }
    }
}