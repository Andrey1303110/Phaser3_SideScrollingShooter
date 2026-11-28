import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameTypeSelect } from './scenes/GameTypeSelect';
import { CampaignScene } from './scenes/CampaignScene';
import { PauseScene } from './scenes/PauseScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SetLanguageScene } from './scenes/SetLanguageScene';
import { DisclaimerScene } from './scenes/DisclaimerScene';
import { InfoScene } from './scenes/InfoScene';
import { SettingsScene } from './scenes/SettingsScene';
import { AchievementsScene } from './scenes/AchievementsScene';
import { AchievementNotice } from './scenes/AchievementNotice';

export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    input: {
		activePointers: 5,
	},
    callbacks: { postBoot: () => queueMicrotask(updateOrientation) },
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
        fullscreenTarget: document.body,
    },

    scene: [BootScene, DisclaimerScene, SetLanguageScene, PreloadScene, GameTypeSelect, CampaignScene, GameScene, PauseScene, UpgradeScene, InfoScene, SettingsScene, AchievementsScene, AchievementNotice],
};

const portrait = window.matchMedia('(orientation: portrait)');
export let game;
let suspended = false;
let pausedSounds = [];

function updateOrientation() {
    if (portrait.matches) {
        if (game?.isRunning && !suspended) {
            game.pause();
            suspended = true;
            game.input.enabled = false;
            pausedSounds = game.sound.sounds.filter(sound => sound.isPlaying && sound.pause());
        }
    } else if (!game) {
        game = new Phaser.Game(config);
    } else if (suspended) {
        game.input.enabled = true;
        game.resume();
        pausedSounds.forEach(sound => { if (sound.isPaused) sound.resume(); });
        pausedSounds = [];
        suspended = false;
    }
}

portrait.addEventListener('change', updateOrientation);
updateOrientation();
