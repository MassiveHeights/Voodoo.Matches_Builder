import {
  Black,
  DisplayObject,
  FontStyle,
  FontWeight,
  Sprite,
  TextField,
  Timer,
} from "black-engine";
import { Ease, Tween } from "black-engine";
import Delayed from "../kernel/delayed-call";
import Match from "../objects/matches/match";
export default class Hint extends DisplayObject {
  constructor() {
    super();

    this._hand = null;
    this._note = null;
    this._match = null;
    this._matchHeight = 0;
    this._duration = 1.2;

    this._interval = 2;
    this._isActive = false;

    this._startX = 0;
    this._startY = 0;
    this._rotation = 0;

    this._init();
  }

  onUpdate() {
    if (this._timer.mTick === this._interval && this._isActive) {
      if (!this.isShow) {
        this.showHint();
      }
    }
  }

  show(startPos, rotation) {
    this._startX = startPos.x;
    this._startY = startPos.y;
    this._rotation = rotation;

    this._isActive = true;
    this._timer.start();
  }

  showHint() {
    const startX = this._startX;
    const startY = this._startY
    const rotation = this._rotation;

    this.isShow = true;
    const L = this._matchHeight;

    const endX = startX + L * Math.sin(rotation);
    const endY = startY - L * Math.cos(rotation);

    this._showHand(startX, startY, endX, endY)
    this._showMatch(startX, startY, rotation);
    this._showHintText(startX, startY);

    this._timer.mTick = 0;
    this.isShow = false;
  }

  hideHint() {
    this._hand.removeAllComponents();
    this._match.removeAllComponents();
    this._note.removeAllComponents();

    this._hand.visible = false;
    this._match.visible = false;
    this._note.visible = false;

    this._timer.mTick = -this._interval;
  }

  stop() {
    this.hideHint();
    this._isActive = false;
    this._timer.stop();
  }

  _showHand(startX, startY, endX, endY) {
    const hand = this._hand;
    hand.x = startX;
    hand.y = startY;
    hand.visible = true;
    hand.rotation = -Math.PI * 0.2;
    hand.alpha = 0;

    const duration = this._duration * 0.8;
    const delay = this._duration - duration;
    const alphaDuration = duration * 0.3;
    const moveDuration = duration - alphaDuration;

    const alphaTween = new Tween({ alpha: 1 }, alphaDuration, {
      delay: delay,
      ease: Ease.sinusoidalOut,
    });
    const rotationTween = new Tween({ rotation: hand.rotation - Math.PI * 0.1 }, moveDuration, { 
      ease: Ease.sinusoidalInOut,
    });
    const moveTween = new Tween({ x: endX - 10, y: endY }, moveDuration, {
      ease: Ease.sinusoidalInOut,
    });

    hand.addComponent(alphaTween);

    alphaTween.on('complete', () => {
      hand.addComponent(moveTween);
      hand.addComponent(rotationTween);
      moveTween.on('complete', () => this._hideObj(hand));
    });
  }

  _showMatch(startX, startY, rotation) {
    const match = this._match;

    match.visible = true;
    match.x = startX;
    match.y = startY;
    match.alpha = 0;
    match.rotation = rotation - Math.PI * 0.5;

    const duration = this._duration * 0.5;

    const tween = new Tween({alpha: 0.5}, duration, {
      ease: Ease.sinusoidalOut,
    });

    tween.on('complete', () => Delayed.call(this._duration - duration, () => this._hideObj(match)));
    match.addComponent(tween);
  }

  _showHintText(startX, startY) {
    const note = this._note;
    note.x = startX - 35;
    note.y = startY - 70;
    note.alpha = 0;
    note.visible = true;

    const duration = this._duration * 0.5;
    const delay = this._duration * 0.15;

    const textTween = new Tween({ alpha: 1 }, duration, {
      delay: delay,
      ease: Ease.sinusoidalOut,
    });
    textTween.on('complete', () => Delayed.call(this._duration - duration - delay, () => this._hideObj(note)));

    note.addComponent(textTween);
  }

  _hideObj(obj) {
    const duration = 0.2;

    const tween = new Tween({ alpha: 0 }, duration, { 
      ease: Ease.sinusoidalIn,
    });
    tween.on('complete', () => obj.visible = false);
    obj.addComponent(tween);
  }

  _init() {
    this._initSprites();
    this._initNotification();
    this._initTimer();
    Black.input.on('pointerDown', this.hideHint, this);
  }

  _initSprites() {
    const match = this._match = new Match();
    match.visible = false;
    this.add(match);
    this._matchHeight = match.getHeight();

    const hand = this._hand = new Sprite(Black.assets.getTexture('ui/hand'));
    hand.scale = 0.15;
    hand.visible = false;
    hand.alignAnchor(0.25, -0.1);

    this.add(hand);
  }

  _initNotification() {
    const note = this._note = new TextField(
      'swipe!',
      'Baloo',
      0xffffff,
      30, 
      FontStyle.NORMAL,
      FontWeight.NORMAL,
      // 3,
      // 0x111111
    );
    note.autoSize = false;
    note.fieldWidth = 960;
    note.align = 'center';
    note.alignPivot();
    note.visible = false;

    this.add(note);
  }

  _initTimer() {
    this._timer = this.addComponent(new Timer(1, 5));
  }
}
