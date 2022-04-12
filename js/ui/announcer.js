import { Black, DisplayObject, TextField, FontAlign, FontStyle, FontWeight, Tween, Ease } from "black-engine";
import Delayed from "../kernel/delayed-call";

export default class Announcer extends DisplayObject {
  constructor() {
    super();

    this._text = null;

    this.visible = false;
  }

  onAdded() {
    super.onAdded();

    this._initText();

    Black.stage.on("resize", () => this.__onResize());
    this.__onResize();
  }

  show(value) {
    const string = value + ' matches left';
    this._setText(string);

    this.visible = true;

    const text = this._text;
    text.removeAllComponents();
    text.scale = 0;
    text.alpha = 0;

    const duration = 0.4;
    const tween = new Tween({ scale: 1.1 }, duration * 0.5, {
      ease: Ease.backOut,
    });
    text.addComponent(tween);

    const alphaTween = new Tween({ alpha: 1 }, duration, {
      ease: Ease.sinusoidalOut,
    });
    text.addComponent(alphaTween);

    alphaTween.once('complete', () => {
      Delayed.call(0.25, () => this.hide());
    });
  }

  hide() {
    const text = this._text;
    text.removeAllComponents();
    const duration = 0.15;
    const tween = new Tween({ scale: 0 }, duration, {
      ease: Ease.backIn,
    });
    text.addComponent(tween);

    const alphaTween = new Tween({ alpha: 0 }, duration, {
      ease: Ease.sinusoidalIn,
    });
    text.addComponent(alphaTween);

    alphaTween.once('complete', () => {
      this.visible = false;
    });
  }

  _initText() {
    const text = this._text = new TextField(
      '',
      "Baloo",
      0xffffff,
      26,
      FontStyle.NORMAL,
      FontWeight.NORMAL,
    );

    text.align = FontAlign.CENTER;
    text.alignAnchor();

    this.add(text);
  }

  _setText(string) {
    this._text.text = string;

    this.__onResize();
  }

  __onResize() {
    const { _text } = this;
    const bounds = Black.stage.bounds;

    _text.x = bounds.center().x;
    _text.y = bounds.top + 175;
  }
}