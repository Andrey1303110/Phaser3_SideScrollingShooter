import { GameModel } from "./GameModel";
import { FONTS } from "./constants";
import { config } from "./main";
import { CommonScene } from "./scenes/CommonScene";

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

/**
 * Retrieves texts for the given scene based on its name
 * @param {string} scene 
 * @returns {object} texts for the scene
 */
export function getSceneTexts(scene) {
    const texts = scene.cache.json.get('texts');
    if (!texts || !scene.name) {
        return {};
    }
    return texts[scene.name];
}

/**
 * Converts RGB color to hex string
 * @param {object} colors
 * @param {number} colors.r
 * @param {number} colors.g
 * @param {number} colors.b 
 * @returns {string} hex color string like '0xFFFFFF'
 */
export function rgbToHex(colors) {
    return '0x' + ((1 << 24) + (colors.r << 16) + (colors.g << 8) + colors.b).toString(16).slice(1);
}

/**
 * Creates a delay in milliseconds
 * @param {Phaser.Scene|CommonScene} context 
 * @param {number} duration 
 * @returns {Promise}
 */
export const delayInMSec = (context, duration) => {
    const scene = context?.time ? context : context.scene;

    return new Promise(resolve => {
        scene.time.delayedCall(duration, resolve);
    });
};

/**
 * Gets font name based on current language
 * @returns {string} font name
 */
export function getFontName() {
    const model = GameModel.getInstance();
    return FONTS[model.lang];
}

/**
 * Creates a tween and returns a promise that resolves when the tween is complete
 * @param {CommonScene} scene 
 * @param {*} config 
 * @returns {Promise}
 */
export function tweenPromise(scene, config) {
    return new Promise(resolve => {
        scene.tweens.add({
            ...config,
            onComplete: () => {
                if (typeof config.onComplete === 'function') {
                    config.onComplete();
                }
                resolve();
            }
        });
    });
}

/**
 * Creates a full screen black rectangle
 * @param {CommonScene} scene 
 * @returns {Phaser.GameObjects.Rectangle}
 */
export function createScreenBlackRectangle(scene) {
    return scene.add.rectangle(screenData.left, screenData.top, screenData.width, screenData.height, '0x000000', 0).setOrigin(0);
}
