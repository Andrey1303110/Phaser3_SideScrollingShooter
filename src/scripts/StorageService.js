export class StorageService {
    static get(key, def, parser) {
        const value = localStorage.getItem(key);
        if (value === null) {
            return def;
        }
        if (parser) {
            return parser(value);
        }
        return value;
    }
  
    static set(key, value) {
        localStorage.setItem(key, value);
    }
}
