export const SCENE_NAMES = {
    BOOT: 'Boot',
    DISCLAIMER: 'Disclaimer',
    SET_LANGUAGE: 'SetLanguage',
    PRELOAD: 'Preload',
    MAIN_MENU: 'MainMenu',
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
export const ATLAS_FILES = ['dragon', 'jet', 'strategic_jet', 'helicopter', 'boom'];

// Only .png
export const IMAGE_FILES = ['fire', 'flag', 'rocket', 'missile', 'missile_2', 'map', 'ruby', 'return', 'pause', 'scale', 'reload', 'velocity', 'progress_bar', 'progress_bar_fill', 'skobeeva', 'chief_commander', 'commander', 'president', 'next', 'life_icon', 'health_bar_empty', 'health_bar_fill', 'health', 'explosion_particle', 'fire_button', 'trees_mid', 'trees_near'];

// Matches the level order and atmosphere specified in game_parallax/README.txt.
export const LEVEL_BACKGROUNDS = [
    { clouds: 'clouds_night', celestial: 'moon' },
    { clouds: 'clouds_day', celestial: 'sun' },
    { clouds: 'clouds_dawn', celestial: 'sun' },
    { clouds: 'clouds_sunset', celestial: 'sun' },
    { clouds: 'clouds_night', celestial: null },
    { clouds: 'clouds_day', celestial: 'sun' },
    { clouds: 'clouds_night', celestial: 'moon' },
    { clouds: 'clouds_sunset', celestial: 'sun' },
    { clouds: 'clouds_dawn', celestial: 'sun' },
    { clouds: 'clouds_day', celestial: 'sun' },
    { clouds: 'clouds_night', celestial: null },
    { clouds: 'clouds_day', celestial: 'sun' },
    { clouds: 'clouds_night', celestial: 'moon' },
    { clouds: 'clouds_dawn', celestial: 'sun' },
    { clouds: 'clouds_sunset', celestial: 'sun' },
];

export const PARALLAX_IMAGE_FILES = ['sun', 'moon', 'clouds_day', 'clouds_dawn', 'clouds_sunset', 'clouds_night'];

// Only .mp3
export const AUDIO_FILES = ['error', 'rocket_launch', 'fire_launch', 'missile_launch', 'missile_2_launch', 'explosion_small', 'wings', 'ready', 'lose', 'win', 'upgrade', 'level_up', 'whoosh', 'click', 'fire_effect', 'campaign_complete_song'];

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
        texture: 'fire',
        sound: 'fire_launch',
    },
    ROCKET: {
        reload: 1750,
        velocity: -350,
        maxSpeed: -350,
        acceleration: -400,
        particlesSetting: {
            quantity: 10,
            speedX: { min: -25, max: -100 },
            speedY: { min: -100, max: 100 },
            lifespan: { min: 25, max: 100 },
            alpha: { start: 0.35, end: 0 },
            scale: { start: 0.1, end: 0.2 },
            tint: 0xC4ADAD
        },
        scale: 0.4,
        damage: 25,
        reward: 100,
        texture: 'rocket',
        sound: 'rocket_launch',
    },
    MISSILE: {
        reload: 2000,
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
        texture: 'missile',
        sound: 'missile_launch',
    },
    MISSILE_2: {
        reload: 2500,
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
        texture: 'missile_2',
        sound: 'missile_2_launch',
    }
};

export const ENEMIES = {
    HELICOPTER: {
        weapon: WEAPONS.ROCKET,
        scale: 0.9,
        texture: 'helicopter',
        frames: 4,
        reward: 275,
        entryLevel: 0,
    },
    JET: {
        velocity: -250,
        weapon: WEAPONS.MISSILE,
        scale: 0.76,
        texture: 'jet',
        frames: 4,
        reward: 375,
        entryLevel: 5,
    },
    STRATEGIC_JET: {
        velocity: -200,
        weapon: WEAPONS.MISSILE_2,
        scale: 0.85,
        texture: 'strategic_jet',
        frames: 4,
        reward: 500,
        entryLevel: 10,
    },
};

// Shared maneuver settings. Speed is in pixels/second; delays are in milliseconds.
// rocketInterval is the minimum between launches; moving and aiming may extend it.
export const HELICOPTER_FLIGHT_DEFAULTS = {
    shots: { min: 3, max: 5 },
    approachPercent: { min: 68, max: 82 },
    advancePercent: { min: 12, max: 22 },
    altitudePercent: { min: 18, max: 30 },
    altitudeChangeChance: 0.5,
    exitMargin: 0.18,
    heightPadding: 12,
    arrivalDistance: 5,
    arrivalSpeed: 14,
    slowdown: 3,
    steeringTime: 160,
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
            speed: 60,
            aimDelay: 2500,
            rocketInterval: 7000,
            recoveryDelay: 1300,
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
            speed: 65,
            aimDelay: 2400,
            rocketInterval: 6700,
            recoveryDelay: 1250,
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
            speed: 70,
            aimDelay: 2300,
            rocketInterval: 6400,
            recoveryDelay: 1200,
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
            speed: 75,
            aimDelay: 2200,
            rocketInterval: 6100,
            recoveryDelay: 1150,
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
            speed: 80,
            aimDelay: 2100,
            rocketInterval: 5800,
            recoveryDelay: 1100,
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
            speed: 85,
            aimDelay: 2000,
            rocketInterval: 5500,
            recoveryDelay: 1050,
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
            speed: 90,
            aimDelay: 1900,
            rocketInterval: 5200,
            recoveryDelay: 1000,
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
            speed: 95,
            aimDelay: 1800,
            rocketInterval: 4900,
            recoveryDelay: 950,
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
            speed: 100,
            aimDelay: 1700,
            rocketInterval: 4600,
            recoveryDelay: 900,
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
            speed: 105,
            aimDelay: 1600,
            rocketInterval: 4300,
            recoveryDelay: 850,
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
            speed: 110,
            aimDelay: 1500,
            rocketInterval: 4000,
            recoveryDelay: 800,
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
            speed: 115,
            aimDelay: 1400,
            rocketInterval: 3700,
            recoveryDelay: 750,
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
            speed: 120,
            aimDelay: 1300,
            rocketInterval: 3400,
            recoveryDelay: 700,
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
            speed: 125,
            aimDelay: 1200,
            rocketInterval: 3100,
            recoveryDelay: 650,
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
            speed: 130,
            aimDelay: 1100,
            rocketInterval: 2800,
            recoveryDelay: 600,
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
