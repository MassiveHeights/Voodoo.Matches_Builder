import { DisplayObject, Sprite, Vector } from "black-engine";
import { Spine } from 'black-spine';
import { Black } from 'black-engine';

export default class Rocket extends DisplayObject {
  constructor() {
    super();

    this._rocket = null;
    this._firework = null;
    this._rocketView = null;
    this._startPos = null;

    this._scale = 0.25;

    this._init();
  }

  getRocketPos() {
    const pos = new Vector();
    const { _rocketView: rocketView, _startPos: startPos } = this;

    pos.x = (rocketView.x - startPos.x) * this._scale * 3.2;
    pos.y = (rocketView.y - startPos.y) * this._scale;

    return pos;
  }

  launch() {
    Black._soundManager.playFx('rocketS');

    const rocket = this._rocket;
    const firework = this._firework;

    rocket.play('animation', false);

    rocket.on('animationComplete', () => {
      firework.x += this.getRocketPos().x;
      firework.y -= this.getRocketPos().y;

      firework.visible = true;
      firework.play('animation', true);
      Black._soundManager.playFx('firework_1', 1, true);
      Black._soundManager.playFx('firework_2', 1, true);
      Black._soundManager.playFx('firework_3', 1, true);

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

    this._rocketView = rocket.skeleton.bones.find(bone => bone.data.name === "rocket");
    this._startPos = new Vector(this._rocketView.x, this._rocketView.y);
  }

  _initFirework() {
    const firework = this._firework = new Spine('firework');
    this.add(firework);

    firework.alignPivotOffset(0.5)

    firework.scale = this._scale;
    firework.visible = false;
  }
}