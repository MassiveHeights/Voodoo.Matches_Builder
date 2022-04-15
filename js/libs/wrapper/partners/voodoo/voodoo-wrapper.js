import {Partner} from "../../partner";
import {CreativeWrapper} from "../../creative-wrapper";
import {IceTemplateDev} from "./ice-template-dev";

export class VoodooWrapper extends Partner {
  constructor(creativeConfig, isDevMode) {
    super(creativeConfig);
    this._devMode = isDevMode;
  }

  getParam(paramKey) {
    let result = window._gameplay.creative[paramKey.toString()];

    if (result === 'true') result = true;
    if (result === 'false') result = false;

    return result;

  }

  getParams() {
    return window._gameplay.creative;
  }

  start() {
    if (this.state === CreativeWrapper.STATE.none) {
      this.state = CreativeWrapper.STATE.ready;

      window.gameReady && window.gameReady();
      this._showSplashScreen();
      CreativeWrapper.START_CREATIVE();
    }
  }

  __initPartner() {
    if (!this._devMode) {
      this._iceCreamFunctions();

    } else {
      new IceTemplateDev();
      this._iceCreamFunctions();
      this._resize();
    }
  }

  _iceCreamFunctions() {
    window._gameplayEvents.initGame = () => this._init();
    window._gameplayEvents.startGame = () => this._startGame();
    window._gameplayEvents.playableResize = () => this._resize();
    window._gameplayEvents.restartGame = () => this._restart();
    window._gameplayEvents.startLevel = () => {
      this._startGame();
    };
    window._gameplayEvents.paused = (paused) => {
      this._pause(paused);
    };
  }

  _init() {
    this.start();
  }

  _startGame() {
    this.state = CreativeWrapper.STATE.started;

    // this.__resetCTAIdleTime();
    window._gameplayEvents.startTimer();
  }

  _restart() {
    // this.__resetCTAIdleTime();
    this.events.post(Partner.EVENT_TYPES.RESTART);
  }

  __onEndGame() {
    window._gameplayEvents.endGame('Completed');
  }

  __resetCTAIdleTime() {
    // if (this._ctaIdleTimer) {
    //   clearTimeout(this._ctaIdleTimer);
    // }
    //
    // this._ctaIdleTimer = setTimeout(() => {
    //   this._showCTA();
    // }, window._gameplay.timerEndScreen * 1000);
  }

  _pause(paused) {
    if (paused) {
      this.events.post(Partner.EVENT_TYPES.PAUSE);

    } else {
      this.events.post(Partner.EVENT_TYPES.RESUME);
    }
  }

  _resize() {
    this.events.post('resize');
  }

  __onHideSplashScreen() {
    if (this._splashScreenElement) {
      this._splashScreenElement.style.display = 'none';
    }

    if (document.getElementById("loading"))
      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
      }, 1000);
  }
}
