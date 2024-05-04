import Resolver from "../engine/resolver.js";

export default class Polygon {
	vertices = [];
	velocity = { x: 0, y: 0 };
	angularVelocity = 0;
	rotation = 0;
	position = { x: 0, y: 0 };
	mass = 1;

	constructor() { }
	
	addForce(magnitude, angle) {

	}

	addTorque(magnitude, direction) {

	}
}