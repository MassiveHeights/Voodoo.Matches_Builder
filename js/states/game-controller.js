export default class GameController {
  constructor(data) { 
    this._game = data.game;
    this._ui = data.ui;
    this._scene = data.scene;

    this._initSignals();
  }

  _initSignals() {
    const scene = this._scene;

    scene.events.on('addedMatch', () => this._onAddedMatch());
    scene.events.on('onLose', () => this._onLose());
    scene.events.on('onWin', () => this._onWin());
    scene.events.once('addedMatch', () => this._onFirstMatchAdded());
  }

  _onFirstMatchAdded() {
    const ui = this._ui;

    this._scene.stopHint();
    ui.hideTutorial();
  }

  _onAddedMatch() {
    this._ui.decreaseProgressBar();
  }

  _onWin() {
    this._game.victory();
  }

  _onLose() {
    this._game.defeat();
  }
}