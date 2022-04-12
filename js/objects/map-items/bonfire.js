import { DisplayObject } from "black-engine";
import { Spine } from 'black-spine';
import { Black, GameObject } from 'black-engine';
import PhysicsOption from "../../physics/physics-options";
import * as planck from "planck-js";
import {Polygon, Vec2} from "planck-js";
import BodiesTypes from "../../physics/bodies-types";

export default class Bonfire extends DisplayObject {
  constructor(physics) {
    super();
    this._physics = physics;

    this._scale = 0.5;

    this._init();
    this._initBody();
  }

  _init() {
    const view = new Spine('matches_layout');

    view.scale = this._scale;
    view.play('bonfire', true);

    this.add(view);

    Black._soundManager.playFx('walking_fire_loop', 1, true);

    view.scale = this._scale ;
  }

  _initBody() {
    const width = 2;
    const height = 2;
    const s = PhysicsOption.worldScale;

    const bonfireBox = this._physics.world.createBody({
      position: Vec2(0, 0),
      userData: {
        id: 'bonfire',
        type: 'bonfire',
        object: this
      },
    });

    bonfireBox.createFixture(
      Polygon([
        planck.Vec2(0, 0),
        planck.Vec2(width, 0),
        planck.Vec2(width, height),
        planck.Vec2(0, height)
      ]), {
        filterCategoryBits: BodiesTypes.campfire,
        filterMaskBits: BodiesTypes.match,
      });

    bonfireBox.setPosition(Vec2(440 / s - width * 0.5, 860 / s - height));

    bonfireBox.setActive(true);
  }

}
