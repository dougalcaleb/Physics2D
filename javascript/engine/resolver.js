import Vector from "../struct/vector.js";
import Point from "../struct/point.js";
import { PolyType } from "../struct/enum.js";
import Store from "./store.js";

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
  }

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

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			const proj1 = polygon1.vertices.map(v => ({
				value: Vector.dot(v, normal) + offset,
				id: v.id
			}));
			const proj2 = polygon2.vertices.map(v => ({
				value: Vector.dot(v, normal),
				id: v.id
			}));
			const proj1Max = proj1.reduce((max, v) => v.value > max.value ? v : max, { value: -Infinity });
			const proj1Min = proj1.reduce((min, v) => v.value < min.value ? v : min, { value: Infinity });
			const proj2Max = proj2.reduce((max, v) => v.value > max.value ? v : max, { value: -Infinity });
			const proj2Min = proj2.reduce((min, v) => v.value < min.value ? v : min, { value: Infinity });
			if (proj1Min.value > proj2Max.value || proj2Min.value > proj1Max.value) {
				collision = false;
			} else {
				let currentOverlap = Math.abs(proj1Min.value - proj2Max.value);
				if (currentOverlap < overlap) {
					//* Need some logic here to extract the overlapping vertices and their IDs
					console.log("poly1 1min - 2max:", proj1Min.value - proj2Max.value, "2min - 1max:", proj2Min.value - proj1Max.value);
					overlap = currentOverlap;
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

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			const proj1 = polygon1.vertices.map(v => ({
				value: Vector.dot(v, normal) + offset,
				id: v.id
			}));
			const proj2 = polygon2.vertices.map(v => ({
				value: Vector.dot(v, normal),
				id: v.id
			}));
			const proj1Max = proj1.reduce((max, v) => v.value > max.value ? v : max, { value: -Infinity });
			const proj1Min = proj1.reduce((min, v) => v.value < min.value ? v : min, { value: Infinity });
			const proj2Max = proj2.reduce((max, v) => v.value > max.value ? v : max, { value: -Infinity });
			const proj2Min = proj2.reduce((min, v) => v.value < min.value ? v : min, { value: Infinity });
			if (proj1Min.value > proj2Max.value || proj2Min.value > proj1Max.value) {
				collision = false;
			} else {
				let currentOverlap = Math.abs(proj1Min.value - proj2Max.value);
				if (currentOverlap < overlap) {
					console.log("poly2 1min - 2max:", proj1Min.value - proj2Max.value, "2min - 1max:", proj2Min.value - proj1Max.value);
					overlap = currentOverlap;
					overlapNormal = normal;
				}
			}
		});
		
		if (!collision) { return false; }

		console.log("overlap:", overlap, "overlapNormal:", overlapNormal)

		// Correct the penetration
		const resolutionMagnitude = overlap / Math.hypot(overlapNormal.x, overlapNormal.y);
		const normalized = new Vector({
			x: overlapNormal.x,
			y: overlapNormal.y
		});
		normalized.magnitude = 1;

		if (polygon1.type === PolyType.STATIC) {
			resolution.polygon2.x = -normalized.x * resolutionMagnitude;
			resolution.polygon2.y = -normalized.y * resolutionMagnitude;
		} else if (polygon2.type === PolyType.STATIC) {
			resolution.polygon1.x = -normalized.x * resolutionMagnitude;
			resolution.polygon1.y = -normalized.y * resolutionMagnitude;
		} else {
			resolution.polygon1.x = normalized.x * resolutionMagnitude / 2;
			resolution.polygon1.y = normalized.y * resolutionMagnitude / 2;
			resolution.polygon2.x = -normalized.x * resolutionMagnitude / 2;
			resolution.polygon2.y = -normalized.y * resolutionMagnitude / 2;
		}

		// const poly1Corrected = {
		// 	x: polygon1.position.x + resolution.polygon1.x,
		// 	y: polygon1.position.y + resolution.polygon1.y
		// };
		// const poly2Corrected = {
		// 	x: polygon2.position.x + resolution.polygon2.x,
		// 	y: polygon2.position.y + resolution.polygon2.y
		// };

		// Find point of collision

		// const closestPointsOnEdges = (edge1, edge2) => {
		// 	// Direction vectors
		// 	const edge1Vec = { x: edge1.pt2.x - edge1.pt1.x, y: edge1.pt2.y - edge1.pt1.y };
		// 	const edge2Vec = { x: edge2.pt2.x - edge2.pt1.x, y: edge2.pt2.y - edge2.pt1.y };
		
		// 	// Relative vector
		// 	const relativeVec = { x: edge2.pt1.x - edge1.pt1.x, y: edge2.pt1.y - edge1.pt1.y };
		
		// 	// Dot products
		// 	const dotEdge1 = Vector.dot(edge1Vec, edge1Vec);
		// 	const dotEdge2 = Vector.dot(edge2Vec, edge2Vec);
		// 	const dotRelativeEdge1 = Vector.dot(edge1Vec, relativeVec);
		// 	const dotRelativeEdge2 = Vector.dot(edge2Vec, relativeVec);
		
		// 	// Solve for parameters
		// 	let t = (dotRelativeEdge1 * dotEdge2 - dotRelativeEdge2 * dotEdge1) / (dotEdge1 * dotEdge2 - relativeVec ** 2);
		// 	let u = (dotRelativeEdge1 + t * dotRelativeEdge2) / dotEdge1;
		
		// 	// Clamp parameters
		// 	t = Math.max(0, Math.min(1, t));
		// 	u = Math.max(0, Math.min(1, u));
		
		// 	// Calculate closest points
		// 	const closestEdge1 = { x: edge1.pt1.x + t * edge1Vec.x, y: edge1.pt1.y + t * edge1Vec.y };
		// 	const closestEdge2 = { x: edge2.pt1.x + u * edge2Vec.x, y: edge2.pt1.y + u * edge2Vec.y };
		
		// 	return { closestEdge1, closestEdge2 };
		// };

		// const closestPointOnEdge = (edge, point) => {
		// 	// Vector representing the edge
		// 	const edgeVector = {
		// 		x: edge.pt2.x - edge.pt1.x,
		// 		y: edge.pt2.y - edge.pt1.y
		// 	};
		
		// 	// Vector from edge start to point
		// 	let pointVector = {
		// 		x: point.x - edge.pt1.x,
		// 		y: point.y - edge.pt1.y
		// 	};
		
		// 	// Project pointVector onto edgeVector
		// 	const edgeLengthSquared = Vector.dot(edgeVector, edgeVector);
		// 	let t = Vector.dot(edgeVector, pointVector) / edgeLengthSquared;
		
		// 	// Clamp parameter t to ensure it's within the line segment
		// 	t = Math.max(0, Math.min(1, t));
		
		// 	// Calculate closest point on the edge
		// 	let closestPoint = {
		// 		x: edge.pt1.x + t * edgeVector.x,
		// 		y: edge.pt1.y + t * edgeVector.y
		// 	};
		
		// 	return closestPoint;
		// }

		// const closestPoints = { polygon1: null, polygon2: null, distance: Infinity };

		// polygon1.vertices.forEach((vertex1, index1) => {
		// 	if (index1 === polygon1.vertices.length - 1) { index1 = -1; }

		// 	const edge1 = {
		// 		pt1: {
		// 			x: vertex1.x + poly1Corrected.x,
		// 			y: vertex1.y + poly1Corrected.y
		// 		},
		// 		pt2: {
		// 			x: polygon1.vertices[index1 + 1].x + poly1Corrected.x,
		// 			y: polygon1.vertices[index1 + 1].y + poly1Corrected.y
		// 		}
		// 	};

		// 	polygon2.vertices.forEach((vertex2, index2) => {
		// 		if (index2 === polygon2.vertices.length - 1) { index2 = -1; }

		// 		const edge2 = {
		// 			pt1: {
		// 				x: vertex2.x + poly2Corrected.x,
		// 				y: vertex2.y + poly2Corrected.y
		// 			},
		// 			pt2: {
		// 				x: polygon2.vertices[index2 + 1].x + poly2Corrected.x,
		// 				y: polygon2.vertices[index2 + 1].y + poly2Corrected.y
		// 			}
		// 		}

		// 		const { closestEdge1, closestEdge2 } = closestPointsOnEdges(edge1, edge2);
		// 		const color = getRandomColor();
		// 		Store._debugPts.push({
		// 			color: color,
		// 			x: closestEdge1.x,
		// 			y: closestEdge1.y
		// 		});

		// 		Store._debugPts.push({
		// 			color: color,
		// 			x: closestEdge2.x,
		// 			y: closestEdge2.y
		// 		});

		// 		const dist = Point.distanceSqr(closestEdge1, closestEdge2);
		// 		if (dist < closestPoints.distance) {
		// 			closestPoints.polygon1 = closestEdge1;
		// 			closestPoints.polygon2 = closestEdge2;
		// 			closestPoints.distance = dist;
		// 		}
		// 	});
		// });

		// Store._debugPts.push({
		// 	color: "white",
		// 	x: closestPoints.polygon1.x,
		// 	y: closestPoints.polygon1.y,
		// 	size: 10
		// });
		// Store._debugPts.push({
		// 	color: "white",
		// 	x: closestPoints.polygon2.x,
		// 	y: closestPoints.polygon2.y,
		// 	size: 10
		// });

		// Calculate resulting velocities
		// https://chrishecker.com/Rigid_Body_Dynamics#:~:text=Physics%2C%20Part%203%3A%20Collision%20Response
		const relativeVelocity = new Vector({
			x: polygon1.velocity.x - polygon2.velocity.x,
			y: polygon1.velocity.y - polygon2.velocity.y
		});
		relativeVelocity.multiplyInPlace(-(1 + (polygon1.restitution * polygon2.restitution)));
		const impulse =
			Vector.dot(relativeVelocity, overlapNormal) /
			(
				Vector.dot(overlapNormal, overlapNormal.multiply(1 / polygon1.mass + 1 / polygon2.mass))
			);
		const velocities = {
			polygon1: {
				x: polygon1.velocity.x + overlapNormal.multiply(impulse / polygon1.mass).x,
				y: polygon1.velocity.y + overlapNormal.multiply(impulse / polygon1.mass).y
			},
			polygon2: {
				x: polygon2.velocity.x - overlapNormal.multiply(impulse / polygon2.mass).x,
				y: polygon2.velocity.y - overlapNormal.multiply(impulse / polygon2.mass).y
			}
		};

		return {resolution, velocities};
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