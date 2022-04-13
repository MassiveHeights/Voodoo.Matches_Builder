import {Black, DisplayObject, Sprite, Vector, CanvasRenderTexture, MessageDispatcher} from "black-engine";
import * as planck from 'planck-js';
import {Vec2} from "planck-js";
import BodiesTypes from "../../physics/bodies-types";
import PhysicsOption from "../../physics/physics-options";
import Node from "./node";
import FireEffect from "./fire-effect";
import GAME_CONFIG from "../../states/game-config";

const PI = Math.PI;

export default class Match extends DisplayObject {
  constructor(parent, physics, fireLayer) {
    super();

    this._parent = parent;
    this.events = new MessageDispatcher();

    this._fireLayer = fireLayer;
    this._physics = physics;
    this._mass = 0.2;
    this._scale = GAME_CONFIG.matchScale;

    this._view = null;
    this._body = null;
    this._shadowL = null;
    this._shadowR = null;

    this._bodyPos = null;
    this._viewPos = null;
    this._rot = null;

    this._nodesPool = [];

    this._pivotOffsetY = 0;

    this._burning = false;
    this._fires = [];
    this._destoroyedFires = 0;

    this._bmdMatchCopy = null;
    this._sourceTextureContext = null;

    this._init();
  }

  get burning() {
    return this._burning;
  }

  createBody() {
    if (!this._body) {
      this._initBody();
      this._centerViewAnchor();
    }
    // this._body.setActive(true);
  }

  setActive(value) {
    if (this._body) {
      this._body.setActive(value);
    }
  }

  removeBody() {
    if (this._body) {
      this._physics.world.destroyBody(this._body);
    }
  }

  addNode(pos) {
    const node = this._createNode();
    const view = this._view;
    const viewPos = Vec2(view.x, view.y);
    const distance = Vec2.distance(viewPos, pos);

    const diffX = viewPos.x - pos.x;
    const diffY = viewPos.y - pos.y;

    const nodeVecRotation = Math.atan(-diffX / diffY) - (diffY < 0 ? Math.PI : 0);
    const nodeDirection = Math.sin(nodeVecRotation) >= 0 ? -1 : 1;
    const viewDirection = Math.sin(view.rotation) >= 0 ? -1 : 1;
    const direction = nodeDirection * viewDirection;

    this._nodesPool.push({
      view: node,
      distance: distance * direction,
    });

    node.animate();
  }

  getBody() {
    return this._body;
  }

  getHeight() {
    return this._height;
  }

  getPosition() {
    const viewPos = new Vec2(this._view.x, this._view.y);
    return viewPos;
  }

  getBodyLine() {
    const viewPos = this.getPosition();
    const s = PhysicsOption.worldScale;

    const p1 = new Vec2();
    const p2 = new Vec2();

    const rot = this._view.rotation;

    const d1 = this._height * this._pivotOffsetY;
    const d2 = this._height * (1 - this._pivotOffsetY);

    p1.x = (viewPos.x + d1 * Math.sin(rot)) / s;
    p1.y = (viewPos.y - d1 * Math.cos(rot)) / s;

    p2.x = (viewPos.x - d2 * Math.sin(rot)) / s;
    p2.y = (viewPos.y + d2 * Math.cos(rot)) / s;

    return {
      p1,
      p2,
    };
  }

  setRotation(rotation) {
    this._view.rotation = this._rot = rotation;
  }

  setPos(pos) {
    this._view.x = pos.x;
    this._view.y = pos.y;

    this._viewPos = {...pos};

    const s = PhysicsOption.worldScale;
    pos.x /= s;
    pos.y /= s;

    this._bodyPos = {...pos};
    this._body?.setPosition(pos);
  }

  startBurn(posX, posY) {
    if (this._burning) return;

    this._burning = true;
    this._burnedView.visible = true;

    const s = PhysicsOption.worldScale;

    const startPosition = new Vector(posX * s, posY * s);
    this._createFire(startPosition.x, startPosition.y, -1);
    this._createFire(startPosition.x, startPosition.y, 1);

    this._createMatchBitmap();
  }

  burnMatchFromSide() {
    this.startBurn(this._view.x, this._view.y);
  }

  onUpdate() {
    this._updateNodes();
    if(!this._burning){
      this._updateShadows();
    }
    this._updateBurnedViewTransform();
    this._updateBurn();
  }

  _updateBurnedViewTransform() {
    this._burnedView.x = this._view.x;
    this._burnedView.y = this._view.y;
    this._burnedView.scaleX = this._view.scaleX;
    this._burnedView.scaleY = this._view.scaleY;
    this._burnedView.rotation = this._view.rotation;
  }

  _updateBurn() {
    this._fires.forEach((fire) => {
      fire.updateMove();

      const p1 = new Vec2();
      const rot = this._view.rotation;
      const d1 = this._height * this._pivotOffsetY - (this._height * fire.movePercent);

      p1.x = (+d1 * Math.sin(rot));
      p1.y = (-d1 * Math.cos(rot));

      fire.x = this._view.x + p1.x;
      fire.y = this._view.y + p1.y;

      this._sourceTextureContext.clearRect(0, this._height * fire.movePercent, this._width / this._scale, this._height * 0.05);
    });

    if (this._bmdMatchCopy) {

      this._bmdMatchCopy.alignPivotOffset(0.5 / Black.driver.renderScaleFactor, 0.5 / Black.driver.renderScaleFactor);

      this._bmdMatchCopy.scaleX = Black.driver.renderScaleFactor;
      this._bmdMatchCopy.scaleY = Black.driver.renderScaleFactor;

      this._bmdMatchCopy.x = this._view.x;
      this._bmdMatchCopy.y = this._view.y;

      this._bmdMatchCopy.rotation = this._view.rotation;
    }
  }

