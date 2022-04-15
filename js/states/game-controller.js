export default class GameController {
  constructor(data) { 
    this._game = data.game;
    this._ui = data.ui;
    this._scene = data.scene;

    this._initSignals();
  }

  _initSignals() {
    const scene = this._scene;
    const ui = this._ui;

    scene.events.on('addedMatch', () => this._onAddedMatch());
    scene.events.on('onLose', () => this._onLose());
    scene.events.once('onWin', () => this._onWin());
    
    ui.events.on('retryClick', () => this._onRetryClick());
    ui.events.on('tutorialShown', () => {
      scene.events.once('addedMatch', () => this._onFirstInteraction());
    });
  }

  _onAddedMatch() {
    this._ui.decreaseProgressBar();
  }

  _onFirstInteraction() {
    this._ui.hideTutorial();
    this._scene.stopHint();
  }

  _onWin() {
    this._game.victory();
  }

  _onLose() {
    if(creativeWrapper.getParam('autoRetry')){
      this._game.retry();
    }else{
      this._scene.defeat();
    }
  }

  _onRetryClick() {
    this._game.retry();
  }
}