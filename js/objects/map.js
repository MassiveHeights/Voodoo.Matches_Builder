import {Black, DisplayObject, Ease, MessageDispatcher, Sprite, Tween, Vector} from "black-engine";
import {Vec2, WeldJoint} from "planck-js";
import * as planck from 'planck-js';
import PhysicsOption from "../physics/physics-options";
import GAME_CONFIG from "../states/game-config";
import Bonfire from "./map-items/bonfire";
import Rocket from "./map-items/rocket";
import DotsHelper from "./matches/dots-helper";
import Match from "./matches/match";
import INTERSECT from "./matches/matches-intersection";

export default class Map extends DisplayObject {
  constructor(physics) {
    super();

    this.events = new MessageDispatcher(false);
    this.touchable = true;

    this._physics = physics;
    this._levelSize = GAME_CONFIG.levelSize;
    this._s = PhysicsOption.worldScale;

    this._matchesPool = [];
    this._currentMatch = null;
    this._startPointer = null;
    this._dotsHelper = null;
    
    this._disableInput = false;
    
    this._matchesLayer = null;
    this._fireLayer = null;
    this._bonFireLayer = null;

    this._burnMatches = 0;
    this._totalMatches = 0;

    this._gameWin = false;
    this._gameLose = false;

    this._moveCameraTween = null;

    this._init();
  }

  start() {
    this._disableInput = false;

    this._gameWin = false;
    this._gameLose = false;

    this._burnMatches = 0;
    this._totalMatches = 0;

    this._matchesPool.forEach(match => this._removeMatch(match));
    this._matchesPool = [];
    this._matchesLayer.removeAllChildren();

    this._createStartMatch();

    this._rocket.reset();
  }

  getHintPos() {
    const pos = this._getStartMatchPos();
    pos.x += 5;
    pos.y += 6;
    return pos;
  }

  getRocketPos() {
    return this._rocket.getRocketPos();
  }

  onPointerDown() {
    if (this._disableInput) return;
    
    this._startPointer = this.globalToLocal(Black.input.pointerPosition);
    this._enableMatch = this._startPointer.y < this._getGroundY() + 40;

    if (!this._enableMatch) return;

    if (this._currentMatch) {
      this.onPointerUp();
    }

    this._currentMatch = this._createMatch(this._startPointer);
    this._checkDotsHelper();
    this._deactivatePhysics();
  }

  onPointerMove() {
    if (this._disableInput) return;
    if (!this._enableMatch) return;

    this._calcRotation();
    this._checkDotsHelper();
  }

  onPointerUp() {
    if (this._disableInput) {
      if (this._currentMatch != null) {
        this._removeMatch(this._currentMatch);
      }
      this._resetDotsHelper();

      return;
    }

    if (!this._enableMatch) return;

    this._setMatch();
    this._resetDotsHelper();
    this._activatePhysics();
  }

  _activatePhysics() {
    this._matchesPool.forEach(match => match.setActive(true));
  }

  _deactivatePhysics() {
    this._matchesPool.forEach(match => match.setActive(false));
  }

  _init() {
    this._matchesLayer = new DisplayObject();
    this._fireLayer = new DisplayObject();
    this._bonFireLayer = new DisplayObject();

    this._initDotsHelper();
    this._initBonfire();
    this._initRocket();
    this._initHoldingBodies();

    this._checkCollisions();

    this.add(this._matchesLayer);
    this.add(this._fireLayer);
    this.add(this._bonFireLayer);
  }

