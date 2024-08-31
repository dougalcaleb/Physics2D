export default class Vector {
	#magnitude = null;
	#angle = null;
	#x = null;
	#y = null;
	#isSimple = true;
	origin = { x: 0, y: 0 };

	/**
	 * Vector class. Represents a 2D vector with x and y components.
	 * @param {Object} args Object with vector components { x, y, origin?, simple? }
	 * @param {...any} args Magnitude and angle [ magnitude, angle ]
	 */
	constructor(...args) {
		if (args.length === 2) {
			this.#angle = args[1];
			this.magnitude = args[0];
			this.#isSimple = false;
		} else if (args.length === 1) {
			this.#x = args[0].x;
			this.#y = args[0].y;
			if (!args[0].simple) {
				this.#magnitude = Math.hypot(this.#x, this.#y);
				this.#angle = Math.atan2(this.#y, this.#x);
				this.#isSimple = false;
			}
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
		this.#magnitude = Math.hypot(this.#x, this.#y);
		this.#angle = Math.atan2(this.#y, this.#x);
	}

	get y() { return this.#y; }
	set y(value) {
		this.#y = value;
		this.magnitude = Math.hypot(this.#x, this.#y);
		this.#angle = Math.atan2(this.#y, this.#x);
	}

	get angle() { return this.#angle; }
	set angle(value) {
		this.#angle = value;
		this.#x = this.#magnitude * Math.cos(this.#angle);
		this.#y = this.#magnitude * Math.sin(this.#angle);
	}

	/**
	 * Set this vector to be a 0 vector
	 */
	reset() {
		this.#x = 0;
		this.#y = 0;
		this.magnitude = 0;
		this.#angle = 0;
	}

	/**
	 * Returns a new vector that is the sum of this vector and the given vector
	 * @param {Vector} vector A vector (or object with an x and y component)
	 * @param {Boolean} simple Whether to return a simple vector or a full vector with magnitude and angle
	 * @returns {Vector} A new vector that is the sum of this vector and the passed vector
	 */
	add(vector, simple = false) {
		return new Vector({
			x: this.#x + vector.x,
			y: this.#y + vector.y,
			simple
		});
	}

	/**
	 * Modifies this vector to be the sum of itself and the given vector
	 * @param {Vector} vector A vector (or object with an x and y component)
	 */
	_add(vector) {
		this.#x += vector.x;
		this.#y += vector.y;
		this.#magnitude = Math.hypot(this.#x, this.#y);
		this.#angle = Math.atan2(this.#y, this.#x);
		return this;
	}

	divide(scalar, simple = false) {
		return new Vector({
			x: this.#x / scalar,
			y: this.#y / scalar,
			simple
		});
	}

	/**
	 * Returns a new vector that is the this vector scaled by the given scalar
	 * @param {Number} scalar A scalar value to multiply the vector by
	 * @param {Boolean} simple Whether to return a simple vector or a full vector with magnitude and angle
	 * @returns {Vector} A new vector that is the sum of this vector and the passed vector
	 */
	scale(scalar, simple = false) {
		return new Vector({
			x: this.#x * scalar,
			y: this.#y * scalar,
			simple
		});
	}

	/**
	 * Scales this vector by the given scalar
	 * @param {Number} vector A vector (or object with an x and y component)
	 */
	_scale(scalar) {
		this.#x *= scalar;
		this.#y *= scalar;
		if (!this.#isSimple) {
			this.#magnitude = Math.hypot(this.#x, this.#y);
		}
		return this;
	}

	/**
	 * Returns a unit vector based off of the components of this vector
	 * @param {Boolean} simple Whether to return a simple vector or a full vector with magnitude and angle
	 * @returns {Vector} A new vector that is this vector with a magnitude of 1
	 */
	normalize(simple) {
		return new Vector({
			x: this.#x / this.#magnitude,
			y: this.#y / this.#magnitude,
			simple
		});
	}

	/**
	 * Normalizes this vector to have a magnitude of 1
	 */
	_normalize() {
		this.#x /= this.#magnitude;
		this.#y /= this.#magnitude;
		this.#magnitude = 1;
		return this;
	}

	/**
	 * Dot product of two vectors. Positive value indicates vectors are in the same direction, negative value indicates vectors are in opposite directions
	 * @param {Vector} vector1 A vector (or object with an x and y component)
	 * @param {Vector} vector2 A vector (or object with an x and y component)
	 * @returns {Number} The dot product of the two vectors
	 */
	static dot(vector1, vector2) {
		return (vector1.x * vector2.x) + (vector1.y * vector2.y);
	}

	/**
	 * Magnitude of a vector
	 * @param {Vector} vector A vector (or object with an x and y component)
	 * @returns {Number} The magnitude of the vector
	 */
	static magnitude(vector) {
		return Math.hypot(vector.x, vector.y);
	}

	/**
	 * Magnitude of a vector squared. Useful for comparisons
	 * @param {Vector} vector A vector (or object with an x and y component)
	 * @returns {Number} The square of the magnitude of the vector
	 */
	static magnitudeSqr(vector) {
		return (vector.x ** 2) + (vector.y ** 2);
	}

	/**
	 * Returns vector1 projected onto vector2. This is the vector that lies parallel to vector2 and is the components of vector1 in that direction.
	 * @param {Vector} vector1 A vector (or object with an x and y component)
	 * @param {Vector} vector2 A vector (or object with an x and y component)
	 * @returns {Vector} The projection of vector1 onto vector2
	 */
	static project(vector1, vector2) {
		const dotBoth = (vector1.x * vector2.x) + (vector1.y * vector2.y);
		const dotSelf = (vector2.x * vector2.x) + (vector2.y * vector2.y);
		return vector2.scale(dotBoth / dotSelf);
	}
}