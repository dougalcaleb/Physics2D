export default class Clock {
	paused = false;
	pausedAt = null;
	delta = 0;
	framerate = 0;
	doFramerate = true;

	_lastTick = 0;
	_subscribers = [];
	_framerates = [];
	_getAvgFramerateEvery = 1;
	_framerateAvgCount = 5;
	_frame = 0;

	#sinceLastAvg = 0;
	#framerateOutput = null;

	#env = null;

	constructor(env, calculateFramerate = true) {
		this.#env = env;
		this.doFramerate = calculateFramerate;
		this.step = this.step.bind(this);
		if (this.doFramerate) {
			this.#framerateOutput = document.querySelector("#framerate");
		}
	}
	
	start() {
		if (this.paused) {
			this.paused = false;
			this._lastTick = performance.now();
			this.step(this._lastTick, true);
		} else {
			this._lastTick = performance.now();
			window.requestAnimationFrame(this.step);
		}
	}

	// todo:
	// - on completed mode (runs next step ASAP, regardless of window framerate)
	// - fixed physics step mode (run physics at a fixed rate, render at window framerate)
	step(timestamp, cont = true) {
		this._frame++;
		this.delta = (timestamp - this._lastTick) / 1000;
		this._subscribers.forEach(subscriber => subscriber(this.delta));
		this._lastTick = timestamp;

		if (this.doFramerate) {
			this._framerates.push(1 / this.delta);
			this.#sinceLastAvg += this.delta;
			if (this._framerates.length > this._framerateAvgCount) {
				this._framerates.shift();
			}
			if (this.#sinceLastAvg >= this._getAvgFramerateEvery) {
				this.framerate = this._framerates.reduce((acc, curr) => acc + curr, 0) / this._framerates.length;
				this.#sinceLastAvg = 0;
			}
			this.#framerateOutput.innerText = `${this.framerate.toFixed(1)}fps Frame ${this._frame}`;
		}

		if (cont && !this.paused) {
			window.requestAnimationFrame(this.step);
		}
	}

	pause() {
		this.paused = true;
		this.pausedAt = performance.now();
	}

	subscribeAfter(callback) {
		this._subscribers.push(callback);
	}

	subscribeBefore(callback) {
		this._subscribers.unshift(callback);
	}
}