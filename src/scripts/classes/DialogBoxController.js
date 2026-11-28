import { TIMING } from '../timing';
import { resourceKey } from '../identifiers';
import { DialogBox } from './DialogBox';
import { config } from '../main';
import { DEPTH_LAYERS } from '../constants';
import { CAMPAIGN_SKILL_MISSIONS } from '../campaignSkills';
import { uiText, uiUnit } from '../ui';
import { delayInMSec, tweenPromise, screenData, getSceneTexts } from '../Utils';

const MIN_SHOW_DURATION = TIMING.DIALOG_BOX_CONTROLLER.DEFAULT_MIN_SHOW_DURATION_MS;
const READING_MS_PER_CHARACTER = TIMING.DIALOG_BOX_CONTROLLER.DEFAULT_READING_MS_PER_CHARACTER_MS;
const SHOW_DELAY = TIMING.DIALOG_BOX_CONTROLLER.DEFAULT_SHOW_DELAY_MS;

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
        for (let i = 0; i < dialogsCount; i++) {
            const isLast = i === dialogsCount-1;
            const dialogData = this._data[i];
            const dialogBox = new DialogBox(this._scene, dialogData);
            const mentionsUnlock = ({ 0: 7, 3: 2, 6: 1, 9: 0 })[level] === i;
            const rule = mentionsUnlock ? this._showUnlockRule() : null;
            await this._playShowingDialog(dialogBox, level, i, dialogData.text);
            rule?.destroy();

            if (isLast) {
                await delayInMSec(this._scene, SHOW_DELAY);
            }
        }

        await this._toggleShowingBg(false);
    }

    _showUnlockRule() {
        const u = uiUnit();
        const text = getSceneTexts(this._scene, 'Skills').MISSION_RULES.replace('{missions}', CAMPAIGN_SKILL_MISSIONS.join(' / '));
        return this._scene.add.text(screenData.left + screenData.width / 2, screenData.top + 6 * u, text, {
            ...uiText(15, '#ffe3a9'), align: 'center', backgroundColor: '#18302f',
            padding: { x: 8 * u, y: 4 * u }, wordWrap: { width: screenData.width - 32 * u },
        }).setOrigin(0.5, 0).setDepth(DEPTH_LAYERS.DIALOGUES);
    }

    async _toggleShowingBg(value) {
        const alpha = value ? 1 : 0;

        if (value) {
            this._darkBg.setDepth(DEPTH_LAYERS.COVER_SCREEN);
            this._darkBg.setInteractive();
        }

        await tweenPromise(this._scene, {
            targets: this._darkBg,
            alpha,
            ease: 'Power1',
            duration: TIMING.DIALOG_BOX_CONTROLLER.TOGGLE_SHOWING_BG_DURATION_MS,
        });

        if (!value) { 
            this._darkBg.setDepth(DEPTH_LAYERS.NONE);
            this._darkBg.removeInteractive();
        }
    }

    async _playShowingDialog(dialogBox, levelIndex, i, text) {
        await dialogBox.showEnter();
        
        const soundName = resourceKey.voice(levelIndex, i, this._scene.model.lang);
        const sound = this._scene.sounds[soundName];
        const duration = Math.max(sound ? sound.duration * TIMING.DIALOG_BOX_CONTROLLER.VOICE_SECONDS_TO_MS : text.length * READING_MS_PER_CHARACTER, MIN_SHOW_DURATION);
    
        sound?.play();
        await Promise.race([
            dialogBox.resolver.wait(),
            delayInMSec(this._scene, duration),
        ]);
        sound?.stop();
        
        await dialogBox.showExit();
    }

    /**
     * @param {number} fileId 
     */
    _setData(fileId) {
        this._data = this._scene.cache.json.get(resourceKey.dialogues(fileId));
    }
}
