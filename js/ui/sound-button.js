import {Black, DisplayObject, Ease, MessageDispatcher, Sprite, Tween} from "black-engine";

export default class SoundButton extends DisplayObject {
  constructor() {
    super();
    this._resize = null;

    this.events = new MessageDispatcher();

    this._textureOn = Black.assets.getTexture('ui/button_SOUND_on');
    this._textureOff = Black.assets.getTexture('ui/button_SOUND_off');

    this._sprite = new Sprite(this._textureOn);
    this._sprite.alignPivotOffset();
    this._sprite.width = 70;
    this._sprite.scaleY = this._sprite.scaleX;

    this.addChild(this._sprite);

    this._sprite.on('pointerDown', (msg, p) => this._onClick());

    this._visible = false;
    this._isShown = false;
  }

  _onClick() {
    this.events.post('onMuteClick');
  }

  setState(muteState) {
    this._sprite.texture = muteState ? this._textureOff : this._textureOn;
  }

  show() {
    if(this._isShown){
      return;
    }
    this._isShown = true;
    this.visible = true;

    this.scale = 0;

    const tween = new Tween({scale: 1}, 0.3, {
      ease: Ease.backOut,
    });

    tween.on('complete', () => {
      this.touchable = true;
      this._sprite.touchable = true;
    });

    this.addComponent(tween);
  }

  onAdded() {
    super.onAdded();

    this._resize = this.stage.on('resize', () => this.__onResize());
    this.__onResize();
  }

  onRemoved() {
    this._resize.off();
  }

  __onResize() {
    this.x = this.stage.bounds.x + 70;
    this.y = this.stage.bounds.top + 70;
  }
}
