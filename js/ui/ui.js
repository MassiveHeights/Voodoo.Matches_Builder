import { Black, DisplayObject, MessageDispatcher, Sprite } from "black-engine";
import Delayed from "../kernel/delayed-call";
import GAME_CONFIG from "../states/game-config";
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

    this._levelSize = GAME_CONFIG.levelSize;

    this.touchable = true;
  }

  start(isRetry = false) {
    this._progressBar.restore();
    if(!isRetry) {
      this._tutorial.show();
    }
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

  hideTutorial() {
    this._tutorial.hide();
  }

  _init() {
    this._initProgressBar();
    this._initAnnouncer();
    if(creativeWrapper.getParam('retryButton')){
      this._initRetryButton();
    }
    this._initTutorial();
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
    retryButton.on('pointerDown', () => this._onRetryButtonClick());
  }

  _onRetryButtonClick() {
    this.events.post('retryClick');
  }

  onResize() {
    const { _retryButton } = this;

    const bounds = Black.stage.bounds;

    if(_retryButton){
      _retryButton.x = bounds.topRight.x - 70;
      _retryButton.y = bounds.topRight.y + 70;
    }
  }
}
