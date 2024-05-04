import Point from "./struct/point.js";
import Polygon from "./struct/polygon.js";
import Store from "./engine/store.js";
import { PolyType } from "./struct/enum.js";
import Utils from "./engine/utils.js";

Store.init();

Store.addPolygon(new Polygon([
	new Point(100, 100),
	new Point(200, 100),
	new Point(200, 200),
	new Point(100, 200)
], PolyType.DYNAMIC));

Store.addPolygon(new Polygon([
	new Point(25, window.innerHeight - 150),
	new Point(200, window.innerHeight - 150),
	new Point(25, window.innerHeight - 100),
	new Point(200, window.innerHeight - 100)
], PolyType.STATIC));