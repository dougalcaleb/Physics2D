export default class Sector {
	x = null;
	y = null;
	height = null;
	width = null;
	children = {};

	constructor(x, y, height, width) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
	}

	removeChild(polyID) {
		delete this.children[polyID];
	}
	
	addChild(polygon) {
		this.children[polygon.id] = polygon;
	}
}