//WIP

import creativeConfig from './../../../../../creative-config';

export class IceTemplateDev {
  constructor() {
    window._voodooProvider = "tapjoy";

    this._init();
  }

  _init() {
    this._initParams();
    this._initMethods();
  }

  _initParams() {

    window._gameplay = {
      timerEndScreen: 2,
      nbRetry: 0,
      isEnd: false,
      timerLock: false,
      isInit: false,
      paused: false,
      nbClick: 0,
      started: false,
      redirectionAfterClick: 7,
      restartAfterStore: true,
      autoStart: false,
      autoStartDelay: 1,
      endLevelDefaults: {
        available: true,
        delay: 1,
        paused: false
      }
    };

    window._gameplay.creative = {
    };

    for (let param in creativeConfig.config.creative) {
      window._gameplay.creative[`${param}`] = creativeConfig.config.creative[param].value;
    }

    window._gameplayEndLevel = {};

    window._gameplayEndLevel.tapsToWin = 5;

    for (let param in creativeConfig.config.endLevel) {
      window._gameplayEndLevel[`${param}`] = creativeConfig.config.endLevel[param].value;
    }
  }

  _initMethods() {
    if (window._gameplayEvents == null)
      window._gameplayEvents = {};

    window._gameplayEvents.checkAutoStart = function () {
      if (window._gameplay.autoStart) {
        setTimeout(function () {
          if (!window._gameplay.started) {
            if (typeof window._gameplayEvents.startGame === 'function') {
              window._gameplay.started = true;
              window._gameplayEvents.startGame();
            }
          }
        }, window._gameplay.autoStartDelay * 1000);
      } else {
        window.addEventListener('touchstart', function (event) {
          if (!window._gameplay.started) {
            if (typeof window._gameplayEvents.startGame === 'function') {
              window._gameplay.started = true;
              window._gameplayEvents.startGame();
            }
          }
        });
      }
    };

    window._gameplayEvents.startTimer = function (event) {
      if (window._gameplay.timerLock) return;
      window._gameplay.timerLock = true;
      // document.getElementById("start-screen").style.display = "none";
      if (!window._gameplay.started) {
        window._gameplay.started = true;
        window._gameplayEvents.startGame();
      }
      setTimeout(function () {

        //TODO after fake retry screen module implementation
        //   if(document.getElementById('retry-screen').style.display =="none" || document.getElementById('retry-screen').style.display=="")
        //     window._gameplayEvents.endGame("timer");
      }, window._gameplay.timerEndScreen * 1000);
    };

    window._gameplayEvents.endGame = function (end) {
      if (window._gameplay.isEnd) return;
      console.log("End Game : " + end);
      window._gameplay.isEnd = true;
      if (window._gameplay.endLevelDefaults.available)
        window._gameplayEvents.endLevel();
    };

    window._gameplayEvents.endLevel = function () {
      if (window._gameplay.lockEndLevel) return;
      window._gameplay.lockEndLevel = true;
      window._gameplay.isEndLevel = true;
      setTimeout(function () {
        window._gameplay.creative = window._gameplayEndLevel;
        window._gameplayEvents.restartGame();
        window._gameplay.paused = window._gameplay.endLevelDefaults.paused;
        window._gameplay.lockEndLevel = false;
      }, window._gameplay.endLevelDefaults.delay * 1000);
    };

    window._gameplayEvents.lose = function () {
      if (window._gameplay.isEnd) return;
      if (window._gameplay.nbRetry > 0) {

        //TODO show retry fake screen
        // if (typeof window.showRetryScreen === 'function') {
        //   window.showRetryScreen();
        // }
      } else {
        if (window._gameplay.restartAfterStore && window._gameplay.isEndLevel)
          window._gameplayEvents.endLevelAfterStore();
        else
          window._gameplayEvents.endGame("lose");
      }
    };

    window._gameplayEvents.endLevelAfterStore = function (type) {
      if (window._gameplay.lockEndLevel) return;
      window._gameplay.lockEndLevel = true;
      window._gameplay.isEndLevel = true;
      if (!window._gameplay.restartAfterStore) return;
      if (document.getElementById('end-screen')) document.getElementById('end-screen').style.display = "none";
      var delay = type == "editor" ? 500 : 1250;
      setTimeout(function () {
        window._gameplay.creative = window._gameplayEndLevel;
        window._gameplayEvents.restartGame();
        window._gameplay.paused = window._gameplay.endLevelDefaults.paused;
        window._gameplay.lockEndLevel = false;
      }, delay);
    };
  }
}
