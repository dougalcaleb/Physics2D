export default class Sector {
	x = null;
	y = null;
	height = null;
	width = null;
	children = {};
	childList = [];
	count = 0;

	constructor(x, y, height, width) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
	}

	removeChild(polyID) {
		if (!this.children[polyID]) return;
		delete this.children[polyID];
		this.childList.filterInPlace(polygon => polygon.id !== polyID);
		this.count--;
	}
	
	addChild(polygon) {
		if (this.children[polygon.id]) return;
		this.children[polygon.id] = polygon;
		this.childList.push(polygon);
		this.count++;
	}
}