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

  _init() {
    this._initProgressBar();
    this._initAnnouncer();
    this._initRetryButton();
    this._initBackButton();
    this._listenButtons();
  }

  _initProgressBar() {
    const progressBar = this._progressBar = new ProgressBar();
    this.add(progressBar);

    // // TEMP
    // for (let i = 1; i < 16; ++i) {
    //   Delayed.call(i / 3, () => {
    //     progressBar.decrease();
    //   });
    // }
  }

  _initAnnouncer() {
    const announcer = this._announcer = new Announcer();
    this.add(announcer);

    // // TEMP
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

    this.add(retryButton);
  }

  _initBackButton() {
    const frame = 'ui/button_BACK';

    const backButton = this._backButton = new Sprite(Black.assets.getTexture(frame));
    backButton.alignPivotOffset();
    backButton.touchable = true;

    this.add(backButton);
  }

  _listenButtons() {
    const { _retryButton, _backButton } = this;

    _retryButton.on('pointerDown', (msg, p) => this._onRetryButtonClick());
    _backButton.on('pointerDown', (msg, p) => this._onBackButtonClick());
  }

  _onRetryButtonClick() {
    console.log('Retry Button Click');
  }

  _onBackButtonClick() {
    console.log('Back Button Click');
  }

  onResize() {
    const { _retryButton, _backButton } = this;

    const bounds = Black.stage.bounds;

    _retryButton.x = bounds.topRight.x - 70;
    _retryButton.y = bounds.topRight.y + 70;

    _backButton.x = bounds.topLeft.x + 70;
    _backButton.y = bounds.topLeft.y + 70;
  }
}
