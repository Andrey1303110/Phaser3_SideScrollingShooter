import { DialogBox } from './DialogBox';
import { config, delay } from '../main';
import { DEPTH_LAYERS } from '../constants';

const MIN_SHOW_DURATION = 2500;
const SHOW_DELAY = 200;

export class DialogBoxController {
    constructor(scene) {
        this._scene = scene;
        
        this._darkBg = this._scene.add.rectangle(config.width * 0.5, config.height * 0.5, config.width, config.height, '0x000000', 0.6).setAlpha(0);
    }

    /**
     * @param {number} level 
     */
    async flowShow(level) {
        this._setData(level);

        if (!this._data) return;

        await this._toggleShowingBg(true);

            const lastElement = this._data[this._data.length-1];
            if (data !== lastElement) await delay(SHOW_DELAY);
        };

        await this._toggleShowingBg(false);
    }

    async _toggleShowingBg(value) {
        const alpha = value ? 1 : 0;

        if (value) {
            this._darkBg.setDepth(DEPTH_LAYERS.COVER_SCREEN);
            this._darkBg.setInteractive();
        }

        await new Promise(resolve => {
            this._scene.tweens.add({
                targets: this._darkBg,
                alpha,
                ease: 'Power1',
                duration: 250,
                onComplete: () => resolve()
            });
        });

        if (!value) { 
            this._darkBg.setDepth(DEPTH_LAYERS.NONE);
            this._darkBg.removeInteractive();
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