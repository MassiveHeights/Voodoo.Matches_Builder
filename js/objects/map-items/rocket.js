import {Spine} from 'black-spine';
import {Black, GameObject} from 'black-engine';
import PhysicsOption from "../../physics/physics-options";
import {Polygon, Vec2} from "planck-js";
import * as planck from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import {DisplayObject, Sprite, Vector} from "black-engine";

export default class Rocket extends DisplayObject {
  constructor(physics) {
    super();
    this._physics = physics;

    this._rocket = null;
    this._firework = null;
    this._rocketView = null;
    this._startPos = null;
    this._rocketBox = null;

    this._scale = 0.25;
    this._isLaunched = false;

    this._rocketLaunched = false;
    this._init();
  }

  getRocketPos() {
    const pos = new Vector();
    const {_rocketView: rocketView, _startPos: startPos} = this;

    pos.x = (rocketView.x - startPos.x) * this._scale * 3.2;
    pos.y = (rocketView.y - startPos.y) * this._scale;

    return pos;
  }

  reset() {
    this._isLaunched = false;
    this._rocket.play('static', false);
    this._firework.off('animationComplete');
  }

  launch() {
    this._isLaunched = true;
    Black._soundManager.playFx('rocketS');

    const rocket = this._rocket;

    rocket.play('animation', false);
    rocket.once('animationComplete', () => {
      this._launchFirework();
    });
  }

  _launchFirework() {
    const firework = this._firework;

    firework.x = this.getRocketPos().x;
    firework.y = -this.getRocketPos().y;

    firework.visible = true;
    firework.play('animation', false);

    Black._soundManager.playFx('firework_1', 1, true);
    Black._soundManager.playFx('firework_2', 1, true);
    Black._soundManager.playFx('firework_3', 1, true);

    this._firework.once('animationComplete', () => {
      if(this._isLaunched){
        this._firework.rotation = Math.random() * 2 * Math.PI;
        this._launchFirework();
      }
    });
  }

  _init() {
    this._initRocket();
    this._initFirework();

  }

  initBody() {
    const width = 1.5;
    const height = 0.5;
    const s = PhysicsOption.worldScale;

    this._rocketBox = this._physics.world.createBody({
      bullet: true,
      type: 'dynamic',
      position: Vec2(0, 0),
      userData: {
        id: 'rocket',
        type: 'rocket',
        object: this
      },
      gravityScale: 0
    });

    this._rocketBox.createFixture({
      shape: Polygon([
        planck.Vec2(0, 0),
        planck.Vec2(width, 0),
        planck.Vec2(width, height),
        planck.Vec2(0, height)
      ]),

      filterCategoryBits: BodiesTypes.rocket,
      filterMaskBits: BodiesTypes.fire,
    });

    this._rocketBox.setAngle(Math.PI * 0.37);

    this._rocketBox.setPosition(Vec2(this.x / s - 0.25, this.y / s - 0.75));
    this._rocketBox.setActive(true);
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

    firework.alignPivotOffset(0.5);

    firework.scale = this._scale;
    firework.visible = false;
  }
}
