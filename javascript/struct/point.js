export default class Point {
	x = 0;
	y = 0;
	distance = null;
	angle = null;
	id = null;
	
	constructor(...args) {
		if (args.length === 1) {
			this.x = args[0].x;
			this.y = args[0].y;
			this.id = args[0].id ?? null;
			this.distance = args[0].distance ?? null;
			this.angle = args[0].angle ?? null;
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

	_add(point) {
		this.x += point.x;
		this.y += point.y;
	}

	rotate(angle) {
		return {
			x: this.distance * Math.cos(this.angle + angle),
			y: this.distance * Math.sin(this.angle + angle)
		}
	}

	_rotate(angle) {
		this.x = this.distance * Math.cos(this.angle + angle);
		this.y = this.distance * Math.sin(this.angle + angle);
	}

	static distanceSqr(point1, point2) {
		return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
	}

	static distance(point1, point2) {
		return Math.sqrt(Point.distanceSqr(point1, point2));
	}

	static subtract(point1, point2) {
		return new Point(point1.x - point2.x, point1.y - point2.y);
	}
}