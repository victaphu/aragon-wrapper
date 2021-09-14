"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.APP_CONTEXTS = void 0;

var _classPrivateFieldGet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldGet"));

var _rxjs = require("rxjs");

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

const contextInstantiators = {
  path: () => new _rxjs.BehaviorSubject(null),
  trigger: () => new _rxjs.Subject()
};

class AppContext {
  constructor(appAddress) {
    this.appAddress = appAddress;
    Object.entries(contextInstantiators).forEach(([context, instantiator]) => {
      this[context] = instantiator();
    });
  }

  get(context) {
    if (!this[context]) {
      throw new Error(`Could not find internal context '${context}' on ${this.appAddress}`);
    }

    return this[context];
  }

}

const APP_CONTEXTS = Object.keys(contextInstantiators).reduce((contexts, context) => {
  contexts[context.toUpperCase()] = context;
  return contexts;
}, {});
exports.APP_CONTEXTS = APP_CONTEXTS;

var _appContexts = /*#__PURE__*/new WeakMap();

class AppContextPool {
  constructor() {
    _classPrivateFieldInitSpec(this, _appContexts, {
      writable: true,
      value: new Map()
    });
  }

  hasApp(appAddress) {
    return (0, _classPrivateFieldGet2.default)(this, _appContexts).has(appAddress);
  }

  get(appAddress, context) {
    let appContext = (0, _classPrivateFieldGet2.default)(this, _appContexts).get(appAddress);

    if (!appContext) {
      appContext = new AppContext();
      (0, _classPrivateFieldGet2.default)(this, _appContexts).set(appAddress, appContext);
    }

    return appContext.get(context);
  }

  emit(appAddress, context, value) {
    this.get(appAddress, context).next(value);
  }

}

exports.default = AppContextPool;
//# sourceMappingURL=index.js.map