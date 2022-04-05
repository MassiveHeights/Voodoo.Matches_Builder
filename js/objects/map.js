import {Black, DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, MessageDispatcher, TextField} from "black-engine";
import * as planck from 'planck-js';
import { Vec2 } from "planck-js";
import Delayed from "../kernel/delayed-call";
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

  onPointerDown(pointer) {
    // console.log(pointer.x, pointer.y)
    pointer = this.globalToLocal(Black.input.pointerPosition); 

    this._currentMatch = this.createMatch(pointer);
  }

  onPointerMove(pointer) {
    // console.log('onPointerMove')
  }

  onPointerUp(pointer) {
    // console.log('onPointerUp')
    this._currentMatch.activate();
    // this._currentMatch = null;
  }

  createMatch(pointer) {
    const match = new Match(this._physics);
    match.visible = false;

    this._matchesPool.push(match);
    const bounds = Black.stage.bounds;

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

    ground.createFixture(planck.Box(width/s, height/s));

    const bounds = Black.stage.bounds;
    const groundX = bounds.center().x / s;
    const groundY = (bounds.bottom - 100) / s;

    ground.setPosition(planck.Vec2(groundX, groundY));
  }

  _initMatches() {
    const count = 10;

    for (let i = 0; i < count; i++) {
      const match = new Match(this._physics);
      this.add(match);
  
      const bounds = Black.stage.bounds;
      const groundX = 100 + 30 * i; //bounds.center().x;
      const groundY = 300; //bounds.bottom;
  
      const pos = planck.Vec2(groundX, groundY);
      match.setPos(pos);
    }
  }

  onResize() {
    const { _ground: ground } = this;
    const bounds = Black.stage.bounds;
  }
}