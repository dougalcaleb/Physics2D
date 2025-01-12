export class PolygonType {
	static DYNAMIC = 0;
	static STATIC = 1;
}

export class Angle {
	static UP = Math.PI / 2;
	static DOWN = Math.PI * 3 / 2;
	static LEFT = Math.PI;
	static RIGHT = 0;
}

export class Force {
	static FORCE = 0;
	static ACCELERATION = 1;
	static IMPULSE = 2;
	static VELOCITY = 3;
}