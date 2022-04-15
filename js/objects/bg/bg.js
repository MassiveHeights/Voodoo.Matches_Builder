import { Black, DisplayObject, Sprite, TilingInfo } from "black-engine";
import { Polygon, Vec2 } from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import PhysicsOption from "../../physics/physics-options";
import GAME_CONFIG from "../../states/game-config";
import { GROUND_CONFIG, SKY_CONFIG } from "./bg-config";

export default class Background extends DisplayObject {
  constructor(physics) {
    super();

    this._levelSize = GAME_CONFIG.levelSize;
    this._physics = physics;

    this._groundConfig = GROUND_CONFIG[creativeWrapper.getParam('ground')];
    this._s = PhysicsOption.worldScale;

    this._groundData = {
      width: this._levelSize * 0.8,
      x: this._levelSize * 0.03,
      y: this._levelSize * 0.4,
    }

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

    Black.stage.on('resize', () => this.onResize());
    this.onResize();
    this._setPositions();
  }

  _initSky() {
    const frameName = SKY_CONFIG[creativeWrapper.getParam('skyColor')];
    const sky = this._sky = new Sprite(frameName);

    this.add(sky)
    sky.alignAnchor(0.5);
  }

  _initGround() {
    const ground = this._ground = new Sprite(this._groundConfig.ground);

    this.add(ground)
    ground.alignAnchor(0.5, 1);
  }

  _initGroundTile() {
    const groundTileBottom = this._groundTileBottom = new Sprite(this._groundConfig.tileBottom);
    groundTileBottom.tiling = new TilingInfo(4000, 1000);
    groundTileBottom.alignAnchor(0.5, 0);
    this.add(groundTileBottom);

    const groundTileLeft = this._groundTileLeft = new Sprite(this._groundConfig.tileSide);
    groundTileLeft.tiling = new TilingInfo(2000, groundTileLeft.height);
    groundTileLeft.alignAnchor(1, 1);
    this.add(groundTileLeft);

    const groundTileRight = this._groundTileRight = new Sprite(this._groundConfig.tileSide);
    groundTileRight.tiling = new TilingInfo(2000, groundTileLeft.height);
    groundTileRight.alignAnchor(0, 1);
    this.add(groundTileRight);
  }

  _initPlatform() {
    const platform = this._platform = new Sprite(this._groundConfig.platform);

    this.add(platform)
    platform.alignAnchor(0.5);
  }

  _initGroundBody() {
    const groundPoints1 = [
      Vec2(-2, 0.1),
      Vec2(-2, -0.13),
      Vec2(-0.5, -0.13),
      Vec2(-0.35, -0.12),
      Vec2(-0.15, -0.09),
      Vec2(-0.14, -0.025),
      Vec2(-0.14, 0.1),
    ];

    const groundPoints2 = [
      Vec2(-0.14, 0.1),
      Vec2(-0.14, -0.02),
      Vec2(0.22, -0.022),
      Vec2(0.22, 0.1),
    ];

    const groundPoints3 = [
      Vec2(0.22, 0.1),
      Vec2(0.22, -0.022),
      Vec2(0.28, -0.078),
      Vec2(0.34, -0.11),
      Vec2(0.5, -0.126),
      Vec2(2, -0.126),
      Vec2(2, 0.1),
    ];

    const bounds = Black.stage.bounds;
    const groundX = (bounds.center().x + this._groundData.x) / this._s;
    const groundY = (bounds.center().y + this._groundData.y) / this._s;
    const pos = Vec2(groundX, groundY);

    this._createGroundBody(groundPoints1, pos);
    this._createGroundBody(groundPoints2, pos);
    this._createGroundBody(groundPoints3, pos);
  }

  _createGroundBody(points, pos) {
    const ground = this._physics.world.createBody(Vec2(0, 0));

    const ls = this._groundData.width / this._s;
    points.forEach(point => point.mul(ls));

    ground.createFixture(Polygon(points), {
      friction: 100,
      restitution: 0.1,
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

    points.forEach(point => point.mul(ls * this._platformData.scale * 0.93));

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
    const sky = this._sky;
    const bounds = Black.stage.bounds;
    const center = bounds.center();

    sky.x = center.x;
    sky.y = center.y;

    sky.width = Math.max(bounds.width, bounds.height);
    sky.scaleY = sky.scaleX;
  }

  _setPositions() {
    const { _ground: ground, _platform: platform, _groundTileBottom: groundTileBottom, _groundTileLeft: groundTileLeft, _groundTileRight: groundTileRight } = this;
    const { _groundData: groundData, _platformData: platformData } = this;

    const bounds = Black.stage.bounds;
    const center = bounds.center();

    ground.x = center.x + groundData.x;
    ground.y = center.y + groundData.y;

    ground.width = groundData.width;
    ground.scaleY = ground.scaleX;

    groundTileBottom.x = ground.x;
    groundTileBottom.y = ground.y - 1;
    groundTileBottom.scale = ground.scale;

    groundTileLeft.x = ground.x - ground.width * 0.5 + 1;
    groundTileRight.x = ground.x + ground.width * 0.5 - 1;
    groundTileLeft.y = groundTileRight.y = ground.y;
    groundTileLeft.scale = groundTileRight.scale = ground.scale;

    platform.x = center.x + platformData.x;
    platform.y = center.y + platformData.y;
    platform.scale = platformData.scale;
  }
}