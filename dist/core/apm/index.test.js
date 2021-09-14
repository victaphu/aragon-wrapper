"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var apm = _interopRequireWildcard(require("./index"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)('apm: getApmInternalAppInfo', async t => {
  t.plan(6); // arrange
  // namehash('apm-repo.aragonpm.eth')

  const repoNamehash = '0x7b4f7602faf178a4a239b8b2ed4155358e256b08ee7c6b6b1b01ebec891ce1f1'; // namehash('apm-repo.open.aragonpm.eth')

  const repoOpenNamehash = '0xf254443da20ea3d6bad4fa45ddd197dd713255675d3304106f889682e479f9c0'; // act

  const result = apm.getApmInternalAppInfo(repoNamehash);
  const openResult = apm.getApmInternalAppInfo(repoOpenNamehash);
  const emptyResult = apm.getApmInternalAppInfo(); // assert

  t.is(result.name, 'Repo');
  t.true(Array.isArray(result.abi));
  t.is(openResult.name, 'Repo');
  t.true(Array.isArray(openResult.abi));
  t.deepEqual(result, openResult);
  t.is(emptyResult, null);
});
//# sourceMappingURL=index.test.js.map