"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var _rxjs = require("rxjs");

var _apps = require("../../apps");

var _path = _interopRequireDefault(require("./path"));

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)("should return an observable for the app's paths on observe", async t => {
  t.plan(3); // arrange

  const appAddress = '0xABCD';
  const pathContextMock = (0, _rxjs.of)('/', '/page1', '/page2');
  const requestStub = {
    params: ['observe']
  };
  const proxyStub = {
    address: appAddress
  };
  const appContextPoolStub = {
    get: _sinon.default.stub().withArgs(appAddress, _apps.APP_CONTEXTS.PATH).returns(pathContextMock)
  };
  const wrapperStub = {
    appContextPool: appContextPoolStub
  }; // act

  const result = (0, _path.default)(requestStub, proxyStub, wrapperStub); // assert

  let emitIndex = 0;
  result.subscribe(value => {
    if (emitIndex === 0) {
      t.deepEqual(value, '/');
    } else if (emitIndex === 1) {
      t.deepEqual(value, '/page1');
    } else if (emitIndex === 2) {
      t.deepEqual(value, '/page2');
    } else {
      t.fail('too many emissions');
    }

    emitIndex++;
  });
});
(0, _ava.default)('should request app path on modify', async t => {
  t.plan(2); // arrange

  const appAddress = '0xABCD';
  const newPath = '/new';
  const requestStub = {
    params: ['modify', newPath]
  };
  const proxyStub = {
    address: appAddress
  };
  const mockResponseSymbol = Symbol('response');
  const wrapperStub = {
    requestAppPath: _sinon.default.stub().returns(mockResponseSymbol)
  }; // act

  const response = (0, _path.default)(requestStub, proxyStub, wrapperStub); // assert

  t.true(wrapperStub.requestAppPath.calledOnceWith(appAddress, newPath));
  t.is(response, mockResponseSymbol);
});
(0, _ava.default)('should error on invalid path request', async t => {
  t.plan(1); // arrange

  const appAddress = '0xABCD';
  const requestStub = {
    params: ['notHandled']
  };
  const proxyStub = {
    address: appAddress
  }; // assert

  await t.throwsAsync((0, _path.default)(requestStub, proxyStub), {
    message: 'Invalid path operation'
  });
});
//# sourceMappingURL=path.test.js.map