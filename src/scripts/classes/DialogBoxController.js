import { DialogBox } from './DialogBox';
import { config, delayInMSec } from '../main';
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

        if (!this._data) {
            return;
        }
        
        await this._toggleShowingBg(true);

        const dialogsCount = this._data.length;
        this._addSoundsToScene(level, dialogsCount);

        for (let i = 0; i < dialogsCount; i++) {
            const dialogData = this._data[i];
            const dialogBox = new DialogBox(this._scene, dialogData);
            await this._playShowingDialog(dialogBox, level, i);

            const isLast = dialogData === this._data[dialogsCount-1];
            if (isLast) {
                await delayInMSec(this._scene, SHOW_DELAY);
            }
        }

        await this._toggleShowingBg(false);
    }

    _addSoundsToScene(levelIndex, dialogsCount) {
        for (let i = 0; i < dialogsCount; i++) {
            const name = `level${levelIndex}_text${i}_${config.lang}`;
            this._scene.sounds[name] = this._scene.sound.add(name);
        }
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

    async _playShowingDialog(dialogBox, levelIndex, i) {
        await dialogBox.showEnter();
        
        const soundName = `level${levelIndex}_text${i}_${config.lang}`;
        const sound = this._scene.sounds[soundName];
        const duration = Math.max(sound.duration * 1000, MIN_SHOW_DURATION);
    
        sound.play();
        await Promise.race([
            dialogBox.resolver.wait(),
            delayInMSec(this._scene, duration),
        ]);
        sound.stop();
        
        await dialogBox.showExit();
    }

    /**
     * @param {number} fileId 
     */
    _setData(fileId) {
        this._data = this._scene.cache.json.get(`dialogues${fileId}`);
    }
}