"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResponse = createResponse;
exports.createRequestHandler = createRequestHandler;
exports.combineRequestHandlers = combineRequestHandlers;
Object.defineProperty(exports, "accounts", {
  enumerable: true,
  get: function () {
    return _accounts.default;
  }
});
Object.defineProperty(exports, "cache", {
  enumerable: true,
  get: function () {
    return _cache.default;
  }
});
Object.defineProperty(exports, "describeScript", {
  enumerable: true,
  get: function () {
    return _describeScript.default;
  }
});
Object.defineProperty(exports, "describeTransaction", {
  enumerable: true,
  get: function () {
    return _describeTransaction.default;
  }
});
Object.defineProperty(exports, "getApps", {
  enumerable: true,
  get: function () {
    return _getApps.default;
  }
});
Object.defineProperty(exports, "network", {
  enumerable: true,
  get: function () {
    return _network.default;
  }
});
Object.defineProperty(exports, "path", {
  enumerable: true,
  get: function () {
    return _path.default;
  }
});
Object.defineProperty(exports, "guiStyle", {
  enumerable: true,
  get: function () {
    return _guiStyle.default;
  }
});
Object.defineProperty(exports, "trigger", {
  enumerable: true,
  get: function () {
    return _trigger.default;
  }
});
Object.defineProperty(exports, "web3Eth", {
  enumerable: true,
  get: function () {
    return _web3Eth.default;
  }
});
Object.defineProperty(exports, "intent", {
  enumerable: true,
  get: function () {
    return _intent.default;
  }
});
Object.defineProperty(exports, "call", {
  enumerable: true,
  get: function () {
    return _call.default;
  }
});
Object.defineProperty(exports, "signMessage", {
  enumerable: true,
  get: function () {
    return _signMessage.default;
  }
});
Object.defineProperty(exports, "events", {
  enumerable: true,
  get: function () {
    return _events.default;
  }
});
Object.defineProperty(exports, "pastEvents", {
  enumerable: true,
  get: function () {
    return _pastEvents.default;
  }
});
Object.defineProperty(exports, "externalIntent", {
  enumerable: true,
  get: function () {
    return _external.intent;
  }
});
Object.defineProperty(exports, "externalCall", {
  enumerable: true,
  get: function () {
    return _external.call;
  }
});
Object.defineProperty(exports, "externalEvents", {
  enumerable: true,
  get: function () {
    return _external.events;
  }
});
Object.defineProperty(exports, "externalPastEvents", {
  enumerable: true,
  get: function () {
    return _external.pastEvents;
  }
});
Object.defineProperty(exports, "addressIdentity", {
  enumerable: true,
  get: function () {
    return _addressIdentity.default;
  }
});
Object.defineProperty(exports, "appIdentifier", {
  enumerable: true,
  get: function () {
    return _appIdentifier.default;
  }
});
Object.defineProperty(exports, "searchIdentities", {
  enumerable: true,
  get: function () {
    return _searchIdentities.default;
  }
});

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _rpcMessenger = require("@aragon/rpc-messenger");

var _accounts = _interopRequireDefault(require("./accounts"));

var _cache = _interopRequireDefault(require("./cache"));

var _describeScript = _interopRequireDefault(require("./describe-script"));

var _describeTransaction = _interopRequireDefault(require("./describe-transaction"));

var _getApps = _interopRequireDefault(require("./get-apps"));

var _network = _interopRequireDefault(require("./network"));

var _path = _interopRequireDefault(require("./path"));

var _guiStyle = _interopRequireDefault(require("./gui-style"));

var _trigger = _interopRequireDefault(require("./trigger"));

var _web3Eth = _interopRequireDefault(require("./web3-eth"));

var _intent = _interopRequireDefault(require("./intent"));

var _call = _interopRequireDefault(require("./call"));

var _signMessage = _interopRequireDefault(require("./sign-message"));

var _events = _interopRequireDefault(require("./events"));

var _pastEvents = _interopRequireDefault(require("./past-events"));

var _external = require("./external");

var _addressIdentity = _interopRequireDefault(require("./address-identity"));

var _appIdentifier = _interopRequireDefault(require("./app-identifier"));

var _searchIdentities = _interopRequireDefault(require("./search-identities"));

function createResponse({
  request: {
    id
  }
}, {
  error,
  value = null,
  kind
}) {
  if (kind === 'C') {
    return {
      id,
      payload: _rpcMessenger.signals.COMPLETE
    };
  }

  if (kind === 'E') {
    return {
      id,
      payload: error || new Error()
    };
  }

  return {
    id,
    payload: value
  };
}

function createRequestHandler(request$, requestType, handler) {
  // Filter request types to match provided params
  const filteredRequest$ = request$.pipe((0, _operators.filter)(({
    request
  }) => request.method === requestType)); // Send request to handler and return response

  return filteredRequest$.pipe(
  /**
   * Turn the promise returned by the handler into an observable and materialize it, i.e:
   * - if the observable emits, emit a Notification of kind 'N' (next) with a value property
   * - if the observable rejects, emit a Notification of kind 'E' with an error property
   * - if the observable completes, emit a Notification of kind 'C' (complete)
   */
  (0, _operators.mergeMap)(({
    request,
    proxy,
    wrapper
  }) => {
    return (0, _rxjs.from)(handler(request, proxy, wrapper)).pipe((0, _operators.materialize)());
  }, createResponse), // TODO: instead of filtering, log if a payload is undefined
  (0, _operators.filter)(response => response.payload !== undefined));
}

function combineRequestHandlers(...handlers) {
  return (0, _rxjs.merge)(...handlers);
} // Export request handlers
//# sourceMappingURL=index.js.map