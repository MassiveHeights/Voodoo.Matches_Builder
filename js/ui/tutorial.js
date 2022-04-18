import {
  Black,
  DisplayObject, FontAlign,
  FontStyle,
  FontWeight,
  Sprite,
  TextField,
  Timer,
  Tween,
  Ease
} from "black-engine";
import localization from "js/localization";
import Utils from "../helpers/utils";
import Delayed from "../kernel/delayed-call";

export default class Tutorial extends DisplayObject {
  constructor() {
    super();

    this._bg = null;
    this._txt = null;

    this.visible = false;
    this._isHidden = false;

    this._init();
  }

  onAdded() {
    super.onAdded();

    Black.stage.on('resize', () => this._onResize());
    this._onResize();
  }

  show() {
    if(this._isHidden) {
      return;
    }
    
    this.removeAllComponents();
    this.visible = true;
    this.scale = 0;

    const tween = new Tween({scale: this._getScale()}, 0.35, {
      delay: 0.2,
      playOnAdded: true,
      ease: Ease.backOut
    });

    this.addComponent(tween);

    return tween;
  }

  hide() {
    this.removeAllComponents();
    const tween = new Tween({scale: 0}, 0.3, {
      playOnAdded: true,
      ease: Ease.backIn
    });

    tween.once('complete', () => {
      this.visible = false;
    });
    
    this.addComponent(tween);
    this._isHidden = false;
  }

  _init() {
    this._initBg();
    this._initText();

    this._tween = null;

    /** @type {Timer} */
    this._timer = new Timer(1, creativeWrapper.getParam('hintDelay'));
    this._timer.on('complete', () => this._onRestart());
    this._timer.startOnAdded = false;
    this.addComponent(this._timer);
  }

  _initBg() {
    const bg = this._bg = new Sprite('ui/frame_tutorial');
    bg.alignPivotOffset(0.485, 0.5);
    bg.scaleX = 1.2;
    this.add(bg);
  }

  _initText() {
    const text = this._txt = new TextField(
      localization.get('TUTORIAL_TEXT'),
      'Baloo',
      0xffffff,
      56,
      FontStyle.NORMAL,
      FontWeight.NORMAL,
      8,
      0x6a6666
    );

    text.align = FontAlign.CENTER;
    text.multiline = true;
    text.lineHeight = 1.2;
    text.alignPivotOffset();

    this.addChild(text);
  }

  _getScale() {
    return Utils.LP(1.8, 1.2);
  }

  _onResize() {
    this.scale = this._getScale();

    const bounds = Black.stage.bounds;

    this.x = bounds.center().x;
    this.y = bounds.center().y - 100;

    this._txt.width = this._bg.width * 0.8;
    this._txt.scaleY = this._txt.scaleX;
  }

  _onRestart() {
    this._onResize();
    this.visible = true;
  }
}
