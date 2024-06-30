import Utils from "../engine/utils.js";
import Point from "./point.js";
import Vector from "./vector.js";
import { PolyType } from "./enum.js";
import MappedArray from "./mappedarray.js";

export default class Polygon {
	vertices = [];
	position = { x: 0, y: 0 };
	velocity = { x: 0, y: 0 };
	acceleration = { x: 0, y: 0 };
	#rotation = 0;
	angularVelocity = 0;
	angularDrag = 0;
	mass = 1;
	restitution = 1;
	momentInertia = 1;
	type = null;
	active = true;
	maxSize = 0;
	sector = null;
	id = null;
	
	debugVectors = [];


	_vertexCount = 0;	
	_netForce = new Vector(0, 0);
	_lastForce = new Vector(0, 0);

	#originalVertices = [];

	get rotation() { return this.#rotation; }
	set rotation(value) {
		this.#rotation = value;
		this.#originalVertices.forEach((v, i) => {
			this.vertices.getAt(i).set(v.rotate(value));
		});
	}

	/**
	 * Create a new polygon
	 * @param {Object} options.vertices - An array of points representing the vertices of the polygon
	 * @param {Object} options.position - The position of the polygon
	 * @param {PolyType} options.type - The type of polygon (static or dynamic)
	 */
	constructor(options) {
		const polyVerts = Polygon.createPolygon(options.vertices);
		polyVerts.pop();
		this.position = options.position;
		this.vertices = new MappedArray(polyVerts.map((v, i) => new Point({ ...v, id: i })));
		this.#originalVertices = this.vertices.map(v => new Point(v));
		this.maxSize = this.vertices.reduce((max, v) => Math.max(max, Point.distance({x: 0, y: 0}, v)), 0);
		this.type = options.type;
		this.id = Utils.UUID();
		this.mass = this.type === PolyType.DYNAMIC ? (options.mass || 1) : Infinity;
		this.rotation = options.rotation || 0;
		const pointMass = this.mass / this.vertices.length;
		this.momentInertia = options.momentInertia || this.vertices.reduce((acc, v) => (acc + pointMass * (Point.distance(v, { x: 0, y: 0 }) ** 2)), 0);
		this.restitution = options.restitution || 1;
		this.angularDrag = options.angularDrag || 1;
		this._vertexCount = this.vertices.length;
	}
	
	addForce(forceVector) {
		this._netForce._add(forceVector);
		this._lastForce = forceVector;
	}

	addTorque(magnitude, direction) {

	}

	update(deltaTime) {
		this.acceleration.x = (this._netForce.x / this.mass);
		this.acceleration.y = (this._netForce.y / this.mass);
		this.velocity.x += this.acceleration.x * deltaTime;
		this.velocity.y += this.acceleration.y * deltaTime;
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;
		this.rotation += this.angularVelocity * deltaTime;
		this.angularVelocity -= this.angularDrag * this.angularVelocity * deltaTime;
		
		this._netForce.reset();
	}

	setVelocity(velocity) {
		this.velocity = velocity;
	}

	setAngularVelocity(angularVelocity) {
		this.angularVelocity = angularVelocity;
	}

	resolve(resolution) {
		this.position.x += resolution.x;
		this.position.y += resolution.y;
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