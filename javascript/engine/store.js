import Renderer from "./render.js";
import Engine from "./engine.js";
import Clock from "./clock.js";
import { PolyType } from "../struct/enum.js";
import MappedArray from "../struct/mappedarray.js";

export default class Store {
	static polygons = new MappedArray([]);
	static dynamicPolygons = new MappedArray([]);
	static staticPolygons = new MappedArray	;
	static sectors = {};
	static sectorCount = {
		x: null,
		y: null
	}
	static sectorSize = null;

	static GRAVITY = 9.8;
	static SCALE = 1;		// Pixels that equal 1 meter

	static _debugPts = [];
	static _debugVectors = [];

	Clock = null;
	Engine = null;
	Renderer = null;
	
	constructor() { }

	static init() {
		this.Clock = new Clock();
		this.Engine = new Engine(this.Clock);
		this.Renderer = new Renderer(this.Clock);

		setTimeout(() => {
			this.Clock.start();
		}, 0);
	}

	static addPolygon(polygon) {
		this.polygons.push(polygon);
		if (polygon.type === PolyType.DYNAMIC) {
			this.dynamicPolygons.push(polygon);
		} else {
			this.staticPolygons.push(polygon);
		}
		this.Engine.createSectors();
	}

	static addSector(sector) {
		this.sectors[`${sector.x}-${sector.y}`] = sector;
	}

	static clearSectors() {
		this.sectors = {};
	}

	static setSectorCount(x, y) {
		this.sectorCount.x = x;
		this.sectorCount.y = y;
	}

	static setSectorSize(size) {
		this.sectorSize = size;
	}

	static addSectorChild(sector, child) {

	}
}