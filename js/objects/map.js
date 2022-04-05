import {Black, DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, MessageDispatcher, TextField} from "black-engine";
import * as planck from 'planck-js';
import { Vec2 } from "planck-js";
import Delayed from "../kernel/delayed-call";
import BodiesTypes from "../physics/bodies-types";
import PhysicsOption from "../physics/physics-options";
import Overlay from "../ui/overlay";
import Match from "./matches/match";

export default class Map extends DisplayObject {
  constructor(physics) {
    super();

    this._physics = physics;
    this._s = PhysicsOption.worldScale;

    this._matchesPool = [];
    this._currentMatch = null;
    this._startPointer = null;

    this.touchable = true;

    this._init();
  }

  _init() {
    this._initOverlay();
    // this._initMatches();
    this._initGround();

    this._setupSignals();
    Black.stage.on('resize', () => this.onResize());
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);
  }

  _setupSignals() {
    this._overlay.on('onPointerMove', (msg, pointer) => this.onPointerMove(pointer));
    this._overlay.on('onPointerDown', (msg, pointer) => this.onPointerDown(pointer));
    this._overlay.on('onPointerUp', (msg, pointer) => this.onPointerUp(pointer));
  }

  onPointerDown() {
    if(this._currentMatch){
      this.onPointerUp();
    }
    this._startPointer = this.globalToLocal(Black.input.pointerPosition); 
    this._currentMatch = this.createMatch(this._startPointer);
  }

  onPointerMove() {
    const p1 = this._startPointer;
    const p2 = this.globalToLocal(Black.input.pointerPosition);

    const disX = p1.x - p2.x;
    const disY = p1.y - p2.y;

    let rotation = Math.atan(-disX/disY);

    if(disY < 0){
      rotation = rotation - Math.PI;
    }

    const length = Vec2.distance(p1, p2);

    if(length > 10){
      this._currentMatch.setRotation(rotation);
    }
  }

  onPointerUp() {
    const isFirst = this._matchesPool.length === 0;
    const currentMatch = this._currentMatch;
    if(this._isIntersection(currentMatch) || isFirst){
      this._matchesPool.push(currentMatch);
      currentMatch.activate();
      this._createJoints(currentMatch);
      if(!isFirst){
      }
    }else{
      this._removeMatch(this._currentMatch);
    }

    this._currentMatch = null;
  }

  _removeMatch(match) {
    this.removeChild(match);
  }

  _createJoints(match) {
    const jointPoints = this._getJointPoints(match);

    jointPoints.forEach(intersection => {
      const { body1, body2, anchor } = intersection;
      this._physics.world.WeldJointOpt({}, body1, body2, anchor);
    })
  }

  _getJointPoints(currentMatch) {
    const jointPoints = [];

    this._matchesPool.forEach(match => {
      if(currentMatch !== match){
        const intersection = this._getIntersection(currentMatch, match);
        if(intersection) {
          jointPoints.push(intersection)
        }
      }
    });

    return jointPoints;
  }

  _getIntersection(match1, match2) {
    const point = null;

    const intersection = {
      body1: match1.getBody(),
      body2: match2.getBody(),
      anchor: point
    };

    return null; //intersection;
  }

  _isIntersection(currentMatch) {    
    let isIntersection = false;
    this._matchesPool.forEach(match => {
      if(currentMatch !== match){
        
      }
    });

    return true; //isIntersection;
  }

  createMatch(pointer) {
    const match = new Match(this._physics);
    match.visible = false;

    const x = pointer.x;
    const y = pointer.y;
    
    const pos = planck.Vec2(x, y);
    match.setPos(pos);

    this.add(match);

    Delayed.call(0.01, () => match.visible = true);

    return match;
  }

  _initGround() {
    const ground = this._ground = this._physics.world.createBody(planck.Vec2(0, 0));
    const width = 1000;
    const height = 20;
    const s = this._s;

    ground.createFixture(planck.Box(width/s, height/s), {
      filterCategoryBits: BodiesTypes.ground,
      filterMaskBits: BodiesTypes.match,
    });

    const bounds = Black.stage.bounds;
    const groundX = bounds.center().x / s;
    const groundY = (bounds.bottom - 100) / s;

    ground.setPosition(planck.Vec2(groundX, groundY));
  }

  onResize() {
    const { _ground: ground } = this;
    const bounds = Black.stage.bounds;
  }
}