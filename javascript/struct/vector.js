export default class Vector {
	magnitude = null;
	angle = null;
	x = null;
	y = null;

	constructor(magnitude, angle) {
		this.magnitude = magnitude;
		this.angle = angle;
		this.x = this.magnitude * Math.cos(this.angle);
		this.y = this.magnitude * Math.sin(this.angle);
	}

	add(vector) {
		return new Vector(
			Math.sqrt(Math.pow(this.x + vector.x, 2) + Math.pow(this.y + vector.y, 2)),
			Math.atan2(this.y + vector.y, this.x + vector.x)
		)
	}

	addInPlace(vector) {
		this.x += vector.x;
		this.y += vector.y;
		this.magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		this.angle = Math.atan2(this.y, this.x);
	}

	reset() {
		this.x = 0;
		this.y = 0;
		this.magnitude = 0;
		this.angle = 0;
	}

	divide(scalar) {
		return new Vector(
			Math.sqrt(Math.pow(this.x / scalar, 2) + Math.pow(this.y / scalar, 2)),
			Math.atan2(this.y / scalar, this.x / scalar)
		)
	}
}