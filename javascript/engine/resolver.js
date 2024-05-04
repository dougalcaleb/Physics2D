export default class Resolver {
	constructor() { }
	
	static resolve(polygon1, polygon2) {
		// Resolve collision by SAT
		// Return the positions of the objects and the forces to apply
	}

	static addForce(magnitude, angle) { 
		// Add a force through the center of mass
		// Return the velocity
	}
	
	static addTorque(magnitude, direction) {
		// Add a torque through the center of mass
		// Return the angular velocity
	}
}