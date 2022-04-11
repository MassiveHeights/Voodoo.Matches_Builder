export default class GameController {
  constructor(data) { 
    this._ui = data.ui;
    this._scene = data.scene;

    this._initSignals();
  }

  _initSignals() {
    this._scene.events.on('addedMatch', () => {
      this._ui.decreaseProgressBar();
    });
  }
}