import Style from "../global/style.js";

export default class Renderer {
	canvas = null;
	ctx = null;

	constructor(clock) {
		this.canvas = document.getElementById("render");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.ctx = this.canvas.getContext("2d");
		this.ctx.fillStyle = Style.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		clock.subscribe(this.render);
	}

	render(deltaTime) {}
}