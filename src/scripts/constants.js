import { SOUND_KEYS, TEXTURE_KEYS } from './identifiers';
export const SCENE_NAMES = {
    BOOT: 'Boot',
    DISCLAIMER: 'Disclaimer',
    SET_LANGUAGE: 'SetLanguage',
    PRELOAD: 'Preload',
    MAIN_MENU: 'MainMenu',
    ACHIEVEMENTS: 'Achievements',
    ACHIEVEMENT_NOTICE: 'AchievementNotice',
    INFO: 'Info',
    SETTINGS: 'Settings',
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
export const ATLAS_FILES = [TEXTURE_KEYS.JET, TEXTURE_KEYS.STRATEGIC_JET, TEXTURE_KEYS.HELICOPTER, TEXTURE_KEYS.BOOM, TEXTURE_KEYS.SKILL_FX];

// Only .png
export const IMAGE_FILES = [TEXTURE_KEYS.FIRE, TEXTURE_KEYS.FLAG, TEXTURE_KEYS.ROCKET, TEXTURE_KEYS.MISSILE, TEXTURE_KEYS.MISSILE_2, TEXTURE_KEYS.MAP, TEXTURE_KEYS.RUBY, TEXTURE_KEYS.RETURN, TEXTURE_KEYS.PAUSE, TEXTURE_KEYS.SCALE, TEXTURE_KEYS.RELOAD, TEXTURE_KEYS.VELOCITY, TEXTURE_KEYS.PROGRESS_BAR, TEXTURE_KEYS.PROGRESS_BAR_FILL, TEXTURE_KEYS.SKOBEEVA, TEXTURE_KEYS.CHIEF_COMMANDER, TEXTURE_KEYS.COMMANDER, TEXTURE_KEYS.PRESIDENT, TEXTURE_KEYS.NEXT, TEXTURE_KEYS.LIFE_ICON, TEXTURE_KEYS.HEALTH_BAR_EMPTY, TEXTURE_KEYS.HEALTH_BAR_FILL, TEXTURE_KEYS.HEALTH, TEXTURE_KEYS.EXPLOSION_PARTICLE, TEXTURE_KEYS.FIRE_BUTTON, TEXTURE_KEYS.TREES_MID, TEXTURE_KEYS.TREES_NEAR];

// Matches the level order and atmosphere specified in game_parallax/README.txt.
export const LEVEL_BACKGROUNDS = [
    { clouds: TEXTURE_KEYS.CLOUDS_NIGHT, celestial: TEXTURE_KEYS.MOON },
    { clouds: TEXTURE_KEYS.CLOUDS_DAY, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_DAWN, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_SUNSET, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_NIGHT, celestial: null },
    { clouds: TEXTURE_KEYS.CLOUDS_DAY, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_NIGHT, celestial: TEXTURE_KEYS.MOON },
    { clouds: TEXTURE_KEYS.CLOUDS_SUNSET, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_DAWN, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_DAY, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_NIGHT, celestial: null },
    { clouds: TEXTURE_KEYS.CLOUDS_DAY, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_NIGHT, celestial: TEXTURE_KEYS.MOON },
    { clouds: TEXTURE_KEYS.CLOUDS_DAWN, celestial: TEXTURE_KEYS.SUN },
    { clouds: TEXTURE_KEYS.CLOUDS_SUNSET, celestial: TEXTURE_KEYS.SUN },
];

export const PARALLAX_IMAGE_FILES = [TEXTURE_KEYS.SUN, TEXTURE_KEYS.MOON, TEXTURE_KEYS.CLOUDS_DAY, TEXTURE_KEYS.CLOUDS_DAWN, TEXTURE_KEYS.CLOUDS_SUNSET, TEXTURE_KEYS.CLOUDS_NIGHT];

export const AUDIO_FILES = [
    SOUND_KEYS.ERROR,
    SOUND_KEYS.ROCKET_LAUNCH,
    SOUND_KEYS.FIRE_LAUNCH,
    SOUND_KEYS.MISSILE_LAUNCH,
    SOUND_KEYS.MISSILE_2_LAUNCH,
    SOUND_KEYS.EXPLOSION_SMALL,
    SOUND_KEYS.WINGS,
    SOUND_KEYS.READY,
    SOUND_KEYS.LOSE,
    SOUND_KEYS.WIN,
    SOUND_KEYS.UPGRADE,
    SOUND_KEYS.LEVEL_UP,
    SOUND_KEYS.WHOOSH,
    SOUND_KEYS.CLICK,
    SOUND_KEYS.FIRE_EFFECT,
    SOUND_KEYS.CAMPAIGN_COMPLETE_SONG,
    SOUND_KEYS.SHIELD_BREAK,
    SOUND_KEYS.DRAGON_HURT,
    SOUND_KEYS.DRAGON_FIRE_BEAM,
    SOUND_KEYS.MISSILE_INTERCEPT,
    SOUND_KEYS.VAMPIRISM_HEAL,
    SOUND_KEYS.ACHIEVEMENT_UNLOCK,
];

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
export const GAME_ACTOR_SCALE_MULTIPLIER = 1.5;
export const UPGRADE_MULTIPLIER = 0.04;
export const JOYSTICK_RADIUS = 90;
export const JOYSTICK_GAP = 35;
export const LEVEL_REQUIRED_SCORE = 1000;
export const LEVEL_SCORE_MULTIPLIER = 1.25;
export const LEVEL_REQUIRED_SCORE_MULTIPLIER = 1.275;

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
        maxSpeed: 500,
        acceleration: 500,
        damage: 100,
        particlesSetting: {
            quantity: 15,
            speedX: { min: -5, max: 250 },
            speedY: { min: -75, max: 75 },
            lifespan: { min: 25, max: 250 },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.35, end: 0.05 },
            tint: [0xFFFF00, 0xFF8000, 0xFF0000],
            angle: { min: -25, max: 25 },
        },
        scale: 0.4,
        reward: 0,
        texture: TEXTURE_KEYS.FIRE,
        sound: SOUND_KEYS.FIRE_LAUNCH,
    },
    ROCKET: {
        reload: 1750,
        velocity: -350,
        maxSpeed: -350,
        acceleration: -400,
        particlesSetting: {
            quantity: 10,
            speed: { min: 70, max: 130 },
            lifespan: { min: 25, max: 100 },
            alpha: { start: 0.35, end: 0 },
            scale: { start: 0.1, end: 0.2 },
            tint: 0xC4ADAD
        },
        scale: 0.4,
        damage: 25,
        reward: 100,
        texture: TEXTURE_KEYS.ROCKET,
        sound: SOUND_KEYS.ROCKET_LAUNCH,
    },
    MISSILE: {
        reload: 1250,
        velocity: -475,
        maxSpeed: -475,
        acceleration: -900,
        particlesSetting: {
            quantity: 25,
            speedX: { min: -25, max: -150 },
            speedY: { min: -50, max: 50 },
            lifespan: { min: 25, max: 100 },
            alpha: { start: 0.15, end: 0 },
            scale: { start: 0.1, end: 0.25 },
            tint: 0xFF7700
        },
        scale: 0.375,
        damage: 40,
        reward: 150,
        texture: TEXTURE_KEYS.MISSILE,
        sound: SOUND_KEYS.MISSILE_LAUNCH,
    },
    MISSILE_2: {
        reload: 1650,
        velocity: -800,
        maxSpeed: -800,
        acceleration: -2250,
        particlesSetting: {
            quantity: 35,
            speedX: { min: -25, max: -200 },
            speedY: { min: -25, max: 25 },
            lifespan: { min: 25, max: 100 },
            alpha: { start: 0.25, end: 0 },
            scale: { start: 0.1, end: 0.35 },
            tint: 0xC18CFF
        },
        scale: 0.4,
        damage: 60,
        reward: 750,
        texture: TEXTURE_KEYS.MISSILE_2,
        sound: SOUND_KEYS.MISSILE_2_LAUNCH,
    }
};

