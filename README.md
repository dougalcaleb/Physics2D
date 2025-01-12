# Physics2D

A simple, efficiency-minded 2D physics engine to be used as the core for other plugins and simple interactive web experiences.

Current version: 0.8.0

Usage:

```javascript
import Physics2D from "physics2d"
import { Point, Polygon, PolygonType } from "physics2d"

const Scene = new Physics2D({
	canvas: HTMLElement,		// Reference to DOM Canvas
	scale: Number,				// Number of pixels that represent 1 meter in the simulation
	gravity: Number,			// Gravity scale
	sceneX: Number,				// Width of canvas
	sceneY: Number,				// Height of canvas
	backgroundColor: String,	// Canvas background color (can be hex, rgba, hsl)
	lineColor: String,			// Border color for polygons
	fillColor: String,			// Fill color for polygons
	lineWidth: Number,			// Border width for polygons
});

// Note that every instance of Point() can alternatively be a simple object with x and y keys
// i.e. the following are equivalent:
// new Point(1, 1)
// { x: 1, y: 1 }

Scene.addPolygon({
	// Vertices are relative to the origin of the polygon
	// This is the only strictly required setting
	vertices: Array<Point>,
	position: Point,
	// PolygonType is an enum of DYNAMIC and STATIC
	// Static polygons cannot be moved, while dynamic polygons have no constraints
	type: PolygonType,
	mass: Number,
	// velocity and angularVelocity specify the initial linear and rotational
	// velocities of the polygon respectively
	velocity: Number,
	angularVelocity: Number,
	rotation: Number,
	// rotationalInertia specifies how difficult it is to induce 
	// rotation relative to the polygon's mass
	rotationalInertia: Number,
	// restitution specifies the bounciness of a polygon
	restitution: Number,
	// angularDrag specifies how quickly a polygon's rotation slows
	angularDrag: Number
});
```

The Physics2D class instance also exposes a few methods to aid in controlling the scene:

```javascript
// Clock management
Scene.start();
Scene.pause();
Scene.step(deltaTime: Number);

// Hooking into the clock
// beforeStep callbacks are unshift()-ed into the call stack in the same order as called
// afterStep callbacks are push()-ed into the call stack in the same order as called
Scene.beforeStep(callback: function);
Scene.afterStep(callback: function);

// Polygon management
Scene.addPolygon(polygon: Polygon);
```