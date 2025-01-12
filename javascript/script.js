import Physics2D from "./Physics2D.js";
import { Point, Polygon, PolygonType } from "./Physics2D.js"

/**
 * TODO:
 * - Click and drag to move polygons (acceleration in direction of mouse)
 * - Different clock methods
 */

const scene = new Physics2D({
	canvas: document.getElementById("render"),
	sceneX: window.innerWidth,
	sceneY: window.innerHeight,
});

scene.start();

setTimeout(() => {
	scene.pause();
});


window.addEventListener("resize", () => {
	scene.Renderer.setCanvasSize(window.innerWidth, window.innerHeight);
	scene.Renderer.render();
});

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(1, 1),
// 		new Point(1, -1),
// 		new Point(-1, 1),
// 		new Point(-1, -1)
// 	],
// 	type: PolygonType.DYNAMIC,
// 	position: new Point(7.5, 9),
// 	restitution: 0.1,
// 	// velocity: { x: 3, y: 0 },
// 	// velocity: { x: 0, y: 50 },
// 	// angularDrag: 110,
// 	// angularVelocity: 4,
// 	// rotation: Math.PI / 4
// 	rotation: 1.1,
// 	mass: 15,
// }));

scene.addPolygon(new Polygon({
	vertices: [
		// new Point(1, 1),
		// new Point(1, -1),
		// new Point(-1, 1),
		// new Point(-1, -1)
		{ x: 1, y: 1 },
		{ x: 1, y: -1 },
		{ x: -1, y: 1 },
		{ x: -1, y: -1 }
	],
	type: PolygonType.DYNAMIC,
	// position: new Point(7.5, 9),
	position: { x: 7.5, y: 9 },
	restitution: 0.1,
	// velocity: { x: 3, y: 0 },
	// velocity: { x: 0, y: 50 },
	// angularDrag: 110,
	// angularVelocity: 4,
	// rotation: Math.PI / 4
	rotation: 1.1,
	mass: 15,
}));


// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(5, 0.5),
// 		new Point(5, -0.5),
// 		new Point(-5, 0.5),
// 		new Point(-5, -0.5)
// 	],
// 	type: PolygonType.DYNAMIC,
// 	position: new Point(10, 12),
// 	restitution: 0.8,
// 	// angularDrag: 110,
// 	rotation: -0.1,
// 	mass: 300
// }));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8, 1.4),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.2)
// 	],
// 	type: PolygonType.DYNAMIC,
// 	position: new Point(6, 10),
// 	mass: 15
// }));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8, 1.4),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.2)
// 	],
// 	type: PolygonType.DYNAMIC,
// 	position: new Point(15, 10)
// }));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-1.5, 0.5),
// 		new Point(-1.5, -0.5)
// 	],
// 	type: PolygonType.STATIC,
// 	position: new Point(2, 2)
// }));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-0.5, 0.5),
// 		new Point(-0.5, -0.5)
// 	],
// 	type: PolygonType.STATIC,
// 	position: new Point(4, 12),
// 	rotation: -0.3,
// }));

// floor
scene.addPolygon(new Polygon({
	vertices: [
		new Point(30, 0.5),
		new Point(30, -0.5),
		new Point(-1.5, 0.5),
		new Point(-1.5, -0.5)
	],
	type: PolygonType.STATIC,
	position: new Point(2, 2)
}));

// ceiling
scene.addPolygon(new Polygon({
	vertices: [
		new Point(30, 0.5),
		new Point(30, -0.5),
		new Point(-1.5, 0.5),
		new Point(-1.5, -0.5)
	],
	type: PolygonType.STATIC,
	position: new Point(2, 14.5)
}));

// floating platform
scene.addPolygon(new Polygon({
	vertices: [
		new Point(10, 0.5),
		new Point(10, -0.5),
		new Point(-1, 0.5),
		new Point(-1, -0.5)
	],
	type: PolygonType.STATIC,
	position: new Point(15, 8.5)
}));

// left wall
scene.addPolygon(new Polygon({
	vertices: [
		new Point(0.5, 8),
		new Point(0.5, -3.9),
		new Point(-1.5, 8),
		new Point(-1.5, -3.9)
	],
	type: PolygonType.STATIC,
	position: new Point(2, 6.5)
}));

// right wall
// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.5, 8),
// 		new Point(0.5, -3.9),
// 		new Point(-1.5, 8),
// 		new Point(-1.5, -3.9)
// 	],
// 	type: PolygonType.STATIC,
// 	position: new Point(30, 6.5)
// }));

// center wall
scene.addPolygon(new Polygon({
	vertices: [
		new Point(0.5, 8),
		new Point(0.5, -3.9),
		new Point(-1.5, 8),
		new Point(-1.5, -3.9)
	],
	type: PolygonType.STATIC,
	position: new Point(15, 6.5)
}));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(4, 0.5),
// 		new Point(4, -0.5),
// 		new Point(-1.5, 0.5),
// 		new Point(-1.5, -0.5)
// 	],
// 	type: PolygonType.STATIC,
// 	position: new Point(25, 2)
// }));

// scene.addPolygon(new Polygon({
// 	vertices: [
// 		new Point(0.8,  0.5),
// 		new Point(0.4, -1.1),
// 		new Point(-1, 1),
// 		new Point(-2, -0.9)
// 	],
// 	type: PolygonType.DYNAMIC,
// 	position: new Point(8, 10),
// 	rotation: Math.PI + 1.2
// }));


// scene.polygons.getAt(0).addForce(new Vector(4, Math.PI / 2));

document.querySelector("#debug-play").addEventListener("click", () => {
	scene.start();
});
document.querySelector("#debug-pause").addEventListener("click", () => {
	scene.pause();
});
document.querySelector("#debug-step").addEventListener("click", () => {
	scene.step();
});
document.addEventListener("keydown", (event) => {
	if (event.code === "Insert" || event.code === "PageUp") {
		scene.step();
	} else if (event.code === "Space") {
		if (scene.paused) {
			scene.start();
		} else {
			scene.pause();
		}
	}
});


// scene.afterStep(() => {
// 	if (Store.Clock._frame === 175) {
// 		Store.Clock.pause();
// 	}
// });