import { DisplayObject } from "black-engine";
import { Spine } from 'black-spine';
import { Black, GameObject } from 'black-engine';


export default class Bonfire extends DisplayObject {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const view = new Spine('matches_layout');
    this.add(view);

    Black._soundManager.playFx('walking_fire_loop', 1, true);

    view.scale = 0.5;
    // view.blendMode = BlendMode.HARD_LIGHT;

    //HARD_LIGHT
    //HUE
    //SATURATE

    view.play('bonfire', true);
  }
}