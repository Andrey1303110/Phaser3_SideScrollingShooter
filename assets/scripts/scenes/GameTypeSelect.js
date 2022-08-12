class GameTypeSelect extends Phaser.Scene {
    constructor() {
        super("Levels");
    }

    init(){
        this.buttons = [];
    }

    create(data) {
        this.createBG(data);
        this.createButton('campaign', .35);
        this.createButton('unlim', .65);
    }

    createBG(data) {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        let scaleX = this.cameras.main.width / this.sceneBG.width;
        let scaleY = this.cameras.main.height / this.sceneBG.height;
        let scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    createButton(name, y_pos){
        this.buttons[name] = this.add.sprite(config.width / 2, config.height * y_pos, 'button_' + name)
        .setScale(.65)
        .setAlpha(.75)
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
        }
    }
}