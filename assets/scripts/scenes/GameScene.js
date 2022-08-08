var player;
var test;
class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init(data) {
        this.currentLevel = data.level;
        data.completed ? this.currentScore = data.score : this.currentScore = 0;
        //this.maxLevel = Object.keys(config.Levels)[Object.keys(config.Levels).length-1];
    }

    create(data) {
        this.createBG(data);
        this.getMaxEnemyHeightFrame();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createPlayer();
        this.createEnemies();
        this.createCompleteEvents();
        this.addOverlap();
        this.createScoreText();
        this.createSounds();
    }

    update() {
        this.sceneBG.tilePositionX += this.sceneBG.width / 10000 * this.speed;
        this.player.move();
        this.player.shooting();
    }

    createBG(data) {
        this.sceneBG = this.add.tileSprite(0, 0, config.width, config.height, `bg${data.level}`).setOrigin(0).setAlpha(.65);
        this.speed = config.Levels[this.currentLevel].velocity * .06;
    }

    createScoreText() {
        this.scoreText = this.add.text(screenEndpoints.right - config.width * .01, screenEndpoints.top + config.width * .01, this.currentScore, {
            font: `${config.width * .03}px DishOut`,
            fill: '#EA0000',
        }).setOrigin(1, 0).setAlpha(.75);
    }

    createPlayer() {
        this.player = new Player({ scene: this });
        player = this.player;
    }

    createEnemies() {
        this.enemies = new Enemies(this);
    }

    createSounds() {
        if (this.sounds) {
            return;
        }
        this.sounds = {
            rocket_launch: this.sound.add('rocket_launch'),
            fire_launch: this.sound.add('fire_launch'),
            missile_launch: this.sound.add('missile_launch'),
            explosion_small: this.sound.add('explosion_small'),
            wings: this.sound.add('wings'),
        };
    }

    addOverlap() {
        this.physics.add.overlap(this.player.fires, this.enemies, this.onOverlap, undefined, this);
        this.physics.add.overlap(this.enemies.fires, this.player, this.onOverlap, undefined, this);
        this.physics.add.overlap(this.player.fires, this.enemies.fires, this.onOverlap, undefined, this);
        this.physics.add.overlap(this.player, this.enemies, this.onOverlap, undefined, this);
    }

    onOverlap(source, target) {
        if (target.x > config.width + target.displayWidth / 2) {
            return;
        }

        if (source !== this.player && target !== this.player) {
            this.currentScore += target.reward * this.currentLevel;
            this.scoreText.text = this.currentScore;
            Boom.generate(this, target.x, target.y);
        }

        source.setAlive(false);
        target.setAlive(false);
        this.sounds.explosion_small.play();
    }

    createCompleteEvents() {
        this.player.emit('killed');
        this.player.once('killed', this.onComplete, this);
        this.events.once('enemies-killed', this.onComplete, this);
    }

    onComplete() {
        if (this.player.active && config.currentLevel <= this.currentLevel) {
            config.currentLevel++;
            localStorage.setItem('currentLevel', config.currentLevel);
        }
        this.scene.start('Map');
        this.game.sound.stopAll();
    }

    getMaxEnemyHeightFrame() {
        let max_frame_height = 0;
        let frames = this.textures.list.helicopter.frames;

        Object.keys(frames).forEach(function (key) {
            if (frames[key].cutHeight > max_frame_height) {
                max_frame_height = frames[key].cutHeight;
            }
        });
        this.maxEnemyFrameHeight = max_frame_height;
    }
}