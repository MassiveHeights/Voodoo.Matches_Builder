import { Asset, AssetType, Texture, LoaderType, AtlasTexture } from 'black-engine';

/**
 * Single JSON file asset class responsible for loading json file.
 *
 * @cat assets
 * @extends Asset
 */
export default class JSONInlineLoaderObjectAsset extends Asset {
  /**
   * Creates new JSONAsset instance.
   *
   * @param {string} name The name of asset.
   * @param {string} url  URL to the json file.
   * @return {void}
   */
  constructor(name, urlOrInline) {
    super(AssetType.JSON, name);

    /**
     * @private
     * @type {string}
     */
    this.urlOrInline = urlOrInline;

    /** 
     * @private 
     * @type {XHRAssetLoader|null} 
     */
    this.mXHR = null;
  }

  /**
   * @inheritDoc
   */
  onLoaderRequested(factory) {
    if (typeof this.urlOrInline === 'string' || this.urlOrInline instanceof String) {
      this.mXHR = factory.get(LoaderType.XHR, this.urlOrInline);
      this.mXHR.mimeType = 'application/json';
      this.mXHR.responseType = 'json';
      this.addLoader(this.mXHR);
    }
  }

  /**
   * @inheritDoc
   */
  onAllLoaded() {
    if (typeof this.urlOrInline === 'string' || this.urlOrInline instanceof String)
      super.ready(/** @type {!Object}*/(this.mXHR.data));
    else
      super.ready(this.mUrl);
  }
}