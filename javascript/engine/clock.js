export default class Clock {
	targetInterval = null;
	paused = false;
	pausedAt = null;

	_lastTick = 0;
	_subscribers = [];

	constructor(targetInterval = 15) {
		this.targetInterval = targetInterval;
		this.step = this.step.bind(this);
	}
	
	start() {
		this._lastTick = performance.now();
		window.requestAnimationFrame(this.step);
	}

	step(timestamp, cont = true) {
		console.log("Clock tick");
		if (timestamp - this._lastTick >= this.targetInterval) {
			const delta = (timestamp - this._lastTick) / 1000;
			this._subscribers.forEach(subscriber => subscriber(delta));
			this._lastTick = timestamp;
		}
		if (cont && !this.paused) {
			window.requestAnimationFrame(this.step);
		}
	}

	pause() {
		console.log("Clock paused");
		this.paused = true;
		this.pausedAt = performance.now();
	}

	resume() {
		this.paused = false;
		this._lastTick = performance.now();
		this.step(this.pausedAt, true);
	}

	subscribe(callback) {
		this._subscribers.push(callback);
	}
}