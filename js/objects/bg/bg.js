import { Black, DisplayObject, Sprite, TilingInfo } from "black-engine";
import { Polygon, Vec2 } from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import PhysicsOption from "../../physics/physics-options";

export default class Background extends DisplayObject {
  constructor(physics, levelSize) {
    super();

    this._levelSize = levelSize;
    this._physics = physics;

    this._s = PhysicsOption.worldScale;

    this._platformData = {
      scale: 0.8,
      x: this._levelSize * 0.1,
      y: this._levelSize * 0.17,
    }

    this._init();
  }

  _init() {
    this._initSky();
    this._initGround();
    this._initGroundTile();
    this._initPlatform();
    this._initGroundBody();
    this._initPlatformBody();

    // Black.stage.on('resize', () => this.onResize());
    // this.onResize();
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

  _initGroundTile() {
    const groundTileBottom = this._groundTileBottom = new Sprite('bg/level_4_01_tile');
    groundTileBottom.tiling = new TilingInfo(this._levelSize, 1000);

    groundTileBottom.alignAnchor(0.5, 0);

    this.add(groundTileBottom);
  }

  _initPlatform() {
    const platform = this._platform = new Sprite('bg/level_4_02');

    this.add(platform)
    platform.alignAnchor(0.5);
  }

  _initGroundBody() {
    const groundPoints1 = [
      Vec2(-0.5, 0),
      Vec2(-0.5, -0.135),
      Vec2(-0.35, -0.13),
      Vec2(-0.145, -0.1),
      Vec2(-0.13, 0),
    ];

    const groundPoints2 = [
      Vec2(-0.13, 0),
      Vec2(-0.13, -0.025),
      Vec2(0.21, -0.027),
      Vec2(0.21, 0),
    ];

    const groundPoints3 = [
      Vec2(0.21, 0),
      Vec2(0.21, -0.027),
      Vec2(0.28, -0.09),
      Vec2(0.34, -0.12),
      Vec2(0.5, -0.134),
      Vec2(0.5, 0),
    ];

    const bounds = Black.stage.bounds;
    const groundX = bounds.center().x / this._s;
    const groundY = (bounds.center().y + this._levelSize * 0.4) / this._s;
    const pos = Vec2(groundX, groundY);

    this._createGroundBody(groundPoints1, pos);
    this._createGroundBody(groundPoints2, pos);
    this._createGroundBody(groundPoints3, pos);
  }

  _createGroundBody(points, pos) {
    const ground = this._physics.world.createBody(Vec2(0, 0));

    const ls = this._levelSize / this._s;
    points.forEach(point => point.mul(ls));

    ground.createFixture(Polygon(points), {
      filterCategoryBits: BodiesTypes.ground,
      filterMaskBits: BodiesTypes.match,
    });

    ground.setPosition(pos);
  }

  _initPlatformBody() {
    const s = this._s;
    const ls = this._levelSize / s;

    const points = [
      Vec2(-0.027, -0.05),
      Vec2(-0.02, -0.053),
      Vec2(0.019, -0.0425),
      Vec2(0.05, -0.0275),
      Vec2(0.085, -0.005),
      Vec2(0.082, 0.032),
      Vec2(0.0625, 0.045),
      Vec2(0.036, 0.053),
      Vec2(-0.082, 0.037),
      Vec2(-0.085, 0.025),
      Vec2(-0.075, -0.002),
      Vec2(-0.0574, -0.025),
    ];

    points.forEach(point => point.mul(ls * this._platformData.scale));

    const platform = this._physics.world.createBody(Vec2(0, 0));
    platform.createFixture(Polygon(points), {
      filterCategoryBits: BodiesTypes.ground,
      filterMaskBits: BodiesTypes.match,
    });

    const bounds = Black.stage.bounds;
    const platformX = (bounds.center().x + this._platformData.x) / s;
    const platformY = (bounds.center().y + this._platformData.y) / s;

    platform.setPosition(Vec2(platformX, platformY));
  }

  onResize() {
    const { _sky: sky, _ground: ground, _platform: platform, _groundTileBottom: groundTileBottom } = this;

    const bounds = Black.stage.bounds;
    const center = bounds.center();
    const levelSize = this._levelSize;

    sky.x = center.x;
    sky.y = center.y;

    sky.width = Math.max(bounds.width, bounds.height);
    sky.scaleY = sky.scaleX;

    ground.x = center.x;
    ground.y = center.y + levelSize * 0.4;

    ground.width = levelSize;
    ground.scaleY = ground.scaleX;

    groundTileBottom.x = center.x;
    groundTileBottom.y = ground.y;
    
    platform.x = center.x + this._platformData.x;
    platform.y = center.y + this._platformData.y;
    platform.scale = ground.scaleY * this._platformData.scale;
  }
}