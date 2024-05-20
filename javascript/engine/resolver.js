import Vector from "../struct/vector.js";
import Point from "../struct/point.js";
import { PolyType } from "../struct/enum.js";
import Store from "./store.js";
import Utils from "./utils.js";

function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export default class Resolver {
	constructor() { }

	// Resolve collision by SAT
	// Return the positions of the objects and the forces to apply
	// TODO: Precision solver
	// Use kinematics and the known net forces to backtrack and find the exact point and velocity of collision

	// The polygon with the least overlap on one of the axis is the one whose edge is colliding. 
	// The other point of contact is most likely a vertex of the other polygon, but may be an edge if perfectly aligned.
	static resolve(polygon1, polygon2) {
		polygon1.debugVectors = [];
		polygon2.debugVectors = [];
		let collision = true;
		let overlap = Infinity;
		let overlapNormal = null;
		let verticesOfContact = {
			type: 1, // 1 = vertex-edge, 2 = edge-edge
			poly: null,
			vertices: []
		};
		const pointOfCollision = new Point({ x: 0, y: 0 });
		const resolution = {
			polygon1: { x: 0, y: 0 },
			polygon2: { x: 0, y: 0 }
		};
		let poly1CollisionVertices = [];
		let poly2CollisionVertices = [];

		for (let i = 0; i < polygon1._vertexCount; i++) {
			const vertex = polygon1.vertices[i];
			const index = i === polygon1._vertexCount - 1 ? -1 : i;

			// Get the normal of the edge
			const normal = new Vector({
				x: -(vertex.y - polygon1.vertices[index + 1].y),
				y: (vertex.x - polygon1.vertices[index + 1].x)
			});

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			// Project the vertices of the polygons onto the normal
			const proj1 = polygon1.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal) + offset, 5),
				id: v.id
			}));
			const proj2 = polygon2.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 5),
				id: v.id
			}));

			let poly1SecondVertex = null;
			let poly2SecondVertex = null;

			// Find the min/max of each projection. 
			// If the edges are perfectly aligned, there will be some values that are equal, which constitutes an edge - edge collision.
			const proj1Max = proj1.reduce((max, v) => v.value >= max.value ? v : max, { value: -Infinity });
			const proj1Min = proj1.reduce((min, v) => {
				if (v.value === min.value) {
					poly1SecondVertex = v;
				}
				return v.value < min.value ? v : min;
			}, { value: Infinity });
			const proj2Max = proj2.reduce((max, v) => {
				if (v.value === max.value) {
					poly2SecondVertex = v;
				}
				return v.value > max.value ? v : max;
			}, { value: -Infinity });
			const proj2Min = proj2.reduce((min, v) => v.value <= min.value ? v : min, { value: Infinity });

			// We can quit early if there is a separating axis found
			if (proj1Min.value > proj2Max.value || proj2Min.value > proj1Max.value) {
				collision = false;
				break;
			} else {
				let currentOverlap = Math.abs(proj1Min.value - proj2Max.value);
				if (currentOverlap < overlap) {
					// If this is the smallest overlap found so far, keep track of it
					overlap = currentOverlap;
					overlapNormal = normal;
					// If it's a vertex-edge collision, we only need to keep track of the one vertex that intersects with the edge, as that's the point of contact
					verticesOfContact.vertices = [ polygon2.vertices[proj2Max.id].add(polygon2.position) ];
					verticesOfContact.type = 1;
					verticesOfContact.poly = 2;
					// If this is an edge-edge collision, we need to keep track of all involved vertices
					if (poly2SecondVertex) {
						verticesOfContact.vertices.push(
							polygon2.vertices[poly2SecondVertex.id].add(polygon2.position),
							polygon1.vertices[proj1Min.id].add(polygon1.position),
							polygon1.vertices[poly1SecondVertex.id].add(polygon1.position)
						);
						verticesOfContact.type = 2;
					}
				}
			}
		}

		// Quit early if possible
		if (!collision) { return false; }

		// Same process for the second polygon
		for (let i = 0; i < polygon2._vertexCount; i++) {
			const vertex = polygon2.vertices[i];
			const index = i === polygon1._vertexCount - 1 ? -1 : i;

			const normal = new Vector({
				x: -(vertex.y - polygon2.vertices[index + 1].y),
				y: (vertex.x - polygon2.vertices[index + 1].x)
			});

			const offset = Vector.dot({
				x: polygon1.position.x - polygon2.position.x,
				y: polygon1.position.y - polygon2.position.y
			}, normal);

			const proj1 = polygon1.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal) + offset, 5),
				id: v.id
			}));
			const proj2 = polygon2.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 5),
				id: v.id
			}));

			let poly2SecondVertex = null;
			let poly1SecondVertex = null;

			const proj1Max = proj1.reduce((max, v) => v.value >= max.value ? v : max, { value: -Infinity });
			const proj1Min = proj1.reduce((min, v) => {
				if (v.value === min.value) {
					poly1SecondVertex = v;
				}
				return v.value < min.value ? v : min;
			}, { value: Infinity });
			const proj2Max = proj2.reduce((max, v) => {
				if (v.value === max.value) {
					poly2SecondVertex = v;
				}
				return v.value > max.value ? v : max
			}, { value: -Infinity });
			const proj2Min = proj2.reduce((min, v) => v.value <= min.value ? v : min, { value: Infinity });

			if (proj1Min.value > proj2Max.value || proj2Min.value > proj1Max.value) {
				collision = false;
				break;
			} else {
				let currentOverlap = Math.abs(proj1Min.value - proj2Max.value);
				if (currentOverlap < overlap) {
					overlap = currentOverlap;
					overlapNormal = normal;
					verticesOfContact.vertices = [ polygon1.vertices[proj1Min.id].add(polygon1.position) ];
					verticesOfContact.type = 1;
					verticesOfContact.poly = 1;
					if (poly1SecondVertex) {
						verticesOfContact.vertices.push(
							polygon1.vertices[poly1SecondVertex.id].add(polygon1.position),
							polygon2.vertices[proj2Max.id].add(polygon2.position),
							polygon2.vertices[poly2SecondVertex.id].add(polygon2.position)
						);
						verticesOfContact.type = 2;
					}
				}
			}
		}
		
		if (!collision) { return false; }

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

		// Get the world point of contact
		if (verticesOfContact.type === 1) {
			// Vertex-edge collision - the point of contact is the vertex
			const adjust = verticesOfContact.poly === 1 ? resolution.polygon1 : resolution.polygon2;
			pointOfCollision.x = verticesOfContact.vertices[0].x + adjust.x;
			pointOfCollision.y = verticesOfContact.vertices[0].y + adjust.y;
		} else {
			// Edge-edge collision
			// We know that all 4 vertices are in a straight (enough) line, and, as a simplification, the point of contact we want is the center of the two vertices in the middle
			// Choose a reference point, find the relative projection of each vertex and sort them to find which two are the middle two
			const refPoint = verticesOfContact.vertices[0];
			const projections = verticesOfContact.vertices.map(v => {
				const rel = Point.subtract(v, refPoint);
				return {
					proj: Vector.dot(rel, rel),
					pos: v
				}
			}).sort((a, b) => a.proj - b.proj);
			pointOfCollision.x = (projections[1].pos.x + projections[2].pos.x + resolution.polygon1.x + resolution.polygon2.x) / 2;
			pointOfCollision.y = (projections[1].pos.y + projections[2].pos.y + resolution.polygon1.y + resolution.polygon2.y) / 2;
		}

		// Store._debugPts.push({
		// 	x: pointOfCollision.x,
		// 	y: pointOfCollision.y,
		// 	color: "red",
		// 	size: 5
		// });

		// Calculate resulting velocities
		// https://chrishecker.com/Rigid_Body_Dynamics#:~:text=Physics%2C%20Part%203%3A%20Collision%20Response
		const relativeVelocity = new Vector({
			x: polygon1.velocity.x - polygon2.velocity.x,
			y: polygon1.velocity.y - polygon2.velocity.y
		});
		relativeVelocity.scaleInPlace(-(1 + (polygon1.restitution * polygon2.restitution)));
		const relativeContact = {
			polygon1: new Vector({
				x: pointOfCollision.x - polygon1.position.x,
				y: pointOfCollision.y - polygon1.position.y,
				magnitude: null
			}),
			polygon2: new Vector({
				x: pointOfCollision.x - polygon2.position.x,
				y: pointOfCollision.y - polygon2.position.y,
				magnitude: null
			})
		};

		const normalizedPerp = new Vector({
			x: normalized.y,
			y: -normalized.x,
			magnitude: null
		});

		const poly1PerpVector = normalizedPerp.scale(Vector.dot(relativeContact.polygon1, normalizedPerp));
		const poly2PerpVector = normalizedPerp.scale(Vector.dot(relativeContact.polygon2, normalizedPerp));

		// Store._debugVectors.push({
		// 	x: poly1PerpVector.x,
		// 	y: poly1PerpVector.y,
		// 	origin: polygon1.position,
		// 	color: "green",
		// 	size: 5
		// });

		// Store._debugVectors.push({
		// 	x: poly2PerpVector.x,
		// 	y: poly2PerpVector.y,
		// 	origin: polygon2.position,
		// 	color: "green",
		// 	size: 5
		// });

		// console.log("normalized vector", normalized);
		// console.log("relative contact", relativeContact.polygon1, relativeContact.polygon2);
		// console.log("Perpendiculars", poly1Perp, poly2Perp, "(poly1 is", polygon1.id, ", poly2 is", polygon2.id, ")");
		const impulse =
			Vector.dot(relativeVelocity, overlapNormal) /
			(
				Vector.dot(overlapNormal, overlapNormal.scale((1 / polygon1.mass) + (1 / polygon2.mass))) +
				Vector.dot(poly1PerpVector, overlapNormal) ** 2 / polygon1.momentInertia +
				Vector.dot(poly2PerpVector, overlapNormal) ** 2 / polygon2.momentInertia
			);
		const linearVelocities = {
			polygon1: {
				x: polygon1.velocity.x + overlapNormal.scale(impulse / polygon1.mass).x,
				y: polygon1.velocity.y + overlapNormal.scale(impulse / polygon1.mass).y
			},
			polygon2: {
				x: polygon2.velocity.x - overlapNormal.scale(impulse / polygon2.mass).x,
				y: polygon2.velocity.y - overlapNormal.scale(impulse / polygon2.mass).y
			}
		};

		const poly1amChange = -Vector.dot({
			x: poly1PerpVector.y,
			y: -poly1PerpVector.x
		}, overlapNormal.scale(impulse)) / polygon1.momentInertia;
		const poly2amChange = -Vector.dot({
			x: poly2PerpVector.y,
			y: -poly2PerpVector.x
		}, overlapNormal.scale(impulse)) / polygon2.momentInertia;

		const angularVelocities = {
			polygon1: polygon1.angularVelocity + poly1amChange,
			polygon2: polygon2.angularVelocity - poly2amChange
		};

		// console.log("Moments of inertia:", polygon1.momentInertia, polygon2.momentInertia);
		// console.log("poly2 angular impulse:", Vector.dot(poly2PerpVector, overlapNormal.scale(impulse)));
		// console.log("Resulting angular velocities:", angularVelocities.polygon1, angularVelocities.polygon2);

		return { resolution, linearVelocities, angularVelocities };
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