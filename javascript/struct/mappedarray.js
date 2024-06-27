export default class MappedArray {
	get length() { return this.#length; }

	#idProp = "id";		// Property to pull from inserted objects to use as the indexed ID
	#collection = [];	// Main array of objects
	#length = 0;		// Length of the array
	#idxMap = {};		// Map of object IDs to their indices in the array

	constructor(arr = [], idProp = "id", optimizeRemove = false) {
		this.#idProp = idProp;
		arr.forEach((obj, idx) => {
			this.#collection.push(obj, idx);
			this.#idxMap[obj[idProp]] = idx;
		});
	}

	removeAt(index) {
		const map = Object.values(this.#idxMap);
		const id = map.find(v => v === index)[0];
		if (id === undefined) return false;
		return this.remove(id);
	}

	remove(id) {
		const index = this.#idxMap[id];
		if (index === undefined) return false;
		delete this.#idxMap[id];
		this.#collection.splice(index, 1);
		for (let i = 0; i < this.#length - 1; i++) {
			const obj = this.#collection[i];
			if (this.#idxMap[obj[this.#idProp]] > index) {
				this.#idxMap[obj[this.#idProp]] -= 1;
			}
		}
		this.#length--;
		return true;
	}

	get(id) {
		const index = this.#idxMap[id];
		if (index === undefined) return undefined;
		return this.#collection[index];
	}
	
	push(obj) {
		this.#collection.push(obj);
		this.#idxMap[obj[this.#idProp]] = this.#length++;
	}

	forEach(callback) {
		this.#collection.forEach(callback);
	}

	map(callback) {
		return this.#collection.map(callback);
	}

	filter(callback) {
		return this.#collection.filter(callback);
	}

	find(callback) {
		return this.#collection.find(callback);
	}

	getIndex(id) {
		return this.#idxMap[id];
	}
}