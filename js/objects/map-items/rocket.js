import {DisplayObject, Sprite} from "black-engine";
import {Spine} from 'black-spine';
import {Black, GameObject} from 'black-engine';
import PhysicsOption from "../../physics/physics-options";
import {Polygon, Vec2} from "planck-js";
import * as planck from "planck-js";
import BodiesTypes from "../../physics/bodies-types";

export default class Rocket extends DisplayObject {
  constructor(physics) {
    super();
    this._physics = physics;

    this._rocket = null;
    this._firework = null;
    this._scale = 0.2;

    this._init();
    // this.launch()
  }

  launch() {
    Black._soundManager.playFx('rocketS');

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

  initBody() {
    const width = 1.5;
    const height = 0.5;
    const s = PhysicsOption.worldScale;

    const rocketBox = this._physics.world.createBody({
      bullet: true,
      type: 'dynamic',
      position: Vec2(0, 0),
      userData: {
        id: 'rocket',
        type: 'rocket',
        object: this
      },
      gravityScale:0
    });

    rocketBox.createFixture({
      shape: Polygon([
        planck.Vec2(0, 0),
        planck.Vec2(width, 0),
        planck.Vec2(width, height),
        planck.Vec2(0, height)
      ]),

      filterCategoryBits: BodiesTypes.rocket,
      filterMaskBits: BodiesTypes.fire,
    });

    rocketBox.setAngle(Math.PI * 0.37);

    rocketBox.setPosition(Vec2(this.x / s - 0.25, this.y / s - 0.75));
    rocketBox.setActive(true);
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

    firework.alignPivotOffset(0.5);

    firework.scale = this._scale;
    firework.visible = false;
  }
}
