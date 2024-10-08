import Vector from "../struct/vector.js";
import Point from "../struct/point.js";
import { PolyType } from "../struct/enum.js";
import Store from "./store.js";
import Utils from "./utils.js";

export default class Resolver {
	constructor() { }

	// OVERALL TODO:
	// - Clean up the verticesOfContact object
	// - Ensure that simple vectors are being used whenever possible
	// - See if the very similar if-branched blocks can be consolidated

	// Resolve collision by SAT
	// Return the positions of the objects and the forces to apply
	// TODO: Precision solver
	// Use kinematics and the known net forces to backtrack and find the exact point and velocity of collision
	// TODO: Overpenetration is not solved quite correctly, the impulse isn't strong enough to correct very fast or overly penetrating objects

	// The polygon with the least overlap on one of the axis is the one whose edge is colliding. 
	// The other point of contact is most likely a vertex of the other polygon, but may be an edge if perfectly aligned.
	static resolve(polygon1, polygon2) {
		polygon1.debugVectors = [];
		polygon2.debugVectors = [];
		let overlap = Infinity;
		let overlapNormal = null;
		// TODO: clean this object up, it's pretty gross right now
		let verticesOfContact = {
			type: 1, 		// 1 = vertex-edge, 2 = edge-edge
			poly: null,		// If the collision is type 1, this will be the polygon that the vertex belongs to
			vertices: [],
			correction: 1	// 1 or -1. If the vertex is on the other polygon, the resolution must be in the negative of the normal direction
		};
		const pointOfCollision = new Point({ x: 0, y: 0 });
		const resolution = {
			polygon1: { x: 0, y: 0 },
			polygon2: { x: 0, y: 0 }
		};

		const p1Max = polygon1._vertexCount - 1;
		const p2Max = polygon2._vertexCount - 1;

		for (let i = 0; i < polygon1._vertexCount; i++) {
			const vertex1 = polygon1.vertices.getAt(i);
			const vertex2 = polygon1.vertices.getAt((i === polygon1._vertexCount - 1) ? 0 : (i + 1));

			// Get the normal of the edge
			const normal = new Vector({
				x: -(vertex1.y - vertex2.y),
				y: (vertex1.x - vertex2.x)
			})._normalize();

			const offset = Vector.dot(
				{
					x: polygon2.position.x - polygon1.position.x,
					y: polygon2.position.y - polygon1.position.y
				},
				normal
			);

			// Project the vertices of the polygons onto the normal
			const proj1 = Utils.objSort(polygon1.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 5),
				id: v.id
			})), "value");
			const proj2 = Utils.objSort(polygon2.vertices.map(v => ({
				value: Utils.Round((Vector.dot(v, normal) + offset), 5),
				id: v.id
			})), "value");

			if (proj1[p1Max].value < proj2[0].value || proj1[0].value > proj2[p2Max].value) {
				return false; // Early exit if there is a separating axis
			} else {
				// Find the minimum overlap
				const overlapP1MinP2Max = Math.abs(proj1[p1Max].value - proj2[0].value);
				const overlapP2MinP1Max = Math.abs(proj2[p2Max].value - proj1[0].value);

				// If both possible overlaps are greater than the current overlap, this axis is not the minimum separating axis. Skip the rest.
				if (overlapP1MinP2Max > overlap && overlapP2MinP1Max > overlap) {
					continue;
				}

				if (overlapP1MinP2Max <= overlapP2MinP1Max) {
					overlap = overlapP1MinP2Max;
					overlapNormal = normal;

					// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
					if (proj2[p2Max].value === proj2[p2Max - 1].value) {
						verticesOfContact.type = 2; // edge-edge collision
						verticesOfContact.poly = null;
						verticesOfContact.correction = 1;
						verticesOfContact.vertices = [
							polygon2.vertices.get(proj2[p2Max].id).add(polygon2.position),
							polygon2.vertices.get(proj2[p2Max - 1].id).add(polygon2.position),
							polygon1.vertices.get(proj1[0].id).add(structuredClone(polygon1.position)),
							polygon1.vertices.get(proj1[1].id).add(structuredClone(polygon1.position))
						];
					} else {
						verticesOfContact.type = 1; // vertex-edge collision
						verticesOfContact.poly = 2; // The vertex belongs to polygon 2, since the normal is from polygon 1
						verticesOfContact.correction = 1;
						verticesOfContact.vertices = [
							polygon2.vertices.get(proj2[0].id).add(polygon2.position)
						];
					}
				} else {
					overlap = overlapP2MinP1Max;
					overlapNormal = normal;

					// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
					if (proj2[p2Max].value === proj2[p2Max - 1].value) {
						verticesOfContact.type = 2; // edge-edge collision
						verticesOfContact.poly = null;
						verticesOfContact.correction = -1;
						verticesOfContact.vertices = [
							polygon1.vertices.get(proj1[0].id).add(polygon1.position),
							polygon1.vertices.get(proj1[1].id).add(polygon1.position),
							polygon2.vertices.get(proj2[p2Max].id).add(polygon2.position),
							polygon2.vertices.get(proj2[p2Max - 1].id).add(polygon2.position)
						];
					} else {
						verticesOfContact.type = 1; // vertex-edge collision
						verticesOfContact.poly = 2; // The vertex belongs to polygon 2, since the normal is from polygon 1
						verticesOfContact.correction = -1;
						verticesOfContact.vertices = [
							polygon2.vertices.get(proj2[p2Max].id).add(polygon2.position)
						];
					}
				}
			}
		}

		// Same process for the second polygon
		for (let i = 0; i < polygon2._vertexCount; i++) {
			const vertex1 = polygon2.vertices.getAt(i);
			const vertex2 = polygon2.vertices.getAt((i === polygon1._vertexCount - 1) ? 0 : (i + 1));

			const normal = new Vector({
				x: -(vertex1.y - vertex2.y),
				y: (vertex1.x - vertex2.x)
			})._normalize();

			const offset = Vector.dot(
				{
					x: polygon1.position.x - polygon2.position.x,
					y: polygon1.position.y - polygon2.position.y
				},
				normal
			);

			const proj1 = Utils.objSort(polygon1.vertices.map(v => ({
				value: Utils.Round((Vector.dot(v, normal) + offset), 5),
				id: v.id
			})), "value");
			const proj2 = Utils.objSort(polygon2.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 5),
				id: v.id
			})), "value");

			if (proj1[p1Max].value < proj2[0].value || proj1[0].value > proj2[p2Max].value) {
				return false; // Early exit if there is a separating axis
			} else {
				// Find the minimum overlap
				const overlapP1MinP2Max = Math.abs(proj1[p1Max].value - proj2[0].value);
				const overlapP2MinP1Max = Math.abs(proj2[p2Max].value - proj1[0].value);

				// If both possible overlaps are greater than the current overlap, this axis is not the minimum separating axis. Skip the rest.
				if (overlapP1MinP2Max > overlap && overlapP2MinP1Max > overlap) {
					continue;
				}

				if (overlapP1MinP2Max <= overlapP2MinP1Max) {
					overlap = overlapP1MinP2Max;
					overlapNormal = normal;

					// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
					if (proj1[p1Max].value === proj1[p1Max - 1].value) {
						verticesOfContact.type = 2; // edge-edge collision
						verticesOfContact.poly = null;
						verticesOfContact.correction = 1;
						verticesOfContact.vertices = [
							polygon2.vertices.get(proj2[0].id).add(polygon2.position),
							polygon2.vertices.get(proj2[1].id).add(polygon2.position),
							polygon1.vertices.get(proj1[p1Max].id).add(polygon1.position),
							polygon1.vertices.get(proj1[p1Max - 1].id).add(polygon1.position)
						];
					} else {
						verticesOfContact.type = 1; // vertex-edge collision
						verticesOfContact.poly = 1; // The vertex belongs to polygon 1, since the normal is from polygon 2
						verticesOfContact.correction = 1;
						verticesOfContact.vertices = [
							polygon1.vertices.get(proj1[p1Max].id).add(polygon1.position)
						];
					}
				} else {
					overlap = overlapP2MinP1Max;
					overlapNormal = normal;

					// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
					if (proj1[p1Max].value === proj1[p1Max - 1].value) {
						verticesOfContact.type = 2; // edge-edge collision
						verticesOfContact.poly = null;
						verticesOfContact.correction = -1;
						verticesOfContact.vertices = [
							polygon1.vertices.get(proj1[0].id).add(polygon1.position),
							polygon1.vertices.get(proj1[1].id).add(polygon1.position),
							polygon2.vertices.get(proj2[p2Max].id).add(polygon2.position),
							polygon2.vertices.get(proj2[p2Max - 1].id).add(polygon2.position)
						];
					} else {
						verticesOfContact.type = 1; // vertex-edge collision
						verticesOfContact.poly = 1; // The vertex belongs to polygon 1, since the normal is from polygon 2
						verticesOfContact.correction = -1;
						verticesOfContact.vertices = [
							polygon1.vertices.get(proj1[0].id).add(polygon1.position)
						];
					}
				}
			}
		}

		// Correct the penetration
		const resVector = overlapNormal.scale(overlap * verticesOfContact.correction);

		if (polygon1.type === PolyType.STATIC) {
			resolution.polygon2.x = resVector.x;
			resolution.polygon2.y = resVector.y;
		} else if (polygon2.type === PolyType.STATIC) {
			resolution.polygon1.x = resVector.x;
			resolution.polygon1.y = resVector.y;
		} else {
			resolution.polygon1.x = -resVector.x / 2;
			resolution.polygon1.y = -resVector.y / 2;
			resolution.polygon2.x = resVector.x / 2;
			resolution.polygon2.y = resVector.y / 2;
		}

		// Get the world point of contact
		if (verticesOfContact.type === 1) {
			// Vertex-edge collision - the point of contact is the vertex
			pointOfCollision.x = verticesOfContact.vertices[0].x;
			pointOfCollision.y = verticesOfContact.vertices[0].y;
		} else {
			// Edge-edge collision
			// We know that all 4 vertices are in a straight (enough) line, and, as a simplification, the point of contact we want is the center of the two vertices in the middle
			// Choose a reference point, find the relative projection of each vertex and sort them to find which two are the middle two
			const refPoint = verticesOfContact.vertices[0];
			const projections = Utils.objSort(verticesOfContact.vertices.map(v => ({
				proj: Vector.dot(refPoint, v),
				pos: v
			})), "proj");
			pointOfCollision.x = (projections[1].pos.x + projections[2].pos.x + resolution.polygon1.x + resolution.polygon2.x) / 2;
			pointOfCollision.y = (projections[1].pos.y + projections[2].pos.y + resolution.polygon1.y + resolution.polygon2.y) / 2;
		}

		// Calculate resulting velocities
		// https://chrishecker.com/Rigid_Body_Dynamics#:~:text=Physics%2C%20Part%203%3A%20Collision%20Response
		const relativeVelocity = new Vector({
			x: polygon1.velocity.x - polygon2.velocity.x,
			y: polygon1.velocity.y - polygon2.velocity.y
		});
		relativeVelocity._scale(-(1 + (polygon1.restitution * polygon2.restitution)));
		const relativeContact = {
			polygon1: new Vector({
				x: pointOfCollision.x - polygon1.position.x,
				y: pointOfCollision.y - polygon1.position.y,
				simple: true
			}),
			polygon2: new Vector({
				x: pointOfCollision.x - polygon2.position.x,
				y: pointOfCollision.y - polygon2.position.y,
				simple: true
			})
		};

		const normalizedPerp = new Vector({
			x: overlapNormal.y,
			y: -overlapNormal.x,
			simple: true
		});

		const poly1PerpVector = normalizedPerp.scale(Vector.dot(relativeContact.polygon1, normalizedPerp), true);
		const poly2PerpVector = normalizedPerp.scale(Vector.dot(relativeContact.polygon2, normalizedPerp), true);

		const impulse =
			Vector.dot(relativeVelocity, overlapNormal) /
			(
				Vector.dot(overlapNormal, overlapNormal.scale((1 / polygon1.mass) + (1 / polygon2.mass), true)) +
				Vector.dot(poly1PerpVector, overlapNormal) ** 2 / polygon1.momentInertia +
				Vector.dot(poly2PerpVector, overlapNormal) ** 2 / polygon2.momentInertia
			);
		const scaledImpulseNormalP1 = overlapNormal.scale(impulse / polygon1.mass, true);
		const scaledImpulseNormalP2 = overlapNormal.scale(impulse / polygon2.mass, true);
		const linearVelocities = {
			polygon1: {
				x: polygon1.velocity.x + scaledImpulseNormalP1.x,
				y: polygon1.velocity.y + scaledImpulseNormalP1.y
			},
			polygon2: {
				x: polygon2.velocity.x - scaledImpulseNormalP2.x,
				y: polygon2.velocity.y - scaledImpulseNormalP2.y
			}
		};

		const scaledNormal = overlapNormal.scale(impulse, true);
		const poly1amChange = -Vector.dot({
			x: poly1PerpVector.y,
			y: -poly1PerpVector.x
		}, scaledNormal) / polygon1.momentInertia;
		const poly2amChange = -Vector.dot({
			x: poly2PerpVector.y,
			y: -poly2PerpVector.x
		}, scaledNormal) / polygon2.momentInertia;

		const angularVelocities = {
			polygon1: polygon1.angularVelocity + poly1amChange,
			polygon2: polygon2.angularVelocity - poly2amChange
		};

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