  _updateNodes() {
    const {_view: view, _nodesPool: nodesPool} = this;
    const rot = view.rotation;

    nodesPool.forEach(data => {
      const nodeView = data.view;
      const d = data.distance;

      nodeView.x = (view.x + d * Math.sin(rot));
      nodeView.y = (view.y - d * Math.cos(rot));

      nodeView.rotation = rot;
    });
  }

  _updateShadows() {
    const {_shadowL: shadowL, _shadowR: shadowR, _view: view} = this;

    shadowL.x = shadowR.x = view.x;
    shadowL.y = shadowR.y = view.y;

    const rot = view.rotation;
    shadowL.rotation = shadowR.rotation = rot;

    const alpha = (Math.cos(rot) + 1) * 0.5;

    const min = 0.35;
    const max = 0.65;

    shadowR.alpha = min + (1 - alpha) * (max - min);
    shadowL.alpha = min + alpha * (max - min);
  }

  _init() {
    this._initBurnedView();
    this._initView();
    this._initShadows();
  }

  _initBurnedView() {
    const burnedView = this._burnedView = new Sprite('matches/match_burned0' + (Math.random() * 100 > 50 ? 0 : 1));

    this.add(burnedView);
    burnedView.alignPivotOffset(0.5, 1);
    burnedView.rotation = this._rot = Math.PI * 0.5;
    burnedView.visible = false;
  }

  _initView() {
    const view = this._view = new Sprite('matches/match');
    view.scale = this._scale;

    this._width = view.width;
    this._height = view.height;

    this.add(view);
    this._view.alignPivotOffset(0.5, 1);
    this._view.rotation = this._rot = Math.PI * 0.5;
    this._pivotOffsetY = 1;
  }

  _initShadows() {
    const shadowL = this._shadowL = new Sprite('matches/match_tint01');
    const shadowR = this._shadowR = new Sprite('matches/match_tint00');
    shadowL.scale = shadowR.scale = this._scale;

    this.add(shadowL);
    this.add(shadowR);
    shadowL.alignPivotOffset(0.5, 1);
    shadowR.alignPivotOffset(0.5, 1);
  }

  _initBody() {
    const width = this._width;
    const height = this._height;
    const s = PhysicsOption.worldScale;

    const body = this._body = this._physics.world.createDynamicBody(planck.Vec2(0, 0));
    body.createFixture(planck.Box(width * 0.5 * 0.75 / s, height * 0.5 * 0.95 / s), {
      friction: 100,
      density: 0.001,
      // filterCategoryBits: BodiesTypes.match,
      // filterMaskBits: BodiesTypes.ground,
      // filterCategoryBits: BodiesTypes.match,
      filterMaskBits: BodiesTypes.campfire | BodiesTypes.fire,
    });


    this._view.userData = {
      object: this,
      id: 'match'
    };

    body.setGravityScale(this._mass);
    body.setUserData(this._view);
    body.setActive(false);
  }

  _centerViewAnchor() {
    this._view.alignPivotOffset(0.5);
    this._shadowL.alignPivotOffset(0.5);
    this._shadowR.alignPivotOffset(0.5);
    this._burnedView.alignPivotOffset(0.5);

    const d = this._height * 0.5;
    this._viewPos.x += d * Math.sin(this._rot);
    this._viewPos.y -= d * Math.cos(this._rot);

    this._pivotOffsetY = 0.5;

    this.setPos(this._viewPos);
    this._body.setAngle(this._rot);
  }

  _createNode() {
    const node = new Node(this._scale * 1.3);
    this._parent.add(node);

    return node;
  }

  _createFire(posX, posY, moveDirection) {
    let fire = new FireEffect(this._physics);

    this._fireLayer.add(fire);

    fire.x = posX;
    fire.y = posY;

    let relativePosition = fire.relativeTo(this._view);

    fire.movePercent = Math.min(1, Math.max(0, (relativePosition.y) / (this._height / this._scale)));
    fire.moveDirection = moveDirection;

    this._fires.push(fire);


    fire.events.on('stopFire', () => {
      this._destoroyedFires++;

      if(this._destoroyedFires >= this._fires.length) {
        this.events.post('burn-end');
      }
    });
  }

  _createMatchBitmap() {
    this._updateShadows();

    const matchTexture = new CanvasRenderTexture(this._width, this._height, Black.driver.renderScaleFactor);

    const context = this._sourceTextureContext = matchTexture.renderTarget.context;

    let viewRegion = this._view.texture.region;

    let shadowLRegion = this._shadowL.texture.region;
    let shadowRRegion = this._shadowR.texture.region;

    context.drawImage(this._view.texture.native, viewRegion.x, viewRegion.y, viewRegion.width, viewRegion.height, 0, 0, this._width, this._height);

    context.globalAlpha = this._shadowL.alpha / 2;
    context.drawImage(this._shadowL.texture.native, shadowLRegion.x, shadowLRegion.y, shadowLRegion.width, shadowLRegion.height, 0, 0, this._width, this._height);

    context.globalAlpha = this._shadowR.alpha;
    context.drawImage(this._shadowR.texture.native, shadowRRegion.x, shadowRRegion.y, shadowRRegion.width, shadowRRegion.height, 0, 0, this._width, this._height);

    const source = this._bmdMatchCopy = new Sprite(matchTexture);
    this.add(source);

    this._view.visible = false;
    this._shadowL.visible = false;
    this._shadowR.visible = false;
    //this._burnedView.visible = false;
  }
}
