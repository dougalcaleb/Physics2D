export default class Clock {
	targetInterval = null;

	_lastTick = 0;
	_subscribers = [];

	constructor(targetInterval = 15) {
		this.targetInterval = targetInterval;
		this.step = this.step.bind(this);
	}
	
	start() {
		window.requestAnimationFrame(this.step);
	}

	step(timestamp) {
		if (timestamp - this._lastTick >= this.targetInterval) {
			const delta = timestamp - this._lastTick;
			this._subscribers.forEach(subscriber => subscriber(delta));
			this._lastTick = timestamp;
		}
		window.requestAnimationFrame(this._timer);
	}

	subscribe(callback) {
		this._subscribers.push(callback);
	}
}