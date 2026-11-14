import { screenData } from '../Utils';

export class HelicopterFlight {
    constructor(helicopter, config) {
        this.helicopter = helicopter;
        this.config = config;
        this.state = 'stopped';
    }

    start() {
        const helicopter = this.helicopter;
        this._shots = 0;
        this._shotLimit = Phaser.Math.Between(this.config.shots.min, this.config.shots.max);
        this._cooldown = 0;
        this._setTarget(screenData.left + screenData.width
            * Phaser.Math.Between(this.config.approachPercent.min, this.config.approachPercent.max) / 100,
            this._clampHeight(helicopter.y), 'approach');
        helicopter.body.setVelocity(helicopter.velocity, 0);
    }

    stop() {
        this.state = 'stopped';
        this.helicopter.body.stop();
    }

    update(delta) {
        if (this.state === 'stopped') return;
        this._cooldown = Math.max(0, this._cooldown - delta);

        switch (this.state) {
            case 'approach':
            case 'advance':
            case 'climb':
                this._flyToTarget(delta);
                break;
            case 'aim':
                this._wait -= delta;
                if (this._wait <= 0 && this._cooldown === 0) {
                    this.helicopter._shooting();
                    this._shots++;
                    this._cooldown = this.config.rocketInterval;
                    this._wait = this.config.recoveryDelay;
                    this.state = 'recover';
                }
                break;
            case 'recover':
                this._wait -= delta;
                if (this._wait <= 0) this._chooseManeuver();
                break;
            case 'exit':
                this._steer(this.helicopter.velocity, 0, delta);
                break;
        }

        // A slight forward pitch follows movement and levels out during hovering.
        const helicopter = this.helicopter;
        const tilt = helicopter.body.velocity.x / this.config.speed * this.config.maxTilt;
        helicopter.rotation += (tilt - helicopter.rotation) * (1 - Math.exp(-delta / this.config.steeringTime));
    }

    _setTarget(x, y, state) {
        this._targetX = x;
        this._targetY = y;
        this.state = state;
    }

    _flyToTarget(delta) {
        const helicopter = this.helicopter;
        const dx = this._targetX - helicopter.x;
        const dy = this._targetY - helicopter.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.config.arrivalDistance && helicopter.body.velocity.length() < this.config.arrivalSpeed) {
            helicopter.body.stop();
            this._wait = this.config.aimDelay;
            this.state = 'aim';
            return;
        }

        const speed = Math.min(this.config.speed, distance * this.config.slowdown);
        const length = distance || 1;
        this._steer(dx / length * speed, dy / length * speed, delta);
    }

    _steer(x, y, delta) {
        const body = this.helicopter.body;
        const blend = 1 - Math.exp(-delta / this.config.steeringTime);
        body.setVelocity(body.velocity.x + (x - body.velocity.x) * blend,
            body.velocity.y + (y - body.velocity.y) * blend);
    }

    _chooseManeuver() {
        const helicopter = this.helicopter;
        const exitLine = screenData.left + helicopter.displayWidth / 2 + screenData.width * this.config.exitMargin;
        if (this._shots >= this._shotLimit || helicopter.x <= exitLine + this.config.arrivalDistance) {
            this.state = 'exit';
            return;
        }

        if (Phaser.Math.Between(0, 99) < this.config.altitudeChangeChance * 100) {
            let offset = screenData.height
                * Phaser.Math.Between(this.config.altitudePercent.min, this.config.altitudePercent.max) / 100;
            if (Phaser.Math.Between(0, 1) === 0) offset = -offset;
            const target = helicopter.y + offset;
            const y = this._clampHeight(target) === target ? target : this._clampHeight(helicopter.y - offset);
            this._setTarget(helicopter.x, y, 'climb');
        } else {
            const distance = screenData.width
                * Phaser.Math.Between(this.config.advancePercent.min, this.config.advancePercent.max) / 100;
            this._setTarget(Math.max(exitLine, helicopter.x - distance), helicopter.y, 'advance');
        }
    }

    _clampHeight(y) {
        const margin = this.helicopter.displayHeight / 2 + this.config.heightPadding;
        return Phaser.Math.Clamp(y, screenData.top + margin, screenData.bottom - margin);
    }
}
