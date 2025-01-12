export default class Utils {

	static __uuidIterator = Utils.#uuidGen();

	constructor() { }

	// Accurately rounds a value to a specified number of decimal places
	static Round(value, places) {
		return +(Math.round(value + "e+" + places) + "e-" + places);
	}

	// Helper function to generate a UUID
	static * #uuidGen() {
		let curr = 0;
		while (true) {
			yield curr.toString(16).padStart(6, "0");
			curr++;
		}
	}

	// Generator function that gives a 6-char hex string in ascending order
	static UUID() {
		return Utils.__uuidIterator.next().value;
	}

	// Sorts (in place) an array of GT/LT/ET comparable objects by Insertion Sort
	static sort(arr) {
		for (let i = 1; i < arr.length; i++) {
			let key = arr[i];
			let j = i - 1;
			while (j >= 0 && arr[j] > key) {
				arr[j + 1] = arr[j];
				j = j - 1;
			}
			arr[j + 1] = key;
		}
		return arr;
	}

	/**
	 * Sorts (in place) an array of objects by Insertion Sort
	 * @param {Array} arr Array of objects
	 * @param {String} prop Property to compare
	 */
	static objSort(arr, prop) {
		for (let i = 1; i < arr.length; i++) {
			let key = arr[i];
			let j = i - 1;
			// Compare using the property
			while (j >= 0 && arr[j][prop] > key[prop]) {
				arr[j + 1] = arr[j];
				j = j - 1;
			}
			arr[j + 1] = key;
		}
		return arr;
	}
}