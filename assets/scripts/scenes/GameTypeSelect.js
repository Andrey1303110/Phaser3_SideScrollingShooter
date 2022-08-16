class GameTypeSelect extends Phaser.Scene {
    constructor() {
        super("Levels");
    }

    init(){
        this.buttons = [];
    }

    create() {
        this.createBG();
        this.createButton('campaign', .25);
        this.createButton('unlim', .5);
        this.createButton('upgrade', .75);
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
        .setScale(.65)
        .setAlpha(.65)
        .setOrigin(.5)
        .setInteractive()
        .on('pointerdown', this.gameSelect);
        this.buttons[name].name = name;

        const textTitle = name.toUpperCase();
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };
        this.add.text(this.buttons[name].x, this.buttons[name].y, textTitle, textStyle).setOrigin(0.5);

        this.buttons[name].on('pointerover', ()=>{this.buttons[name].setAlpha(1)});
        this.buttons[name].on('pointerout', ()=>{this.buttons[name].setAlpha(.75)});
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