  _initHoldingBodies() {
    const s = this._s;
    const pos1 = this._getStartMatchPos();
    pos1.x = (pos1.x - 15)/s;
    pos1.y = (pos1.y + 2)/s;
    const body = this._physics.world.createBody(pos1);
    body.createFixture(planck.Box(0.5, 0.04), {
      friction: 100,
      density: 0.001,
    });
    body.setGravityScale(100);

    const pos2 = this._getStartMatchPos();

    pos2.x = (pos2.x + 100)/s;
    pos2.y = (pos2.y + 2)/s;
    
    const body2 = this._physics.world.createBody(pos2);
    body2.createFixture(planck.Box(0.5, 0.04), {
      friction: 100,
      density: 0.001,
    });
    body2.setGravityScale(100);
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
      this._createNode(match, anchor, index)
    });
  }

  _createNode(match, anchor, index) {
    const delay = index * 60;
    anchor.mul(this._s);
    match.addNode(anchor, delay);
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

    return INTERSECT(p1, p2, p3, p4);
  }

  _checkCollisions() {
    this._physics.world.on('pre-solve', (contact, oldManifold) => {
      let fixtureA = contact.getFixtureA();
      let fixtureB = contact.getFixtureB();

      const hasUserData = fixtureA.getBody().getUserData() && fixtureB.getBody().getUserData();

      if (hasUserData) {
        const fixtureAId = fixtureA.getBody().getUserData().id;
        const fixtureBId = fixtureB.getBody().getUserData().id;

        const matchAUserData = fixtureA.getBody().getUserData().userData || null;
        const matchBUserdata = fixtureB.getBody().getUserData().userData || null;

        if (fixtureAId === 'bonfire') {
          if (matchBUserdata && matchBUserdata.id === 'match') {
            const object = matchBUserdata.object;
            !object.burning && this._burnMatch(object, contact);
          }
          contact.setEnabled(false);
        }

        if (fixtureBId === 'fire') {
          if (matchAUserData && matchAUserData.id === 'match') {
            const object = matchAUserData.object;
            !object.burning && this._burnMatch(object, contact);
          }
          contact.setEnabled(false);
        }

        if (fixtureAId === 'rocket' && fixtureBId === 'fire') {
          this._win();
        }

        if (fixtureAId === 'fire' || fixtureBId === 'fire') {
          contact.setEnabled(false);
        } else if (fixtureAId === 'rocket' || fixtureBId === 'rocket') {
          contact.setEnabled(false);
        }
      }
    });
  }

  _burnMatch(match, contactData = null) {
    Black._soundManager.playFx('walking_fire_loop', 0.7, false);

    this._disableInput = true;
    this.onPointerUp();

    if (contactData == null) {
      match.burnMatchFromSide(match);
    } else {
      let worldManifold = contactData.getWorldManifold();
      match.startBurn(worldManifold.points[0].x, worldManifold.points[0].y);
    }

    this._burnMatches++;

    match.events.on('burn-end', () => {
      if (this._gameWin) {
        return;
      }

      this._burnMatches--;
      this._totalMatches--;

      if (this._burnMatches <= 0) {
        if (this._totalMatches > 0) {
          let proceeded = false;
          this._matchesPool.forEach(match => {
            if (!match.burning) {
              proceeded = true;
              this._burnMatch(match);
            }

            if (!proceeded) {
              this._lose();
            }
          });
        } else {
          if (!this._gameWin) {
            this._lose();
          }
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

    bonfire.initBody();
  }

  _initRocket() {
    const rocket = this._rocket = new Rocket(this._physics);
    this.add(rocket);

    const bounds = Black.stage.bounds;
    rocket.x = bounds.center().x + this._levelSize * 0.07;
    rocket.y = bounds.center().y + this._levelSize * 0.12;

    rocket.initBody();
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

    if (length > 10) {
      this._currentMatch.setRotation(rotation);
    }
  }

  _createMatch(pointer, isAutoSet) {
    const match = new Match(this._matchesLayer, this._physics, this._fireLayer);

    const pos = Vec2(pointer.x, pointer.y);
    match.setPos(pos);
    this._matchesLayer.add(match);

    if(!isAutoSet){
      Black._soundManager?.playFx('new_match');
    }

    return match;
  }

  _setMatch(currentMatch = this._currentMatch, isAutoSet = false) {
    currentMatch.createBody();

    const jointPoints = this._getJointPoints(currentMatch);
    const isIntersection = jointPoints.length !== 0;
    const isFinished = this._gameLose || this._gameWin;

    if ((isIntersection || isAutoSet) && !isFinished) {
      this._matchesPool.push(currentMatch);
      this._totalMatches++;
      if (!isAutoSet) {
        Black._soundManager.playFx('match_fixed_2');
        this._createJoints(jointPoints);
        this.events.post('addedMatch');
        this._checkLose();
      }
    } else {
      this._removeMatch(this._currentMatch);
    }

    this._currentMatch = null;
  }

  _checkLose() {
    if((this._totalMatches >= GAME_CONFIG.startMatchesValue + 1) && this._burnMatches === 0){
      setTimeout(() => {
        if(this._burnMatches === 0){
          this._lose();
        }
      }, 200);
    }
  }

  _removeMatch(match) {
    match.removeBody();
    match.removeView();

    this._matchesLayer.removeChild(match);
  }

  _createStartMatch() {
    const match = this._createMatch(this._getStartMatchPos(), true);
    match.setRotation(Math.PI * 0.5);
    this._setMatch(match, true);
  }

  _getStartMatchPos() {
    const x = Black.stage.bounds.center().x - this._levelSize * 0.05;
    return new Vector(x, this._getGroundY());
  }

  _getGroundY() {
    const bounds = Black.stage.bounds;
    return bounds.center().y + this._levelSize * 0.38;
  }

  _win() {
    if(this._gameWin){
      return;
    }
    this._gameWin = true;
    this._disableInput = true;

    this._rocket.launch();
    this.events.post('burnedRocket');
  }

  _lose() {
    if (this._gameLose) return;
    this._gameLose = true;
    this._disableInput = true;

    this.events.post('onLose');
  }

  _calcDistance(pos1, pos2) {
    const distance = Vec2.distance(pos1, pos2);

    return distance;
  }
}
