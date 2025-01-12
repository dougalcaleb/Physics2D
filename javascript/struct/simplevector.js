import Vector from "./vector.js";

export default class SimpleVector {
	#x = null;
	#y = null;
	origin = null;

	/**
	 * Represents a 2D vector with x and y components.
	 * @param {object} components Object with vector components { x, y }
	 * @param {object=} origin Origin of the vector
	 */
	constructor(components, origin = null) {
		this.#x = components?.x || 0;
		this.#y = components?.y || 0;
		this.origin = origin || { x: 0, y: 0 };
	}

	get x() { return this.#x; }
	set x(value) {
		this.#x = value;
	}

	get y() { return this.#y; }
	set y(value) {
		this.#y = value;
	}

	/**
	 * Set this vector to be a 0 vector
	 */
	reset() {
		this.#x = 0;
		this.#y = 0;
	}

	/**
	 * Returns a new vector that is the sum of this vector and the given vector
	 * @param {Vector | SimpleVector} vector A vector (or object with an x and y component)
	 * @returns {SimpleVector} A new vector that is the sum of this vector and the passed vector
	 */
	add(vector) {
		return new SimpleVector({
			x: this.#x + vector.x,
			y: this.#y + vector.y,
		});
	}

	/**
	 * Modifies this vector to be the sum of itself and the given vector
	 * @param {Vector | SimpleVector} vector A vector (or object with an x and y component)
	 * @returns {SimpleVector} This vector, modified to be the sum of itself and the given vector
	 */
	_add(vector) {
		this.#x += vector.x;
		this.#y += vector.y;
		return this;
	}

	/**
	 * Returns a new vector that is the this vector scaled by the given scalar
	 * @param {Number} scalar A scalar value to multiply the vector by
	 * @returns {SimpleVector} A new vector that is the sum of this vector and the passed vector
	 */
	scale(scalar) {
		return new SimpleVector({
			x: this.#x * scalar,
			y: this.#y * scalar
		});
	}

	/**
	 * Scales this vector by the given scalar
	 * @param {Number} vector A vector (or object with an x and y component)
	 * @returns {SimpleVector} This vector, modified to be the sum of itself and the given vector
	 */
	_scale(scalar) {
		this.#x *= scalar;
		this.#y *= scalar;
		return this;
	}

	/**
	 * Returns a unit vector based off of the components of this vector
	 * @returns {SimpleVector} A new vector that is this vector with a magnitude of 1
	 */
	normalize() {
		const magnitude = Math.hypot(this.#x, this.#y);
		return new SimpleVector({
			x: this.#x / magnitude,
			y: this.#y / magnitude
		});
	}

	/**
	 * Normalizes this vector to have a magnitude of 1
	 * @returns {SimpleVector} This vector, modified to have a magnitude of 1
	 */
	_normalize() {
		const magnitude = Math.hypot(this.#x, this.#y);
		if (!magnitude) {
			return this;
		}
		this.#x /= magnitude;
		this.#y /= magnitude;
		return this;
	}

	/**
	 * Projects this vector onto another vector
	 * @param {Vector | SimpleVector} vector The vector to project this vector onto
	 * @returns {SimpleVector} This vector, modified to be the projection of itself onto the given vector
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
	 * @returns {SimpleVector} A new vector that is perpendicular to this vector
	 */
	perpendicular() {
		return new SimpleVector({
			x: -this.y,
			y: this.x
		});
	}

	/**
	 * Makes this vector perpendicular to its original direction
	 * @returns {SimpleVector} This vector, modified to be perpendicular to its original direction
	 */
	_perpendicular() {
		const temp = this.#x;
		this.#x = -this.#y;
		this.#y = temp;
		return this;
	}

	/**
	 * Creates the full complex representation of this vector (including magnitude and angle)
	 * @returns {Vector} A new vector that is the complex representation of this vector
	 */
	complex() {
		return new Vector({ x: this.#x, y: this.#y });
	}
}