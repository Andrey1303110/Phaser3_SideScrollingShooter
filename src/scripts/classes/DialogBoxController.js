import { DialogBox } from './DialogBox';
import { delay } from '../main';

const SHOW_DUARTION = 7500;

export class DialogBoxController {
    constructor(scene) {
        this._scene = scene;
    }

    /**
     * @param {number} level 
     */
    async flowShow(level) {
        this._setData(level);

        if (!this._data) return;

        for (const data of this._data) {
            const dialogBox = new DialogBox(this._scene, data);
            await dialogBox.showEnter(dialogBox);
            await delay(SHOW_DUARTION);
            await dialogBox.showExit(dialogBox);
        };
    }

    /**
     * @param {number} fileId 
     */
    _setData(fileId) {
        this._data = this._scene.scene.cache.json.get(`dialogues${fileId}`);
    }
}