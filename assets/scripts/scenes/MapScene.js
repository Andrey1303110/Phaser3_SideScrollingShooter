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
        let i = 0;
        config.Levels.forEach(element => {
            this.createDot(element);
            i++;
        });
    }

    createDot(object){
        let x = (config.width - this.map.displayWidth)/2 + (object.x/1000 * this.map.displayWidth);
        let y = (config.height - this.map.displayHeight)/2 + (object.y/1000 * this.map.displayWidth);
        let dot = this.add.sprite(x, y, 'battle')
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', this.selectLevel)
            //.setDepth(1);
        dot.info = object;

        if (object.level > config.currentLevel) {
            dot.setAlpha(0.6).setScale(2/3)
               .on('pointerdown', ()=>{this.sounds.error.play({volume: .33})});
            dot.active = false;
        } else {
            dot
                .setAlpha(1)
                .on('pointerdown', ()=>{this.sounds.select.play({volume: .33})})
                //.setDepth(Object.keys(config.Levels)[Object.keys(config.Levels).length-1]);
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
            this.scene.createLevelCard(this.info);
        }   
    }

    createLevelCard(info){
        let currentLevelHiScore = localStorage.getItem('hiScores').split(',')[info.level-1];
        info.hiScore = currentLevelHiScore;

        let bg_rect = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, '0x000000', 0).setInteractive();

        let first_anim_duration = 365;

        this.tweens.add({
            targets: bg_rect,
            fillAlpha: 0.45,
            ease: 'Linear',
            duration: first_anim_duration,
        })

        let frame = this.add.sprite(config.width / 2, config.height/2, 'frame');
        frame.displayHeight = config.height * .795
        let texts = [];

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .086, 'MISSION', {
            font: `${frame.displayWidth * .13}px DishOut`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.55));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .25, `Level ${info.level}`, {
            font: `${frame.displayWidth * .0925}px DishOut`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .37, 'City', {
            font: `${frame.displayWidth * .055}px DishOut`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .44, info.name, {
            font: `${frame.displayWidth * .06175}px DishOut`,
            fill: '#0a0a0a',
        }).setOrigin(0.5).setAlpha(0.8));

        if (currentLevelHiScore > 0) {
            texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .58, `Hi score: ${currentLevelHiScore}`, {
                font: `${frame.displayWidth * .049}px DishOut`,
                fill: '#E2B80D',
            }).setOrigin(0.5).setAlpha(0.8));
        }

        texts.push(this.add.text(frame.x, frame.y - frame.displayHeight/2 + frame.displayHeight * .71, `Enemies - ${info.enemies}`, {
            font: `${frame.displayWidth * .051}px DishOut`,
            fill: '#EA0000',
        }).setOrigin(0.5).setAlpha(0.8));

        this.sounds.stamp.play();

        let stamp = this.add.sprite(frame.x, frame.y, 'stamp').setAlpha(0).setAngle(31).setScale(2.5);

        let timeline = this.tweens.createTimeline();

        timeline.add({
            targets: stamp,
            scale: .26,
            x: frame.x + frame.displayWidth/2 - frame.displayWidth * .27,
            y: frame.y + frame.displayWidth/2 - frame.displayHeight * .26,
            alpha: 0.85,
            ease: 'Power3',
            duration: first_anim_duration,
        });
        timeline.add({
            targets: stamp,
            scale: .305,
            alpha: 0.55,
            ease: 'Power2',
            duration: first_anim_duration * .75,
            onComplete: () => {
                let start_button = this.add.text(frame.x, frame.y + frame.displayHeight/2 - frame.displayHeight * .09, 'START', {
                    font: `${frame.displayWidth * .105}px DishOut`,
                    fill: '#51E04A',
                })
                .setOrigin(0.5)
                .setAlpha(0.5)
                .setInteractive()
                .on('pointerdown', ()=>{this.gameStart(info)})
                .on('pointerover', ()=>{start_button.setAlpha(.85)})
                .on('pointerout', ()=>{start_button.setAlpha(.55)});
                texts.push(start_button);

                let close_button = this.add.sprite(screenEndpoints.right - config.width * .035, screenEndpoints.top + config.width * .035, 'close')
                .setAlpha(0.65)
                .setInteractive()
                .on('pointerdown', ()=>{this.cardClose({bg_rect, frame, texts, stamp, close_button})})
                .on('pointerover', ()=>{close_button.setAlpha(.85)})
                .on('pointerout', ()=>{close_button.setAlpha(.65)});
            }
        });

        timeline.play();
    }

    cardClose(data){
        data.bg_rect.destroy();
        data.frame.destroy();
        data.stamp.destroy();
        data.close_button.destroy();
        data.texts.forEach(element => {
            element.destroy();
        });
    }

    gameStart(info){
        this.sounds.ready.play();

        let bg_rect = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, '0x000000', 0).setInteractive();

        this.tweens.add({
            targets: bg_rect,
            fillAlpha: 1,
            ease: 'Linear',
            duration: this.sounds.ready.duration * 1000 * .7,
            onComplete: ()=>{
                this.scene.start('Game', info);
            }
        });
    }

    createSounds(){
        if (this.sounds) {
            return;
        }
        this.sounds = {
            select: this.sound.add('select'),
            error: this.sound.add('error'),
            stamp: this.sound.add('stamp'),
            ready: this.sound.add('ready'),
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