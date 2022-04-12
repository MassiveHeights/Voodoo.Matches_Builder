import {Black, DisplayObject, MessageDispatcher, Sprite, Vector} from "black-engine";
import {Vec2, WeldJoint} from "planck-js";
import Delayed from "../kernel/delayed-call";
import PhysicsOption from "../physics/physics-options";
import Bonfire from "./map-items/bonfire";
import Rocket from "./map-items/rocket";
import DotsHelper from "./matches/dots-helper";
import Match from "./matches/match";

export default class Map extends DisplayObject {
  constructor(physics, levelSize) {
    super();

    this.events = new MessageDispatcher(false);
    this._physics = physics;
    this._levelSize = levelSize;
    this._s = PhysicsOption.worldScale;

    this._matchesPool = [];
    this._matchesWrapper = null;
    this._currentMatch = null;
    this._startPointer = null;
    this._dotsHelper = null;

    this._disableInput = false;

    this._fireLayer = null;
    this._bonFireLayer = null;

    this.touchable = true;
    this._isPlaying = false;

    this._state = STATES.disable;
    this._init();
  }

  start() {
    this._isPlaying = true;
    this._matchesPool.forEach(match => {
      match.removeBody();
    });
    this._matchesPool = [];
    this._matchesWrapper.removeAllChildren();
    this._createStartMatch();
  }

  _init() {
    this._matchesWrapper = new DisplayObject();
    this._fireLayer = new DisplayObject();
    this._bonFireLayer = new DisplayObject();

    this._initDotsHelper();
    this._initBonfire();
    this._initRocket();
    this._createDebugLevel();
    this._checkCollisions();

    this.add(this._matchesWrapper);
    this.add(this._fireLayer);
    this.add(this._bonFireLayer);
  }

  onPointerDown() {
    if (this._disableInput) return;

    this._startPointer = this.globalToLocal(Black.input.pointerPosition);
    this._enableMatch = this._startPointer.y < this._getGroundY() + 10;

    if (!this._isPlaying || !this._enableMatch) return;

    if (this._currentMatch) {
      this.onPointerUp();
    }

    this._currentMatch = this._createMatch(this._startPointer);
    this._checkDotsHelper();
  }

  onPointerMove() {
    if (this._disableInput) return;

    if (!this._isPlaying || !this._enableMatch) return;

    this._calcRotation();
    this._checkDotsHelper();
  }

  onPointerUp() {
    if (this._disableInput) return;

    if (!this._isPlaying || !this._enableMatch) return;

    this._setMatch();
    this._resetDotsHelper();
  }

  _createJoints(jointPoints) {
    jointPoints.forEach((intersection, index) => {
      const {body1, body2, anchor} = intersection;
      const joint = WeldJoint({
        frequencyHz: 4,
        dampingRatio: 1,
        collideConnected: false,
      }, body1, body2, anchor);
      this._physics.world.createJoint(joint);

      body1.setActive(true);
      body2.setActive(true);

      const match = this._currentMatch;
      Delayed.call(0.06 * index, () => this._createNode(match, anchor));
    });
  }

  _createNode(match, anchor) {
    anchor.mul(this._s);
    match.addNode(anchor);
  }

  _getJointPoints(currentMatch) {
    const jointPoints = [];

    this._matchesPool.forEach(match => {
      if (currentMatch !== match) {
        const intersection = this._getIntersection(currentMatch, match);
        if (intersection) {
          jointPoints.push(intersection);
        }
      }
    });

    return jointPoints;
  }

  _getIntersection(match1, match2) {
    const intersect = this._intersect(match1, match2);

    if (!intersect) {
      return null;
    }

    const point = Vec2(intersect.x, intersect.y);

    const intersection = {
      body1: match1.getBody(),
      body2: match2.getBody(),
      anchor: point
    };

    return intersection;
  }

