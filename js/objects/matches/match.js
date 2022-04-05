import {DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, Graphics, MessageDispatcher, Sprite, TextField} from "black-engine";
import * as planck from 'planck-js';
import { Vec2 } from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import PhysicsOption from "../../physics/physics-options";

export default class Match extends DisplayObject {
  constructor(physics) {
    super();

    this._physics = physics;
    this._mass = 0.25;

    this._view = null;
    this._body = null;

    this._bodyPos = null;
    this._viewPos = null;
    this._rot = null;

    this._init();
  }

  createBody() {
    if(!this._body){
      this._initBody();
      this._centerViewAnchor();
    }
    // this._body.setActive(true);
  }

  getBody() {
    return this._body;
  }

  getHeight() {
    return this._height;
  }

  getBodyLine() {
    const d = this._height * 0.5;
    const viewPos = new Vec2(this._view.x, this._view.y);
    const s = PhysicsOption.worldScale;

    const p1 = new Vec2();
    const p2 = new Vec2();

    const rot = this._view.rotation;

    p1.x = (viewPos.x + d * Math.sin(rot))/s;
    p1.y = (viewPos.y - d * Math.cos(rot))/s;

    p2.x = (viewPos.x - d * Math.sin(rot))/s;
    p2.y = (viewPos.y + d * Math.cos(rot))/s;

    return {
      p1, 
      p2,
    }
  }

  setRotation(rotation) {
    this._view.rotation = this._rot = rotation;
  }

  setPos(pos) {
    this._view.x = pos.x;
    this._view.y = pos.y;

    this._viewPos = {...pos};

    const s = PhysicsOption.worldScale;
    pos.x /= s;
    pos.y /= s;

    this._bodyPos = {...pos};
    this._body?.setPosition(pos);
  }

  _init() {
    this._initView();
  }

  _initView() {
    const view = this._view = new Sprite('matches/match');
    view.scale = 0.5;

    this._width = view.width;
    this._height = view.height;

    this.add(view);
    view.alignAnchor(0.5, 1);
    view.rotation = this._rot = Math.PI * 0.5;
  }

  _initBody() {
    const width = this._width;
    const height = this._height;
    const s = PhysicsOption.worldScale;
    
    const body = this._body = this._physics.world.createDynamicBody(planck.Vec2(0, 0));
    body.createFixture(planck.Box(width * 0.5/s, height * 0.5/s), {
      friction: 10,
      restitution: 0.2,
      density: 0.1,
      filterCategoryBits: BodiesTypes.match,
      filterMaskBits: BodiesTypes.ground,
    });

    body.setGravityScale(this._mass);

    body.view = this._view;
    body.setUserData(this._view);
    body.setActive(false);
  }

  _centerViewAnchor() {
    this._view.alignAnchor(0.5);

    const d = this._height * 0.5;
    this._viewPos.x += d * Math.sin(this._rot);
    this._viewPos.y -= d * Math.cos(this._rot);
    
    this.setPos(this._viewPos)
    this._body.setAngle(this._rot);
  }
}