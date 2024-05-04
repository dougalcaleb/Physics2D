import Renderer from "./struct/render.js";
import Engine from "./engine/engine.js";
import Clock from "./engine/clock.js";

const clock = new Clock();
const engine = new Engine(clock);
const renderer = new Renderer(clock);

clock.start();