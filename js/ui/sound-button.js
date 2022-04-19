import {Black, DisplayObject, Ease, MessageDispatcher, Sprite, Tween} from "black-engine";
import Utils from "../helpers/utils";

export default class SoundButton extends DisplayObject {
  constructor() {
    super();
    this._resize = null;

    this.events = new MessageDispatcher();

    this._textureOn = Black.assets.getTexture('ui/button_sound_on');
    this._textureOff = Black.assets.getTexture('ui/button_sound_off');

    this._sprite = new Sprite(this._textureOn);
    this._sprite.alignPivotOffset();
    this._sprite.width = 70;
    this._sprite.scaleY = this._sprite.scaleX;

    this.addChild(this._sprite);

    this._sprite.on('pointerDown', (msg, p) => this._onClick());

    this.touchable = true;
    this._sprite.touchable = true;
  }

  _onClick() {
    this.events.post('onMuteClick');
  }

  setState(muteState) {
    this._sprite.texture = muteState ? this._textureOff : this._textureOn;
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
    this.x = this.stage.bounds.x + this.stage.bounds.width - 60;
    this.y = this.stage.bounds.top + Utils.LP(70, 200);
  }
}
