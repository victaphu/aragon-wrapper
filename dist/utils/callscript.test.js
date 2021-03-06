"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var script = _interopRequireWildcard(require("./callscript"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(0, _ava.default)('encodeCallScript', t => {
  const callScript = script.encodeCallScript([{
    to: '0xcafe1a77e84698c83ca8931f54a755176ef75f2c',
    data: '0xcafe'
  }, {
    to: '0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0xbeef'
  }, {
    to: '0xbaaabaaa03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0x'
  }]);
  t.is(callScript.slice(0, 10), script.CALLSCRIPT_ID, 'callscript should start with script ID 1');
  t.is(callScript.slice(10, 50), 'cafe1a77e84698c83ca8931f54a755176ef75f2c', 'first part of callscript should be address for tx 1');
  t.is(callScript.slice(50, 58), '00000002', 'second part of callscript should be data length for tx 1');
  t.is(callScript.slice(58, 62), 'cafe', 'third part of callscript should be data for tx 1');
  t.is(callScript.slice(62, 102), 'beefbeef03c7e5a1c29e0aa675f8e16aee0a5fad', 'fourth part of callscript should be address for tx 2');
  t.is(callScript.slice(102, 110), '00000002', 'fifth part of callscript should be data length for tx 2');
  t.is(callScript.slice(110, 114), 'beef', 'sixth part of callscript should be data for tx 2');
  t.is(callScript.slice(114, 154), 'baaabaaa03c7e5a1c29e0aa675f8e16aee0a5fad', 'seventh part of callscript should be address for tx 3');
  t.is(callScript.slice(154, 162), '00000000', 'eigth part of callscript should be data length for tx 3');
});
//# sourceMappingURL=callscript.test.js.map