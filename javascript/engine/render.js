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

		let active = false;
		let abortController = new AbortController();
		document.querySelector("#debug-render").addEventListener("click", () => {
			const coordHeight = 25;
			const coordText = "yellow";
			const mouseDistance = 10;
			let dragStart = null;
			let dragging = false;
			if (active) {
				abortController.abort();
				active = false;
			} else {
				this.mouseEvent = document.addEventListener("mousemove", (moveEvent) => {
					this.render();
					let dragLength = dragging ? Number(Math.sqrt(Math.pow(moveEvent.clientX - dragStart.x, 2) + Math.pow(moveEvent.clientY - dragStart.y, 2)).toFixed(2)) : 0;
					const text = `X: ${moveEvent.clientX}, Y: ${moveEvent.clientY}${dragging ? " Length: " + dragLength + `px (${(dragLength / Store.SCALE).toFixed(2)}m)` : ""}`;
					if (moveEvent.clientY < coordHeight + mouseDistance) {
						this.ctx.fillStyle = coordText;
						this.ctx.font = "12px monospace";
						this.ctx.fillText(text, moveEvent.clientX + 10, moveEvent.clientY + coordHeight + mouseDistance + 15);
					} else {
						this.ctx.fillStyle = coordText;
						this.ctx.font = "12px monospace";
						this.ctx.fillText(text, moveEvent.clientX + 10, moveEvent.clientY - coordHeight - mouseDistance + 15);
					}
					if (dragStart && dragging) {
						this.ctx.strokeStyle = "red";
						this.ctx.beginPath();
						this.ctx.moveTo(dragStart.x, dragStart.y);
						this.ctx.lineTo(moveEvent.clientX, moveEvent.clientY);
						this.ctx.stroke();
					}
				}, { signal: abortController.signal });
				this.canvas.addEventListener("mousedown", (downEvent) => {
					dragStart = {
						x: downEvent.clientX,
						y: downEvent.clientY
					};
					dragging = true;
				}, { signal: abortController.signal });
				this.canvas.addEventListener("mouseup", (upEvent) => {
					dragging = false;
					dragStart = null;
				}, { signal: abortController.signal });
			}
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
		
		// Draw a reference scale in the upper left (10m, 1m, 0.5m)
		this.ctx.strokeStyle = Style.debug.scale;
		this.ctx.lineWidth = Style.lineWidth;
		this.ctx.beginPath();
		this.ctx.moveTo(10, 10);
		this.ctx.lineTo(10 * Store.SCALE, 10);
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.moveTo(10, 20);
		this.ctx.lineTo(Store.SCALE + 10, 20);
		this.ctx.stroke();
		this.ctx.beginPath();
		this.ctx.moveTo(10, 30);
		this.ctx.lineTo(0.5 * Store.SCALE + 10, 30);
		this.ctx.stroke();

		Store.polygons.forEach(polygon => {
			this.ctx.strokeStyle = Style.line;
			this.ctx.lineWidth = Style.lineWidth;
			this.ctx.beginPath();
			const start = polygon.vertices.getAt(0).add(polygon.position);
			this.ctx.moveTo(start.x * Store.SCALE, this.canvas.height - (start.y * Store.SCALE));
			polygon.vertices.forEach((vertex, index) => {
				const pos = vertex.add(polygon.position);
				if (index > 0) {
					this.ctx.lineTo(pos.x * Store.SCALE, this.canvas.height - (pos.y * Store.SCALE));
				}
				// this.ctx.fillStyle = "orange";
				// this.ctx.font = "12px monospace";
				// this.ctx.fillText(vertex.id, pos.x * Store.SCALE, this.canvas.height - (pos.y * Store.SCALE));
			});
			this.ctx.closePath();
			this.ctx.stroke();

			// RED: Last force   GREEN: Velocity   BLUE: Acceleration
			// this.drawVector(polygon.position, polygon.position.add(polygon._lastForce), Style.debug.force);
			// this.drawVector(polygon.position, polygon.position.add(polygon.velocity), Style.debug.velocity);
			// this.drawVector(polygon.position, polygon.position.add(polygon.acceleration), Style.debug.acceleration);

			// this.ctx.fillStyle = Style.debug.text;
			// this.ctx.font = "12px monospace";
			// this.ctx.fillText(polygon.id, polygon.position.x * Store.SCALE, this.canvas.height - (polygon.position.y * Store.SCALE));

			// if (polygon.type === PolyType.STATIC) return;
			// polygon.debugVectors.forEach(data => {
			// 	this.ctx.strokeStyle = this.ctx.strokeStyle = data.color;
			// 	this.ctx.beginPath();
			// 	this.ctx.moveTo(
			// 		(polygon.position.x + data.vector.origin.x) * Store.SCALE,
			// 		this.canvas.height - ((polygon.position.y + data.vector.origin.y) * Store.SCALE)
			// 	);
			// 	this.ctx.lineTo(
			// 		(polygon.position.x + data.vector.origin.x) * Store.SCALE + (data.vector.x * Store.SCALE * DEBUG_SCALE),
			// 		this.canvas.height - ((polygon.position.y + data.vector.origin.y) * Store.SCALE) - (data.vector.y * Store.SCALE * DEBUG_SCALE)
			// 	);
			// 	this.ctx.stroke();
			// });
		});

		Store._debugPts.forEach((pt) => {
			this.ctx.fillStyle = pt.color;
			this.ctx.beginPath();
			if (!pt.shape) {
				this.ctx.arc(pt.x * Store.SCALE, this.canvas.height - (pt.y * Store.SCALE), pt.size || 5, 0, 2 * Math.PI);
			} else if (pt.shape === "rect") {
				this.ctx.rect(pt.x * Store.SCALE, this.canvas.height - (pt.y * Store.SCALE), pt.size, pt.size);
			}
			this.ctx.fill();
		});

		Store._debugVectors.forEach(data => this.drawVector(data.origin, { x: data.x, y: data.y }, data.color, data.head));

		Store._debugPts = [];
		Store._debugVectors = [];
	}

	drawVector(origin, components, color = "red", head = true) {
		const _origin = {
			x: origin.x * Store.SCALE,
			y: this.canvas.height - (origin.y * Store.SCALE)
		}
		const _components = {
			x: components.x * Store.SCALE,
			y: components.y * Store.SCALE
		}

		const ctx = this.ctx;
		const arrowHeadLength = 0.2 * Store.SCALE; // Length of the arrowhead lines
		const arrowHeadAngle = Math.PI / 6; // Angle between the arrowhead lines and the vector line
	
		// Calculate the angle of the vector
		const angle = Math.atan2(_components.y, _components.x);
	
		// Calculate the points for the arrowhead
		const arrowPoint1 = {
			x: _components.x - arrowHeadLength * Math.cos(angle - arrowHeadAngle),
			y: _components.y - arrowHeadLength * Math.sin(angle - arrowHeadAngle)
		};
		const arrowPoint2 = {
			x: _components.x - arrowHeadLength * Math.cos(angle + arrowHeadAngle),
			y: _components.y - arrowHeadLength * Math.sin(angle + arrowHeadAngle)
		};

		// Transform the arrowhead points to the canvas coordinate system
		const arrowPoint1Canvas = {
			x: _origin.x + arrowPoint1.x,
			y: _origin.y - arrowPoint1.y
		};
		const arrowPoint2Canvas = {
			x: _origin.x + arrowPoint2.x,
			y: _origin.y - arrowPoint2.y
		};

		// Draw the main line
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(_origin.x, _origin.y);
		ctx.lineTo(_origin.x + _components.x, _origin.y - _components.y);
		ctx.stroke();

		// Draw the arrowhead
		if (head) {
			ctx.beginPath();
			ctx.moveTo(_origin.x + _components.x, _origin.y - _components.y);
			ctx.lineTo(arrowPoint1Canvas.x, arrowPoint1Canvas.y);
			ctx.lineTo(arrowPoint2Canvas.x, arrowPoint2Canvas.y);
			ctx.lineTo(_origin.x + _components.x, _origin.y - _components.y);
			ctx.fillStyle = color;
			ctx.fill();
		}
	}
}