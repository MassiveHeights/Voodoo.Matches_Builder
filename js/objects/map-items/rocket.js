import { DisplayObject } from "black-engine";
import { Spine } from 'black-spine';

export default class Rocket extends DisplayObject {
  constructor() {
    super();

    this._rocket = null;
    this._firework = null;
    this._scale = 0.2;

    this._init();
  }

  launch() {
    this._rocket.play('animation', false)
    
    this._rocket.on('animationComplete', () => {
      this._firework.visible = true;
      this._firework.play('animation', true);
    });
  }

  _init() {
    this._initRocket();
    this._initFirework();
  }

  _initRocket() {
    const rocket = this._rocket = new Spine('rocket');
    this.add(rocket);

    rocket.scale = this._scale;
    rocket.rotation = -Math.PI * 0.12;
  }

  _initFirework() {
    const firework = this._firework = new Spine('firework');
    this.add(firework);

    firework.scale = this._scale;
    firework.visible = false;
  }
}