import {
  Black,
  DisplayObject,
  Sprite,
} from "black-engine";

export default class Stars extends DisplayObject {
  constructor() {
    super();

    this._starsCount = 3;
    this._currentStar = 0;
    this._stars = [];

    this._firstStar = null;
    this._secondStar = null;
    this._thirdStar = null;
  }

  onAdded() {
    this._initStars();

    // this._resize = Black.stage.on("resize", () => this.onResize());
    // this.onResize();
  }

  showAll() {
    this._stars.forEach(star => star.visible = true);
    this._currentStar = 0;
  }

  hideStar() {
    const _stars = this._stars;

    const star = _stars[this._currentStar];
    star.visible = false;

    this._currentStar += 1;
  }

  _initStars() {
    const {_starsCount, _stars} = this;
    const offset = 30;

    for (let i = 0; i < _starsCount; ++i){
      const star = this._createStar();
      star.x = -star.width * 0.5 - i * offset;

      _stars.push(star);

      this.add(star);
    }
  }

  _createStar() {
    const frame = 'ui/star';

    const star = new Sprite(Black.assets.getTexture(frame));
    star.alignPivotOffset();
    star.scale = 0.15;

    return star;
  }
}
