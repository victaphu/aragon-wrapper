"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _proxyquire = _interopRequireDefault(require("proxyquire"));

var _sinon = _interopRequireDefault(require("sinon"));

var eventsUtils = _interopRequireWildcard(require("../../utils/events"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_ava.default.beforeEach(t => {
  const utilsStub = {
    events: eventsUtils
  };
  const events = (0, _proxyquire.default)('./events', {
    '../../utils': utilsStub
  }).default;
  t.context = {
    events,
    utilsStub
  };
});

(0, _ava.default)('should invoke proxy.events with the correct options', async t => {
  const {
    events
  } = t.context;
  t.plan(2); // arrange

  const mockObservable = Symbol('mockObservable');
  const proxyStub = {
    events: _sinon.default.stub().returns(mockObservable)
  };
  const requestStub = {
    params: ['allEvents', {
      fromBlock: 5
    }]
  }; // act

  const eventsObservable = events(requestStub, proxyStub); // assert

  t.true(proxyStub.events.calledOnceWithExactly(['allEvents'], {
    fromBlock: 5
  }));
  t.is(eventsObservable, mockObservable);
});
(0, _ava.default)('should invoke proxy.events with the correct options for aragonAPIv1', async t => {
  const {
    events
  } = t.context;
  t.plan(2); // arrange

  const mockObservable = Symbol('mockObservable');
  const proxyStub = {
    events: _sinon.default.stub().returns(mockObservable)
  }; // aragonAPIv1 only passes the fromBlock

  const requestStub = {
    params: [5]
  }; // act

  const eventsObservable = events(requestStub, proxyStub); // assert

  t.true(proxyStub.events.calledOnceWith(null, {
    fromBlock: 5
  }));
  t.is(eventsObservable, mockObservable);
});
(0, _ava.default)('should invoke proxy.events with the correct options for aragonAPIv1 when no fromBlock is passed', async t => {
  const {
    events
  } = t.context;
  t.plan(2); // arrange

  const mockObservable = Symbol('mockObservable');
  const proxyStub = {
    events: _sinon.default.stub().returns(mockObservable)
  }; // aragonAPIv1 does not need to pass the fromBlock

  const requestStub = {
    params: []
  }; // act

  const eventsObservable = events(requestStub, proxyStub); // assert

  t.true(proxyStub.events.calledOnceWith(null, {
    fromBlock: undefined
  }));
  t.is(eventsObservable, mockObservable);
});
//# sourceMappingURL=events.test.js.map