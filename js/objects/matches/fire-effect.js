import {
  DisplayObject,
  Ease,
  Tween,
  Vector,
  BlendMode,
  MessageDispatcher,
  Sprite,
  Black,
  AnimationController
} from "black-engine";
import {Spine} from "black-spine";
import PhysicsOption from "../../physics/physics-options";
import * as planck from "planck-js";
import {Polygon, Vec2} from "planck-js";
import BodiesTypes from "../../physics/bodies-types";

export default class FireEffect extends DisplayObject {
  constructor(physics) {
    super();

    this.events = new MessageDispatcher();

    this._fireView = null;
    this._fireAnimation = null;

    this._physics = physics;
    this._body = null;

    this._moveSpeed = 0.025;
    this._bodyWidth = 0.7;
    this._bodyHeight = 1.5;
    this._fireScale = 0.3;
    this._additionalFireScale = 0.3;

    this.moveDirection = 0;
    this.movePercent = 0;
    this.startMovePercent = 0;
    this.firstSplashShowed = false;
    this.secondSplashShowed = false;

  }

  init(addBody = true) {
    this._initAnimation();
    this._initView();

    if (addBody) {
      setTimeout(() => {
        this._initBody();
      }, 500);
    }
  }

  _initView() {
    this._fireAnimation.play('match_start', false);
    this._fireView.scale = 0;

    let tween = new Tween({scaleX: this._fireScale, scaleY: this._fireScale}, 0.1, {ease: Ease.sinusoidalOut});
    this._fireView.addComponent(tween);

    this.add(this._fireView);
  }

  _initAnimation() {
    const frames = this._fireView = new Sprite();
    this.add(frames);
    frames.alignAnchor(0.5, 0.75);

    const startTexture = Black.assets.getTextures('match_start/match_start__*');
    const end1Texture = Black.assets.getTextures('match_end_1/match_end_1__*');
    const end2Texture = Black.assets.getTextures('match_end_2/match_end_2__*');

    const anim = this._fireAnimation = frames.addComponent(new AnimationController());
    anim.add('match_start', startTexture, 200, false);
    anim.add('match_end_1', end1Texture, 200, false);
    anim.add('match_end_2', end2Texture, 200, false);

    // this._fireView.blendMode = BlendMode.SCREEN;
  }

  _initBody() {
    this._body = this._physics.world.createBody({
      // bullet: true,
      gravityScale: 0,
      position: Vec2(0, 0),
      userData: {
        id: 'fire',
        type: 'fire',
        object: this
      },
    });

    this._body.createFixture({
      shape: Polygon([
        planck.Vec2(0, 0),
        planck.Vec2(this._bodyWidth, 0),
        planck.Vec2(this._bodyWidth, this._bodyHeight),
        planck.Vec2(0, this._bodyHeight)
      ]),

      density: 0,
      friction: 0,
      restitution: 0,
      mass: 0,
      filterCategoryBits: BodiesTypes.fire,
      filterMaskBits: BodiesTypes.rocket | BodiesTypes.match,
    });

    this._body.setActive(true);
  }

  _showAdditionalFireAnimation(animName){
    this._fireView.scale = this._additionalFireScale;
    this._fireAnimation.play(animName, false);

    this._fireAnimation.on('complete', () => {

      const tween = new Tween({alpha: 0}, 0.18, {
        playOnAdded: true,
        ease: Ease.sinusoidalOut,
      });

      this._fireView.addComponent(tween);
    });
  }

  showFireSplash1() {
    this._showAdditionalFireAnimation('match_end_1');
  }

  showFireSplash2() {
    this._showAdditionalFireAnimation('match_end_2');
  }

  stopFire() {
    this.events.post('stopFire');

    let tween = new Tween({alpha: 0, scaleX: 0, scaleY: 0}, 0.2, {ease: Ease.backIn});
    this._fireView.addComponent(tween);

    if (this._body != null) {
      this._body.setActive(false);
      this._physics.world.destroyBody(this._body);
    }
  }

  updateMove() {
    if (this.y != null && this.x != null && this._body != null) {
      const s = PhysicsOption.worldScale;
      this._body.setPosition(new Vector(this.x / s - this._bodyWidth * 0.5, this.y / s - this._bodyHeight * 0.5));
    }

    if (this.moveDirection !== 0) {
      this.movePercent += this.moveDirection * this._moveSpeed;

      if (this.movePercent <= 0 || this.movePercent >= 1) {
        this.stopFire();
        this.moveDirection = 0;
      }
    }
  }
}
