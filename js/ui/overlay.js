import { Black, DisplayObject, Sprite } from "black-engine";

export default class Overlay extends DisplayObject {
  constructor() {
    super();

    this._view = null;
    this._isPressed = false;

    this.touchable = true;
  }

  disable() {
    this.touchable = false;
  }

  enable() {
    this.touchable = true;
  }

  onAdded() {
    this._initView();
    this._initSignals();

    Black.stage.on('resize', () => this._onResize());
    this._onResize();
  }

  _initView() {
    const view = this._view = new Sprite('textures/overlay');
    this.add(view);

    view.alpha = 0;
    view.touchable = true;
  }

  _initSignals() {
    this._view.on('pointerDown', (msg, pointer) => {
      this._isPressed = true;
      this.post('onPointerDown', pointer);
    });

    this._view.on('pointerUp', (msg, pointer) => {
      this._isPressed = false;
      this.post('onPointerUp', pointer);
    });

    this._view.on('pointerMove', (msg, pointer) => {
      if (this._isPressed) {
        this.post('onPointerMove', pointer);
      }
    });
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._view.x = bounds.left;
    this._view.y = bounds.top;

    this._view.width = bounds.width;
    this._view.height = bounds.height;
  }
}
