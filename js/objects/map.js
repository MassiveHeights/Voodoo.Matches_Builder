import { Black, DisplayObject, Graphics } from "black-engine";
import { Vec2, WeldJoint } from "planck-js";
import Delayed from "../kernel/delayed-call";
import PhysicsOption from "../physics/physics-options";
import Overlay from "../ui/overlay";
import DotsHelper from "./dots-helper";
import Match from "./matches/match";

export default class Map extends DisplayObject {
  constructor(physics) {
    super();

    this._physics = physics;
    this._s = PhysicsOption.worldScale;

    this._matchesPool = [];
    this._currentMatch = null;
    this._startPointer = null;
    this._dotsHelper = null;
    
    this.touchable = true;

    this._init();
  }

  _init() {
    this._initOverlay();
    this._initDotsHelper();

    this._setupSignals();
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
    this._currentMatch = this._createMatch(this._startPointer);
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

    this._resetDotsHelper();
    const jointPoints = this._getJointPoints(this._currentMatch);
    if(jointPoints.length !== 0) {
      this._setDotsHelper(jointPoints);
    }
  }

  onPointerUp() {
    const isFirst = this._matchesPool.length === 0;
    const currentMatch = this._currentMatch;
    currentMatch.createBody();

    const jointPoints = this._getJointPoints(currentMatch);
    const isIntersection = jointPoints.length !== 0;

    if(isIntersection || isFirst){
      this._matchesPool.push(currentMatch);
      if(!isFirst){
        this._createJoints(jointPoints);
      }
    }else{
      this._removeMatch(this._currentMatch);
    }

    this._currentMatch = null;
    this._resetDotsHelper();
  }

  _removeMatch(match) {
    const body = match.getBody();
    if(body){
      this._physics.world.destroyBody(body);
    }
    this.removeChild(match);
  }

  _createJoints(jointPoints) {
    jointPoints.forEach(intersection => {
      const { body1, body2, anchor } = intersection;
      const joint = WeldJoint({
        frequencyHz: 2.5,
        dampingRatio: 0.7,
      }, body1, body2, anchor);
      this._physics.world.createJoint(joint);

      body1.setActive(true);
      body2.setActive(true);
    });
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
    const intersect = this.intersect(match1, match2);

    if(!intersect) {
      return null
    }

    const point = Vec2(intersect.x, intersect.y);

    const intersection = {
      body1: match1.getBody(),
      body2: match2.getBody(),
      anchor: point
    };

    return intersection;
  }

  intersect(match1, match2) {
    const { p1, p2 } = match1.getBodyLine();
    const { p1: p3, p2: p4 } = match2.getBodyLine();

    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    const { x: x3, y: y3 } = p3;
    const { x: x4, y: y4 } = p4;

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false
    }
  
    const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
    if (denominator === 0) {
      return false
    }
  
    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false
    }
  
    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)
  
    return {x, y}
  }

  _initDotsHelper() {
    this._dotsHelper = new DotsHelper();
    this.add(this._dotsHelper);
  }

  _createDotHelper(pos) {
    const g = new Graphics();

    g.beginPath();
    g.fillStyle(0xff0000, 1);
    g.circle(0, 0, 7);
    g.fill();

    const s = this._s;
    g.x = pos.x * s;
    g.y = pos.y * s;

    this.add(g);
  }

  _resetDotsHelper() {
    this._dotsHelper.reset();
  }

  _setDotsHelper(intersections) {
    const dotsHelper = this._dotsHelper;

    const points = [];

    intersections.forEach(data => {
      points.push(data.anchor)
    });

    dotsHelper.set(points);
    this.setChildIndex(dotsHelper, 999);
  }

  _createMatch(pointer) {
    const match = new Match(this._physics);
    match.visible = false;

    const x = pointer.x;
    const y = pointer.y;
    
    const pos = Vec2(x, y);
    match.setPos(pos);

    this.add(match);

    Delayed.call(0.01, () => match.visible = true);

    return match;
  }
}