export const SCENE_NAMES = {
    boot: 'Boot',
    preload: 'Preload',
    main: 'Levels',
    campaign: 'Campaign',
    game: 'GameScene',
    upgrade: 'Upgrade',
    pause: 'Pause',
}

export const EVENTS = {     
    killed: 'killed',
    allEnemiesKilled: 'enemies-killed',
    update: 'update',
}

// Only .png + .json
export const ATLASES_FILES = ['dragon', 'jet', 'strategic_jet', 'helicopter', 'boom'];

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
