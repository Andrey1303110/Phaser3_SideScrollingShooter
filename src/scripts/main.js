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

    scene: [BootScene, DisclaimerScene, SetLanguageScene, PreloadScene, GameTypeSelect, CampaignScene, GameScene, PauseScene, UpgradeScene, InfoScene, SettingsScene, AchievementsScene, AchievementNotice],
};

export const game = new Phaser.Game(config);
