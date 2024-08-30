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

Store.SCALE = 60;

Store.init();

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(1, 1),
// 		new Point(1, -1),
// 		new Point(-1, 1),
// 		new Point(-1, -1)
// 	],
// 	type: PolyType.DYNAMIC,
// 	position: new Point(8, 14),
// 	restitution: 0.5,
// 	// angularDrag: 110,
// 	// rotation: 1.1
// }));

Store.addPolygon(new Polygon({
	vertices: [
		new Point(5, 0.5),
		new Point(5, -0.5),
		new Point(-5, 0.5),
		new Point(-5, -0.5)
	],
	type: PolyType.DYNAMIC,
	position: new Point(10, 14),
	restitution: 0.8,
	// angularDrag: 110,
	rotation: -0.1 
}));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8, 1.4),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.2)
// 	],
// 	type: PolyType.DYNAMIC,
// 	position: new Point(4, 10.5)
// }));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8, 1.4),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.2)
// 	],
// 	type: PolyType.DYNAMIC,
// 	position: new Point(25, 5)
// }));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-1.5, 0.5),
// 		new Point(-1.5, -0.5)
// 	],
// 	type: PolyType.STATIC,
// 	position: new Point(2, 2)
// }));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-0.5, 0.5),
// 		new Point(-0.5, -0.5)
// 	],
// 	type: PolyType.STATIC,
// 	position: new Point(4, 12),
// 	rotation: -0.3,
// }));

// floor
Store.addPolygon(new Polygon({
	vertices: [
		new Point(30, 0.5),
		new Point(30, -0.5),
		new Point(-1.5, 0.5),
		new Point(-1.5, -0.5)
	],
	type: PolyType.STATIC,
	position: new Point(2, 2)
}));

// floating platform
Store.addPolygon(new Polygon({
	vertices: [
		new Point(10, 0.5),
		new Point(10, -0.5),
		new Point(-1, 0.5),
		new Point(-1, -0.5)
	],
	type: PolyType.STATIC,
	position: new Point(15, 8.5)
}));

// left wall
Store.addPolygon(new Polygon({
	vertices: [
		new Point(0.5, 8),
		new Point(0.5, -3.9),
		new Point(-1.5, 8),
		new Point(-1.5, -3.9)
	],
	type: PolyType.STATIC,
	position: new Point(2, 6.5)
}));

// right wall
Store.addPolygon(new Polygon({
	vertices: [
		new Point(0.5, 8),
		new Point(0.5, -3.9),
		new Point(-1.5, 8),
		new Point(-1.5, -3.9)
	],
	type: PolyType.STATIC,
	position: new Point(30, 6.5)
}));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-1.5, 0.5),
// 		new Point(-1.5, -0.5)
// 	],
// 	type: PolyType.STATIC,
// 	position: new Point(25, 2)
// }));

// Store.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8, 1.4),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.2)
// 	],
// 	type: PolyType.DYNAMIC,
// 	position: new Point(26, 25),
// 	rotation: Math.PI + 1.2
// }));


Store.polygons.getAt(0).addForce(new Vector(4, Math.PI / 2));

document.querySelector("#debug-play").addEventListener("click", () => {
	Store.Clock.resume();
});
document.querySelector("#debug-pause").addEventListener("click", () => {
	Store.Clock.pause();
});
document.querySelector("#debug-step").addEventListener("click", () => {
	Store.Clock.pausedAt += (1000 / 60);
	Store.Clock.step(Store.Clock.pausedAt, false);
});
document.addEventListener("keydown", (event) => {
	if (event.code === "Insert" || event.code === "PageUp") {
		Store.Clock.pausedAt += (1000 / 60);
		Store.Clock.step(Store.Clock.pausedAt, false);
	} else if (event.code === "Space") {
		if (Store.Clock.paused) {
			Store.Clock.resume();
		} else {
			Store.Clock.pause();
		}
	}
});


Store.Renderer.render();
Store.Clock.pause();