import { DialogBox } from './DialogBox';
import { config, delay } from '../main';
import { DEPTH_LAYERS } from '../constants';

const SHOW_DUARTION = 7500;
const SHOW_DELAY = 200;

export class DialogBoxController {
    constructor(scene) {
        this._scene = scene;
        
        this._sceneBG = this._scene.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, '0x000000', 0.6).setAlpha(0);
    }

    /**
     * @param {number} level 
     */
    async flowShow(level) {
        this._setData(level);

        if (!this._data) return;

        await this._toggleShowingBG(true);

        for (const data of this._data) {
            const dialogBox = new DialogBox(this._scene, data);
            await this._playShowingDialog(dialogBox);

            const lastElement = this._data[this._data.length-1];
            if (data !== lastElement) await delay(SHOW_DELAY);
        };

        await this._toggleShowingBG(false);
    }

    async _toggleShowingBG(value) {
        const alpha = value ? 1 : 0;

        if (value) {
            this._sceneBG.setDepth(DEPTH_LAYERS.COVER_SCREEN);
            this._sceneBG.setInteractive();
        }

        await new Promise(resolve => {
            this._scene.tweens.add({
                targets: this._sceneBG,
                alpha,
                ease: 'Power1',
                duration: 250,
                onComplete: () => resolve()
            });
        });

        if (!value) { 
            this._sceneBG.setDepth(DEPTH_LAYERS.NONE);
            this._sceneBG.removeInteractive();
        }
    }

    async _playShowingDialog(dialogBox) {
        await dialogBox.showEnter();
        
        await Promise.race([
            dialogBox.resolver.wait(),
            delay(SHOW_DUARTION),
        ]);
        
        await dialogBox.showExit();
    }

    /**
     * @param {number} fileId 
     */
    _setData(fileId) {
        this._data = this._scene.cache.json.get(`dialogues${fileId}`);
    }
}