import {DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, Graphics, MessageDispatcher, TextField} from "black-engine";
import Debugger from "../physics/debugger";
import Physics from '../physics/physics';
import Map from "../objects/map";
import Background from "../objects/bg/bg";

export default class GameScene extends GameObject {
  constructor() {
    super();

    this.events = new MessageDispatcher(false);
    this._isPaused = false;

    this._physics = null;
    this._debugger = null;
    this._bg = null;
    this._map = null;

    this._init();
    this.start();
  }

  start() {
    this.touchable = true;
  }

  pause() {
    this._isPaused = true;
  }

  resume() {
    this._isPaused = false;
  }

  _init() {
    this._initPhysics();

    this._initBg();
    this._initMap();


    this.add(this._debugger);
    
    this.events.on('tap', () => {
      this._onTap();
    });
  }

  _initBg() {
    const bg = new Background();
    this.add(bg);
  }

  _initMap() {
    const map = this._map = new Map(this._physics);
    this.add(map);
  }

  _initPhysics() {
    this._physics = new Physics();

    const debug = this._debugger = new Debugger(this._physics.world);
    debug.isActive = true;
  }

  _onTap() {
    // console.log('tap')
  }

  update(dt) {
    if (this._isPaused)
      return;

    this._physics.update();
    this._debugger.update();
  }
}
