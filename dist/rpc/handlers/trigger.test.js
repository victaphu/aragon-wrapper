"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var _rxjs = require("rxjs");

var _apps = require("../../apps");

var _trigger = _interopRequireDefault(require("./trigger"));

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)("should return an observable for the app's triggers", async t => {
  t.plan(3); // arrange

  const appAddress = '0xABCD';
  const triggerContextMock = (0, _rxjs.of)({
    event: 'event1',
    returnValues: {
      data: 'data1'
    }
  }, {
    event: 'event2',
    returnValues: {
      data: 'data2'
    }
  }, {
    event: 'event3',
    returnValues: {
      data: 'data3'
    }
  });
  const requestStub = {
    params: ['observe']
  };
  const proxyStub = {
    address: appAddress
  };
  const appContextPoolStub = {
    get: _sinon.default.stub().withArgs(appAddress, _apps.APP_CONTEXTS.TRIGGER).returns(triggerContextMock)
  };
  const wrapperStub = {
    appContextPool: appContextPoolStub
  }; // act

  const result = (0, _trigger.default)(requestStub, proxyStub, wrapperStub); // assert

  let emitIndex = 0;
  result.subscribe(value => {
    if (emitIndex === 0) {
      t.deepEqual(value, {
        event: 'event1',
        returnValues: {
          data: 'data1'
        }
      });
    } else if (emitIndex === 1) {
      t.deepEqual(value, {
        event: 'event2',
        returnValues: {
          data: 'data2'
        }
      });
    } else if (emitIndex === 2) {
      t.deepEqual(value, {
        event: 'event3',
        returnValues: {
          data: 'data3'
        }
      });
    } else {
      t.fail('too many emissions');
    }

    emitIndex++;
  });
});
(0, _ava.default)('should emit trigger', async t => {
  t.plan(1); // arrange

  const appAddress = '0xABCD';
  const newEventName = 'newEvent';
  const newEventData = 'newData';
  const requestStub = {
    params: ['emit', newEventName, newEventData]
  };
  const proxyStub = {
    address: appAddress
  };
  const appContextPoolStub = {
    emit: _sinon.default.stub()
  };
  const wrapperStub = {
    appContextPool: appContextPoolStub
  }; // act

  (0, _trigger.default)(requestStub, proxyStub, wrapperStub); // assert

  t.true(appContextPoolStub.emit.calledOnceWith(appAddress, _apps.APP_CONTEXTS.TRIGGER, {
    event: newEventName,
    returnValues: newEventData
  }));
});
(0, _ava.default)('should error on invalid trigger request', async t => {
  t.plan(1); // arrange

  const appAddress = '0xABCD';
  const requestStub = {
    params: ['notHandled']
  };
  const proxyStub = {
    address: appAddress
  }; // assert

  await t.throwsAsync((0, _trigger.default)(requestStub, proxyStub), {
    message: 'Invalid trigger operation'
  });
});
//# sourceMappingURL=trigger.test.js.map