  _intersect(match1, match2) {
    const {p1, p2} = match1.getBodyLine();
    const {p1: p3, p2: p4} = match2.getBodyLine();

    const {x: x1, y: y1} = p1;
    const {x: x2, y: y2} = p2;
    const {x: x3, y: y3} = p3;
    const {x: x4, y: y4} = p4;

    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    if (denominator === 0) {
      return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return {x, y};
  }

  _checkCollisions() {
    this._physics.world.on('pre-solve', (contact, oldManifold) => {
      var fixtureA = contact.getFixtureA();
      var fixtureB = contact.getFixtureB();

      if (fixtureA.getBody().getUserData()) {

        if (fixtureA.getBody().getUserData().id === 'bonfire') {

          if (fixtureB.getBody().getUserData().userData && fixtureB.getBody().getUserData().userData.id === 'match') {
            if (!fixtureB.getBody().getUserData().userData.object._burning) {
              let worldManifold = contact.getWorldManifold();
              this._disableInput = true;
              fixtureB.getBody().getUserData().userData.object.startBurn(worldManifold.points[0].x, worldManifold.points[0].y);
            }
          }
          contact.setEnabled(false);
        }

        if (fixtureB.getBody().getUserData().id === 'fire') {
          if (fixtureA.getBody().getUserData().userData && fixtureA.getBody().getUserData().userData.id === 'match') {
            if (!fixtureA.getBody().getUserData().userData.object._burning) {
              let worldManifold = contact.getWorldManifold();
              this._disableInput = true;
              fixtureA.getBody().getUserData().userData.object.startBurn(worldManifold.points[0].x, worldManifold.points[0].y);
            }

          }
          contact.setEnabled(false);
        }

        if (fixtureB.getBody().getUserData().id === 'fire' || fixtureA.getBody().getUserData().id === 'fire') {
          contact.setEnabled(false);
        }
      }
    });
  }

  _initDotsHelper() {
    this._dotsHelper = new DotsHelper();
    this.add(this._dotsHelper);
  }

  _resetDotsHelper() {
    this._dotsHelper.reset();
  }

  _setDotsHelper(intersections) {
    const dotsHelper = this._dotsHelper;
    const points = [];
    intersections.forEach(data => points.push(data.anchor));
    dotsHelper.set(points);
    this.setChildIndex(dotsHelper, 999);
  }

  _initBonfire() {
    const bonfire = this._bonfire = new Bonfire(this._physics);
    this.add(bonfire);

    const bounds = Black.stage.bounds;
    bonfire.x = bounds.center().x + this._levelSize * 0.1;
    bonfire.y = bounds.center().y + this._levelSize * 0.38;
  }

  _initRocket() {
    const rocket = this._rocket = new Rocket();
    this.add(rocket);

    const bounds = Black.stage.bounds;
    rocket.x = bounds.center().x + this._levelSize * 0.07;
    rocket.y = bounds.center().y + this._levelSize * 0.12;
  }

  _checkDotsHelper() {
    this._resetDotsHelper();
    const jointPoints = this._getJointPoints(this._currentMatch);
    if (jointPoints.length !== 0) {
      this._setDotsHelper(jointPoints);
    }
  }

  _calcRotation() {
    const p1 = this._startPointer;
    const p2 = this.globalToLocal(Black.input.pointerPosition);

    const disX = p1.x - p2.x;
    const disY = p1.y - p2.y;

    let rotation = Math.atan(-disX / disY);

    if (disY < 0) {
      rotation = rotation - Math.PI;
    }

    const length = Vec2.distance(p1, p2);
    const isNearGround = this._getGroundY() - p1.y < this._currentMatch.getHeight();

    if (isNearGround) {
      rotation = this._fixAngle(rotation);
    }

    if (length > 10) {
      this._currentMatch.setRotation(rotation);
    }
  }

  _fixAngle(rotation) {
    const isLeft = Math.sin(rotation) < 0;
    const l = this._currentMatch.getHeight();
    const p = this._startPointer;
    const endY = p.y - l * Math.cos(rotation);
    const groundY = this._getGroundY();

    if (endY > groundY) {
      rotation = Math.acos((p.y - groundY) / l);
      if (isLeft) {
        rotation = -rotation;
      }
    }

    return rotation;
  }

  _createMatch(pointer) {
    const match = new Match(this._matchesWrapper, this._physics, this._fireLayer);
    match.visible = false;

    const x = pointer.x;
    const y = pointer.y;

    const pos = Vec2(x, y);
    match.setPos(pos);

    this._matchesWrapper.add(match);

    Black._soundManager.playFx('new_match');

    Delayed.call(0.01, () => match.visible = true);

    return match;
  }

  _setMatch(currentMatch = this._currentMatch, isAutoSet = false) {
    // const isFirst = this._matchesPool.length === 0;
    currentMatch.createBody();
    const jointPoints = this._getJointPoints(currentMatch);
    const isIntersection = jointPoints.length !== 0;

    if (isIntersection || isAutoSet) {
      this._matchesPool.push(currentMatch);
      if (!isAutoSet) {
        Black._soundManager.playFx('match_fixed_2');
        this._createJoints(jointPoints);
        this.events.post('addedMatch');
      }

      if (this._checkFinish()) {
        this._finish();
      }
    } else {
      this._removeMatch(this._currentMatch);
    }

    this._currentMatch = null;
  }

  _removeMatch(match) {
    match.removeBody();
    this._matchesWrapper.removeChild(match);
  }

  _createDebugLevel() {
    // debugLevelData.forEach(data => {
    //   const match = this._currentMatch = this._createMatch(new Vector(data.x, data.y));
    //   match.setRotation(data.rotation);
    //   match.createBody();
    //   this.onPointerUp();
    // })
  }

  _createStartMatch() {
    const bounds = Black.stage.bounds;
    const x = bounds.center().x - this._levelSize * 0.1;
    const match = this._createMatch(new Vector(x, this._getGroundY()));
    match.setRotation(Math.PI * 0.5);
    this._setMatch(match, true);
  }

  _getGroundY() {
    const bounds = Black.stage.bounds;
    return bounds.center().y + this._levelSize * 0.38;
  }

  _checkFinish() {
    let minToBonfire = 0;
    let minToRocket = 0;

    const bonfirePos = Vec2(this._bonfire.x, this._bonfire.y);
    const rocketPos = Vec2(this._rocket.x, this._rocket.y);

    this._matchesPool.forEach((match, index) => {
      const matchPos = match.getPosition();

      if (index === 0) {
        minToBonfire = this._calcDistance(matchPos, bonfirePos);
        minToRocket = this._calcDistance(matchPos, rocketPos);
      }

      minToBonfire = Math.min(minToBonfire, this._calcDistance(matchPos, bonfirePos));
      minToRocket = Math.min(minToRocket, this._calcDistance(matchPos, rocketPos));
    });

    const matchHeight = this._matchesPool[0].getHeight();

    if (matchHeight * 0.5 > minToBonfire && matchHeight * 0.5 > minToRocket) {
      this._isPlaying = false;

      return true;
    }

    return false;
  }

  _finish() {
    this._rocket.launch();
    this._matchesPool.forEach(match => match.burnTest());
  }

  _calcDistance(pos1, pos2) {
    const distance = Vec2.distance(pos1, pos2);

    return distance;
  }
}

const STATES = {
  enable: 'enable',
  disable: 'disable',
  finished: 'finished',
};

const debugLevelData = [
  {
    x: 270,
    y: 850,
    rotation: 0.5
  },
  {
    x: 340,
    y: 850,
    rotation: -0.5
  },
  {
    x: 305,
    y: 800,
    rotation: 0,
  },
  {
    x: 305,
    y: 730,
    rotation: 0.2,
  },
  {
    x: 315,
    y: 660,
    rotation: 0.8,
  },
  {
    x: 270,
    y: 700,
    rotation: Math.PI * 0.5,
  },
  {
    x: 260,
    y: 850,
    rotation: Math.PI * 0.5,
  },
  {
    x: 340,
    y: 850,
    rotation: Math.PI * 0.5,
  },
  {
    x: 390,
    y: 850,
    rotation: -Math.PI * 0.35,
  },
];
