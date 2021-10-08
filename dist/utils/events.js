"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventNames = getEventNames;
exports.getPastEventsByBatch = getPastEventsByBatch;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getEventNames(eventNames) {
  // Get all events
  if (!eventNames) {
    return ['allEvents'];
  } // Convert `eventNames` to an array in order to
  // support `.events(name)` and `.events([a, b])`


  if (!Array.isArray(eventNames)) {
    eventNames = [eventNames];
  }

  return eventNames;
} // get all events by blocks (configured from REACT_APP_PAST_EVENTS_BATCH_SIZE environment variable)


async function getPastEventsByBatch({
  options,
  contract,
  eventName
}) {
  let res = [];

  const opts = _objectSpread({}, options);

  const batchSize = process.env.REACT_APP_PAST_EVENTS_BATCH_SIZE;

  for (let i = +options.fromBlock; i < +options.toBlock; i += batchSize) {
    opts.fromBlock = i;
    const toBlock = i + batchSize - 1;

    if (toBlock > options.toBlock) {
      opts.toBlock = options.toBlock;
    } else {
      opts.toBlock = toBlock;
    }

    const arr = await contract.getPastEvents(eventName, opts);
    if (arr && arr.length) res = res.concat(arr);
  }

  return res;
}
//# sourceMappingURL=events.js.map