"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classPrivateFieldGet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldGet"));

var _classPrivateFieldSet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldSet"));

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _cache = /*#__PURE__*/new WeakMap();

var _requestFn = /*#__PURE__*/new WeakMap();

/**
 * A cache to deduplicate async requests.
 */
class AsyncRequestCache {
  /**
   * Create a new AsyncRequestCache that will use `requestFn` when requesting each key
   *
   * @param  {function} requestFn Async function for requesting each key
   */
  constructor(requestFn) {
    _classPrivateFieldInitSpec(this, _cache, {
      writable: true,
      value: new Map()
    });

    _classPrivateFieldInitSpec(this, _requestFn, {
      writable: true,
      value: void 0
    });

    (0, _classPrivateFieldSet2.default)(this, _requestFn, requestFn);
  }
  /**
   * Check if the `key` is available in the cache
   *
   * @param  {string} key Key to check
   * @return {boolean} If key is in the cache
   */


  has(key) {
    return (0, _classPrivateFieldGet2.default)(this, _cache).has(key);
  }
  /**
   * Request `key`, using previous result if cached.
   * Resets the cache for `key` if the request was not successful.
   *
   * @param  {string} key Key to request
   * @param  {boolean} [invalidate] Invalidate any previous requests
   * @return {Promise<*>} Request result
   */


  request(key, invalidate) {
    if (!invalidate && this.has(key)) {
      return (0, _classPrivateFieldGet2.default)(this, _cache).get(key);
    }

    const request = Promise.resolve((0, _classPrivateFieldGet2.default)(this, _requestFn).call(this, key)).catch(err => {
      (0, _classPrivateFieldGet2.default)(this, _cache).delete(key);
      throw err;
    });
    (0, _classPrivateFieldGet2.default)(this, _cache).set(key, request);
    return request;
  }

}

exports.default = AsyncRequestCache;
//# sourceMappingURL=AsyncRequestCache.js.map