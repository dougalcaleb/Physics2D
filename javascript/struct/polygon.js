import Resolver from "../engine/resolver.js";
import Utils from "../engine/utils.js";
import Point from "./point.js";
import { PolyType } from "./enum.js";

export default class Polygon {
	vertices = [];
	position = { x: 0, y: 0 };
	velocity = { x: 0, y: 0 };
	rotation = 0;
	angularVelocity = 0;
	mass = 1;
	type = null;
	active = true;
	maxSize = 0;
	sector = null;
	id = null;

	constructor(vertices, type = PolyType.DYNAMIC) {
		const polyVerts = Polygon.createPolygon(vertices);
		this.position = new Point({
			x: polyVerts.reduce((acc, v) => acc + v.x, 0) / polyVerts.length,
			y: polyVerts.reduce((acc, v) => acc + v.y, 0) / polyVerts.length
		});
		this.vertices = polyVerts.map(v => {
			return new Point({
				x: v.x - this.position.x,
				y: v.y - this.position.y
			});
		});
		this.maxSize = this.vertices.reduce((max, v) => Math.max(max, Utils.pointDistance({x: 0, y: 0}, v)), 0);
		this.type = type;
		this.id = Utils.UUID();
	}
	
	addForce(magnitude, angle) {

	}

	addTorque(magnitude, direction) {

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