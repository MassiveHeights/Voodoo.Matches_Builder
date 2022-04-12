import { Black, DisplayObject, Graphics, Sprite, TilingInfo } from "black-engine";
import PhysicsOption from "../../physics/physics-options";

export default class DotsHelper extends DisplayObject {
  constructor() {
    super();

    this._s = PhysicsOption.worldScale;
    this._pool = [];
    this._activePool = [];
    this._init();
  }

  set(points) {
    const s = this._s;

    points.forEach(point => {
      const dot = this._getDot();
      dot.visible = true;
      dot.x = point.x * s;
      dot.y = point.y * s;
    });
  }

  reset() {
    this._activePool.forEach(dot => {
      dot.visible = false;
    });

    this._pool.push(...this._activePool);
    this._activePool = [];
  }

  _init() {
    const count = 10;
    for (let i = 0; i < count; i++) {
      this._createDot();
    }
  }

  _createDot() {
    const dot = new Graphics();

    dot.beginPath();
    dot.fillStyle(0x00ff00, 1);
    dot.circle(0, 0, 7);
    dot.fill();

    this.add(dot);
    this._pool.push(dot);

    dot.visible = false;
  }

  _getDot() {
    const pool = this._pool;

    if(pool.length === 0) {
      this._createDot();
    }
    const dot = pool.shift();
    this._activePool.push(dot);

    return dot;
  }
}