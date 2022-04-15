import { Black, DisplayObject, Ease, MessageDispatcher, Sprite, Tween } from "black-engine";
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
    if(!isRetry && creativeWrapper.getParam('tutorial')) {
      this._tutorial.show()
      .once('complete', () => this.events.post('tutorialShown'));
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
    if(creativeWrapper.getParam('tutorial')){
      this._tutorial.hide();
    }
  }

  enableRetryBtn() {
    this._retryButton.touchable = true;
  }

  hideRetryBtn() {
    const retryBtn = this._retryButton;
    const tween = new Tween({ scale: 0 }, 0.3, {
      ease: Ease.backIn,
    });

    tween.on('complete', () => {
      retryBtn.visible = false;
    });

    retryBtn.addComponent(tween);
  }

  _init() {
    this._initProgressBar();
    this._initAnnouncer();
    if(creativeWrapper.getParam('retryButton')){
      this._initRetryButton();
    }
    if(creativeWrapper.getParam('tutorial')){
      this._initTutorial();
    }
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
    // retryButton.touchable = true;
    retryButton.width = 65;
    retryButton.scaleY = retryButton.scaleX;

    this.add(retryButton);
    retryButton.on('pointerDown', () => this._onRetryButtonClick());
  }

  _onRetryButtonClick() {
    const retryBtn = this._retryButton;
    retryBtn.removeComponent(this._retryClickTween);

    retryBtn.width = 65;
    retryBtn.scaleY = retryBtn.scaleX;

    const startScale = retryBtn.scale;
    const tween = this._retryClickTween = new Tween({ scale: startScale * 1.2 }, 0.15, {
      ease: Ease.sinusoidalOut,
    });

    tween.yoyo = true;
    tween.repeats = 1;

    retryBtn.addComponent(tween);
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
