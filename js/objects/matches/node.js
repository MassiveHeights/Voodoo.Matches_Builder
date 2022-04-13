import {AnimationController, Black, DisplayObject, Ease, Sprite, Tween} from "black-engine";
import {Spine} from 'black-spine';

export default class Node extends DisplayObject {
  constructor(scale) {
    super();

    this._view = null;
    this._scale = scale;

    this._init();
  }

  animate() {
    const anim = this._anim;
    const view = this._view;

    anim.play('anim');
    anim.on('complete', () => {
      view.visible = true;
      view.scale = 0;

      const tween = new Tween({scaleX: this._scale, scaleY: this._scale}, 0.18, {
        playOnAdded: true,
        ease: Ease.backOut,
      });
      view.addComponent(tween);
    });
  }

  _init() {
    this._initAnimation();
    this._initView();
  }

  _initAnimation() {
    const frames = new Sprite();
    this.add(frames);
    frames.alignAnchor(0.5);

    const textureAnim = Black.assets.getTextures('matches/node/fix_*');
    const animController = new AnimationController();
    const anim = this._anim = frames.addComponent(animController);
    anim.add('anim', textureAnim, 200, false);

    frames.scale = this._scale;
  }

  _initView() {
    const view = this._view = new Sprite('matches/node');
    this.add(view);
    view.alignAnchor(0.5);
    view.visible = false;
  }
}
