import BaseGame from '../kernel/base-game';
import {Black, GameObject} from 'black-engine';
import Tutorial from "js/ui/tutorial";
import Confetti from "js/ui/confetti";
import SoundButton from "../ui/sound-button";
import SoundManager from "../objects/soundManager";
import {CreativeWrapper} from "../libs/wrapper/creative-wrapper";
import GameScene from '../scene/game-scene';

export default class Game extends BaseGame {
  constructor() {
    super();
    this._gameScene = null;
    this._tutorial = null;
    this._soundManager = null;

    this._totalTaps = 0;
    this._inputEnabled = true;
    this._gameStarted = false;

    this._initEvents();
  }

  victory() {
    console.log("win!");
    window._gameplayEvents.endGame("win");
  }

  defeat() {
    console.log("lose!");
    window._gameplayEvents.lose();
  }

  // Call this method for 'Install button' action
  onInstallClick() {
    window._voodooExit("click");
  }

  _onInited() {
    if (this._soundManager == null) {
      Black._soundManager = this._soundManager = new SoundManager();
    }

    this._initScene();
    this._initUI();

    Black.input.on('pointerDown', (m, p) => {
      this._gameStarted = true;
      this._onPlayerInteraction(m, p);
    });

    Black.stage.on("resize", () => this._onResize());
    this._onResize()
  }

  // Calls from ICE API or first click
  // Here game logic should start
  _startGame() {
    console.log("start game: launch game");
    this._initSoundManger();

    this._gameStarted = true;
  }

  _initSoundManger() {
    if (this._soundManager == null) {
      this._soundManager = new SoundManager();

      this._soundManager.playBackgroundMusic();
    }
  }

  // Calls from ICE API after level completed
  _restartGame() {
    console.log("restart game");

    super._restartGame();
    this._totalTaps = 0;
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
    if (creativeWrapper.getParam('tutorial') === true) {
      this._tutorial = new Tutorial();
      Black.stage.add(this._tutorial);
    }

    if (creativeWrapper.getParam('sounds') === true) {
      let soundButton = new SoundButton();
      Black.stage.addChild(soundButton);
      this._soundManager.registerSoundButton(soundButton);
    }
  }

  _onPlayerInteraction(m, p) {
    if (this._gameStarted) {
      if (!this._inputEnabled) return;
      this._initSoundManger();

      this._onPointerDown(p);

      this._soundManager.playTapSfx();

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
