import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameTypeSelect } from './scenes/GameTypeSelect';
import { CampaignScene } from './scenes/CampaignScene';
import { PauseScene } from './scenes/PauseScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SetLanguageScene } from './scenes/SetLanguageScene';
import { FONTS } from './constants';
import { GameModel } from './GameModel';

export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    input: {
		activePointers: 5,
	},
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },

    backgroundColor: '#F3F3F3',
    orientation: Phaser.Scale.LANDSCAPE,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'gameDiv',
    },

    scene: [BootScene, SetLanguageScene, PreloadScene, GameTypeSelect, CampaignScene, GameScene, PauseScene, UpgradeScene],
};

export const game = new Phaser.Game(config);

export const screenData = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
};

export function setEndpoints() {
    const aspectRatio = document.body.clientWidth / document.body.clientHeight;
    const targetAspectRatio = 16 / 9;

    if (aspectRatio === targetAspectRatio) {
        screenData.left = 0;
        screenData.right = config.width;
        screenData.top = 0;
        screenData.bottom = config.height;
    } else if (aspectRatio < targetAspectRatio) {
        const newWidth = config.height * aspectRatio;
        screenData.left = (config.width - newWidth) * 0.5;
        screenData.right = screenData.left + newWidth;
        screenData.top = 0;
        screenData.bottom = config.height;
    } else {
        const newHeight = config.width / aspectRatio;
        screenData.left = 0;
        screenData.right = config.width;
        screenData.top = (config.height - newHeight) * 0.5;
        screenData.bottom = screenData.top + newHeight;
    }

    screenData.width = screenData.right - screenData.left;
    screenData.height = screenData.bottom - screenData.top;
}

export function getSceneTexts(scene) {
    const texts = scene.cache.json.get('texts');
    if (!texts || !scene.name) {
        return {};
    }
    return texts[scene.name];
}

export function rgbToHex(colors) {
    return '0x' + ((1 << 24) + (colors.r << 16) + (colors.g << 8) + colors.b).toString(16).slice(1);
}

export const delayInMSec = (context, duration) => {
    const scene = context?.time ? context : context.scene;

    return new Promise(resolve => {
        scene.time.delayedCall(duration, resolve);
    });
};

export function getFontName() {
    const model = GameModel.getInstance();
    return FONTS[model.lang];
}
