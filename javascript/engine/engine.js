import Resolver from "./resolver.js";
import Store from "./store.js";
import Sector from "../struct/sector.js";

export default class Engine {

	constructor(clock) {
		this.step = this.step.bind(this);
		clock.subscribe(this.step);
	}
	
	start() {
		
	}
	
	step(deltaTime) {
		this.partitionObjects();
		
	}

	// Create spatial partitioning sectors to aid in broad-phase pruning
	// https://developer.nvidia.com/gpugems/gpugems3/part-v-physics-simulation/chapter-32-broad-phase-collision-detection-cuda#:~:text=32.1.2%20Spatial%20Subdivision
	createSectors() {
		// Find the cell size that will fit the largest polygon. 
		// The canvas will be split into the smallest square that can fit the largest polygon, 
		// where they fit perfectly on the x - axis and have a remainder at the bottom on the y - axis.
		Store.clearSectors();
		const size = Store.polygons.reduce((max, polygon) => {
			return 2 * Math.max(max, polygon.maxSize);
		}, 0);
		const cellCountX = Math.ceil(window.innerWidth / size);
		const cellCountY = Math.ceil(window.innerHeight / size) + 1;
		const cellSize = window.innerWidth / cellCountX;
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
			Store.sectors[`${sector.x}-${sector.y}`].addChild(polygon);
			polygon.sector = sector;
		});
	}
}