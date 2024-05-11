export default class Utils {

	static __uuidIterator = Utils.#uuidGen();

	constructor() { }

	// unused for now
	static Round(value, places) {
		return +(Math.round(value + "e+" + places) + "e-" + places);
	}

	// generator function that gives a 6-char hex string in ascending order
	static * #uuidGen() {
		let curr = 0;
		while (true) {
			yield curr.toString(16).padStart(6, "0");
			curr++;
		}
	}

	static UUID() {
		return Utils.__uuidIterator.next().value;
	}
}