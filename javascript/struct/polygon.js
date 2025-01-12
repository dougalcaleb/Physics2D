import Utils from "../engine/utils.js";
import Point from "./point.js";
import Vector from "./vector.js";
import { PolygonType, Force } from "./enum.js";
import MappedArray from "./mappedarray.js";
import SimpleVector from "./simplevector.js";

export default class Polygon {
	vertices = new MappedArray();
	position = new Point();
	velocity = new SimpleVector();
	acceleration = new SimpleVector();
	#rotation = 0;
	angularVelocity = 0;
	angularDrag = 0;
	mass = 1;
	restitution = 1;
	rotationalInertia = 1;
	type = null;
	active = true;
	maxSize = 0;
	sector = null;
	id = null;
	
	_vertexCount = 0;

	_accumulatedForce = new SimpleVector();
	_accumulatedAcceleration = new SimpleVector();
	_accumulatedImpulse = new SimpleVector();
	_accumulatedVelocity = new SimpleVector();
	_accumulatedTorque = 0;

	get rotation() { return this.#rotation; }
	set rotation(value) {
		this.#rotation = value;
		this.vertices.forEach(v => v._rotate(value));
	}

	/**
	 * Create a new polygon
	 * @param {Object} options.vertices - An array of points representing the vertices of the polygon
	 * @param {Object} options.position - The position of the polygon
	 * @param {PolygonType} options.type - The type of polygon (static or dynamic)
	 */
	constructor(options) {
		if (!options) {
			throw new Error("Must provide vertices to create a polygon");
		}
		if (!Object.keys(options).every(k => ["vertices", "position", "type", "mass", "rotation", "rotationalInertia", "restitution", "angularDrag", "velocity", "angularVelocity"].includes(k))) {
			throw new Error("Unrecognized polygon option(s)");
		}

		const polyVerts = Polygon.createPolygon(options.vertices);
		polyVerts.pop();
		this.position = new Point(options.position || { x: 0, y: 0 });
		this.vertices = new MappedArray(polyVerts.map((v, i) => new Point({
			x: v.x,
			y: v.y,
			id: i,
			distance: Math.hypot(v.x, v.y),
			angle: Math.atan2(v.y, v.x)
		})));
		this.maxSize = this.vertices.reduce((max, v) => Math.max(max, Point.distance({x: 0, y: 0}, v)), 0);
		this.type = options.type;
		this.id = Utils.UUID();
		this.mass = this.type === PolygonType.DYNAMIC ? (options.mass || 1) : Infinity;
		this.rotation = options.rotation || 0;
		const pointMass = this.mass / this.vertices.length;
		this.rotationalInertia = options.rotationalInertia || this.vertices.reduce((acc, v) => (acc + pointMass * (Point.distance(v, { x: 0, y: 0 }) ** 2)), 0);
		this.restitution = options.restitution || 1;
		this.angularDrag = options.angularDrag || 1;
		this._vertexCount = this.vertices.length;
		this.velocity = options.velocity ? new SimpleVector({ x: options.velocity.x, y: options.velocity.y }) : new SimpleVector();
		this.angularVelocity = options.angularVelocity || 0;
	}
	
	/**
	 * Add a force to the polygon
	 * @param {Vector} forceVector - The force vector, including direction and magnitude
	 * @param {Vector} forceOrigin - Origin of the force vector, relative to the origin of the polygon
	 */
	addForce(forceVector, forceType = Force.FORCE, forceOrigin = null) {
		if (forceOrigin) {
			const throughCM = Vector.project(
				forceVector,
				new Vector({
					x: forceOrigin.x,
					y: forceOrigin.y,
					simple: true
				})
			);
			
			switch (forceType) {
				case Force.FORCE:
					this._accumulatedForce._add(throughCM._scale(1 / this.mass));
					break;
				case Force.ACCELERATION:
					this._accumulatedAcceleration._add(throughCM);
					return;
				case Force.IMPULSE:
					this._accumulatedImpulse._add(throughCM._scale(1 / this.mass));
					break;				
				case Force.VELOCITY:
					this._accumulatedVelocity._add(throughCM);
					break;
			}
			
			const torqueVector = new Vector({
				x: forceOrigin.y,
				y: -forceOrigin.x
			})._normalize()._scale(forceVector.magnitude);
			this.addTorque(Math.sign(Vector.dot(forceOrigin, forceVector)) * torqueVector.magnitude);
		} else {
			switch (forceType) {
				case Force.FORCE:
					this._accumulatedForce._add(forceVector._scale(1 / this.mass));
					break;
				case Force.ACCELERATION:
					this._accumulatedAcceleration._add(forceVector);
					return;
				case Force.IMPULSE:
					this._accumulatedImpulse._add(forceVector._scale(1 / this.mass));
					break;				
				case Force.VELOCITY:
					this._accumulatedVelocity._add(forceVector);
					break;
			}
		}
	}

	addTorque(magnitude) {

	}

	update(deltaTime) {
		this.acceleration._add(this._accumulatedForce);
		this.acceleration._add(this._accumulatedAcceleration);

		this.velocity._add(this.acceleration._scale(deltaTime));
		this.velocity._add(this._accumulatedImpulse);
		this.velocity._add(this._accumulatedVelocity);

		this.position._add(this.velocity.scale(deltaTime));

		this.angularVelocity -= this.angularDrag * this.angularVelocity * deltaTime;
		this.angularVelocity += this._accumulatedTorque * deltaTime;

		this.rotation += this.angularVelocity * deltaTime;
		
		this._accumulatedForce.reset();
		this._accumulatedAcceleration.reset();
		this._accumulatedImpulse.reset();
		this._accumulatedVelocity.reset();
		this._accumulatedTorque = 0;
	}

	/**
	 * Set this polygon's linear velocity
	 * @param {object | Vector} velocity Vector or object with x, y components
	 */
	setVelocity(velocity) {
		if (!(velocity instanceof SimpleVector)) {
			velocity = new SimpleVector(velocity);
		}
		this.velocity = velocity;
	}

	/**
	 * Set this polygon's angular velocity
	 * @param {number} angularVelocity Rotation in radians per second
	 */
	setAngularVelocity(angularVelocity) {
		if (typeof angularVelocity !== "number") {
			throw new Error("Angular velocity must be a number");
		}
		this.angularVelocity = angularVelocity;
	}

	resolve(resolution) {
		this.position._add(resolution);
	}

	// Create a convex hull from a set of vertices (Andrew's Monotone Chain algorithm)
    static createPolygon(vertices) {
		function orientation(p, q, r) {
			const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
			if (val === 0) {
				return 0; // colinear
			}
			return val > 0 ? 1 : 2; // clockwise or counterclockwise
		}

		function convexHull(points) {
			const n = points.length;
			if (n < 3) {
				return null; // Convex hull not possible with less than 3 points
			}

			// Sort points x-first, y-second
			points.sort((a, b) => {
				if (a.x !== b.x) {
					return a.x - b.x;
				}
				return a.y - b.y;
			});

			const hull = [];

			// Lower hull
			for (const p of points) {
				while (hull.length >= 2 && orientation(hull[hull.length - 2], hull[hull.length - 1], p) !== 2) {
					hull.pop();
				}
				hull.push(p);
			}

			// Upper hull
			const upperHullStart = hull.length;
			for (let i = n - 2; i >= 0; i--) {
				const p = points[i];
				while (hull.length >= upperHullStart + 1 && orientation(hull[hull.length - 2], hull[hull.length - 1], p) !== 2) {
					hull.pop();
				}
				hull.push(p);
			}

			return hull;
		}

		return convexHull(vertices);
	}
}