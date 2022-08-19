class LoadingBar {
    constructor (scene) {
        this.scene = scene;
        this.colors = {
            r: 210,
            g: 0,
            b: 25,
        };
        this.style = {
            boxColor: 0xe3e1da,
            x: config.width/2 - (config.width * .8 / 2),
            y: config.height/2 + config.height * .25,
            width: config.width * .8,
            height: config.height * .05,
        };

        this.progressBox = this.scene.add.graphics();
        this.progressBar = this.scene.add.graphics();

        this.showProgressBox();
        this.setEvents();
    }

    setEvents(){
        this.scene.load.on('progress', this.showProgressBar, this);
    }

    showProgressBox(){
        this.progressBox
            .fillStyle(this.style.boxColor)
            .fillRect(this.style.x, this.style.y, this.style.width, this.style.height);
    }

    showProgressBar(value){
        this.colors.r = 210 - value * 200;
        this.colors.g = value * 225;

        this.progressBar
            .clear()
            .fillStyle(rgbToHex(this.colors))
            .fillRect(this.style.x, this.style.y, this.style.width * value, this.style.height);
    }
}