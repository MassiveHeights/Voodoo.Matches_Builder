import {
  Black,
  DisplayObject,
  Rectangle,
  Sprite,
  GameObject,
  TextField,
  FontStyle,
  FontWeight,
  FontAlign,
} from "black-engine";
import GAME_CONFIG from "../../states/game-config";
import Stars from "./stars";

export default class ProgressBar extends DisplayObject {
  constructor() {
    super();

    this._startMatchesValue = GAME_CONFIG.startMatchesValue;
    this._yellowMarkerValue = GAME_CONFIG.yellowMarkerValue;
    this._redMarkerValue = GAME_CONFIG.redMarkerValue;

    this.touchable = false;
    
    this._currentMatchesValue = this._startMatchesValue;
    this._progress = null;
    this._bar = null;
    this._stars = null;
  }

  getValue() {
    return this._currentMatchesValue;
  }

  onAdded() {
    this._initBg();
    this._initBar();
    this._initTargetMarkers();
    this._initProgress();
    this._initStars();
    this._initLevelText();

    this._resize = Black.stage.on("resize", () => this.onResize());
    this.onResize();
  }

  decrease() {
    if(this._currentMatchesValue === 0){
      return;
    }
    
    this._currentMatchesValue -= 1;

    this._updateProgress();
    this._checkForHideStars();
  }

  _initBg() {
    const frame = 'ui/progressbar_empty';
    const bg = new Sprite(Black.assets.getTexture(frame));
    bg.alignPivotOffset();

    this.add(bg);
  }

  _initBar() {
    const frame = 'ui/progressbar';
    const bar = this._bar = new Sprite(Black.assets.getTexture(frame));
    bar.alignPivotOffset();

    this.add(bar);
  }

  _initTargetMarkers() {
    const startMatchesValue = this._startMatchesValue;

    this._yellowMarker = this._createTargetMarker('ui/progressbar_limit_red', startMatchesValue - this._redMarkerValue);
    this._redMarker = this._createTargetMarker('ui/progressbar_limit_yell', startMatchesValue - this._yellowMarkerValue);
  }

  _createTargetMarker(frame, value) {
    const marker = new GameObject();
    this.add(marker);

    const markerView = new Sprite(Black.assets.getTexture(frame));
    markerView.alignPivotOffset();
    marker.add(markerView);

    const markerText = new TextField(
      value.toString(),
      "Baloo",
      0xffffff,
      20,
      FontStyle.NORMAL,
      FontWeight.NORMAL,
    );

    markerText.align = FontAlign.CENTER;
    markerText.alignAnchor();
    markerText.y = markerView.y - markerView.height * 0.5 - 10;
    marker.add(markerText);

    return marker;
  }

  _initProgress() {
    const bar = this._bar;

    this._progress = new Rectangle(-bar.width * 0.5, -bar.height * 0.5, bar.width, bar.height);
  }

  _initStars() {
    const bar = this._bar;

    const stars = this._stars = new Stars();
    stars.x = bar.x + bar.width * 0.5;
    stars.y = bar.y + bar.height * 0.5 + 20;

    this.add(stars);
  }

  _initLevelText() {
    const { _bar, _stars } = this;

    const string = creativeWrapper.getParam('levelText');

    const levelText = new TextField(
      string,
      "Baloo",
      0xffffff,
      20,
      FontStyle.NORMAL,
      FontWeight.NORMAL,
    );

    levelText.align = FontAlign.CENTER;
    levelText.alignAnchor();
    levelText.x = _bar.x - _bar.width * 0.5 + levelText.width * 0.5;
    levelText.y = _stars.y;
    this.add(levelText);
  }

  _updateProgress() {
    const { _bar, _startMatchesValue, _progress } = this;

    _progress.x -= _bar.width / _startMatchesValue;
    _bar.clipRect = _progress;
  }

  _checkForHideStars() {
    const { _currentMatchesValue, _yellowMarkerValue, _redMarkerValue, _stars } = this;

    if (_currentMatchesValue === _yellowMarkerValue || _currentMatchesValue === _redMarkerValue || _currentMatchesValue === 0) {
      _stars.hideStar();
    }
  }

  onResize() {
    const bounds = Black.stage.bounds;

    this.x = bounds.center().x;
    this.y = bounds.top + 63;

    this._setMarkersPosition();
  }

  _setMarkersPosition() {
    const { _bar, _startMatchesValue, _yellowMarkerValue, _redMarkerValue, _redMarker, _yellowMarker } = this;

    const k = _bar.width / _startMatchesValue;

    _redMarker.x = _bar.x + _bar.width * 0.5 - _redMarkerValue * k;
    _yellowMarker.x = _bar.x + _bar.width * 0.5 - _yellowMarkerValue * k;
  }
}
