import Resolver from "./resolver.js";

export default class Engine {

	constructor(clock) {
		clock.subscribe(this.step);
	}
	
	start() {
		
	}
	
	step(deltaTime) {
		
	}
}