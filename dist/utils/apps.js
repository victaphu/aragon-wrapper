"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findAppMethodFromData = findAppMethodFromData;
exports.findAppMethodFromSignature = findAppMethodFromSignature;
exports.knownAppIds = exports.apmAppId = void 0;

var _ethEnsNamehash = require("eth-ens-namehash");

var _web3Utils = require("web3-utils");

const apmAppId = appName => (0, _ethEnsNamehash.hash)(`${appName}.aragonpm.eth`);

exports.apmAppId = apmAppId;

function findAppMethod(app, methodTestFn, {
  allowDeprecated
} = {}) {
  const {
    deprecatedFunctions,
    functions
  } = app || {};
  let method; // First try to find the method in the current functions

  if (Array.isArray(functions)) {
    method = functions.find(methodTestFn);
  }

  if (!method && allowDeprecated) {
    // The current functions didn't have it; try with each deprecated version's functions
    const deprecatedFunctionsFromVersions = Object.values(deprecatedFunctions || {});

    if (deprecatedFunctionsFromVersions.every(Array.isArray)) {
      // Flatten all the deprecated functions
      const allDeprecatedFunctions = [].concat(...deprecatedFunctionsFromVersions);
      method = allDeprecatedFunctions.find(methodTestFn);
    }
  }

  return method;
}
/**
 * Find the method descriptor corresponding to the data component of a
 * transaction sent to `app`.
 *
 * @param  {Object} app App artifact
 * @param  {Object} data Data component of a transaction to app
 * @param  {Object} options Options
 * @param  {boolean} [options.allowDeprecated] Allow deprecated functions to be returned. Defaults to true.
 * @return {Object|void} Method with radspec notice and function signature, or undefined if none was found
 */


function findAppMethodFromData(app, data, {
  allowDeprecated = true
} = {}) {
  const methodId = data.substring(2, 10);
  return findAppMethod(app, method => (0, _web3Utils.soliditySha3)(method.sig).substring(2, 10) === methodId, {
    allowDeprecated
  });
}
/**
 * Find the method descriptor corresponding to an app's method signature.
 *
 * @param  {Object} app App artifact
 * @param  {string} methodSignature Method signature to be called
 * @param  {Object} options Options
 * @param  {boolean} [options.allowDeprecated] Allow deprecated functions to be returned. Defaults to true.
 * @return {Object|void} Method with radspec notice and function signature, or undefined if none was found
 */


function findAppMethodFromSignature(app, methodSignature, {
  allowDeprecated = true
} = {}) {
  // Is the given method a full signature, e.g. 'foo(arg1,arg2,...)'
  const fullMethodSignature = Boolean(methodSignature) && methodSignature.includes('(') && methodSignature.includes(')');
  return findAppMethod(app, method => {
    // Note that fallback functions have the signature 'fallback' in an app's artifact.json
    if (fullMethodSignature) {
      return method.sig === methodSignature;
    } // If full signature isn't given, just match against the method names


    const methodName = method.sig.split('(')[0];
    return methodName === methodSignature;
  }, {
    allowDeprecated
  });
}

const knownAppIds = [apmAppId('finance'), apmAppId('token-manager'), apmAppId('vault'), apmAppId('voting')];
exports.knownAppIds = knownAppIds;
//# sourceMappingURL=apps.js.map