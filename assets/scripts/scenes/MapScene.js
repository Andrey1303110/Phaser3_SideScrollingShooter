class MapScene extends Phaser.Scene {
    constructor() {
        super("Map");
    }

    init(){
        this.mapDots = [];
    }

    create() {
        this.createSounds();
        this.createBG();
        this.createMap();
        this.createButtons();
    }

    createBG() {
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'bg').setAlpha(.925).setOrigin(.5).setInteractive();

        let scaleX = this.cameras.main.width / this.sceneBG.width;
        let scaleY = this.cameras.main.height / this.sceneBG.height;
        let scale = Math.max(scaleX, scaleY);
        this.sceneBG.setScale(scale).setScrollFactor(0);
    }

    createMap(){
        this.map = this.add.sprite(config.width / 2, config.height / 2, 'map').setAlpha(.65).setOrigin(.5).setScale(1.25);
    }

    createButtons(){
        config.Levels.forEach(element => {
            this.createDot(element)
        });

        /*
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
        */
    }

    createDot(object){
        let x = (config.width - this.map.displayWidth)/2 + (object.x/1000 * this.map.displayWidth);
        let y = (config.height - this.map.displayHeight)/2 + (object.y/1000 * this.map.displayWidth);
        let dot = this.add.sprite(x, y, 'battle')
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', this.selectLevel)
            .setDepth(1);
        dot.info = object;

        if (object.level > config.currentLevel) {
            dot.setAlpha(0.6).setScale(2/3)
               .on('pointerdown', ()=>{this.sounds.error.play({volume: .33})});
            dot.active = false;
        } else {
            dot
                .setAlpha(1)
                .on('pointerdown', ()=>{this.sounds.select.play({volume: .33})})
                .setDepth(Object.keys(config.Levels)[Object.keys(config.Levels).length-1]);
            dot.active = true;
            if (config.currentLevel > object.level) {
                dot.setTexture('flag').setOrigin(0, 1);
            } else {
                this.addDotAnim(dot);
            }
        }

        this.mapDots.push(dot);
    }

    addDotAnim(object){
        this.tweens.add({
            targets: object,
            scale: object.scale * 1.5,
            duration: 425,
            yoyo: true,
            repeat: -1,
        });
    }

    selectLevel(){
        if (this.active) {
            this.scene.scene.start('Game', this.info);
        }   
    }

    createSounds(){
        if (this.sounds) {
            return;
        }
        this.sounds = {
            select: this.sound.add('select'),
            error: this.sound.add('error'),
        };
    }

    /*
    createStats(data) {
        this.add.graphics()
            .fillStyle('#000', 0.5)
            .fillRoundedRect(config.width / 2 - config.width * .15, config.height / 2 - config.height * .25, config.width * .3, config.height * .5, config.width*.03);

        const textTitle = data.completed ? 'Level completed!' : 'Game over';
        const textScore = `Score: ${data.score}`;
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };

        this.add.text(config.width / 2, config.height / 2 - config.height * .125, textTitle, textStyle).setOrigin(0.5);
        this.add.text(config.width / 2, config.height / 2 + config.height * .125, textScore, textStyle).setOrigin(0.5);
    }

    createStartText() {
        this.startText = this.add.text(config.width / 2, screenEndpoints.bottom - config.height * .05, 'Tap to start', {
            font: `${config.width*.04}px DishOut`,
            fill: '#f0f0f0',
        }).setOrigin(0.5);

        let initScale = this.startText.scale;

        let timeline = this.tweens.createTimeline();

        timeline.add({
            targets: this.startText,
            scale: initScale + .18,
            ease: 'Power2',
            duration: 550,
        });
        timeline.add({
            targets: this.startText,
            scale: initScale,
            ease: 'Power2',
            duration: 550,
        });

        timeline.loop = -1;

        timeline.play();
    }
    */
}