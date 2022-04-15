import BaseGame from '../kernel/base-game';
import {Black, GameObject} from 'black-engine';
import Tutorial from "js/ui/tutorial";
import Confetti from "js/ui/confetti";
import SoundButton from "../ui/sound-button";
import SoundManager from "../objects/soundManager";
import {CreativeWrapper} from "../libs/wrapper/creative-wrapper";
import GameScene from '../scene/game-scene';
import UI from '../ui/ui';
import GameController from './game-controller';

export default class Game extends BaseGame {
  constructor() {
    super();
    this._gameScene = null;
    this._tutorial = null;
    this._soundManager = null;
    this._ui = null;
    this._controller = null;

    this._totalTaps = 0;
    this._inputEnabled = true;
    this._gameStarted = false;

    this._retryTimes = 0;

    this._initEvents();
  }

  retry() {
    if(creativeWrapper.getParam('retryTimes') === this._retryTimes + 1) {
      this._ui.hideRetryBtn();
    }

    if(creativeWrapper.getParam('retryTimes') < this._retryTimes + 1) {
      window._gameplayEvents.lose();
      return;
    }
    
    this._ui.start(true);
    this._gameScene.start(true);

    this._retryTimes++;
  }

  victory() {
    Black._soundManager.playFx('cta_win');

    console.log("win!");
    window._gameplayEvents.endGame("win");
  }

  defeat() {
    Black._soundManager.playFx('cta_lose');

    console.log("lose!");
    window._gameplayEvents.lose();
  }

  // Call this method for 'Install button' action
  onInstallClick() {
    window._voodooExit("click");
  }

  _onInited() {
    // if (this._soundManager == null) {
    //   Black._soundManager = this._soundManager = new SoundManager();
    // }

    this._initScene();
    this._initUI();
    this._initController();

    Black.input.on('pointerDown', (m, p) => {
      this._gameStarted = true;
      this._onPlayerInteraction(m, p);
    });

    Black.stage.on("resize", () => this._onResize());
    this._onResize();
  }

  // Calls from ICE API or first click
  // Here game logic should start
  _startGame() {
    console.log("start game: launch game");
    this._initSoundManger();
    this._ui.start();

    this._gameStarted = true;
  }

  _initSoundManger() {
    if(Black.stage.mChildren.indexOf(this._soundButton) !== -1){
      return;
    }

    if (creativeWrapper.getParam('sounds') === true) {
      if (this._soundManager == null) {
        Black._soundManager = this._soundManager = new SoundManager();

        this._soundManager.playBackgroundMusic();
      }

      let soundButton = this._soundButton = new SoundButton();
      Black.stage.addChild(soundButton);
      soundButton.show();
      this._soundManager.registerSoundButton(soundButton);
    }
  }

  // Calls from ICE API after level completed
  _restartGame() {
    console.log("restart game");

    super._restartGame();
    this._totalTaps = 0;
    // this.retry();
    this._inputEnabled = true;
    this._gameScene.events.off(['victory', 'preFinish', 'inputLock']);
  }

  _initEvents() {
    creativeWrapper.events.on('restart', () => this._restartGame());
  }

  _initScene() {
    const scene = this._gameScene = new GameScene();
    Black.stage.addChild(scene);
  }

  _initUI() {
    const ui = this._ui = new UI();
    Black.stage.addChild(ui);

    // if (creativeWrapper.getParam('tutorial') === true) {
    //   this._tutorial = new Tutorial();
    //   Black.stage.add(this._tutorial);
    // }
  }

  _initController() {
    const data = {
      game: this,
      ui: this._ui,
      scene: this._gameScene,
    };

    this._controller = new GameController(data);
  }

  _onPlayerInteraction(m, p) {
    if (this._gameStarted) {
      if (!this._inputEnabled) return;
      this._initSoundManger();

      this._onPointerDown(p);

      // this._soundManager.playTapSfx();

      if (this._tutorial) {
        this._tutorial.onTap();
      }
    }
  }

  _onPointerDown() {
    this._totalTaps++;
    this._gameScene.events.post('tap');

    if (this._totalTaps >= creativeWrapper.getParam('tapsToWin')) {
      this._gameScene.events.post('victory');
      this.__inputLock(true);
    }
  }

  _onUpdate(dt) {
    // Don't remove this
    if (window.creativeWrapper.state === CreativeWrapper.STATE.started) {
      window.creativeWrapper.state = CreativeWrapper.STATE.playing;
      this._startGame();
    }

    this._gameScene.update(dt);
  }

  _onResize() {
    super._onResize();
  }

  _onRender() {
    super._onRender();
  }

  __victory() {
    let c = new Confetti();
    Black.stage.add(c);

    this.victory();
  }

  __inputLock(value) {
    this._tutorial && this._tutorial.setEnabled(!value);
    this._inputEnabled = !value;
  }
}
