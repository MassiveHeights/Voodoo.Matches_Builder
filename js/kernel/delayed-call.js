import {Black, GameObject, Tween} from 'black-engine';

let helper;

/**
 * @author Comics
 */
export default class Delayed {
    constructor() {
    }

    static call(delay, callback, context, ...params) {

        if (!helper)
            helper = Black.stage.addChild(new GameObject());

        if (delay > 0) {
            let t = new Tween({}, delay);
            t.on('complete', x => {
                callback.apply(context, params);
                this.__removeCall(callback);
            });
            helper.addComponent(t);
            Delayed.calls[callback] = t;
            return t;
        } else {
            callback.apply(context, params);
        }
    }

    static __removeCall(callback) {
        Delayed.calls[callback] = null;
        delete Delayed.calls[callback];
    }

    static kill(callback) {
        if (Delayed.calls[callback]) {
            Delayed.calls[callback].stop();
            Delayed.calls[callback].removeFromParent();
            Delayed.__removeCall(callback);
        }
    }
}

Delayed.calls = {};
