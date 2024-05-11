import Vector from "../struct/vector.js";
import Point from "../struct/point.js";
import { PolyType } from "../struct/enum.js";

export default class Resolver {
	constructor() { }

	// Resolve collision by SAT
	// Return the positions of the objects and the forces to apply
	static resolve(polygon1, polygon2) {
		polygon1.debugVectors = [];
		polygon2.debugVectors = [];
		let collision = true;
		let overlap = Infinity;
		let overlapNormal = null;
		const resolution = {
			polygon1: { x: 0, y: 0 },
			polygon2: { x: 0, y: 0 }
		};

		polygon1.vertices.forEach((vertex, index) => {
			if (index === polygon1.vertices.length - 1) index = -1;

			const normal = new Vector({
				x: -(vertex.y - polygon1.vertices[index + 1].y),
				y: (vertex.x - polygon1.vertices[index + 1].x)
			});
			polygon1.debugVectors.push({ vector: normal, color: "#eb34ab" });

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			const proj1 = polygon1.vertices.map(v => Vector.dot(v, normal) + offset);
			const proj2 = polygon2.vertices.map(v => Vector.dot(v, normal));
			if (Math.min(...proj1) > Math.max(...proj2) || Math.min(...proj2) > Math.max(...proj1)) {
				collision = false;
			} else {
				if (Math.abs(Math.min(...proj1) - Math.max(...proj2)) < overlap) {
					overlap = Math.abs(Math.min(...proj1) - Math.max(...proj2));
					overlapNormal = normal;
				}
			}
		});

		polygon2.vertices.forEach((vertex, index) => {
			if (index === polygon2.vertices.length - 1) index = -1;
			
			const normal = new Vector({
				x: -(vertex.y - polygon2.vertices[index + 1].y),
				y: (vertex.x - polygon2.vertices[index + 1].x)
			});
			polygon2.debugVectors.push({ vector: normal, color: "#eb34ab" });

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			const proj1 = polygon1.vertices.map(v => Vector.dot(v, normal) + offset);
			const proj2 = polygon2.vertices.map(v => Vector.dot(v, normal));
			if (Math.min(...proj1) > Math.max(...proj2) || Math.min(...proj2) > Math.max(...proj1)) {
				collision = false;
			} else {
				if (Math.abs(Math.min(...proj1) - Math.max(...proj2)) < overlap) {
					overlap = Math.abs(Math.min(...proj1) - Math.max(...proj2));
					overlapNormal = normal;
				}
			}
		});
		
		if (collision) {
			const resolutionMagnitude = overlap / Math.hypot(overlapNormal.x, overlapNormal.y);
			overlapNormal.magnitude = 1;
			if (polygon1.type === PolyType.STATIC) {
				resolution.polygon2.x = -overlapNormal.x * resolutionMagnitude;
				resolution.polygon2.y = -overlapNormal.y * resolutionMagnitude;
			} else if (polygon2.type === PolyType.STATIC) {
				resolution.polygon1.x = -overlapNormal.x * resolutionMagnitude;
				resolution.polygon1.y = -overlapNormal.y * resolutionMagnitude;
			} else {
				resolution.polygon1.x = overlapNormal.x * resolutionMagnitude / 2;
				resolution.polygon1.y = overlapNormal.y * resolutionMagnitude / 2;
				resolution.polygon2.x = -overlapNormal.x * resolutionMagnitude / 2;
				resolution.polygon2.y = -overlapNormal.y * resolutionMagnitude / 2;
			}
			return resolution;
		}
		return false;
	}

	static addForce(magnitude, angle) { 
		// Add a force through the center of mass
		// Return the velocity
	}
	
	static addTorque(magnitude, direction) {
		// Add a torque through the center of mass
		// Return the angular velocity
	}
}