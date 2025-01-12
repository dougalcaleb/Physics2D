import Sector from "../struct/sector.js";
import { Angle, Force, PolygonType } from "../struct/enum.js";
import Vector from "../struct/vector.js";
import Point from "../struct/point.js";
import SimpleVector from "../struct/simplevector.js";
import Utils from "./utils.js";

export default class Engine {
	collisions = [];
	deltaTime = 0;
	stepDelta = 0;
	resolutionMap = {}; // For step-separated collision resolution

	sectors = {};
	sectorCount = {
		x: null,
		y: null
	};
	sectorSize = null;

	#stepStart = 0; //> remove

	#env = null;

	constructor(env, clock) {
		this.#env = env;
		this.step = this.step.bind(this);
		clock.subscribeAfter(this.step);
	}
	
	step(deltaTime) {
		this.#stepStart = performance.now();
		this.deltaTime = deltaTime;
		//? this.applyCollisionResolution();
		this.addForces();
		this.update();
		this.partitionObjects();
		this.collisionQueue();
		//? this.calculateCollisionResolution();
		this.resolveCollisions();
		this.stepDelta = performance.now() - this.#stepStart;
	}

	// Create spatial partitioning sectors to aid in broad-phase pruning
	// https://developer.nvidia.com/gpugems/gpugems3/part-v-physics-simulation/chapter-32-broad-phase-collision-detection-cuda#:~:text=32.1.2%20Spatial%20Subdivision
	createSectors() {
		// Find the cell size that will fit the largest polygon. 
		// The canvas will be split into the smallest square that can fit the largest polygon, 
		// where they fit perfectly on the x - axis and have a remainder at the top on the y - axis.
		this.clearSectors();
		let size = this.#env._polygons.reduce((max, polygon) => {
			return Math.max(max, polygon.maxSize);
		}, 0);
		size *= 2;
		const cellCountX = Math.ceil(this.#env.sceneX / (size * this.#env.scale));
		const cellCountY = Math.ceil(this.#env.sceneY / (size * this.#env.scale)) + 1;
		const cellSize = (this.#env.sceneX / cellCountX / this.#env.scale);
		this.setSectorSize(cellSize);
		this.setSectorCount(cellCountX, cellCountY);
		for (let x = 0; x < cellCountX; x++) {
			for (let y = 0; y < cellCountY; y++) {
				this.addSector(new Sector(x, y, cellSize, cellSize));
			}
		}
		this.partitionStaticObjects();
	}

	// Place each static polygon into its respective sector
	partitionStaticObjects() {
		this.#env._staticPolygons.forEach(polygon => {
			const sector = {
				x: Math.floor(polygon.position.x / this.sectorSize),
				y: Math.floor(polygon.position.y / this.sectorSize)
			}
			this.sectors[`${sector.x}-${sector.y}`].addChild(polygon);
			polygon.sector = sector;
		});
	}

	// Place each dynamic polygon into its respective sector
	partitionObjects() {
		this.#env._dynamicPolygons.forEach(polygon => {
			// Find the current sector
			const sector = {
				x: Math.floor(polygon.position.x / this.sectorSize),
				y: Math.floor(polygon.position.y / this.sectorSize)
			}
			// If the polygon has moved, remove it from the last sector
			if (polygon.sector && (polygon.sector.x !== sector.x || polygon.sector.y !== sector.y)) {
				this.sectors[`${polygon.sector.x}-${polygon.sector.y}`].removeChild(polygon.id);
			}
			// Update the sector and add the polygon to the new sector
			if (this.sectors[`${sector.x}-${sector.y}`]) {
				this.sectors[`${sector.x}-${sector.y}`].addChild(polygon);
				polygon.sector = sector;
			} else {
				polygon.sector = null;
			}
		});
	}

	// Create a queue of potential collisions to resolve
	collisionQueue() {
		// Check for objects in the same sector, as well as BL, B, BR, R
		// When adding collisions in adjacent sectors, add a collision between the object in the origin sector and each object in the adjacent sector
		// When adding collisions in the origin sector, add a collision for each object with each object below it in the list
		Object.values(this.sectors).forEach(origin => {
			if (origin.count > 1) {
				origin.childList.forEach((polygon, index) => {
					if (index < origin.childList.length - 1) {
						origin.childList.slice(index + 1).forEach(other => {
							this.collisions.push([polygon, other]);
						});
					}
				});
			}

			// Check BL
			const bl = this.sectors[`${origin.x - 1}-${origin.y + 1}`];
			if (bl && bl.count > 0) {
				origin.childList.forEach(polygon => {
					bl.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check B
			const b = this.sectors[`${origin.x}-${origin.y + 1}`];
			if (b && b.count > 0) {
				origin.childList.forEach(polygon => {
					b.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check BR
			const br = this.sectors[`${origin.x + 1}-${origin.y + 1}`];
			if (br && br.count > 0) {
				origin.childList.forEach(polygon => {
					br.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check R
			const r = this.sectors[`${origin.x + 1}-${origin.y}`];
			if (r && r.count > 0) {
				origin.childList.forEach(polygon => {
					r.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}
		});
	}

	resolveCollisions() {
		this.collisions.forEach(pair => {
			if (pair[0].type === PolygonType.STATIC && pair[1].type === PolygonType.STATIC) return;

			const { resolution, resolutionVectors, linearVelocities, angularVelocities } = Engine.resolve(pair[0], pair[1], this.deltaTime);
			if (resolution) {
				pair[0].resolve(resolution.polygon1);
				pair[1].resolve(resolution.polygon2);
				
				pair[0].setVelocity(linearVelocities.polygon1);
				pair[1].setVelocity(linearVelocities.polygon2);

				pair[0].setAngularVelocity(angularVelocities.polygon1);
				pair[1].setAngularVelocity(angularVelocities.polygon2);
			}
			globalThis.polygon1 = pair[0];
			globalThis.polygon2 = pair[1];
		});
		this.collisions = [];
	}

	// Resolves collisions but does not apply them. Called at the end of the physics step. 
	// Less accurate. Really only for debugging.
	// calculateCollisionResolution() {
	// 	this.collisions.forEach(pair => {
	// 		if (pair[0].type === PolygonType.STATIC && pair[1].type === PolygonType.STATIC) return;
			
	// 		const { resolution, linearVelocities, angularVelocities } = Resolver.resolve(pair[0], pair[1]);
	// 		if (resolution) {
	// 			this.resolutionMap[pair[0].id] = {
	// 				resolution: resolution.polygon1,
	// 				velocity: linearVelocities.polygon1,
	// 				angularVelocity: angularVelocities.polygon1
	// 			};
	// 			this.resolutionMap[pair[1].id] = {
	// 				resolution: resolution.polygon2,
	// 				velocity: linearVelocities.polygon2,
	// 				angularVelocity: angularVelocities.polygon2
	// 			};
	// 		}
	// 	});
	// 	this.collisions = [];
	// }

	// Applies the collision resolutions calculated in the previous physics step. Called at the beginning of the physics step.
	// Less accurate. Really only for debugging.
	// applyCollisionResolution() {
	// 	Object.keys(this.resolutionMap).forEach(id => {
	// 		const polygon = this.#env.dynamicPolygons.get(id);
	// 		if (!polygon) return;
	// 		const { resolution, velocity, angularVelocity } = this.resolutionMap[id];
	// 		polygon.resolve(resolution);
	// 		polygon.setVelocity(velocity);
	// 		polygon.setAngularVelocity(angularVelocity);
	// 	});
	// 	this.resolutionMap = {};
	// }

	addForces() {
		this.#env._dynamicPolygons.forEach(polygon => {
			polygon.addForce(
				new Vector({
					magnitude: this.#env.gravity,
					angle: Angle.DOWN
				}),
				Force.ACCELERATION
			);
		});
	}

	update() {
		this.#env._dynamicPolygons.forEach(polygon => {
			polygon.update(this.deltaTime);
		});
	}

	// Resolve collision by SAT
	// Return the position adjustments of the objects and the new velocities

	// The polygon with the least overlap on one of the axis is the one whose edge is colliding. 
	// The other point of contact is most likely a vertex of the other polygon, but may be an edge if perfectly aligned.
	static resolve(polygon1, polygon2, deltaTime) {
		let overlap = Infinity;
		let overlapNormal = null;
		let normalCorrection = 1;
		let verticesOfContact = []; // 1 or -1. If the vertex is on the other polygon, the resolution must be in the negative of the normal direction
		let collisionType = 1; 		// 1 = vertex-edge, 2 = edge-edge
		let collisionOwner = null; 	// If the collision is type 1, this will be the polygon that the vertex belongs to
		const pointOfCollision = new Point();
		const resolution = {
			polygon1: new SimpleVector(),
			polygon2: new SimpleVector()
		};

		const p1Max = polygon1._vertexCount - 1;
		const p2Max = polygon2._vertexCount - 1;

		for (let i = 0; i < polygon1._vertexCount; i++) {
			const vertex1 = polygon1.vertices.getAt(i);
			const vertex2 = polygon1.vertices.getAt((i === polygon1._vertexCount - 1) ? 0 : (i + 1));

			// Get the normal of the edge
			const normal = new SimpleVector({
				x: -(vertex1.y - vertex2.y),
				y: (vertex1.x - vertex2.x)
			})._normalize();

			// Get the dot offset (makes the projection relative to the other polygon)
			const offset = Vector.dot(
				{
					x: polygon2.position.x - polygon1.position.x,
					y: polygon2.position.y - polygon1.position.y
				},
				normal
			);

			// Project the vertices of the polygons onto the normal
			const proj1 = Utils.objSort(polygon1.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 3),
				id: v.id
			})), "value");
			const proj2 = Utils.objSort(polygon2.vertices.map(v => ({
				value: Utils.Round((Vector.dot(v, normal) + offset), 3),
				id: v.id
			})), "value");

			if (proj1[p1Max].value < proj2[0].value || proj1[0].value > proj2[p2Max].value) {
				return false; // Early exit if there is a separating axis
			} else {
				// Find the minimum overlap
				const overlapP1MaxP2Min = Math.abs(proj1[p1Max].value - proj2[0].value);
				const overlapP1MinP2Max = Math.abs(proj2[p2Max].value - proj1[0].value);

				// If both possible overlaps are greater than the current overlap, this axis is not the minimum separating axis. Skip the rest.
				if (overlapP1MaxP2Min > overlap && overlapP1MinP2Max > overlap) {
					continue;
				}

				overlapNormal = normal;

				// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
				if (proj2[p2Max].value === proj2[p2Max - 1].value) {
					collisionType = 2;
					collisionOwner = null;
					verticesOfContact = [
						polygon2.vertices.get(proj2[p2Max].id).add(polygon2.position),
						polygon2.vertices.get(proj2[p2Max - 1].id).add(polygon2.position),
						polygon1.vertices.get(proj1[0].id).add(polygon1.position),
						polygon1.vertices.get(proj1[1].id).add(polygon1.position)
					];
				} else {
					collisionType = 1; // vertex-edge collision
					collisionOwner = 2; // The vertex belongs to polygon 2, since the normal is from polygon 1
				}

				// Ensure that we're getting the correct overlap based on which side of the projection each polygon is on
				if (overlapP1MaxP2Min <= overlapP1MinP2Max) {
					overlap = overlapP1MaxP2Min;
					normalCorrection = 1;
					
					if (proj2[p2Max].value !== proj2[p2Max - 1].value) {
						verticesOfContact = [
							polygon2.vertices.get(proj2[0].id).add(polygon2.position)
						];
					}
				} else {
					overlap = overlapP1MinP2Max;
					normalCorrection = -1;
					
					if (proj2[p2Max].value !== proj2[p2Max - 1].value) {
						verticesOfContact = [
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

			// Get the normal of the edge
			const normal = new SimpleVector({
				x: -(vertex1.y - vertex2.y),
				y: (vertex1.x - vertex2.x)
			})._normalize();

			// Get the dot offset (makes the projection relative to the other polygon)
			const offset = Vector.dot(
				{
					x: polygon1.position.x - polygon2.position.x,
					y: polygon1.position.y - polygon2.position.y
				},
				normal
			);

			// Project the vertices of the polygons onto the normal
			const proj1 = Utils.objSort(polygon1.vertices.map(v => ({
				value: Utils.Round((Vector.dot(v, normal) + offset), 3),
				id: v.id
			})), "value");
			const proj2 = Utils.objSort(polygon2.vertices.map(v => ({
				value: Utils.Round(Vector.dot(v, normal), 3),
				id: v.id
			})), "value");

			if (proj1[p1Max].value < proj2[0].value || proj1[0].value > proj2[p2Max].value) {
				return false; // Early exit if there is a separating axis
			} else {
				// Find the minimum overlap
				const overlapP1MaxP2Min = Math.abs(proj1[p1Max].value - proj2[0].value);
				const overlapP1MinP2Max = Math.abs(proj2[p2Max].value - proj1[0].value);

				// If both possible overlaps are greater than the current overlap, this axis is not the minimum separating axis. Skip the rest.
				if (overlapP1MaxP2Min > overlap && overlapP1MinP2Max > overlap) {
					continue;
				}

				overlapNormal = normal;

				// If the two max values of the other polygon's projection are equal, this is an edge-edge collision
				if (proj1[p1Max].value === proj1[p1Max - 1].value) {
					collisionType = 2;
					collisionOwner = null;
					verticesOfContact = [
						polygon2.vertices.get(proj2[0].id).add(polygon2.position),
						polygon2.vertices.get(proj2[1].id).add(polygon2.position),
						polygon1.vertices.get(proj1[p1Max].id).add(polygon1.position),
						polygon1.vertices.get(proj1[p1Max - 1].id).add(polygon1.position)
					];
				} else {
					collisionType = 1; // vertex-edge collision
					collisionOwner = 1; // The vertex belongs to polygon 1, since the normal is from polygon 2
				}

				// Ensure that we're getting the correct overlap based on which side of the projection each polygon is on
				if (overlapP1MaxP2Min <= overlapP1MinP2Max) {
					overlap = overlapP1MaxP2Min;
					normalCorrection = 1;

					if (proj1[p1Max].value !== proj1[p1Max - 1].value) {
						verticesOfContact = [
							polygon1.vertices.get(proj1[p1Max].id).add(polygon1.position)
						];
					}
				} else {
					overlap = overlapP1MinP2Max;
					normalCorrection = -1;

					if (proj1[p1Max].value !== proj1[p1Max - 1].value) {
						verticesOfContact = [
							polygon1.vertices.get(proj1[0].id).add(polygon1.position)
						];
					}
				}
			}
		}

		// Correct the penetration
		const resVector = overlapNormal.scale(overlap * normalCorrection, true);
		const resolutionVectors = {
			polygon1: {},
			polygon2: {}
		};

		if (polygon1.type === PolygonType.STATIC) {
			resolution.polygon2.x = resVector.x;
			resolution.polygon2.y = resVector.y;
			resolutionVectors.polygon1 = new SimpleVector();
			resolutionVectors.polygon2 = resVector;
		} else if (polygon2.type === PolygonType.STATIC) {
			resolution.polygon1.x = resVector.x;
			resolution.polygon1.y = resVector.y;
			resolutionVectors.polygon1 = resVector;
			resolutionVectors.polygon2 = new SimpleVector();
		} else {
			resolution.polygon1.x = -resVector.x / 2;
			resolution.polygon1.y = -resVector.y / 2;
			resolution.polygon2.x = resVector.x / 2;
			resolution.polygon2.y = resVector.y / 2;
			resolutionVectors.polygon1 = resVector.scale(-0.5, true);
			resolutionVectors.polygon2 = resVector.scale(0.5, true);
		}

		const resolvedPositions = {
			polygon1: {
				x: polygon1.position.x + resolution.polygon1.x,
				y: polygon1.position.y + resolution.polygon1.y
			},
			polygon2: {
				x: polygon2.position.x + resolution.polygon2.x,
				y: polygon2.position.y + resolution.polygon2.y
			}
		}

		// Get the world point of contact
		if (collisionType === 1) {
			// Vertex-edge collision - the point of contact is the vertex
			pointOfCollision.x = verticesOfContact[0].x;
			pointOfCollision.y = verticesOfContact[0].y;
		} else {
			// Edge-edge collision
			// We know that all 4 vertices are in a straight (enough) line, and, as a simplification, the point of contact we want is the center of the two vertices in the middle
			// Choose a reference point, find the relative projection of each vertex and sort them to find which two are the middle two
			const refPoint = verticesOfContact[0];
			const projections = Utils.objSort(verticesOfContact.map(v => ({
				proj: Vector.dot(refPoint, v),
				pos: v
			})), "proj");
			pointOfCollision.x = (projections[1].pos.x + projections[2].pos.x + resolution.polygon1.x + resolution.polygon2.x) / 2;
			pointOfCollision.y = (projections[1].pos.y + projections[2].pos.y + resolution.polygon1.y + resolution.polygon2.y) / 2;
		}

		const correctedVelocities = {
			polygon1: {
				x: (polygon1.velocity.x - polygon1.acceleration.x * deltaTime),
				y: (polygon1.velocity.y - polygon1.acceleration.y * deltaTime),
			},
			polygon2: {
				x: (polygon2.velocity.x - polygon2.acceleration.x * deltaTime),
				y: (polygon2.velocity.y - polygon2.acceleration.y * deltaTime),
			},
		};

		let velocitiesToUse = overlap >= 0.002
			? correctedVelocities
			: { polygon1: polygon1.velocity, polygon2: polygon2.velocity };

		// Calculate resulting velocities
		// https://chrishecker.com/Rigid_Body_Dynamics#:~:text=Physics%2C%20Part%203%3A%20Collision%20Response
		const relativeVelocity = new SimpleVector({
			x: velocitiesToUse.polygon1.x - velocitiesToUse.polygon2.x,
			y: velocitiesToUse.polygon1.y - velocitiesToUse.polygon2.y
		});
		relativeVelocity._scale(-(1 + (polygon1.restitution * polygon2.restitution)));
		const relativeContact = {
			polygon1: new SimpleVector({
				x: pointOfCollision.x - resolvedPositions.polygon1.x,
				y: pointOfCollision.y - resolvedPositions.polygon1.y
			}),
			polygon2: new SimpleVector({
				x: pointOfCollision.x - resolvedPositions.polygon2.x,
				y: pointOfCollision.y - resolvedPositions.polygon2.y
			})
		};

		const normalizedPerp = new SimpleVector({
			x: overlapNormal.y,
			y: -overlapNormal.x
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
				x: velocitiesToUse.polygon1.x + scaledImpulseNormalP1.x,
				y: velocitiesToUse.polygon1.y + scaledImpulseNormalP1.y
			},
			polygon2: {
				x: velocitiesToUse.polygon2.x - scaledImpulseNormalP2.x,
				y: velocitiesToUse.polygon2.y - scaledImpulseNormalP2.y
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

		return { resolution, resolutionVectors, linearVelocities, angularVelocities };
	}

	addSector(sector) {
		this.sectors[`${sector.x}-${sector.y}`] = sector;
	}

	clearSectors() {
		this.sectors = {};
	}

	setSectorCount(x, y) {
		this.sectorCount.x = x;
		this.sectorCount.y = y;
	}

	setSectorSize(size) {
		this.sectorSize = size;
	}
}