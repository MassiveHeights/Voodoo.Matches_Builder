import { Black } from 'black-engine';

export default class BaseGame {
  constructor() {
    this.visibilityHandler = null;

    this._container = Black.engine.containerElement;
    this._ambientlight = null;

    this._dpr = Black.device.pixelRatio;
    this._viewWidth = 0;
    this._viewHeight = 0;
    this._isPause = false;
    this._pendingRestart = false;

    // Black.input.on('pointerDown', () => {
    //   creativeWrapper.events.post('onInteraction');
    // });
  }

  restart() {
    this._pendingRestart = true;
  }

  init() {
    this._updateLayout();

    Black.engine.on('paused', this.__onPause, this);
    Black.engine.on('unpaused', this.__onUnPause, this);

    creativeWrapper.events.on('pause', this._pauseGame, this);
    creativeWrapper.events.on('resume', this._resumeGame, this);
    creativeWrapper.events.on('resize', this._onResize, this);

    this._onResize();

    this._onInited();
    this._update();
  }

  _pauseGame() {
    Black.engine.pause();
  }

  _resumeGame() {
    Black.engine.resume();
  }

  _restartGame() {
    //Black.audio.stopAll();
   // this._destroySceneChildren();
    this._destroyBlackStage();
    this._onInited();
  }

  _destroyBlackStage() {
    const stage = Black.stage;
    while (stage.numChildren > 0) {
      stage.removeChildAt(0);
    }

    while (stage.numComponents > 0) {
      stage.removeComponent(stage.getComponentAt(0));
    }

    stage.touchable = true;
  }

  _destroySceneChildren() {
    // for (let i = this._scene.mChildren.length - 1; i > 0; i--) {
    //   if (this._notDestroyableContainer !== this._scene.mChildren[i]) {
    //     this._scene.removeChild(this._scene.mChildren[i]);
    //   }
    // }
  }

  _onResize() {
    this._updateLayout();
  }

  _updateLayout() {
    this._viewWidth = window.innerWidth;
    this._viewHeight = window.innerHeight;
  }

  _update(time) {
    if (this._isPause === false) {
      this._onUpdate();
      this._lateUpdate();
    }

    window.requestAnimationFrame(time => this._update(time));
  }

  _onRender() {

   // this._renderer.render(this._scene, this._camera);
  }

  _onPause() {

  }

  _onUnPause() {
  }

  //called after rendering
  _lateUpdate() {
    if (this._pendingRestart) {
      this._pendingRestart = false;
      this._restartGame();
    }
  }

  //called before rendering
  _onUpdate() {
  }

  // called after scene initialization. This is the right function to create objects.
  _onInited() {
  }

  __onPause() {
    this._isPause = true;
    this._onPause();
  }

  __onUnPause() {
    this._isPause = false;
    this._onUnPause();
  }
}
