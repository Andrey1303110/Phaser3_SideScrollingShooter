export const SCENE_NAMES = {
    SET_LANGUAGE: 'SetLanguage',
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
export const AUDIO_FILES = ['select', 'error', 'rocket_launch', 'fire_launch', 'missile_launch', 'missile_2_launch', 'explosion_small', 'wings', 'stamp', 'ready', 'lose', 'win', 'upgrade', 'level_up', 'whoosh', 'whoosh_map', 'click', 'fire_effect', 'campaign_complete_song'];

export const FONTS = {
    eng: 'DishOut',
    ukr: 'Pangolin',
}

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
export const LEVEL_REQUIRED_SCORE = 1000;
export const LEVEL_SCORE_MULTIPLIER = 1.225;
export const LEVEL_REQUIRED_SCORE_MULTIPLIER = 1.3;

export const PLAYER = {
    maxHealth: 100,
    currentHealth: 100,
    velocity: 350,
    scale: 0.6,
};

export const WEAPONS = {
    FIRE: {
        reload: 1000,
        velocity: 500,
        damage: 100,
        scale: 0.4,
        reward: 0,
        texture: 'fire',
        sound: 'fire_launch',
    },
    ROCKET: {
        reload: 1750,
        velocity: 350 * -1,
        scale: 0.3,
        damage: 25,
        reward: 100,
        texture: 'rocket',
        sound: 'rocket_launch',
    },
    MISSILE: {
        reload: 2000,
        velocity: 475 * -1,
        scale: 0.375,
        damage: 40,
        reward: 150,
        texture: 'missile',
        sound: 'missile_launch',
    },
    MISSILE_2: {
        reload: 2500,
        velocity: 800 * -1,
        scale: 0.4,
        damage: 60,
        reward: 750,
        texture: 'missile_2',
        sound: 'missile_2_launch',
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

export const CAMPAIGN_LEVELS = [
    {
        index: 1,
        x: 485,
        y: 175,
        enemies: 5,
        enemiesDelay: 3000,
        velocity: 4,
    },
    {
        index: 2,
        x: 506,
        y: 490,
        enemies: 8,
        enemiesDelay: 2500,
        velocity: 4,
    },
    {
        index: 3,
        x: 758,
        y: 179,
        enemies: 11,
        enemiesDelay: 2200,
        velocity: 4,
    },
    {
        index: 4,
        x: 430,
        y: 135,
        enemies: 15,
        enemiesDelay: 1900,
        velocity: 4,
    },
    {
        index: 5,
        x: 890,
        y: 397,
        enemies: 21,
        enemiesDelay: 1700,
        velocity: 4,
    },
    {
        index: 6,
        x: 353,
        y: 287,
        enemies: 28,
        enemiesDelay: 1550,
        velocity: 4,
    },
    {
        index: 7,
        x: 435,
        y: 195,
        enemies: 39,
        enemiesDelay: 1400,
        velocity: 4,
    },
    {
        index: 8,
        x: 105,
        y: 248,
        enemies: 50,
        enemiesDelay: 1300,
        velocity: 4,
    },
    {
        index: 9,
        x: 720,
        y: 311,
        enemies: 65,
        enemiesDelay: 1200,
        velocity: 4,
    },
    {
        index: 10,
        x: 732,
        y: 509,
        enemies: 82,
        enemiesDelay: 1100,
        velocity: 4,
    },
    {
        index: 11,
        x: 874,
        y: 333,
        enemies: 100,
        enemiesDelay: 1050,
        velocity: 4,
    },
    {
        index: 12,
        x: 735,
        y: 366,
        enemies: 120,
        enemiesDelay: 1000,
        velocity: 4,
    },
    {
        index: 13,
        x: 665,
        y: 435,
        enemies: 145,
        enemiesDelay: 975,
        velocity: 4,
    },
    {
        index: 14,
        x: 956,
        y: 261,
        enemies: 200,
        enemiesDelay: 950,
        velocity: 4,
    },
    {
        index: 15,
        x: 676,
        y: 640,
        enemies: 250,
        enemiesDelay: 925,
        velocity: 4,
    },
];

export const UNLIMITED_LEVEL = {
    isUnlim: true,
    index: 15,
    enemies: 1000,
    enemiesDelay: 2000,
}

export const LEVEL_HI_SCORES_SEPARATOR = ',';
