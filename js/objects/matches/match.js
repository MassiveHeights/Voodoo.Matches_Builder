import {DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, Graphics, MessageDispatcher, Sprite, TextField} from "black-engine";
import * as planck from 'planck-js';
import PhysicsOption from "../../physics/physics-options";

export default class Match extends DisplayObject {
  constructor(physics) {
    super();

    this._physics = physics;

    this._view = null;
    this._body = null;

    this._pos = null;

    this._init();
  }

  activate() {
    if(!this._body){
      this._initBody();
      this._body.setPosition(this._pos);
    }
    this._body.setActive(true);
  }

  deactivate() {
    this._body.setActive(false);
  }

  setPos(pos) {
    pos.y -= this._view.height * 0.5;

    this._view.x = pos.x;
    this._view.y = pos.y;

    const s = PhysicsOption.worldScale;
    pos.x /= s;
    pos.y /= s;

    this._pos = pos;
    this._body?.setPosition(pos);
  }

  _init() {
    this._initView();
  }

  _initView() {
    const view = this._view = new Sprite('matches/match');
    view.scale = 0.5;

    this.add(view);
    view.alignAnchor(0.5);
  }

  _initBody() {
    const width = this._view.width;
    const height = this._view.height;
    const s = PhysicsOption.worldScale;

    const body = this._body = this._physics.world.createDynamicBody(planck.Vec2(0, 0));
    body.createFixture(planck.Box(width * 0.5/s, height * 0.5/s), {
      friction: 10,
      restitution: 0.2,
      density: 0.1,
    });

    const mass = Math.random() * 0.4 + 0.3;
    body.setGravityScale(mass);
    body.view = this._view;
    body.setUserData(this._view);
    body.setActive(false);

    // const angle = Math.random()* 20;
    // body.setAngle(angle);

    // fixture.setSensor(true);
  }
}