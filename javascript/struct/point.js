export default class Point {
	x = 0;
	y = 0;
	distance = null;
	angle = null;
	id = null;
	
	/**
	 * Represents a one-dimensional point in 2D space with additional data for relationships to a polygon.
	 * @param {object=} components Components of the point { x?, y?, distance?, angle?, id? }
	 */
	constructor(...args) {
		switch (args.length) {
			case 0:
				this.x = 0;
				this.y = 0;
				break;
			case 1:
				this.x = args[0].x || 0;
				this.y = args[0].y || 0;
				this.id = args[0].id || null;
				this.distance = args[0].distance || null;
				this.angle = args[0].angle || null;
				break;
			case 2:
				this.x = args[0];
				this.y = args[1];
				break;
			default:
				throw new Error("Invalid arguments");
		}
	}

	/**
	 * Set the point to the given position
	 * @param {object} position X and Y components to set the point to { x, y }
	 */
	set(position) {
		this.x = position.x;
		this.y = position.y;
	}
	
	/**
	 * Add two points together and return a new point
	 * @param {Point} point The point to add to this point
	 * @returns {Point} A new point that is the sum of this point and the passed point
	 */
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}

	/**
	 * Add a point to this point
	 * @param {Point} point The point to add to this point
	 * @returns {Point} This point with the given point added
	 */
	_add(point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	}

	/**
	 * Rotate this point around the centerpoint (given by distance) by the given angle
	 * @param {number} angle The angle, in radians, to rotate the point by
	 * @returns {Point} A new point that is the result of rotating this point by the given angle
	 */
	rotate(angle) {
		return new Point({
			x: this.distance * Math.cos(this.angle + angle),
			y: this.distance * Math.sin(this.angle + angle)
		});
	}

	/**
	 * Rotate this point around the centerpoint (given by distance) by the given angle
	 * @param {number} angle The angle, in radians, to rotate the point by
	 * @returns {Point} This point rotated by the given angle
	 */
	_rotate(angle) {
		this.x = this.distance * Math.cos(this.angle + angle);
		this.y = this.distance * Math.sin(this.angle + angle);
		return this;
	}

	/**
	 * Gives a comparable distance between two points. Generally used for comparing with other squared distances.
	 * @param {Point} point1 A point in 2D space
	 * @param {Point} point2 A point in 2D space
	 * @returns {number} The square of the distance between the two points
	 */
	static distanceSqr(point1, point2) {
		return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
	}

	/**
	 * Gives the distance between two points
	 * @param {Point} point1 A point in 2D space
	 * @param {Point} point2 A point in 2D space
	 * @returns {number} The distance between the two points
	 */
	static distance(point1, point2) {
		return Math.sqrt(Point.distanceSqr(point1, point2));
	}

	/**
	 * Subtract two points and return a new point
	 * @param {Point} point1 The point to subtract from
	 * @param {Point} point2 The point to subtract
	 * @returns {Point} A new point that is the result of subtracting the second point from the first point
	 */
	static subtract(point1, point2) {
		return new Point(point1.x - point2.x, point1.y - point2.y);
	}
}