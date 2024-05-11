export default class Point {
	x = 0;
	y = 0;
	id = null;
	
	constructor(...args) {
		if (args.length === 1) {
			this.x = args[0].x;
			this.y = args[0].y;
			this.id = args[0].id || null;
		} else if (args.length === 2) {
			this.x = args[0];
			this.y = args[1];
		} else {
			throw new Error("Invalid number of arguments");
		}
	}

	set(position) {
		this.x = position.x;
		this.y = position.y;
	}
	
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}

	rotateInPlace(angle) {
		const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		const currentAngle = Math.atan2(this.y, this.x);
		this.x = magnitude * Math.cos(currentAngle + angle);
		this.y = magnitude * Math.sin(currentAngle + angle);
	}

	rotate(angle) {
		const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		const currentAngle = Math.atan2(this.y, this.x);
		return {
			x: magnitude * Math.cos(currentAngle + angle),
			y: magnitude * Math.sin(currentAngle + angle)
		}
	}

	static distanceSqr(point1, point2) {
		return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
	}

	static distance(point1, point2) {
		return Math.sqrt(Point.distanceSqr(point1, point2));
	}
}