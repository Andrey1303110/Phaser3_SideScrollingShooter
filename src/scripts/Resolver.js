import { RESOLVER_STATES } from './identifiers';
export class Resolver {
    constructor() {
        this._state = RESOLVER_STATES.PENDING;
        this._callbacks = [];
    }

    resolve() {
        if (this._state === RESOLVER_STATES.PENDING) {
            this._state = RESOLVER_STATES.RESOLVED;
            this._callbacks.forEach(callback => callback());
        }
    }

    reject() {
        if (this._state === RESOLVER_STATES.PENDING) {
            this._state = RESOLVER_STATES.REJECTED;
            this._callbacks.forEach(callback => callback());
        }
    }

    wait() {
        return new Promise((resolve, reject) => {
            if (this._state !== RESOLVER_STATES.PENDING) {
                this._state === RESOLVER_STATES.RESOLVED ? resolve() : reject();
            } else {
                this._callbacks.push(() => {
                    this._state === RESOLVER_STATES.RESOLVED ? resolve() : reject();
                });
            }
        });
    }
}
  