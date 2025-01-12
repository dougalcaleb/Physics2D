import SimpleVector from "./simplevector.js";

export default class Vector {
	#magnitude = null;
	#angle = null;
	#x = null;
	#y = null;
	origin = { x: 0, y: 0 };

	/**
	 * Represents a 2D vector with x and y components, magnitude, and angle.
	 * @param {object} components Object with vector components (either { x, y } or { magnitude, angle })
	 * @param {object=} origin Origin of the vector
	 */
	constructor(components, origin = null) {
		if (components.x && components.y) {
			this.#x = components.x;
			this.#y = components.y;
		} else if (components.magnitude && components.angle) {
			this.#angle = components.angle;
			this.magnitude = components.magnitude;
		} else {
			throw new Error("Invalid components");
		}

		this.origin = origin || { x: 0, y: 0 };
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

	get angle() {
		if (!this.#angle) {
			this.#angle = Math.atan2(this.#y, this.#x);
		}
		return this.#angle;
	}
	set angle(value) {
		this.#angle = value;
		this.#x = this.#magnitude * Math.cos(this.#angle);
		this.#y = this.#magnitude * Math.sin(this.#angle);
	}

	/**
	 * Set this vector to be a 0 vector
	 * @returns {undefined}
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
	 * @returns {Vector} A new vector that is the sum of this vector and the given vector
	 */
	add(vector) {
		return new Vector({
			x: this.#x + vector.x,
			y: this.#y + vector.y,
			simple
		});
	}

	/**
	 * Modifies this vector to be the sum of itself and the given vector
	 * @param {Vector} vector A vector (or object with an x and y component)
	 * @returns {Vector} This vector, modified to be the sum of itself and the given vector
	 */
	_add(vector) {
		this.#x += vector.x;
		this.#y += vector.y;
		this.#magnitude = Math.hypot(this.#x, this.#y);
		this.#angle = Math.atan2(this.#y, this.#x);
		return this;
	}

	/**
	 * Returns a new vector that is the this vector scaled by the given scalar
	 * @param {Number} scalar A scalar value to multiply the vector by
	 * @returns {Vector} A new vector that is the sum of this vector and the given vector
	 */
	scale(scalar) {
		return new Vector({
			x: this.#x * scalar,
			y: this.#y * scalar
		});
	}

	/**
	 * Scales this vector by the given scalar
	 * @param {float} vector A vector (or object with an x and y component)
	 * @returns {Vector} This vector, modified to be scaled by the given scalar
	 */
	_scale(scalar) {
		this.#x *= scalar;
		this.#y *= scalar;
		this.#magnitude = Math.hypot(this.#x, this.#y);
		return this;
	}

	/**
	 * Returns a unit vector based off of the components of this vector
	 * @returns {Vector} A new vector that is this vector with a magnitude of 1
	 */
	normalize() {
		return new Vector({
			x: this.#x / this.#magnitude || 0,
			y: this.#y / this.#magnitude || 0
		});
	}

	/**
	 * Normalizes this vector to have a magnitude of 1
	 * @returns {Vector} This vector, modified to have a magnitude of 1
	 */
	_normalize() {
		if (this.#magnitude) {
			this.#x /= this.#magnitude;
			this.#y /= this.#magnitude;
			this.#magnitude = 1;
		}
		return this;
	}

	/**
	 * Projects this vector onto another vector
	 * @param {Vector} vector The vector to project this vector onto
	 * @returns {Vector} This vector, modified to be the projection of itself onto the given vector
	 */
	_project(vector) {
		const dotBoth = (this.x * vector.x) + (this.y * vector.y);
		const dotSelf = (vector.x * vector.x) + (vector.y * vector.y);
		if (!dotSelf) {
			this._scale(0);
		} else {
			this._scale(dotBoth / dotSelf);
		}
		return this;
	}

	/**
	 * Returns the perpendicular vector to this vector
	 * @returns {Vector} A new vector that is perpendicular to this vector
	 */
	perpendicular() {
		return new Vector({
			x: -this.y,
			y: this.x
		});
	}

	/**
	 * Makes this vector perpendicular to its original direction
	 * @returns {Vector} This vector, modified to be perpendicular to its original direction
	 */
	_perpendicular() {
		const temp = this.#x;
		this.#x = -this.#y;
		this.#y = temp;
		return this;
	}

	/**
	 * Creates a simplified version of this vector (no magnitude or angle)
	 * @returns {SimpleVector} A simple vector with the same components as this vector
	 */
	simple() {
		return new SimpleVector({ x: this.#x, y: this.#y });
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