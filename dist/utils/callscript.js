"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeCallScript = decodeCallScript;
exports.encodeCallScript = encodeCallScript;
exports.isCallScript = isCallScript;
exports.CALLSCRIPT_ID = void 0;

var _web3EthAbi = _interopRequireDefault(require("web3-eth-abi"));

const CALLSCRIPT_ID = '0x00000001';
exports.CALLSCRIPT_ID = CALLSCRIPT_ID;

function decodeSegment(script) {
  // Get address
  const to = `0x${script.substring(0, 40)}`;
  script = script.substring(40); // Get data

  const dataLength = parseInt(`0x${script.substring(0, 8)}`, 16) * 2;
  script = script.substring(8);
  const data = `0x${script.substring(0, dataLength)}`; // Return rest of script for processing

  script = script.substring(dataLength);
  return {
    segment: {
      to,
      data
    },
    scriptLeft: script
  };
}
/**
 * Decode a call script bytes string into its actions.
 *
 * Will return an array containing objects with:
 *
 *  - `to`: to address
 *  - `data`: call data
 *
 * @param {string} actions
 * @returns {Array<Object>}
 */


function decodeCallScript(script) {
  if (!isCallScript(script)) {
    throw new Error(`Not a call script: ${script}`);
  }

  let scriptData = script.substring(10);
  const segments = [];

  while (scriptData.length > 0) {
    const {
      segment,
      scriptLeft
    } = decodeSegment(scriptData);
    segments.push(segment);
    scriptData = scriptLeft;
  }

  return segments;
}
/**
 * Encode a call script
 *
 * ```
 * CallScriptAction {
 *   to: string;
 *   data: string;
 * }
 * ```
 *
 * Example:
 *
 * input:
 * [
 *  { to: 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, data: 0x11111111 },
 *  { to: 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, data: 0x2222222222 }
 * ]
 *
 * output:
 * 0x00000001
 *   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000411111111
 *   bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb000000052222222222
 *
 *
 * @param {Array<CallScriptAction>} actions
 * @returns {string}
 */


function encodeCallScript(actions) {
  return actions.reduce((script, {
    to,
    data
  }) => {
    const address = _web3EthAbi.default.encodeParameter('address', to);

    const dataLength = _web3EthAbi.default.encodeParameter('uint256', (data.length - 2) / 2).toString('hex');

    return script + address.slice(26) + dataLength.slice(58) + data.slice(2);
  }, CALLSCRIPT_ID);
}
/**
 * Checks whether a EVMScript bytes string is a call script.
 *
 * @param {string} actions
 * @returns {bool}
 */


function isCallScript(script) {
  // Get script identifier (0x prefix + bytes4)
  const scriptId = script.substring(0, 10);
  return scriptId === CALLSCRIPT_ID;
}
//# sourceMappingURL=callscript.js.map