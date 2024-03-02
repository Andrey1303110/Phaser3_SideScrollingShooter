import { SCENE_NAMES } from '../constants';
import { config, rgbToHex } from '/src/scripts/main';

const INITIAL_COLORS = {
    r: 210,
    g: 0,
    b: 25,
}

const MAX_VALUE_GREEN = 225;
const MAX_VALUE_RED = 200;

const BOX_COLOR = 0xe3e1da;

export class LoadingBar {
    constructor (scene) {
        this.scene = scene;

        this._colors = {};
        this._colors.r = INITIAL_COLORS.r;
        this._colors.g = INITIAL_COLORS.g;
        this._colors.b = INITIAL_COLORS.b;

        this._style = {
            boxColor: BOX_COLOR,
            x: config.width * 0.5 - (config.width * .25),
            y: config.height * 0.5 + config.height * .25,
            width: config.width * .5,
            height: config.height * .05,
        };

        this._progressBox = this.scene.add.graphics();
        this._progressBar = this.scene.add.graphics();

        this._showProgressBox();
        this._setEvents();
    }

    _setEvents(){
        this.scene.load.on('progress', this._showProgressBar, this);
        this.scene.load.on('complete', () => this.scene.scene.start(SCENE_NAMES.main), this);
    }

    _showProgressBox(){
        this._progressBox
            .fillStyle(this._style.boxColor)
            .fillRect(this._style.x, this._style.y, this._style.width, this._style.height);
    }

    _showProgressBar(value){
        this._colors.r = INITIAL_COLORS.r - value * MAX_VALUE_RED;
        this._colors.g = value * MAX_VALUE_GREEN;

        this._progressBar
            .clear()
            .fillStyle(rgbToHex(this._colors))
            .fillRect(this._style.x, this._style.y, this._style.width * value, this._style.height);
    }
}
