import Resolver from "./resolver.js";
import Store from "./store.js";
import Sector from "../struct/sector.js";
import { Angle, PolyType } from "../struct/enum.js";
import Vector from "../struct/vector.js";

export default class Engine {
	collisions = [];
	deltaTime = 0;
	stepDelta = 0;
	resolutionMap = {}; // For step-separated collision resolution

	#stepStart = 0;

	constructor(clock) {
		this.step = this.step.bind(this);
		clock.subscribe(this.step);
	}
	
	start() {
		
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
		Store.clearSectors();
		let size = Store.polygons.reduce((max, polygon) => {
			return Math.max(max, polygon.maxSize);
		}, 0);
		size *= 2;
		const cellCountX = Math.ceil(window.innerWidth / (size * Store.SCALE));
		const cellCountY = Math.ceil(window.innerHeight / (size * Store.SCALE)) + 1;
		const cellSize = (window.innerWidth / cellCountX / Store.SCALE);
		Store.setSectorSize(cellSize);
		Store.setSectorCount(cellCountX, cellCountY);
		for (let x = 0; x < cellCountX; x++) {
			for (let y = 0; y < cellCountY; y++) {
				Store.addSector(new Sector(x, y, cellSize, cellSize));
			}
		}
		this.partitionStaticObjects();
	}

	// Place each static polygon into its respective sector
	partitionStaticObjects() {
		Store.staticPolygons.forEach(polygon => {
			const sector = {
				x: Math.floor(polygon.position.x / Store.sectorSize),
				y: Math.floor(polygon.position.y / Store.sectorSize)
			}
			Store.sectors[`${sector.x}-${sector.y}`].addChild(polygon);
			polygon.sector = sector;
		});
	}

	// Place each dynamic polygon into its respective sector
	partitionObjects() {
		Store.dynamicPolygons.forEach(polygon => {
			// Find the current sector
			const sector = {
				x: Math.floor(polygon.position.x / Store.sectorSize),
				y: Math.floor(polygon.position.y / Store.sectorSize)
			}
			// If the polygon has moved, remove it from the last sector
			if (polygon.sector && (polygon.sector.x !== sector.x || polygon.sector.y !== sector.y)) {
				Store.sectors[`${polygon.sector.x}-${polygon.sector.y}`].removeChild(polygon.id);
			}
			// Update the sector and add the polygon to the new sector
			if (Store.sectors[`${sector.x}-${sector.y}`]) {
				Store.sectors[`${sector.x}-${sector.y}`].addChild(polygon);
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
		Object.values(Store.sectors).forEach(origin => {
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
			const bl = Store.sectors[`${origin.x - 1}-${origin.y + 1}`];
			if (bl && bl.count > 0) {
				origin.childList.forEach(polygon => {
					bl.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check B
			const b = Store.sectors[`${origin.x}-${origin.y + 1}`];
			if (b && b.count > 0) {
				origin.childList.forEach(polygon => {
					b.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check BR
			const br = Store.sectors[`${origin.x + 1}-${origin.y + 1}`];
			if (br && br.count > 0) {
				origin.childList.forEach(polygon => {
					br.childList.forEach(other => {
						this.collisions.push([polygon, other]);
					});
				});
			}

			// Check R
			const r = Store.sectors[`${origin.x + 1}-${origin.y}`];
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
			if (pair[0].type === PolyType.STATIC && pair[1].type === PolyType.STATIC) return;

			const { resolution, resolutionVectors, linearVelocities, angularVelocities } = Resolver.resolve(pair[0], pair[1], this.deltaTime);
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
	// 		if (pair[0].type === PolyType.STATIC && pair[1].type === PolyType.STATIC) return;
			
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
	// 		const polygon = Store.dynamicPolygons.get(id);
	// 		if (!polygon) return;
	// 		const { resolution, velocity, angularVelocity } = this.resolutionMap[id];
	// 		polygon.resolve(resolution);
	// 		polygon.setVelocity(velocity);
	// 		polygon.setAngularVelocity(angularVelocity);
	// 	});
	// 	this.resolutionMap = {};
	// }

	addForces() {
		Store.dynamicPolygons.forEach(polygon => {
			polygon.addForce(new Vector(polygon.mass * Store.GRAVITY, Angle.DOWN));
		});
	}

	update() {
		Store.dynamicPolygons.forEach(polygon => {
			polygon.update(this.deltaTime);
		});
	}
}