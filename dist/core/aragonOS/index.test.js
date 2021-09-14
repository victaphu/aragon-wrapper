"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var aragonOS = _interopRequireWildcard(require("./index"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)('aragonOS: getAragonOsInternalAppInfo', async t => {
  t.plan(4); // arrange
  // namehash('acl.aragonpm.eth')

  const aclNamehash = '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a'; // act

  const result = aragonOS.getAragonOsInternalAppInfo(aclNamehash);
  const emptyResult = aragonOS.getAragonOsInternalAppInfo(); // assert

  t.is(result.name, 'ACL');
  t.true(Array.isArray(result.abi));
  t.is(result.isAragonOsInternalApp, true);
  t.is(emptyResult, null);
});
(0, _ava.default)('aragonOS: isAragonOsInternalApp', async t => {
  t.plan(2); // arrange
  // namehash('acl.aragonpm.eth')

  const aclNamehash = '0xe3262375f45a6e2026b7e7b18c2b807434f2508fe1a2a3dfb493c7df8f4aad6a'; // act

  const result = aragonOS.isAragonOsInternalApp(aclNamehash);
  const emptyResult = aragonOS.isAragonOsInternalApp(); // assert

  t.true(result);
  t.false(emptyResult);
});
//# sourceMappingURL=index.test.js.map