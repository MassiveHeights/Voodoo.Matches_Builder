import { DisplayObject, Sprite } from "black-engine";
import { Spine } from 'black-spine';

export default class Rocket extends DisplayObject {
  constructor() {
    super();

    this._rocket = null;
    this._firework = null;
    this._scale = 0.2;

    this._init();
    // this.launch()
  }

  launch() {
    const rocket = this._rocket;
    const firework = this._firework;
    const rocketView = rocket.skeleton.bones.find(bone => bone.data.name === "rocket");

    const startX = rocketView.x;
    const startY = rocketView.y;

    rocket.play('animation', false);

    rocket.on('animationComplete', () => {
      firework.x += (rocketView.x - startX) * this._scale * 3.2;
      firework.y -= (rocketView.y - startY) * this._scale;

      firework.visible = true;
      firework.play('animation', true);

      this._firework.on('animationComplete', () => {
        this._firework.rotation = Math.random() * 2 * Math.PI;
      });
    });
  }

  _init() {
    this._initRocket();
    this._initFirework();
  }

  _initRocket() {
    const rocket = this._rocket = new Spine('rocket');
    this.add(rocket);

    rocket.scale = this._scale;
    rocket.rotation = -Math.PI * 0.12;
    rocket.play('static', false);
  }

  _initFirework() {
    const firework = this._firework = new Spine('firework');
    this.add(firework);

    firework.alignPivotOffset(0.5)

    firework.scale = this._scale;
    firework.visible = false;
  }
}