import { Black, DisplayObject, Sprite } from "black-engine";
import Delayed from "../kernel/delayed-call";
import Announcer from "./announcer";
import ProgressBar from "./progress-bar/progress-bar";

export default class UI extends DisplayObject {
  constructor(renderer, camera) {
    super();

    this._resize = null;

    this._camera = camera;
    this._renderer = renderer;

    this._progressBar = null;
    this._announcer = null;

    this.touchable = true;
  }

  onAdded() {
    super.onAdded();

    this._init();

    this._resize = Black.stage.on("resize", () => this.onResize());
    this.onResize();
  }

  decreaseProgressBar() {
    this._progressBar.decrease();

    const value = this._progressBar.getValue();
    this._announcer.show(value)
  }

  _init() {
    this._initProgressBar();
    this._initAnnouncer();
    this._initRetryButton();
    this._listenButtons();
  }

  _initProgressBar() {
    const progressBar = this._progressBar = new ProgressBar();
    this.add(progressBar);

    // TEMP
    // for (let i = 1; i < 16; ++i) {
    //   Delayed.call(i / 3, () => {
    //     progressBar.decrease();
    //   });
    // }
  }

  _initAnnouncer() {
    const announcer = this._announcer = new Announcer();
    this.add(announcer);

    // TEMP
    // for (let i = 1; i < 16; ++i) {
    //   Delayed.call(i, () => {
    //     announcer.show(16 - i);
    //   });
    // }
  }

  _initRetryButton() {
    const frame = 'ui/button_RETRY_small';

    const retryButton = this._retryButton = new Sprite(Black.assets.getTexture(frame));
    retryButton.alignPivotOffset();
    retryButton.touchable = true;
    retryButton.width = 65;
    retryButton.scaleY = retryButton.scaleX;

    this.add(retryButton);

    retryButton.visible = false;
  }

  _listenButtons() {
    const { _retryButton } = this;

    _retryButton.on('pointerDown', (msg, p) => this._onRetryButtonClick());
  }

  _onRetryButtonClick() {
    console.log('Retry Button Click');
  }

  onResize() {
    const { _retryButton } = this;

    const bounds = Black.stage.bounds;

    _retryButton.x = bounds.topRight.x - 70;
    _retryButton.y = bounds.topRight.y + 70;
  }
}
