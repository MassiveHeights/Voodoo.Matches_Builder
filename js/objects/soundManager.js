import {Black} from "black-engine";

export default class SoundManager {
  constructor() {
    this._backSound = null;
    this._sfxSound = null;
    this._soundButton = null;
    this._peviouseMuteState = false;

    this._init();
  }

  get canPlaySound() {
    return creativeWrapper.getParam('sounds');
  }

  _init() {
    this._initEvents();
  }

  _initEvents() {
    creativeWrapper.events.on('mute', (state) => {
      SoundManager.MUTE_STATE = state;
      this._updateSoundState();
    });

    creativeWrapper.events.on('pause', this.onPauseGame, this);
    creativeWrapper.events.on('resume', this.onResumeGame, this);

    creativeWrapper.events.on('audioVolumeChange', (volume) => {
      SoundManager.VOLUME = volume;
      this._updateSoundState();
    });
  }

  onPauseGame() {
    this._peviouseMuteState = SoundManager.MUTE_STATE;

    SoundManager.MUTE_STATE = true;
    this._updateSoundState();
  }

  onResumeGame() {
    SoundManager.MUTE_STATE = this._peviouseMuteState;
    this._updateSoundState();
  }

  _onMuteButtonClicked() {
    SoundManager.MUTE_STATE = !SoundManager.MUTE_STATE;

    this._updateSoundState();
  }

  _updateSoundState() {
    Black.audio.masterVolume = SoundManager.MUTE_STATE ? 0 : SoundManager.VOLUME;
    this._updateSoundButtonState();
  }

  playBackgroundMusic() {
    if (!this.canPlaySound) return;

    if (this._backSound == null) {
      this._backSound = Black.assets.getSound('bg_music');
      this._backSound.play('master', 0.5, true);
    }
  }

  playFx(name, volume = 1, loop = false) {
    if (!this.canPlaySound) return;

    const sound = Black.assets.getSound(name);

    sound.play('master', volume, loop);
  }


  registerSoundButton(soundButton) {
    this._soundButton = soundButton;
    this._soundButton.events.on('onMuteClick', this._onMuteButtonClicked, this);
    this._updateSoundButtonState();
  }

  _updateSoundButtonState() {
    if (this._soundButton == null) return;

    if (SoundManager.VOLUME > 0)
      this._soundButton.setState(SoundManager.MUTE_STATE);
    else
      this._soundButton.setState(false);
  }
}

SoundManager.MUTE_STATE = false;
SoundManager.VOLUME = 1;
