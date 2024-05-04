import Point from "./struct/point.js";
import Polygon from "./struct/polygon.js";
import Store from "./engine/store.js";
import { PolyType } from "./struct/enum.js";
import Vector from "./struct/vector.js";
import Utils from "./engine/utils.js";

Array.prototype.filterInPlace = function (filter) {
	let i, j;
	for (i = 0, j = 0; i < this.length; ++i) {
		if (filter(this[i])) {
			this[j] = this[i];
			++j;
		}
	}
	while (j < this.length) {
		this.pop();
	}
};

Store.SCALE = 30;

Store.init();

// Store.addPolygon(new Polygon([
// 	new Point(100, 100),
// 	new Point(200, 100),
// 	new Point(200, 200),
// 	new Point(100, 200)
// ], PolyType.DYNAMIC));

Store.addPolygon(new Polygon([
	new Point(300, 200),
	new Point(400, 200),
	new Point(300, 300),
	new Point(400, 300)
], PolyType.DYNAMIC));

// Store.addPolygon(new Polygon([
// 	new Point(300, 800),
// 	new Point(400, 800),
// 	new Point(300, 900),
// 	new Point(400, 900)
// ], PolyType.DYNAMIC));

Store.addPolygon(new Polygon([
	new Point(25, 150),
	new Point(200, 150),
	new Point(25, 100),
	new Point(200,100)
], PolyType.STATIC));

Store.polygons[0].addForce(new Vector(4, Math.PI / 2));



document.querySelector("#debug-play").addEventListener("click", () => {
	Store.Clock.resume();
	setTimeout(() => {
		Store.polygons[0].addForce(new Vector(4, Math.PI / 4));
	}, 400);

	setTimeout(() => {
		Store.polygons[0].addForce(new Vector(10, (Math.PI / 8) + Math.PI / 2));
	}, 1200);

	setTimeout(() => {
		Store.polygons[0].addForce(new Vector(8, Math.PI / 4));
	}, 2000);

	setTimeout(() => {
		Store.polygons[0].addForce(new Vector(8, Math.PI - (Math.PI / 8)));
	}, 2400);
});
document.querySelector("#debug-pause").addEventListener("click", () => {
	Store.Clock.pause();
});
document.querySelector("#debug-step").addEventListener("click", () => {
	Store.Clock.pausedAt += (1000 / 60);
	Store.Clock.step(Store.Clock.pausedAt, false);
});

Store.Renderer.render();
Store.Clock.pause();
console.log(Store.sectors);