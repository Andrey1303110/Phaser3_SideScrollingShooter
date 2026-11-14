export class StorageService {
    static get(key, def, parser) {
        let value;
        try {
            value = localStorage.getItem(key);
        } catch {
            return def;
        }
        if (value === null) {
            return def;
        }
        const parsed = parser ? parser(value) : value;
        return typeof parsed === 'number' && !Number.isFinite(parsed) ? def : parsed;
    }
  
    static set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Keep the game playable when browser storage is unavailable or full.
        }
    }
}
