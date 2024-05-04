export default class Clock {
	targetInterval = null;

	_lastTick = 0;
	_subscribers = [];

	#throttleStep = 50;

	constructor(targetInterval = 15) {
		this.targetInterval = targetInterval;
		this.step = this.step.bind(this);
	}
	
	start() {
		window.requestAnimationFrame(this.step);
	}

	step(timestamp) {
		console.log('step');
		if (timestamp - this._lastTick >= this.targetInterval) {
			const delta = timestamp - this._lastTick;
			this._subscribers.forEach(subscriber => subscriber(delta));
			this._lastTick = timestamp;
		}
		if (this.#throttleStep) {
			setTimeout(() => {
				window.requestAnimationFrame(this.step);
			}, this.#throttleStep);
		} else {
			window.requestAnimationFrame(this.step);
		}
	}

	subscribe(callback) {
		this._subscribers.push(callback);
	}
}