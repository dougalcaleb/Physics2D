export default class Vector {
	#magnitude = null;
	#angle = null;
	#x = null;
	#y = null;
	origin = { x: 0, y: 0};

	constructor(...args) {
		if (args.length === 2) {
			this.#angle = args[1];
			this.magnitude = args[0];
		} else if (args.length === 1) {
			this.#x = args[0].x;
			this.#y = args[0].y;
			this.#magnitude = Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
			this.#angle = Math.atan2(this.#y, this.#x);
			this.origin = args[0].origin || { x: 0, y: 0 };
		} else {
			throw new Error("Invalid number of arguments");
		}
	}

	get magnitude() { return this.#magnitude; }
	set magnitude(value) {
		this.#x = value * Math.cos(this.#angle);
		this.#y = value * Math.sin(this.#angle);
		this.#magnitude = value;
	}

	get x() { return this.#x; }
	set x(value) {
		this.#x = value;
		this.#magnitude = Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
		this.#angle = Math.atan2(this.#y, this.#x);
	}

	get y() { return this.#y; }
	set y(value) {
		this.#y = value;
		this.magnitude = Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
		this.#angle = Math.atan2(this.#y, this.#x);
	}

	get angle() { return this.#angle; }
	set angle(value) {
		this.#angle = value;
		this.#x = this.#magnitude * Math.cos(this.#angle);
		this.#y = this.#magnitude * Math.sin(this.#angle);
	}

	add(vector) {
		return new Vector(
			Math.sqrt(Math.pow(this.#x + vector.x, 2) + Math.pow(this.#y + vector.y, 2)),
			Math.atan2(this.#y + vector.y, this.#x + vector.x)
		)
	}

	addInPlace(vector) {
		this.#x += vector.x;
		this.#y += vector.y;
		this.#magnitude = Math.sqrt(Math.pow(this.#x, 2) + Math.pow(this.#y, 2));
		this.#angle = Math.atan2(this.#y, this.#x);
	}

	reset() {
		this.#x = 0;
		this.#y = 0;
		this.magnitude = 0;
		this.#angle = 0;
	}

	divide(scalar) {
		return new Vector(
			Math.sqrt(Math.pow(this.#x / scalar, 2) + Math.pow(this.#y / scalar, 2)),
			Math.atan2(this.#y / scalar, this.#x / scalar)
		)
	}

	dot(vector) {
		return (this.#x * vector.x) + (this.#y * vector.y);
	}

	static dot(vector1, vector2) {
		return (vector1.x * vector2.x) + (vector1.y * vector2.y);
	}
}