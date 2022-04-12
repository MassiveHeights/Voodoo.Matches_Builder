import {DisplayObject, Ease, Tween, Vector, BlendMode} from "black-engine";
import {Spine} from "black-spine";
import PhysicsOption from "../../physics/physics-options";
import * as planck from "planck-js";
import {Polygon, Vec2} from "planck-js";
import BodiesTypes from "../../physics/bodies-types";

export default class FireEffect extends DisplayObject {
  constructor(physics) {
    super();

    this._fireView = null;
    this._physics = physics;
    this._body = null;

    this._moveSpeed = 0.01;
    this._bodyWidth = 0.7;
    this._bodyHeight = 2;
    this._fireScale = 0.3;

    this.moveDirection = 0;
    this.movePercent = 0;

    this._init();
  }

  _init() {
    this._initView();

    setTimeout(() => {
      this._initBody();
    }, 500);
  }

  _initView() {
    this._fireView = new Spine('matches_layout');
    this._fireView.play('match_start', true);
    this._fireView.mState.timeScale = 3;
    this._fireView.scale = 0;

    let tween = new Tween({scaleX: this._fireScale, scaleY: this._fireScale}, 0.1, {ease: Ease.backOut});
    this._fireView.addComponent(tween);

    this.add(this._fireView);
  }

  stopFire() {
    this._fireView.play('match_end_' + (Math.random() * 100 > 50 ? 1 : 2), false);

    let tween = new Tween({alpha: 0, scaleX: 0, scaleY: 0}, 0.1, {ease: Ease.backIn});
    this._fireView.addComponent(tween);

    if (this._body != null) {
      this._body.setActive(false);
      this._physics.world.destroyBody(this._body);
    }
  }

  _initBody() {
    this._body = this._physics.world.createBody({
      bullet: true,
      gravityScale: 0,
      position: Vec2(0, 0),
      userData: {
        id: 'fire',
        type: 'fire',
        object: this
      },
    });

    this._body.createFixture(
      Polygon([
        planck.Vec2(0, 0),
        planck.Vec2(this._bodyWidth, 0),
        planck.Vec2(this._bodyWidth, this._bodyHeight),
        planck.Vec2(0, this._bodyHeight)
      ]),
      {
        density: 0,
        friction: 0,
        restitution: 0,
        mass: 0,
      },
      {
        filterCategoryBits: BodiesTypes.fire,
        filterMaskBits: BodiesTypes.match,
      });

    this._body.setActive(true);
  }

  updateMove() {
    if (this.y != null && this.x != null && this._body != null) {
      const s = PhysicsOption.worldScale;
      this._body.setPosition(new Vector(this.x / s - this._bodyWidth * 0.5, this.y / s - this._bodyHeight * 0.5));
    }

    if (this.moveDirection !== 0) {
      this.movePercent += this.moveDirection * this._moveSpeed;

      if (this.movePercent <= 0 || this.movePercent >= 1) {
        this.stopFire();
        this.moveDirection = 0;
      }
    }
  }
}
