export const SCENE_NAMES = {
    BOOT: 'Boot',
    PRELOAD: 'Preload',
    MAIN: 'Levels',
    CAMPAIGN: 'Campaign',
    GAME: 'GameScene',
    UPGRADE: 'Upgrade',
    PAUSE: 'Pause',
}

export const EVENTS = {     
    KILLED: 'killed',
    ALL_ENEMIES_KILLED: 'enemies-killed',
    UPDATE: 'update',
}

// Only .png + .json
export const ATLAS_FILES = ['dragon', 'jet', 'strategic_jet', 'helicopter', 'boom'];

// Only .png
export const IMAGE_FILES = ['fire', 'flag', 'rocket', 'missile', 'missile_2', 'button_campaign', 'button_unlim', 'button_upgrade', 'map', 'battle', 'ruby', 'flag', 'frame', 'stamp', 'close', 'return', 'pause', 'pause_bg', 'restart', 'play', 'scale', 'reload', 'velocity', 'progress_bar', 'progress_bar_fill', 'skobeeva', 'chief_commander', 'commander', 'president', 'next', 'life_icon', 'health_bar_empty', 'health_bar_fill', 'health'];

// Only .mp3
export const AUDIO_FILES = ['select', 'error', 'rocket_launch', 'fire_launch', 'missile_launch', 'missile_2_launch', 'explosion_small', 'wings', 'stamp', 'ready', 'died', 'win', 'upgrade', 'level_up', 'whoosh', 'whoosh_map', 'click', 'fire_effect', 'campaign_complete_song'];

export const DEPTH_LAYERS = {
    NONE: 0,
    DEFAULT: 1,
    UI: 2,
    COVER_SCREEN: 3,
    DIALOGUES: 4,
    MAX: 5,
}

export const FIRE_WEAPON_DEFAULT_SCALE = 2.5;
export const UPGRADE_MULTIPLIER = 0.04;
export const JOYSTICK_RADIUS = 90;
export const JOYSTICK_GAP = 35;
export const LEVEL_REQUIRED_SCORE = 500;
export const LEVEL_SCORE_MULTIPLIER = 1.2;
export const LEVELS_EXP_MULTIPLIER = 1.3;

export const WEAPONS = {
    FIRE: {
        reload: 1000,
        velocity: 500,
        damage: 100,
        scale: 0.4,
        texture: 'fire',
        reward: 0,
    },
    ROCKET: {
        reload: 1750,
        velocity: 350 * -1,
        scale: 0.3,
        damage: 25,
        texture: 'rocket',
        reward: 100,
    },
    MISSILE: {
        reload: 2000,
        velocity: 475 * -1,
        scale: 0.375,
        damage: 40,
        texture: 'missile',
        reward: 150,
    },
    MISSILE_2: {
        reload: 2500,
        velocity: 800 * -1,
        scale: 0.4,
        damage: 60,
        texture: 'missile_2',
        reward: 750,
    }
};

export const ENEMIES = {
    HELICOPTER: {
        velocity: 110,
        weapon: WEAPONS.ROCKET,
        scale: 0.81,
        texture: 'helicopter',
        textureNum: 4,
        reward: 275,
    },
    JET: {
        velocity: 250,
        weapon: WEAPONS.MISSILE,
        scale: 0.76,
        texture: 'jet',
        textureNum: 4,
        reward: 375,
    },
    STRATEGIC_JET: {
        velocity: 200,
        weapon: WEAPONS.MISSILE_2,
        scale: 0.85,
        texture: 'strategic_jet',
        textureNum: 4,
        reward: 500,
    },
};
