import { rgbToHex, screenData } from '../Utils';
import { config } from '../main';

const INITIAL_COLORS = {
    r: 30,
    g: 150,
    b: 30,
}

const MAX_VALUE_GREEN = 210;

const BOX_COLOR = 0xe3e1da;

export class LoadingBar {
    constructor (scene) {
        this._scene = scene;

        this._colors = {...INITIAL_COLORS};

        const width = config.width * 0.7;
        const height = config.height * 0.06;

        const params = {
            boxColor: BOX_COLOR,
            x: config.width * 0.5 - (width * 0.5),
            y: screenData.bottom - (height * 1.5),
            width,
            height,
            round: height * 0.4
        };

        this._progressBox = this._scene.add.graphics();
        this._progressBar = this._scene.add.graphics();

        this._showProgressBox(params);

        this._scene.load.on('progress', (value) => this._showProgressBar(value, params));
    }

    get graphicsElements() {
        return [ this._progressBox, this._progressBar ];
    }

    _showProgressBox(params){
        const { x, y, width, height, round, boxColor } = params;

        this._progressBox
            .fillStyle(boxColor)
            .fillRoundedRect(x, y, width, height, round);
    }

    _showProgressBar(value, params){
        const { x, y, width, height, round } = params;
        this._colors.g = (MAX_VALUE_GREEN - INITIAL_COLORS.g) * value + INITIAL_COLORS.g;

        this._progressBar
            .clear()
            .fillStyle(rgbToHex(this._colors))
            .fillRoundedRect(x, y, width * value, height, round);
    }
}
