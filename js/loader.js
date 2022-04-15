import {AssetManager, GameObject, Black, Asset, AssetType, Texture, LoaderType, AtlasTexture} from 'black-engine';
import AtlasTextureObjAsset from 'js/kernel/atlas-texture-object-asset';
import localization from 'js/localization';
import {stringsDataStr} from './data/stringsData';
import Game from 'js/states/game';
import {CreativeWrapper} from "./libs/wrapper/creative-wrapper";
import JsonObjAsset from './kernel/json-inline-loader-object-asset';

//Black atlas
import atlas0 from './../assets/atlas-0.png';
import atlas1 from './../assets/atlas-1.png';
import atlas0Data from '../assets/atlas-0.json';
import atlas1Data from '../assets/atlas-1.json';
import rocket from './../assets/rocket.png';
import rocketData from '../assets/rocket.json';
import firework from './../assets/firework.png';
import fireworkData from '../assets/firework.json';

//Sounds
import sound_bg_music from 'assets/sounds/bg_music.mp3';
import cta_lose from 'assets/sounds/cta_lose.mp3';
import cta_stars_1 from 'assets/sounds/cta_stars_1.mp3';
import cta_stars_2 from 'assets/sounds/cta_stars_2.mp3';
import cta_win from 'assets/sounds/cta_win.mp3';
import firework_1 from 'assets/sounds/firework_1.mp3';
import firework_2 from 'assets/sounds/firework_2.mp3';
import firework_3 from 'assets/sounds/firework_3.mp3';
import match_end_1 from 'assets/sounds/match_end_1.mp3';
import match_end_2 from 'assets/sounds/match_end_2.mp3';
import match_fixed_1 from 'assets/sounds/match_fixed_1.mp3';
import match_fixed_2 from 'assets/sounds/match_fixed_2.mp3';
import new_match from 'assets/sounds/new_match.mp3';
import rocketS from 'assets/sounds/rocket.mp3';
import walking_fire_loop from 'assets/sounds/walking_fire_loop.mp3';

//Spines
import rocketSpine from 'assets/spines/rocket.json';
import fireworkSpine from 'assets/spines/firework.json';

//Fonts
import fontBaloo from 'assets/fonts/Baloo-Regular.woff';


export class Loader extends GameObject {
  constructor() {
    super();

    Loader.Assets = {};

    let assets = new AssetManager();
    this._addAssetLoader(assets);
    this._assetsLoaded = false;

    //Black/UI
    assets.enqueueAtlasObj('assets0', atlas0, atlas0Data);
    assets.enqueueAtlasObj('assets1', atlas1, atlas1Data);
    assets.enqueueAtlasObj('firework', firework, fireworkData);
    assets.enqueueAtlasObj('rocket', rocket, rocketData);

    //sounds
    assets.enqueueSound('bg_music', sound_bg_music);
    assets.enqueueSound('cta_lose', cta_lose);
    assets.enqueueSound('cta_stars_1', cta_stars_1);
    assets.enqueueSound('cta_stars_2', cta_stars_2);
    assets.enqueueSound('cta_win', cta_win);
    assets.enqueueSound('firework_1', firework_1);
    assets.enqueueSound('firework_2', firework_2);
    assets.enqueueSound('firework_3', firework_3);
    assets.enqueueSound('match_end_1', match_end_1);
    assets.enqueueSound('match_end_2', match_end_2);
    assets.enqueueSound('match_fixed_1', match_fixed_1);
    assets.enqueueSound('match_fixed_2', match_fixed_2);
    assets.enqueueSound('new_match', new_match);
    assets.enqueueSound('rocketS', rocketS);
    assets.enqueueSound('walking_fire_loop', walking_fire_loop);

    // spines
    assets.enqueueJsonObj('rocket', rocketSpine);
    assets.enqueueJsonObj('firework', fireworkSpine);

    // fonts
    assets.enqueueFont('Baloo', fontBaloo);

    assets.on('progress', this.onAssetsProgress, this);
    assets.on('complete', this.onAssetsLoadded, this);
    assets.loadQueue();
  }

  _addAssetLoader(assetManager) {
    assetManager.enqueueAtlasObj = function (name, imageUrl, jsonData) {
      this.enqueueAsset(name, this.__getAsset('atlas_json_obj', name, this.mDefaultPath + imageUrl, jsonData));
    };

    assetManager.enqueueJsonObj = function(name, jsonData) {
      this.enqueueAsset(name, this.__getAsset('json_obj', name, jsonData));
    };

    assetManager.setAssetType('atlas_json_obj', AtlasTextureObjAsset);
    assetManager.setAssetType('json_obj', JsonObjAsset);
  }

  onAssetsProgress(msg, p) {
  }

  onAssetsLoadded(m) {
    this.loadGame();
  }

  loadGame() {
    this._assetsLoaded = true;
    creativeWrapper.hideSplashScreen();

    localization.registerStrings(JSON.parse(stringsDataStr));
  }

  onUpdate() {
    if (window.creativeWrapper.state !== CreativeWrapper.STATE.none && this._assetsLoaded) {
      window.creativeWrapper.state = CreativeWrapper.STATE.live;
      this.removeFromParent();

      let game = new Game();
      game.init();
    }
  }
}

Loader.Assets = {};
