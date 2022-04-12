import { Black, DisplayObject, MessageDispatcher, Sprite } from "black-engine";
import Delayed from "../kernel/delayed-call";
import Announcer from "./announcer";
import ProgressBar from "./progress-bar/progress-bar";
import Tutorial from "./tutorial";

export default class UI extends DisplayObject {
  constructor(renderer, camera) {
    super();

    this.events = new MessageDispatcher(false);

    this._camera = camera;
    this._renderer = renderer;

    this._progressBar = null;
    this._announcer = null;

    this.touchable = true;
  }

  start() {
    this._progressBar.restore();
  }

  onAdded() {
    super.onAdded();

    this._init();

    Black.stage.on("resize", () => this.onResize());
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
    this._initTutorial();
    this._listenButtons();
  }

  _initProgressBar() {
    const progressBar = this._progressBar = new ProgressBar();
    this.add(progressBar);
  }

  _initTutorial() {
    const tutorial = this._tutorial = new Tutorial();
    this.add(tutorial);
  }

  _initAnnouncer() {
    const announcer = this._announcer = new Announcer();
    this.add(announcer);
  }

  _initRetryButton() {
    const frame = 'ui/button_RETRY_small';

    const retryButton = this._retryButton = new Sprite(Black.assets.getTexture(frame));
    retryButton.alignPivotOffset();
    retryButton.touchable = true;
    retryButton.width = 65;
    retryButton.scaleY = retryButton.scaleX;

    this.add(retryButton);
  }

  _listenButtons() {
    this._retryButton.on('pointerDown', () => this._onRetryButtonClick());
  }

  _onRetryButtonClick() {
    this.events.post('retryClick');
  }

  onResize() {
    const { _retryButton } = this;

    const bounds = Black.stage.bounds;

    _retryButton.x = bounds.topRight.x - 70;
    _retryButton.y = bounds.topRight.y + 70;
  }
}
