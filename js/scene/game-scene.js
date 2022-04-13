import {Black, DisplayObject, FontAlign, FontStyle, FontWeight, GameObject, Graphics, MessageDispatcher, TextField} from "black-engine";
import Debugger from "../physics/debugger";
import Physics from '../physics/physics';
import Map from "../objects/map";
import Background from "../objects/bg/bg";
import Overlay from "../ui/overlay";
import Utils from "../helpers/utils";

export default class GameScene extends GameObject {
  constructor() {
    super();

    this.events = new MessageDispatcher(false);
    this._isPaused = false;

    this._physics = null;
    this._debugger = null;
    this._bg = null;
    this._map = null;

    this._levelSize = 1000;

    this._init();
    this.start();
  }

  start() {
    this.touchable = true;
    this._map.start();
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
    this._initOverlay();

    // this.add(this._debugger);

    this._setupSignals();
    Black.stage.on('resize', () => this.onResize());
    this.onResize();

    this.events.on('tap', () =>  this._onTap());
  }

  _initBg() {
    const bg = this._bg = new Background(this._physics, this._levelSize);
    this.add(bg);
  }

  _initMap() {
    const map = this._map = new Map(this._physics, this._levelSize);
    this.add(map);

    map.events.on('addedMatch', () => this.events.post('addedMatch'));
  }

  _initPhysics() {
    this._physics = new Physics();
    this._debugger = new Debugger(this._physics.world);
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);
  }

  _setupSignals() {
    const map = this._map;

    this._overlay.on('onPointerMove', (msg, pointer) => map.onPointerMove(pointer));
    this._overlay.on('onPointerDown', (msg, pointer) => map.onPointerDown(pointer));
    this._overlay.on('onPointerUp', (msg, pointer) => map.onPointerUp(pointer));
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

  onResize() {    
    this.y = Utils.LP(-this._levelSize * 1, -this._levelSize * 0.83);
    this.x = Utils.LP(-this._levelSize * 0.35, -this._levelSize * 0.3);
    
    this.scale = Utils.LP(2.1, 1.8);
  }
}
