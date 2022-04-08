import {AssetManager, GameObject, Black, Asset, AssetType, Texture, LoaderType, AtlasTexture} from 'black-engine';
import AtlasTextureObjAsset from 'js/kernel/atlas-texture-object-asset';
import localization from 'js/localization';
import {stringsDataStr} from './data/stringsData';
import Game from 'js/states/game';
import {CreativeWrapper} from "./libs/wrapper/creative-wrapper";
import JsonObjAsset from './kernel/json-inline-loader-object-asset';

//Black atlas
import atlas from './../assets/atlas.png';
import atlasData from '../assets/atlas.json';
import fire from './../assets/fire.png';
import fireData from '../assets/fire.json';
import rocket from './../assets/rocket.png';
import rocketData from '../assets/rocket.json';
import firework from './../assets/firework.png';
import fireworkData from '../assets/firework.json';

//Sounds
import sound_throw from 'assets/sounds/throw_01.mp3';
import sound_bg_music from 'assets/sounds/bg_music.mp3';
import sound_success from 'assets/sounds/success.mp3';
import sound_confetti from 'assets/sounds/confetti.mp3';

//Spines
import matches_layout from 'assets/spines/matches_layout.json';
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
    assets.enqueueAtlasObj('assets', atlas, atlasData);
    assets.enqueueAtlasObj('fire', fire, fireData);
    assets.enqueueAtlasObj('firework', firework, fireworkData);
    assets.enqueueAtlasObj('rocket', rocket, rocketData);

    //sounds
    assets.enqueueSound('bg_music', sound_bg_music);
    assets.enqueueSound('confetti', sound_confetti);
    assets.enqueueSound('success', sound_success);
    assets.enqueueSound('throw', sound_throw);

    // spines
    assets.enqueueJsonObj('matches_layout', matches_layout);
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
