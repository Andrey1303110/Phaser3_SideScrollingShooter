import { TEXTURE_KEYS } from './identifiers';

// 1.8 artwork has twice the pixel density, with unchanged world-space sizes.
export const ACTOR_ART_DENSITY = 2;
const detailedAtlases = new Set([
    TEXTURE_KEYS.DRAGON, TEXTURE_KEYS.JET, TEXTURE_KEYS.STRATEGIC_JET, TEXTURE_KEYS.HELICOPTER,
]);

export function actorArtDensity(texture) {
    return detailedAtlases.has(texture) ? ACTOR_ART_DENSITY : 1;
}
