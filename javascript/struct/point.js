export default class Point {
	x = 0;
	y = 0;
	
	constructor(...args) {
		if (args.length === 1) {
			this.x = args[0].x;
			this.y = args[0].y;
		} else if (args.length === 2) {
			this.x = args[0];
			this.y = args[1];
		} else {
			throw new Error("Invalid number of arguments");
		}
	}
	
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}
}