export const ENEMIES = {
    HELICOPTER: {
        weapon: WEAPONS.ROCKET,
        scale: 0.9,
        texture: TEXTURE_KEYS.HELICOPTER,
        frames: 4,
        reward: 275,
        entryLevel: 0,
    },
    JET: {
        velocity: -250,
        weapon: WEAPONS.MISSILE,
        scale: 0.76,
        texture: TEXTURE_KEYS.JET,
        frames: 4,
        reward: 375,
        entryLevel: 5,
    },
    STRATEGIC_JET: {
        velocity: -200,
        weapon: WEAPONS.MISSILE_2,
        scale: 0.85,
        texture: TEXTURE_KEYS.STRATEGIC_JET,
        frames: 4,
        reward: 500,
        entryLevel: 10,
    },
};

// Shared maneuver settings. Speed is in pixels/second; delays are in milliseconds.
// rocketInterval is the minimum between launches; moving and aiming may extend it.
export const HELICOPTER_FLIGHT_DEFAULTS = {
    shots: { min: 3, max: 5 },
    approachSpeedMultiplier: 1.06,
    advancePercent: { min: 12, max: 22 },
    altitudePercent: { min: 18, max: 30 },
    altitudeChangeChance: 0.5,
    exitMargin: 0.18,
    heightPadding: 12,
    arrivalDistance: 5,
    arrivalSpeed: 14,
    slowdown: 4.5,
    steeringTime: 120,
    maxTilt: 0.06,
};

