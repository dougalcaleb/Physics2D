import MappedArray from "./mappedarray.js";

export default class Sector {
	x = null;
	y = null;
	height = null;
	width = null;
	children = {};
	childList = new MappedArray();
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
		this.childList.remove(polyID);
		this.count--;
	}
	
	addChild(polygon) {
		if (this.children[polygon.id]) return;
		this.children[polygon.id] = polygon;
		this.childList.push(polygon);
		this.count++;
	}
}