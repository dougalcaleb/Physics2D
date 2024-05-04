import Style from "../global/style.js";
import Store from "./store.js";

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

	render(deltaTime) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = Style.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		Object.values(Store.sectors).forEach(sector => {
			this.ctx.strokeStyle = Style.debug;
			this.ctx.lineWidth = Style.lineWidth;
			this.ctx.strokeRect(sector.x * sector.width, sector.y * sector.height, sector.width, sector.height);
		});

		Store.polygons.forEach(polygon => {
			this.ctx.strokeStyle = Style.line;
			this.ctx.lineWidth = Style.lineWidth;
			this.ctx.beginPath();
			const start = polygon.vertices[0].add(polygon.position);
			this.ctx.moveTo(start.x, start.y);
			polygon.vertices.forEach((vertex, index) => {
				if (index > 0) {
					const pos = vertex.add(polygon.position);
					this.ctx.lineTo(pos.x, pos.y);
				}
			});
			this.ctx.closePath();
			this.ctx.stroke();
		});
	}
}