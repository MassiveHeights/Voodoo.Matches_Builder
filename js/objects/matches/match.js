import {BlendMode, DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, Graphics, MessageDispatcher, Sprite, TextField} from "black-engine";
import * as planck from 'planck-js';
import { Vec2 } from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import PhysicsOption from "../../physics/physics-options";

const PI = Math.PI;

export default class Match extends DisplayObject {
  constructor(physics) {
    super();

    this._physics = physics;
    this._mass = 0.2;
    this._scale = 0.26;

    this._view = null;
    this._body = null;
    this._shadowL = null;
    this._shadowR = null;

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
    const viewPos = new Vec2(this._view.x, this._view.y);
    const s = PhysicsOption.worldScale;
    
    const p1 = new Vec2();
    const p2 = new Vec2();
    
    const rot = this._view.rotation;
    
    const d1 = this._height * this._view.anchorY;
    const d2 = this._height * (1 - this._view.anchorY);

    p1.x = (viewPos.x + d1 * Math.sin(rot))/s;
    p1.y = (viewPos.y - d1 * Math.cos(rot))/s;

    p2.x = (viewPos.x - d2 * Math.sin(rot))/s;
    p2.y = (viewPos.y + d2 * Math.cos(rot))/s;

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

  onUpdate() {
    const { _shadowL: shadowL, _shadowR: shadowR, _view: view } = this;

    shadowL.x = shadowR.x = view.x;
    shadowL.y = shadowR.y = view.y;

    const rot = view.rotation;
    shadowL.rotation = shadowR.rotation = rot;

    let alpha = (PI * 0.5 - rot)/PI;

    if(alpha > 1) {
      alpha = 2 - alpha;
    }

    const min = 0.35;
    const max = 0.65;

    shadowL.alpha = min + (1 - alpha) * (max - min);
    shadowR.alpha = min + alpha * (max - min);
  }

  _init() {
    this._initView();
    this._initShadows();
  }

  _initView() {
    const view = this._view = new Sprite('matches/match');
    view.scale = this._scale;

    this._width = view.width;
    this._height = view.height;

    this.add(view);
    view.alignAnchor(0.5, 1);
    view.rotation = this._rot = Math.PI * 0.5;
  }

  _initShadows() {
    const shadowL = this._shadowL = new Sprite('matches/match_tint01');
    const shadowR = this._shadowR = new Sprite('matches/match_tint00');
    shadowL.scale = shadowR.scale = this._scale;

    this.add(shadowL);
    this.add(shadowR);
    shadowL.alignAnchor(0.5, 1);
    shadowR.alignAnchor(0.5, 1);
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

    body.setUserData(this._view);
    body.setActive(false);
  }

  _centerViewAnchor() {
    this._view.alignAnchor(0.5);
    this._shadowL.alignAnchor(0.5);
    this._shadowR.alignAnchor(0.5);

    const d = this._height * 0.5;
    this._viewPos.x += d * Math.sin(this._rot);
    this._viewPos.y -= d * Math.cos(this._rot);
    
    this.setPos(this._viewPos)
    this._body.setAngle(this._rot);
  }
}