export const CAMPAIGN_LEVELS = [
    {
        index: 1,
        x: 485,
        y: 175,
        enemies: 5,
        enemiesDelay: 5000,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 144,
            aimDelay: 938,
            rocketInterval: 3850,
            recoveryDelay: 884,
        },
    },
    {
        index: 2,
        x: 506,
        y: 490,
        enemies: 8,
        enemiesDelay: 4464,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 147,
            aimDelay: 900,
            rocketInterval: 3685,
            recoveryDelay: 850,
        },
    },
    {
        index: 3,
        x: 758,
        y: 179,
        enemies: 11,
        enemiesDelay: 4191,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 150,
            aimDelay: 862,
            rocketInterval: 3520,
            recoveryDelay: 816,
        },
    },
    {
        index: 4,
        x: 430,
        y: 135,
        enemies: 15,
        enemiesDelay: 3845,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 153,
            aimDelay: 825,
            rocketInterval: 3355,
            recoveryDelay: 782,
        },
    },
    {
        index: 5,
        x: 890,
        y: 397,
        enemies: 21,
        enemiesDelay: 3643,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 156,
            aimDelay: 788,
            rocketInterval: 3190,
            recoveryDelay: 748,
        },
    },
    {
        index: 6,
        x: 353,
        y: 287,
        enemies: 28,
        enemiesDelay: 3506,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 159,
            aimDelay: 750,
            rocketInterval: 3025,
            recoveryDelay: 714,
        },
    },
    {
        index: 7,
        x: 435,
        y: 195,
        enemies: 39,
        enemiesDelay: 3334,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 162,
            aimDelay: 712,
            rocketInterval: 2860,
            recoveryDelay: 680,
        },
    },
    {
        index: 8,
        x: 105,
        y: 248,
        enemies: 50,
        enemiesDelay: 3250,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 165,
            aimDelay: 675,
            rocketInterval: 2695,
            recoveryDelay: 646,
        },
    },
    {
        index: 9,
        x: 720,
        y: 311,
        enemies: 65,
        enemiesDelay: 3143,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 168,
            aimDelay: 638,
            rocketInterval: 2530,
            recoveryDelay: 612,
        },
    },
    {
        index: 10,
        x: 732,
        y: 509,
        enemies: 82,
        enemiesDelay: 3011,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 171,
            aimDelay: 600,
            rocketInterval: 2365,
            recoveryDelay: 578,
        },
    },
    {
        index: 11,
        x: 874,
        y: 333,
        enemies: 100,
        enemiesDelay: 3000,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 174,
            aimDelay: 562,
            rocketInterval: 2200,
            recoveryDelay: 544,
        },
    },
    {
        index: 12,
        x: 735,
        y: 366,
        enemies: 120,
        enemiesDelay: 2976,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 177,
            aimDelay: 525,
            rocketInterval: 2035,
            recoveryDelay: 510,
        },
    },
    {
        index: 13,
        x: 665,
        y: 435,
        enemies: 145,
        enemiesDelay: 2950,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 180,
            aimDelay: 488,
            rocketInterval: 1870,
            recoveryDelay: 476,
        },
    },
    {
        index: 14,
        x: 956,
        y: 261,
        enemies: 200,
        enemiesDelay: 2900,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 183,
            aimDelay: 450,
            rocketInterval: 1705,
            recoveryDelay: 442,
        },
    },
    {
        index: 15,
        x: 676,
        y: 640,
        enemies: 250,
        enemiesDelay: 2850,
        velocity: 4,
        helicopter: {
            ...HELICOPTER_FLIGHT_DEFAULTS,
            speed: 186,
            aimDelay: 412,
            rocketInterval: 1540,
            recoveryDelay: 408,
        },
    },
];

export const UNLIMITED_LEVEL = {
    isUnlim: true,
    index: 15,
    enemies: 1000,
    enemiesDelay: 2000,
    helicopter: { ...CAMPAIGN_LEVELS.at(-1).helicopter },
}

export const LEVEL_HI_SCORES_SEPARATOR = ',';
