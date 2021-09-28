"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;
exports.intent = intent;
exports.events = events;
exports.pastEvents = pastEvents;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _configuration = require("../../configuration");

var configurationKeys = _interopRequireWildcard(require("../../configuration/keys"));

var _events = require("../../utils/events");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function call(request, proxy, wrapper) {
  const web3 = wrapper.web3;
  const [address, methodAbiFragment, ...params] = request.params;
  const contract = new web3.eth.Contract([methodAbiFragment], address);
  return contract.methods[methodAbiFragment.name](...params).call();
}

async function intent(request, proxy, wrapper) {
  const [address, methodAbiFragment, ...params] = request.params;
  const transactionPath = await wrapper.getExternalTransactionPath(address, methodAbiFragment, params);
  return wrapper.performTransactionPath(transactionPath, {
    external: true
  });
}

function events(request, proxy, wrapper) {
  const web3 = wrapper.web3;
  const [address, jsonInterface] = request.params;
  const contract = new web3.eth.Contract(jsonInterface, address); // `external_events` RPC compatibility with aragonAPI versions:
  //   - aragonAPIv2: `'external_events', [address, jsonInterface, eventNames, eventOptions]`
  //   - aragonAPIv1: `'external_events', [address, jsonInterface, fromBlock (optional)]`

  let eventNames;
  let eventOptions;

  if (request.params.length === 4) {
    // aragonAPIv2
    eventNames = (0, _events.getEventNames)(request.params[2]);
    eventOptions = request.params[3];
  } else if (request.params.length <= 3) {
    // aragonAPIv1
    eventNames = ['allEvents'];
    eventOptions = {
      fromBlock: request.params[2]
    };
  } // Use the app proxy's initialization block by default


  if (eventOptions.fromBlock == null) {
    eventOptions.fromBlock = proxy.initializationBlock;
  }

  let eventSource;

  if (eventNames.length === 1) {
    // Get a specific event or all events unfiltered
    eventSource = (0, _rxjs.fromEvent)(contract.events[eventNames[0]](eventOptions), 'data');
  } else {
    // Get all events and filter ourselves
    eventSource = (0, _rxjs.fromEvent)(this.contract.events.allEvents(eventOptions), 'data').pipe((0, _operators.filter)(event => eventNames.includes(event.event)));
  }

  const eventDelay = (0, _configuration.getConfiguration)(configurationKeys.SUBSCRIPTION_EVENT_DELAY) || 0; // Small optimization: don't pipe a delay if we don't have to

  return eventDelay ? eventSource.pipe((0, _operators.delay)(eventDelay)) : eventSource;
}

function pastEvents(request, proxy, wrapper) {
  const web3 = wrapper.web3;
  const [address, jsonInterface] = request.params;
  const contract = new web3.eth.Contract(jsonInterface, address); // `external_past_events` RPC compatibility with aragonAPI versions:
  //   - aragonAPIv2: `'external_past_events', [address, jsonInterface, eventNames, eventOptions]`
  //   - aragonAPIv1: `'external_past_events', [address, jsonInterface, eventOptions]`

  let eventNames;
  let eventOptions;

  if (request.params.length === 4) {
    // aragonAPIv2
    eventNames = (0, _events.getEventNames)(request.params[2]);
    eventOptions = request.params[3];
  } else if (request.params.length === 3) {
    // aragonAPIv1
    eventNames = ['allEvents'];
    eventOptions = request.params[2];
  } // Use the app proxy's initialization block by default


  if (eventOptions.fromBlock == null) {
    eventOptions.fromBlock = proxy.initializationBlock;
  } // The `from`s only unpack the returned Promises (and not the array inside them!)


  if (eventNames.length === 1) {
    // Get a specific event or all events unfiltered
    return (0, _rxjs.from)(new Promise(async resolve => {
      const options = eventOptions; // console.log("Resolving ", resolve);

      const ranges = [];

      for (let i = +options.fromBlock; i < +options.toBlock; i += 1024) {
        ranges.push(_objectSpread(_objectSpread({}, options), {}, {
          fromBlock: i,
          toBlock: i + 1023 > options.toBlock ? options.toBlock : i + 1023
        }));
      } // console.log(ranges);
      // console.log(options);


      let res = [];

      for (let range of ranges) {
        const arr = await contract.getPastEvents(eventNames[0], range);
        if (arr && arr.length) res = res.concat(arr);
      } // console.log(ranges, res);


      resolve(res);
    }));
  } else {
    // Get all events and filter ourselves
    return (0, _rxjs.from)(contract.getPastEvents('allEvents', eventOptions).then(events => events.filter(event => eventNames.includes(event.event))));
  }
}
//# sourceMappingURL=external.js.map