"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var utils = _interopRequireWildcard(require("./index"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)('should enhance an object to lookup eth addresses easier', async t => {
  // arrange
  const bobAddress = '0x0000000000000000000000000000000000000aBc';
  const bobPermissions = ['read', 'write']; // act

  const permissions = utils.makeAddressMapProxy({});
  permissions[bobAddress] = bobPermissions; // assert

  t.is(permissions['0x0000000000000000000000000000000000000ABC'], bobPermissions);
  t.is(permissions['0x0000000000000000000000000000000000000abc'], bobPermissions);
  t.is(permissions['0x0000000000000000000000000000000000000aBc'], bobPermissions); // addresses with invalid checksums
  // (the checksum is checked if the address has both upper and lowercase letters)

  t.is(permissions['0x0000000000000000000000000000000000000aBC'], undefined);
  t.is(permissions['0x0000000000000000000000000000000000000abC'], undefined);
  t.is(permissions['0x0000000000000000000000000000000000000ABc'], undefined);
});
(0, _ava.default)('should allow the proxy to be initialized with an object containing any cased keys', async t => {
  // arrange
  const dianeAddress = '0x0000000000000000000000000000000000000ABC';
  const annieAddress = '0x0000000000000000000000000000000000000cde';
  const rainiAddress = '0x0000000000000000000000000000000000000eED';
  const dianePermissions = ['read', 'write'];
  const anniePermissions = ['read', 'sing'];
  const rainiPermissions = ['dance', 'modify']; // act

  const permissions = utils.makeAddressMapProxy({
    [dianeAddress]: dianePermissions,
    [annieAddress]: anniePermissions,
    [rainiAddress]: rainiPermissions
  }); // assert

  t.is(permissions['0x0000000000000000000000000000000000000ABC'], dianePermissions);
  t.is(permissions['0x0000000000000000000000000000000000000abc'], dianePermissions);
  t.is(permissions['0x0000000000000000000000000000000000000aBc'], dianePermissions);
  t.is(permissions['0x0000000000000000000000000000000000000CDE'], anniePermissions);
  t.is(permissions['0x0000000000000000000000000000000000000cde'], anniePermissions);
  t.is(permissions['0x0000000000000000000000000000000000000EED'], rainiPermissions);
  t.is(permissions['0x0000000000000000000000000000000000000eed'], rainiPermissions);
  t.is(permissions['0x0000000000000000000000000000000000000EeD'], rainiPermissions);
});
//# sourceMappingURL=index.test.js.map