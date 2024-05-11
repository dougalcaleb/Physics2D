import Style from "../global/style.js";
import Store from "./store.js";
import { PolyType } from "../struct/enum.js";

export default class Renderer {
	canvas = null;
	ctx = null;
	width = 0;
	height = 0;

	constructor(clock) {
		this.canvas = document.getElementById("render");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.ctx = this.canvas.getContext("2d");

		this.render = this.render.bind(this);
		clock.subscribe(this.render);

		window.addEventListener("resize", () => {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
		});
	}

	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = Style.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		Object.values(Store.sectors).forEach(sector => {
			this.ctx.strokeStyle = Style.debug.sector;
			this.ctx.lineWidth = Style.lineWidth;
			this.ctx.strokeRect(sector.x * sector.width * Store.SCALE, this.canvas.height - sector.y * sector.height * Store.SCALE, sector.width * Store.SCALE, sector.height * Store.SCALE);
			this.ctx.fillStyle = Style.debug.textDark;
			this.ctx.font = "10px monospace";
			this.ctx.fillText(sector.x + "-" + sector.y, (sector.x * sector.width * Store.SCALE) + 10, this.canvas.height - ((sector.y * sector.height * Store.SCALE) + 10));
		});
		const DEBUG_SCALE = 0.15;

		Store.polygons.forEach(polygon => {
			this.ctx.strokeStyle = Style.line;
			this.ctx.lineWidth = Style.lineWidth;
			this.ctx.beginPath();
			const start = polygon.vertices[0].add(polygon.position);
			this.ctx.moveTo(start.x * Store.SCALE, this.canvas.height - (start.y * Store.SCALE));
			polygon.vertices.forEach((vertex, index) => {
				if (index > 0) {
					const pos = vertex.add(polygon.position);
					this.ctx.lineTo(pos.x * Store.SCALE, this.canvas.height - (pos.y * Store.SCALE));
				}
			});
			this.ctx.closePath();
			this.ctx.stroke();

			// RED: Last force   GREEN: Velocity   BLUE: Acceleration
			this.ctx.strokeStyle = Style.debug.force;
			this.ctx.beginPath();
			this.ctx.moveTo(polygon.position.x * Store.SCALE, this.canvas.height - (polygon.position.y * Store.SCALE));
			this.ctx.lineTo(polygon.position.x * Store.SCALE + (polygon._lastForce.x * Store.SCALE * DEBUG_SCALE), (this.canvas.height - (polygon.position.y * Store.SCALE + (polygon._lastForce.y * Store.SCALE * DEBUG_SCALE))));
			this.ctx.stroke();

			this.ctx.strokeStyle = Style.debug.velocity;
			this.ctx.beginPath();
			this.ctx.moveTo(polygon.position.x * Store.SCALE, this.canvas.height - (polygon.position.y * Store.SCALE));
			this.ctx.lineTo(polygon.position.x * Store.SCALE + (polygon.velocity.x * Store.SCALE * DEBUG_SCALE), (this.canvas.height - (polygon.position.y * Store.SCALE + (polygon.velocity.y * Store.SCALE * DEBUG_SCALE))));
			this.ctx.stroke();

			this.ctx.strokeStyle = Style.debug.acceleration;
			this.ctx.beginPath();
			this.ctx.moveTo(polygon.position.x * Store.SCALE, this.canvas.height - (polygon.position.y * Store.SCALE));
			this.ctx.lineTo(polygon.position.x * Store.SCALE + (polygon.acceleration.x * Store.SCALE * DEBUG_SCALE), (this.canvas.height - (polygon.position.y * Store.SCALE + (polygon.acceleration.y * Store.SCALE * DEBUG_SCALE))));
			this.ctx.stroke();

			this.ctx.fillStyle = Style.debug.text;
			this.ctx.font = "12px monospace";
			this.ctx.fillText(polygon.id, polygon.position.x * Store.SCALE, this.canvas.height - (polygon.position.y * Store.SCALE));

			// if (polygon.type === PolyType.STATIC) return;
			polygon.debugVectors.forEach(data => {
				this.ctx.strokeStyle = this.ctx.strokeStyle = data.color;
				this.ctx.beginPath();
				this.ctx.moveTo(polygon.position.x + data.vector.origin.x, this.canvas.height - (polygon.position.y + data.vector.origin.y));
				this.ctx.lineTo(polygon.position.x + (data.vector.x) + data.vector.origin.x, (this.canvas.height - (polygon.position.y + (data.vector.y) + data.vector.origin.y)));
				this.ctx.stroke();
			});
		});
	}
}