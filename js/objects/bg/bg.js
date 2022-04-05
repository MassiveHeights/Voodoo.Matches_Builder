import {Black, DisplayObject, Sprite, TextField} from "black-engine";

export default class Background extends DisplayObject {
  constructor() {
    super();

    this._init();
  }

  _init() {
    this._initSky();
    this._initGround();
    this._initPlatform();

    Black.stage.on('resize', () => this.onResize());
    this.onResize();
  }

  _initSky() {
    const sky = this._sky = new Sprite('bg/level_4_bg');

    this.add(sky)
    sky.alignAnchor(0.5);
  }

  _initGround() {
    const ground = this._ground = new Sprite('bg/level_4_00');

    this.add(ground)
    ground.alignAnchor(0.5, 1);
  }

  _initPlatform() {
    const platform = this._platform = new Sprite('bg/level_4_02');

    this.add(platform)
    platform.alignAnchor(0.5);
  }

  onResize() {
    const { _sky: sky, _ground: ground, _platform: platform } = this;

    const bounds = Black.stage.bounds;
    const center = bounds.center();

    sky.x = center.x;
    sky.y = center.y;

    sky.width = Math.max(bounds.width, bounds.height);
    sky.scaleY = sky.scaleX;

    ground.x = center.x;
    ground.y = bounds.bottom;

    ground.width = Math.max(bounds.width, bounds.height);
    ground.scaleY = ground.scaleX;

    platform.x = bounds.left + bounds.width * 0.6;
    platform.y = center.y;
    platform.scale = ground.scaleY;
  }
}