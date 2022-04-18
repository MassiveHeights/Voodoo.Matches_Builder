import {Black, Ease, GameObject, MessageDispatcher, Tween} from "black-engine";
import Debugger from "../physics/debugger";
import Physics from '../physics/physics';
import Map from "../objects/map";
import Background from "../objects/bg/bg";
import Overlay from "../ui/overlay";
import Utils from "../helpers/utils";
import GAME_CONFIG from "../states/game-config";
import Hint from "../ui/hint";

export default class GameScene extends GameObject {
  constructor() {
    super();

    this.events = new MessageDispatcher(false);
    this._isPaused = false;

    this._physics = null;
    this._debugger = null;
    this._bg = null;
    this._map = null;

    this._levelSize = GAME_CONFIG.levelSize;

    this._launchingRocket = false;
    this._moveCameraTween = null;
    this._cameraMoveProgress = 0;

    this._init();
    this.start();
  }

  start(isRetry = false) {
    this.touchable = true;
    this._map.start();
    if(!isRetry) {
      this.showHint();
    }

    this._launchingRocket = false;
    this.removeComponent(this._moveCameraTween);
    this._cameraMoveProgress = 0;
  }

  pause() {
    this._isPaused = true;
  }

  resume() {
    this._isPaused = false;
  }

  showHint() {
    const pos = this._map.getHintPos();
    const rotation = Math.PI * 0.2;

    this._hint.show(pos, rotation)
  }

  stopHint() {
    this._hint.stop();
  }

  canRetry() {
    return !this._launchingRocket;
  }

  _init() {
    this._initPhysics();
    
    this._initBg();
    this._initMap();
    this._initOverlay();
    this._initHint();

    this.add(this._debugger);

    this._setupSignals();
    Black.stage.on('resize', () => this.onResize());
    this.onResize();

    this.events.on('tap', () =>  this._onTap());
  }

  _initHint() {
    const hint = this._hint = new Hint();
    this.add(hint);
  }

  _initBg() {
    const bg = this._bg = new Background(this._physics);
    this.add(bg);
  }

  _initMap() {
    const map = this._map = new Map(this._physics);
    this.add(map);

    map.events.on('addedMatch', () => this.events.post('addedMatch'));
    map.events.on('burnedRocket', () => this._onBurnedRocket());
    map.events.on('onLose', () => this._onLose());
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

  _onBurnedRocket() {
    this._moveCamera();
  }

  _moveCamera() {
    this._cameraMoveProgress = 0;
    this._launchingRocket = true;

    const tween = this._moveCameraTween = new Tween({_cameraMoveProgress: 1}, 2, {
      ease: Ease.sinusoidalIn,
    });

    tween.on('complete', () => {
      setTimeout(() => this._onWin(), 4000);
    });

    this.addComponent(tween);
  }

  _onTap() {
    // console.log('tap')
  }

  _onWin() {
    this.events.post('onWin');
  }

  _onLose() {
    this.events.post('onLose');
  }

  update(dt) {
    if (this._isPaused)
      return;

    this._physics.update();
    this._debugger.update();

    if (this._launchingRocket) {
      this.onResize();
    }
  }

  onResize() {
    const basicPos = this._getBasicPos();
    const rocketPos = this._getRocketPos();

    this.x = basicPos.x + rocketPos.x;
    this.y = basicPos.y + rocketPos.y;

    this.scale = Utils.LP(2.5, 1.8);
  }

  _getBasicPos() {
    const levelSize = this._levelSize;
    const offsetY = this._cameraMoveProgress * this._levelSize * Utils.LP(0.6, 0.3);

    return {
      x: Utils.LP(-levelSize * 0.55, -levelSize * 0.3),
      y: Utils.LP(-levelSize * 1.32, -levelSize * 0.83) + offsetY,
    }
  }

  _getRocketPos() {
    const rocketPos = this._map.getRocketPos();

    return {
      x: -rocketPos.x,
      y: rocketPos.y
    };
  }
}
