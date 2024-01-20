export class Resolver {
    constructor() {
        this._state = 'pending';
        this._callbacks = [];
    }

    resolve() {
        if (this._state === 'pending') {
            this._state = 'resolved';
            this._callbacks.forEach(callback => callback());
        }
    }

    reject() {
        if (this._state === 'pending') {
            this._state = 'rejected';
            this._callbacks.forEach(callback => callback());
        }
    }

    wait() {
        return new Promise((resolve, reject) => {
            if (this._state !== 'pending') {
                this._state === 'resolved' ? resolve() : reject();
            } else {
                this._callbacks.push(() => {
                    this._state === 'resolved' ? resolve() : reject();
                });
            }
        });
    }
}
  