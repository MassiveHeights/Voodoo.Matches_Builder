import {CanvasDriver, Input, Engine, StageScaleMode, MasterAudio} from "black-engine";
import {Loader} from "./loader";
import {CreativeWrapper} from "./libs/wrapper/creative-wrapper";


CreativeWrapper.START_CREATIVE = function () {
  const engine = new Engine('container', Loader, CanvasDriver, [Input, MasterAudio]);
  engine.pauseOnBlur = false;
  engine.pauseOnHide = false;
  engine.viewport.isTransperent = false;
  engine.start();

  engine.stage.setSize(640, 960);
  engine.stage.scaleMode = StageScaleMode.LETTERBOX;

  // if (document.getElementById("loading"))
  //   document.getElementById("loading").style.display = "none";

};

if (!window.creativeWrapper) {
  window.creativeWrapper = new CreativeWrapper();
  window.creativeWrapper.init();

  //Will be ignored in production build
  // showFPSMeter();
}

function showFPSMeter() {
  if (window.creativeWrapper.partnerName == CreativeWrapper.PARTNER_NAME.voodoo_dev)

    (function () {
      var script = document.createElement('script');
      script.onload = function () {
        var stats = new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
          stats.update();
          requestAnimationFrame(loop);
        });
      };
      script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
      document.head.appendChild(script);
    })();
}