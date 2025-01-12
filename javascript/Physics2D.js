import MappedArray from "./struct/mappedarray.js";
import { PolygonType, Force, Angle } from "./struct/enum.js";
import Clock from "./engine/clock.js";
import Engine from "./engine/engine.js";
import Renderer from "./engine/render.js";
import Point from "./struct/point.js";
import Polygon from "./struct/polygon.js";
import Vector from "./struct/vector.js";

export default class Physics2D {
	defaultOptions = {
		scale: 60,
		gravity: 9.8,
		canvas: null,
		sceneX: 0,
		sceneY: 0,
		backgroundColor: "#191919",
		lineColor: "#36A355",
		fillColor: "rgba(0,0,0,0)",
		lineWidth: 2,
	};

	scale = undefined;
	gravity = undefined;
	canvas = undefined;
	sceneX = undefined;
	sceneY = undefined;
	backgroundColor = undefined;
	lineColor = undefined;
	fillColor = undefined;
	lineWidth = undefined;

	get paused() {
		return this.__Clock.paused;
	}
	get frame() {
		return this.__Clock._frame;
	}
		
	__Clock = null;
	__Engine = null;
	__Renderer = null;
	
	_polygons = new MappedArray();
	_dynamicPolygons = new MappedArray();
	_staticPolygons = new MappedArray();
	
	constructor(options = this.defaultOptions) {
		const finalSettings = Object.assign(this.defaultOptions, options);
		Object.entries(finalSettings).forEach(([key, value]) => {
			if (this.defaultOptions[key] === undefined) {
				throw new Error(`Invalid option: ${key}`);
			}
			this[key] = value;
		});

		this.__Clock = new Clock(this);
		this.Engine = new Engine(this, this.__Clock);
		this.Renderer = new Renderer(this, this.__Clock);
	}

	start() {
		this.__Clock.start();
	}

	pause() {
		this.__Clock.pause();
	}

	step(deltaTime = 1000 / 60) {
		this.__Clock.pausedAt += (deltaTime);
		this.__Clock.step(this.__Clock.pausedAt, false);
	}

	beforeStep(callback) {
		this.__Clock.subscribeBefore(callback);
	}

	afterStep(callback) {
		this.__Clock.subscribeAfter(callback);
	}

	addPolygon(polygon) {
		this._polygons.push(polygon);
		if (polygon.type === PolygonType.DYNAMIC) {
			this._dynamicPolygons.push(polygon);
		} else {
			this._staticPolygons.push(polygon);
		}
		this.Engine.createSectors();
	}
}

export { Polygon, Point, PolygonType, Force, Angle, Vector }