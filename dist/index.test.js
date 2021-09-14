"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ava = _interopRequireDefault(require("ava"));

var _sinon = _interopRequireDefault(require("sinon"));

var _proxyquire = _interopRequireDefault(require("proxyquire"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _rpcMessenger = require("@aragon/rpc-messenger");

var apps = _interopRequireWildcard(require("./apps"));

var configurationKeys = _interopRequireWildcard(require("./configuration/keys"));

var apm = _interopRequireWildcard(require("./core/apm"));

var _utils = require("./utils");

var _AsyncRequestCache = _interopRequireDefault(require("./utils/AsyncRequestCache"));

var callscriptUtils = _interopRequireWildcard(require("./utils/callscript"));

var forwardingUtils = _interopRequireWildcard(require("./utils/forwarding"));

var transactionsUtils = _interopRequireWildcard(require("./utils/transactions"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const {
  encodeCallScript
} = callscriptUtils; // soliditySha3('app')

const APP_NAMESPACE_HASH = '0xf1f3eb40f5bc1ad1344716ced8b8a0431d840b5783aea1fd01786bc26f35ac0f'; // soliditySha3('core')

const CORE_NAMESPACE_HASH = '0xc681a85306374a5ab27f0bbc385296a54bcd314a1948b6cf61c4ea1bc44bb9f8';

_ava.default.beforeEach(t => {
  const apmCoreStub = {
    getApmInternalAppInfo: _sinon.default.stub()
  };
  const aragonOSCoreStub = {
    getAragonOsInternalAppInfo: _sinon.default.stub()
  };
  const configurationStub = {
    setConfiguration: _sinon.default.stub()
  };
  const ensStub = {
    resolve: _sinon.default.stub()
  };

  const messengerConstructorStub = _sinon.default.stub();

  messengerConstructorStub.signals = _rpcMessenger.signals;
  const utilsStub = {
    AsyncRequestCache: _AsyncRequestCache.default,
    getCacheKey: _utils.getCacheKey,
    addressesEqual: Object.is,
    callscript: callscriptUtils,
    forwarding: forwardingUtils,
    makeAddressMapProxy: _sinon.default.fake.returns({}),
    makeProxy: _sinon.default.stub(),
    transactions: transactionsUtils
  };

  const Aragon = _proxyquire.default.noCallThru().load('./index', {
    '@aragon/rpc-messenger': messengerConstructorStub,
    './apps': apps,
    './core/aragonOS': aragonOSCoreStub,
    './core/apm': Object.assign(apm, apmCoreStub),
    './configuration': configurationStub,
    './configuration/keys': configurationKeys,
    './ens': () => ensStub,
    './utils': utilsStub
  }).default; // Helper for creating Aragon class instances


  function createAragon(daoAddress = '0x00', options) {
    return new Aragon(daoAddress, _objectSpread({
      apm: {
        ensRegistryAddress: '0x00'
      }
    }, options));
  }

  t.context = {
    Aragon,
    apmCoreStub,
    aragonOSCoreStub,
    createAragon,
    configurationStub,
    ensStub,
    messengerConstructorStub,
    utilsStub
  };
});

_ava.default.afterEach.always(() => {
  _sinon.default.restore();
});

(0, _ava.default)('should create an Aragon instance with no options given', t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // act

  const app = createAragon(); // assert

  t.not(app.apm, undefined);
});
(0, _ava.default)('should throw on init if daoAddress is not a Kernel', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const badDaoAddress = '0xbaddao';
  const instance = createAragon(badDaoAddress); // web3 will throw if a bad address ('0x') comes back

  const kernelProxyCallStub = _sinon.default.stub().withArgs('acl').throws();

  instance.kernelProxy = {
    address: badDaoAddress,
    call: kernelProxyCallStub
  }; // act and assert

  await t.throwsAsync(instance.init(), {
    instanceOf: Error,
    message: `Provided daoAddress is not a DAO`
  });
});
(0, _ava.default)('should set the default configuration', t => {
  const {
    createAragon,
    configurationStub
  } = t.context;
  t.plan(4); // act

  const instance = createAragon(); // assert

  t.truthy(configurationStub.setConfiguration.calledTwice);
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.FORCE_LOCAL_STORAGE, false));
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.SUBSCRIPTION_EVENT_DELAY, 0));
  t.not(instance.apm, undefined);
});
(0, _ava.default)('should set the given configuration', t => {
  const {
    createAragon,
    configurationStub
  } = t.context;
  t.plan(4); // act

  const instance = createAragon('0x00', {
    cache: {
      forceLocalStorage: true
    },
    events: {
      subscriptionEventDelay: 1000
    }
  }); // assert

  t.truthy(configurationStub.setConfiguration.calledTwice);
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.FORCE_LOCAL_STORAGE, true));
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.SUBSCRIPTION_EVENT_DELAY, 1000));
  t.not(instance.apm, undefined);
});
(0, _ava.default)("should set the default configuration if overriding configuration doesn't contain keys", t => {
  const {
    createAragon,
    configurationStub
  } = t.context;
  t.plan(4); // act

  const instance = createAragon('0x00', {
    cache: {},
    events: {}
  }); // assert

  t.truthy(configurationStub.setConfiguration.calledTwice);
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.FORCE_LOCAL_STORAGE, false));
  t.truthy(configurationStub.setConfiguration.calledWith(configurationKeys.SUBSCRIPTION_EVENT_DELAY, 0));
  t.not(instance.apm, undefined);
});
(0, _ava.default)('should use provided accounts', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon(); // act

  await instance.initAccounts({
    providedAccounts: ['0x00']
  });
  const accounts = await instance.getAccounts(); // assert

  t.deepEqual(accounts, ['0x00']);
});
(0, _ava.default)('should get the accounts from web3', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.web3 = {
    eth: {
      getAccounts: _sinon.default.stub().resolves(['0x01', '0x02'])
    }
  }; // act

  await instance.initAccounts({
    fetchFromWeb3: true
  });
  const accounts = await instance.getAccounts(); // assert

  t.deepEqual(accounts, ['0x01', '0x02']);
});
(0, _ava.default)('should not fetch the accounts if not asked', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.web3 = {
    eth: {
      getAccounts: _sinon.default.stub().resolves(['0x01', '0x02'])
    }
  }; // act

  await instance.initAccounts({
    fetchFromWeb3: false
  });
  const accounts = await instance.getAccounts(); // assert

  t.deepEqual(accounts, []);
});
(0, _ava.default)('should get the network details from web3', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  const testNetworkId = 4;
  const testNetworkType = 'rinkeby';
  instance.web3 = {
    eth: {
      getChainId: _sinon.default.stub().resolves(testNetworkId),
      net: {
        getNetworkType: _sinon.default.stub().resolves(testNetworkType)
      }
    }
  }; // act

  await instance.initNetwork(); // assert

  instance.network.subscribe(network => {
    t.deepEqual(network, {
      id: testNetworkId,
      type: testNetworkType
    });
  });
});
(0, _ava.default)('should set the GUI style', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(2); // arrange

  const instance1 = createAragon();
  const instance2 = createAragon();
  instance1.initGuiStyle();
  instance2.initGuiStyle(); // act

  instance1.setGuiStyle('black', {
    name: 'Black theme'
  });
  instance2.setGuiStyle('dark'); // assert

  t.deepEqual(instance1.guiStyle.value, {
    appearance: 'black',
    theme: {
      name: 'Black theme'
    }
  });
  t.deepEqual(instance2.guiStyle.value, {
    appearance: 'dark',
    theme: null
  });
});
const aclEvents = (0, _rxjs.from)([{
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'add',
    allowed: true,
    entity: '0x1'
  }
}, {
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'subtract',
    allowed: true,
    entity: '0x1'
  }
}, {
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'add',
    allowed: true,
    entity: '0x2'
  }
}, {
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'subtract',
    allowed: true,
    entity: '0x2'
  }
}, {
  // Simulate real world mixed order of event types
  event: 'ChangePermissionManager',
  returnValues: {
    app: 'counter',
    role: 'subtract',
    manager: 'manager'
  }
}, {
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'subtract',
    allowed: false,
    entity: '0x2'
  }
}, {
  // duplicate, should not affect the final result because we use a Set
  event: 'SetPermission',
  returnValues: {
    app: 'counter',
    role: 'subtract',
    allowed: false,
    entity: '0x2'
  }
}]);
(0, _ava.default)('should init the ACL correctly', async t => {
  const {
    createAragon,
    utilsStub
  } = t.context;
  t.plan(1);
  const instance = createAragon();
  instance.kernelProxy = {
    call: _sinon.default.stub()
  };
  instance.cache.get = _sinon.default.stub().returns({});
  instance.cache.set = _sinon.default.stub().resolves();
  const aclProxyStub = {
    events: _sinon.default.stub().returns(aclEvents),
    pastEvents: _sinon.default.stub().returns((0, _rxjs.empty)())
  };
  utilsStub.makeProxy.returns(aclProxyStub); // act

  await instance.initAcl(); // assert, tell ava to wait for the permissions observable to debounce

  return new Promise(resolve => {
    instance.permissions.subscribe(value => {
      t.deepEqual(value, {
        counter: {
          add: {
            allowedEntities: ['0x1', '0x2']
          },
          subtract: {
            allowedEntities: ['0x1'],
            manager: 'manager'
          }
        }
      }); // The permissions observable debounces, so we should only get one value back

      resolve();
    });
  });
});
(0, _ava.default)('should init the acl with the default acl fetched from the kernel by default', async t => {
  const {
    createAragon,
    utilsStub
  } = t.context;
  t.plan(2); // arrange

  const defaultAclAddress = '0x321';
  const aclProxyStub = {
    events: _sinon.default.stub().returns(aclEvents),
    pastEvents: _sinon.default.stub().returns((0, _rxjs.empty)())
  };
  const kernelProxyStub = {
    call: _sinon.default.stub().withArgs('acl').resolves(defaultAclAddress)
  };
  utilsStub.makeProxy.returns(kernelProxyStub).withArgs(defaultAclAddress).returns(aclProxyStub);
  const instance = createAragon();
  instance.cache.get = _sinon.default.stub().returns({});
  instance.cache.set = _sinon.default.stub().resolves(); // act

  await instance.initAcl(); // assert

  t.truthy(kernelProxyStub.call.calledOnceWith('acl'));
  t.truthy(utilsStub.makeProxy.calledWith(defaultAclAddress));
});
(0, _ava.default)('should init the acl with the provided acl', async t => {
  const {
    createAragon,
    utilsStub
  } = t.context;
  t.plan(3); // arrange

  const defaultAclAddress = '0x321';
  const givenAclAddress = '0x123';
  const aclProxyStub = {
    events: _sinon.default.stub().returns(aclEvents),
    pastEvents: _sinon.default.stub().returns((0, _rxjs.empty)())
  };
  const kernelProxyStub = {
    call: _sinon.default.stub().withArgs('acl').resolves(defaultAclAddress)
  };
  utilsStub.makeProxy.returns(kernelProxyStub).withArgs(givenAclAddress).returns(aclProxyStub);
  const instance = createAragon();
  instance.cache.get = _sinon.default.stub().returns({});
  instance.cache.set = _sinon.default.stub().resolves(); // act

  await instance.initAcl({
    aclAddress: givenAclAddress
  }); // assert

  t.truthy(kernelProxyStub.call.notCalled);
  t.truthy(utilsStub.makeProxy.neverCalledWith(defaultAclAddress));
  t.truthy(utilsStub.makeProxy.calledWith(givenAclAddress));
});
const kernelAddress = '0x123';
const appInitTestCases = [['with kernel in permissions', {
  [kernelAddress]: 'some permissions',
  '0x456': 'some permissions',
  '0x789': 'some permissions',
  '0xrepo': 'some permissions'
}], ['without kernel in permissions', {
  '0x456': 'some permissions',
  '0x789': 'some permissions',
  '0xrepo': 'some permissions'
}]];
appInitTestCases.forEach(([testName, permissionsObj]) => {
  (0, _ava.default)(`should init the apps correctly - ${testName}`, async t => {
    const {
      createAragon,
      aragonOSCoreStub,
      apmCoreStub,
      ensStub,
      utilsStub
    } = t.context;
    t.plan(1); // arrange

    const kernelAddress = '0x123';
    const appIds = {
      [kernelAddress]: 'kernel',
      '0x456': 'counterApp',
      '0x789': 'votingApp',
      '0xrepo': 'repoApp'
    };
    const codeAddresses = {
      [kernelAddress]: '0xkernel',
      '0x456': '0xcounterApp',
      '0x789': '0xvotingApp',
      '0xrepo': '0xrepoApp'
    }; // Stub makeProxy for each app

    Object.keys(appIds).forEach(address => {
      const proxyStub = {
        call: _sinon.default.stub()
      };
      proxyStub.call.withArgs('kernel').resolves(kernelAddress).withArgs('appId').resolves(appIds[address]).withArgs('implementation').resolves(codeAddresses[address]).withArgs('isForwarder').resolves(false);
      utilsStub.makeProxy.withArgs(address).returns(proxyStub);
    });
    aragonOSCoreStub.getAragonOsInternalAppInfo.withArgs(appIds[kernelAddress]).returns({
      abi: 'abi for kernel',
      isAragonOsInternalApp: true
    });
    apmCoreStub.getApmInternalAppInfo.withArgs(appIds['0xrepo']).returns({
      abi: 'abi for repo'
    }); // Mock ens resolution to just return the appId

    ensStub.resolve = _sinon.default.stub().returnsArg(0);
    const instance = createAragon();
    instance.apm = {
      fetchLatestRepoContentForContract: appId => Promise.resolve({
        abi: `abi for ${appId}`
      })
    };
    instance.permissions = (0, _rxjs.of)(permissionsObj);
    instance.kernelProxy = {
      address: kernelAddress,
      call: _sinon.default.stub().withArgs('KERNEL_APP_ID').resolves('kernel'),
      events: _sinon.default.stub().returns((0, _rxjs.empty)())
    }; // act

    await instance.initApps(); // assert
    // Check value of apps

    return new Promise(resolve => {
      instance.apps.pipe((0, _operators.first)()).subscribe(value => {
        t.deepEqual(value, [{
          abi: 'abi for kernel',
          appId: 'kernel',
          codeAddress: '0xkernel',
          isAragonOsInternalApp: true,
          proxyAddress: '0x123'
        }, {
          abi: 'abi for counterApp',
          appId: 'counterApp',
          codeAddress: '0xcounterApp',
          isForwarder: false,
          kernelAddress: '0x123',
          proxyAddress: '0x456'
        }, {
          abi: 'abi for votingApp',
          appId: 'votingApp',
          codeAddress: '0xvotingApp',
          isForwarder: false,
          kernelAddress: '0x123',
          proxyAddress: '0x789'
        }, {
          abi: 'abi for repoApp',
          appId: 'repoApp',
          codeAddress: '0xrepoApp',
          isForwarder: false,
          kernelAddress: '0x123',
          proxyAddress: '0xrepo'
        }]);
        resolve();
      });
    });
  });
});
(0, _ava.default)('should update the apps correctly on SetApp', async t => {
  const {
    createAragon,
    aragonOSCoreStub,
    ensStub,
    utilsStub
  } = t.context;
  const setAppEventStub = new _rxjs.Subject();
  t.plan(4); // arrange

  const kernelAddress = '0x123';
  const permissionsObj = {
    '0x456': 'some permissions',
    '0x789': 'some permissions'
  };
  const appIds = {
    [kernelAddress]: 'kernel',
    '0x456': 'counterApp',
    '0x789': 'votingApp'
  };
  const codeAddresses = {
    [kernelAddress]: '0xkernel',
    '0x456': '0xcounterApp',
    '0x789': '0xvotingApp'
  }; // Stub makeProxy for each app

  Object.keys(appIds).forEach(address => {
    const proxyStub = {
      call: _sinon.default.stub()
    };
    proxyStub.call.withArgs('kernel').resolves(kernelAddress).withArgs('appId').resolves(appIds[address]).withArgs('implementation').resolves(codeAddresses[address]).withArgs('isForwarder').resolves(false);
    utilsStub.makeProxy.withArgs(address).returns(proxyStub);
  });
  aragonOSCoreStub.getAragonOsInternalAppInfo.withArgs(appIds[kernelAddress]).returns({
    abi: 'abi for kernel',
    isAragonOsInternalApp: true
  }); // Mock ens resolution to just return the appId

  ensStub.resolve = _sinon.default.stub().returnsArg(0);
  const instance = createAragon();
  instance.apm = {
    fetchLatestRepoContentForContract: appId => Promise.resolve({
      abi: `abi for ${appId}`
    })
  };
  instance.permissions = (0, _rxjs.of)(permissionsObj);
  instance.kernelProxy = {
    address: kernelAddress,
    call: _sinon.default.stub().withArgs('KERNEL_APP_ID').resolves('kernel'),
    events: _sinon.default.stub().withArgs('SetApp', {}).returns(setAppEventStub)
  }; // act

  await instance.initApps(); // assert
  // Check initial value of apps

  await new Promise(resolve => {
    instance.apps.pipe((0, _operators.first)()).subscribe(value => {
      t.deepEqual(value, [{
        abi: 'abi for kernel',
        appId: 'kernel',
        codeAddress: '0xkernel',
        isAragonOsInternalApp: true,
        proxyAddress: '0x123'
      }, {
        abi: 'abi for counterApp',
        appId: 'counterApp',
        codeAddress: '0xcounterApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x456'
      }, {
        abi: 'abi for votingApp',
        appId: 'votingApp',
        codeAddress: '0xvotingApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x789'
      }]);
      resolve();
    });
  }); // act

  setAppEventStub.next({
    returnValues: {
      appId: 'counterApp',
      namespace: APP_NAMESPACE_HASH
    }
  });
  await new Promise(resolve => setTimeout(resolve, 100)); // let the emission propagate
  // assert
  // Check app has been updated

  await new Promise(resolve => {
    instance.apps.pipe((0, _operators.first)()).subscribe(value => {
      t.deepEqual(value, [{
        abi: 'abi for kernel',
        appId: 'kernel',
        codeAddress: '0xkernel',
        isAragonOsInternalApp: true,
        proxyAddress: '0x123'
      }, {
        abi: 'abi for counterApp',
        appId: 'counterApp',
        codeAddress: '0xcounterApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x456',
        updated: true
      }, {
        abi: 'abi for votingApp',
        appId: 'votingApp',
        codeAddress: '0xvotingApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x789'
      }]);
      resolve();
    });
  }); // act

  setAppEventStub.next({
    returnValues: {
      appId: 'votingApp',
      namespace: APP_NAMESPACE_HASH
    }
  });
  await new Promise(resolve => setTimeout(resolve, 100)); // let the emission propagate
  // assert
  // Check correct app has been updated

  await new Promise(resolve => {
    instance.apps.pipe((0, _operators.first)()).subscribe(value => {
      t.deepEqual(value, [{
        abi: 'abi for kernel',
        appId: 'kernel',
        codeAddress: '0xkernel',
        isAragonOsInternalApp: true,
        proxyAddress: '0x123'
      }, {
        abi: 'abi for counterApp',
        appId: 'counterApp',
        codeAddress: '0xcounterApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x456'
      }, {
        abi: 'abi for votingApp',
        appId: 'votingApp',
        codeAddress: '0xvotingApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x789',
        updated: true
      }]);
      resolve();
    });
  }); // act

  setAppEventStub.next({
    returnValues: {
      appId: 'counterApp',
      namespace: CORE_NAMESPACE_HASH
    }
  });
  await new Promise(resolve => setTimeout(resolve, 100)); // let the emission propagate
  // assert
  // Check that we filtered the last emission as it wasn't the correct namespace

  await new Promise(resolve => {
    instance.apps.pipe((0, _operators.first)()).subscribe(value => {
      t.deepEqual(value, [{
        abi: 'abi for kernel',
        appId: 'kernel',
        codeAddress: '0xkernel',
        isAragonOsInternalApp: true,
        proxyAddress: '0x123'
      }, {
        abi: 'abi for counterApp',
        appId: 'counterApp',
        codeAddress: '0xcounterApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x456'
      }, {
        abi: 'abi for votingApp',
        appId: 'votingApp',
        codeAddress: '0xvotingApp',
        isForwarder: false,
        kernelAddress: '0x123',
        proxyAddress: '0x789',
        updated: true
      }]);
      resolve();
    });
  });
});
(0, _ava.default)('should init the app identifiers correctly', async t => {
  t.plan(1); // arrange

  const {
    createAragon
  } = t.context;
  const instance = createAragon(); // act

  await instance.initAppIdentifiers(); // assert

  instance.appIdentifiers.subscribe(value => {
    t.deepEqual(value, {});
  });
});
(0, _ava.default)('should emit reduced app identifiers correctly', async t => {
  t.plan(3); // arrange

  const {
    createAragon
  } = t.context;
  const instance = createAragon();
  await instance.initAppIdentifiers(); // act

  instance.setAppIdentifier('0x123', 'ANT'); // assert

  instance.appIdentifiers.pipe((0, _operators.first)()).subscribe(value => {
    t.deepEqual(value, {
      '0x123': 'ANT'
    });
  }); // act

  instance.setAppIdentifier('0x456', 'BNT'); // assert

  instance.appIdentifiers.pipe((0, _operators.first)()).subscribe(value => {
    t.deepEqual(value, {
      '0x123': 'ANT',
      '0x456': 'BNT'
    });
  }); // act

  instance.setAppIdentifier('0x123', 'CNT'); // assert

  instance.appIdentifiers.pipe((0, _operators.first)()).subscribe(value => {
    t.deepEqual(value, {
      '0x123': 'CNT',
      '0x456': 'BNT'
    });
  });
});
(0, _ava.default)('should init the identity providers correctly', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(3); // arrange

  const instance = createAragon(); // act

  await instance.initIdentityProviders(); // assert

  t.truthy(instance.identityProviderRegistrar);
  t.true(instance.identityProviderRegistrar instanceof Map);
  t.is(instance.identityProviderRegistrar.size, 1, 'Should have only one provider');
});
(0, _ava.default)('should emit an intent when requesting address identity modification', async t => {
  const {
    createAragon
  } = t.context;
  const expectedAddress = '0x123';
  t.plan(2); // arrange

  const instance = createAragon(); // act

  await instance.initIdentityProviders();
  instance.identityIntents.subscribe(intent => {
    t.is(intent.address, expectedAddress);
    t.is(intent.providerName, 'local');
  });
  instance.requestAddressIdentityModification(expectedAddress);
});
(0, _ava.default)('should be able to resolve intent when requesting address identity modification', async t => {
  const {
    createAragon
  } = t.context;
  const expectedAddress = '0x123';
  t.plan(2); // arrange

  const instance = createAragon(); // act

  await instance.initIdentityProviders();
  let counter = 0;
  instance.identityIntents.subscribe(intent => {
    intent.resolve(counter++);
  });
  return Promise.all([instance.requestAddressIdentityModification(expectedAddress).then(val => t.is(val, 0)), instance.requestAddressIdentityModification(expectedAddress).then(val => t.is(val, 1))]);
});
(0, _ava.default)('should be able to reject intent when requesting address identity modification', async t => {
  const {
    createAragon
  } = t.context;
  const expectedAddress = '0x123';
  t.plan(2); // arrange

  const instance = createAragon(); // act

  await instance.initIdentityProviders();
  let counter = 0;
  instance.identityIntents.subscribe(intent => {
    if (counter === 0) {
      intent.reject();
    } else {
      intent.reject(new Error('custom error'));
    }

    counter++;
  });
  return Promise.all([t.throwsAsync(instance.requestAddressIdentityModification(expectedAddress), {
    instanceOf: Error,
    message: 'The identity modification was not completed'
  }), t.throwsAsync(instance.requestAddressIdentityModification(expectedAddress), {
    instanceOf: Error,
    message: 'custom error'
  })]);
});
(0, _ava.default)('should init the forwarders correctly', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.apps = (0, _rxjs.of)([{
    appId: 'counterApp',
    isForwarder: true
  }, {
    appId: 'votingApp',
    isForwarder: false
  }]); // act

  await instance.initForwarders(); // assert

  instance.forwarders.subscribe(value => {
    t.deepEqual(value, [{
      appId: 'counterApp',
      isForwarder: true
    }]);
  });
});
(0, _ava.default)('should emit an intent when requesting message signing', async t => {
  const {
    createAragon
  } = t.context;
  const messageToSign = 'test message';
  const requestingApp = '0x123';
  t.plan(2); // arrange

  const instance = createAragon();
  instance.signatures = new _rxjs.Subject(); // act

  instance.signatures.subscribe(intent => {
    t.is(intent.message, messageToSign);
    t.is(intent.requestingApp, requestingApp);
  });
  instance.signMessage(messageToSign, requestingApp);
});
(0, _ava.default)('should be able to resolve intent when requesting message signing', async t => {
  const {
    createAragon
  } = t.context;
  const messageToSign = 'test message';
  const requestingApp = '0x123';
  t.plan(2); // arrange

  const instance = createAragon();
  instance.signatures = new _rxjs.Subject(); // act

  let counter = 0;
  instance.signatures.subscribe(intent => {
    intent.resolve(counter++);
  });
  return Promise.all([instance.signMessage(messageToSign, requestingApp).then(val => t.is(val, 0)), instance.signMessage(messageToSign, requestingApp).then(val => t.is(val, 1))]);
});
(0, _ava.default)('should be able to reject intent when requesting message signing', async t => {
  const {
    createAragon
  } = t.context;
  const messageToSign = 'test message';
  const requestingApp = '0x123';
  t.plan(2); // arrange

  const instance = createAragon();
  instance.signatures = new _rxjs.Subject(); // act

  let counter = 0;
  instance.signatures.subscribe(intent => {
    if (counter === 0) {
      intent.reject();
    } else {
      intent.reject(new Error('custom error'));
    }

    counter++;
  });
  return Promise.all([t.throwsAsync(instance.signMessage(messageToSign, requestingApp), {
    instanceOf: Error,
    message: 'The message was not signed'
  }), t.throwsAsync(instance.signMessage(messageToSign, requestingApp), {
    instanceOf: Error,
    message: 'custom error'
  })]);
});
(0, _ava.default)('should reject non-string message when requesting message signature', async t => {
  const {
    createAragon
  } = t.context;
  const messageToSign = {
    key: 'this is not a string'
  };
  const requestingApp = '0x123';
  t.plan(1); // arrange

  const instance = createAragon(); // act

  return t.throwsAsync(instance.signMessage(messageToSign, requestingApp), {
    instanceOf: Error,
    message: 'Message to sign must be a string'
  });
});
(0, _ava.default)('should emit an intent when performing transaction path', async t => {
  const {
    createAragon
  } = t.context;
  const initialAddress = '0x123';
  const targetAddress = '0x456';
  t.plan(3); // arrange

  const instance = createAragon();
  instance.transactions = new _rxjs.Subject(); // act

  instance.transactions.subscribe(intent => {
    t.deepEqual(intent.transaction, {
      to: initialAddress
    });
    t.true(Array.isArray(intent.path));
    t.is(intent.path.length, 2);
  });
  instance.performTransactionPath([{
    to: initialAddress
  }, {
    to: targetAddress
  }]);
});
(0, _ava.default)('should be able to resolve intent when performing transaction path', async t => {
  const {
    createAragon
  } = t.context;
  const initialAddress = '0x123';
  const targetAddress = '0x456';
  t.plan(2); // arrange

  const instance = createAragon();
  instance.transactions = new _rxjs.Subject(); // act

  let counter = 0;
  instance.transactions.subscribe(intent => {
    intent.resolve(counter++);
  });
  return Promise.all([instance.performTransactionPath([{
    to: initialAddress
  }, {
    to: targetAddress
  }]).then(val => t.is(val, 0)), instance.performTransactionPath([{
    to: initialAddress
  }, {
    to: targetAddress
  }]).then(val => t.is(val, 1))]);
});
(0, _ava.default)('should be able to reject intent when perform transaction path', async t => {
  const {
    createAragon
  } = t.context;
  const initialAddress = '0x123';
  const targetAddress = '0x456';
  t.plan(2); // arrange

  const instance = createAragon();
  instance.transactions = new _rxjs.Subject(); // act

  let counter = 0;
  instance.transactions.subscribe(intent => {
    if (counter === 0) {
      intent.reject();
    } else {
      intent.reject(new Error('custom error'));
    }

    counter++;
  });
  return Promise.all([t.throwsAsync(instance.performTransactionPath([{
    to: initialAddress
  }, {
    to: targetAddress
  }]), {
    instanceOf: Error,
    message: 'The transaction was not signed'
  }), t.throwsAsync(instance.performTransactionPath([{
    to: initialAddress
  }, {
    to: targetAddress
  }]), {
    instanceOf: Error,
    message: 'custom error'
  })]);
});
(0, _ava.default)('should throw if no functions are found, when calculating the transaction path', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.permissions = (0, _rxjs.of)({
    counter: {
      add: {
        allowedEntities: ['0x1', '0x2']
      },
      subtract: {
        allowedEntities: ['0x1'],
        manager: 'im manager'
      }
    }
  });
  instance.forwarders = (0, _rxjs.of)([{
    appId: 'forwarderA',
    proxyAddress: '0x999'
  }]);
  instance.apps = (0, _rxjs.of)([{
    appId: 'counterApp',
    kernelAddress: '0x123',
    functions: [{
      sig: 'signature',
      roles: []
    }],
    proxyAddress: '0x456'
  }, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    // functions: [{
    //   sig: 'signature',
    //   roles: []
    // }],
    proxyAddress: '0x789'
  }]); // act

  return instance.calculateTransactionPath(null, '0x789', 'signature').catch(err => {
    // assert
    t.is(err.message, 'No method named signature on 0x789');
    /*
     * Note: This test also "asserts" that the permissions object, the app object and the
     * forwarders array does not throw any errors when they are being extracted from their observables.
     */
  });
});
(0, _ava.default)('should use normal transaction pathing when finding external transaction path for installed app', async t => {
  const {
    createAragon
  } = t.context;
  const targetAddress = '0x123';
  const targetMethodAbiFragment = [{
    name: 'foo'
  }];
  const targetParams = [8];
  const mockPath = [{
    to: '0x123',
    data: '0x456'
  }];
  t.plan(2); // arrange

  const instance = createAragon();
  instance.accounts = (0, _rxjs.of)('0x00');
  instance.aclProxy = (0, _rxjs.of)({
    address: '0x456'
  });
  instance.apps = (0, _rxjs.of)([{
    appId: 'counterApp',
    kernelAddress: '0x789',
    abi: 'abi for counterApp',
    proxyAddress: targetAddress
  }]);
  instance.getTransactionPath = _sinon.default.stub().returns(mockPath); // act

  const externalPath = await instance.getExternalTransactionPath(targetAddress, targetMethodAbiFragment, targetParams); // assert

  t.deepEqual(externalPath, mockPath);
  t.true(instance.getTransactionPath.calledOnceWith(targetAddress, targetMethodAbiFragment.name, targetParams));
});
(0, _ava.default)('should be able to find external transaction path for non-installed app', async t => {
  const {
    createAragon,
    utilsStub
  } = t.context;
  const targetAddress = '0x123';
  const targetMethodAbiFragment = [{
    name: 'foo'
  }];
  const targetParams = [8];
  const mockTransaction = {
    to: targetAddress,
    data: '0x123'
  };
  t.plan(1); // arrange

  const instance = createAragon();
  instance.accounts = (0, _rxjs.of)('0x00');
  instance.aclProxy = (0, _rxjs.of)({
    address: '0x456'
  });
  instance.apps = (0, _rxjs.of)([{
    appId: 'counterApp',
    kernelAddress: '0x789',
    abi: 'abi for counterApp',
    proxyAddress: '0x456'
  }]);
  instance.describeTransactionPath = _sinon.default.stub().returnsArg(0);
  utilsStub.transactions.createDirectTransaction = _sinon.default.stub().returns(mockTransaction); // act

  const externalPath = await instance.getExternalTransactionPath(targetAddress, targetMethodAbiFragment, targetParams); // assert

  t.deepEqual(externalPath, [mockTransaction]);
});
(0, _ava.default)('should be able to find external transaction path for ACL', async t => {
  const {
    createAragon,
    utilsStub
  } = t.context;
  const targetAddress = '0x123';
  const targetMethodAbiFragment = [{
    name: 'foo'
  }];
  const targetParams = [8];
  const mockPath = [{
    to: '0x123',
    data: '0x123'
  }];
  t.plan(2); // arrange

  const instance = createAragon();
  instance.accounts = (0, _rxjs.of)('0x00');
  instance.aclProxy = (0, _rxjs.of)({
    address: targetAddress
  });
  instance.apps = (0, _rxjs.of)([{
    appId: 'ACL',
    kernelAddress: '0x789',
    abi: 'abi for ACL',
    proxyAddress: '0x456'
  }]);
  utilsStub.addressesEqual = _sinon.default.stub().returns(true);
  instance.getACLTransactionPath = _sinon.default.stub().returns(mockPath); // act

  const externalPath = await instance.getExternalTransactionPath(targetAddress, targetMethodAbiFragment, targetParams); // assert

  t.deepEqual(externalPath, mockPath);
  t.true(instance.getACLTransactionPath.calledOnceWith(targetMethodAbiFragment.name, targetParams));
});
(0, _ava.default)('should run the app and reply to a request', async t => {
  const {
    createAragon,
    messengerConstructorStub,
    utilsStub
  } = t.context; // Note: This is not a "real" unit test because the rpc handlers are not mocked

  t.plan(4); // arrange

  const requestsStub = (0, _rxjs.of)({
    id: 'uuid1',
    method: 'cache',
    params: ['get', 'settings']
  });
  const messengerStub = {
    sendResponse: _sinon.default.stub(),
    requests: () => requestsStub
  };
  messengerConstructorStub.withArgs('someMessageProvider').returns(messengerStub);
  const instance = createAragon();
  instance.cache.get = _sinon.default.stub().withArgs('0x789.settings').returns((0, _rxjs.of)('user settings for the voting app'));
  instance.apps = (0, _rxjs.of)([{
    appId: 'some other app with a different proxy',
    proxyAddress: '0x456'
  }, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    abi: 'abi for votingApp',
    proxyAddress: '0x789'
  }]);

  utilsStub.makeProxyFromAppABI = proxyAddress => ({
    address: proxyAddress,
    updateInitializationBlock: () => {}
  });

  instance.kernelProxy = {
    initializationBlock: 0
  }; // act

  const connect = await instance.runApp('0x789');
  const result = connect('someMessageProvider'); // assert

  t.true(result.shutdown !== undefined);
  t.true(result.shutdownAndClearCache !== undefined);
  /**
   * What we're testing here is that the request for getting the cache (messenger.requests())
   * is handled by the appropriate requestHandler.
   */

  t.is(messengerStub.sendResponse.getCall(0).args[0], 'uuid1');
  t.is(messengerStub.sendResponse.getCall(0).args[1], 'user settings for the voting app');
});
(0, _ava.default)('should run the app and be able to shutdown', async t => {
  const {
    createAragon,
    messengerConstructorStub,
    utilsStub
  } = t.context; // Note: This is not a "real" unit test because the rpc handlers are not mocked

  t.plan(1); // arrange

  const requestsStub = new _rxjs.Subject();
  const messengerStub = {
    sendResponse: _sinon.default.stub(),
    requests: () => requestsStub
  };
  messengerConstructorStub.withArgs('someMessageProvider').returns(messengerStub);
  const instance = createAragon();
  instance.apps = (0, _rxjs.of)([{
    appId: 'some other app with a different proxy',
    proxyAddress: '0x456'
  }, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    abi: 'abi for votingApp',
    proxyAddress: '0x789'
  }]); // Mimic never-ending stream

  instance.accounts = new _rxjs.ReplaySubject(1);
  instance.accounts.next('0x00');

  utilsStub.makeProxyFromAppABI = proxyAddress => ({
    address: proxyAddress,
    updateInitializationBlock: () => {}
  });

  instance.kernelProxy = {
    initializationBlock: 0
  }; // act

  const connect = await instance.runApp('0x789');
  const result = connect('someMessageProvider'); // send one message

  requestsStub.next({
    id: 'uuid1',
    method: 'accounts'
  }); // shutdown

  result.shutdown(); // should not handle message after shutdown

  requestsStub.next({
    id: 'uuid2',
    method: 'accounts'
  }); // assert
  // test that we've only handled messages before the handlers were shutdown

  t.is(messengerStub.sendResponse.callCount, 1);
});
(0, _ava.default)('should run the app and be able to shutdown and clear cache', async t => {
  const {
    createAragon,
    messengerConstructorStub,
    utilsStub
  } = t.context;
  const runningProxyAddress = '0x789'; // Note: This is not a "real" unit test because the rpc handlers are not mocked

  t.plan(2); // arrange

  const requestsStub = new _rxjs.Subject();
  const messengerStub = {
    sendResponse: _sinon.default.stub(),
    requests: () => requestsStub
  };
  messengerConstructorStub.withArgs('someMessageProvider').returns(messengerStub);
  const instance = createAragon();
  instance.apps = (0, _rxjs.of)([{
    appId: 'some other app with a different proxy',
    proxyAddress: '0x456'
  }, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    abi: 'abi for votingApp',
    proxyAddress: runningProxyAddress
  }]); // Mimic never-ending stream

  instance.accounts = new _rxjs.ReplaySubject(1);
  instance.accounts.next('0x00');

  utilsStub.makeProxyFromAppABI = proxyAddress => ({
    address: proxyAddress,
    updateInitializationBlock: () => {}
  });

  instance.kernelProxy = {
    initializationBlock: 0
  }; // set up cache

  await instance.cache.init();
  await instance.cache.set(`${runningProxyAddress}.key1`, 'value1');
  await instance.cache.set(`${runningProxyAddress}.key2`, 'value2');
  await instance.cache.set('alternative.key', 'alternative value'); // act

  const connect = await instance.runApp(runningProxyAddress);
  const result = connect('someMessageProvider'); // send one message

  requestsStub.next({
    id: 'uuid1',
    method: 'accounts'
  }); // shutdown and clear cache

  await result.shutdownAndClearCache(); // should not handle message after shutdown

  requestsStub.next({
    id: 'uuid2',
    method: 'accounts'
  }); // assert
  // test that we've only handled messages before the handlers were shutdown

  t.is(messengerStub.sendResponse.callCount, 1); // test that we've cleared the cache for the running app

  t.true(Object.keys(await instance.cache.getAll()).every(key => !key.startsWith(runningProxyAddress)));
});
(0, _ava.default)('should get the app from a proxy address', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.apps = (0, _rxjs.of)([{
    appId: 'some other app with a different proxy',
    proxyAddress: '0x456'
  }, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    abi: 'abi for votingApp',
    proxyAddress: '0x789'
  }]); // act

  const result = await instance.getApp('0x789'); // assert

  t.deepEqual(result, {
    appId: 'votingApp',
    kernelAddress: '0x123',
    abi: 'abi for votingApp',
    proxyAddress: '0x789'
  });
});
(0, _ava.default)('should get the permission manager', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  instance.permissions = (0, _rxjs.of)({
    counter: {
      add: {
        allowedEntities: ['0x1', '0x2']
      },
      subtract: {
        allowedEntities: ['0x1'],
        manager: 'im manager'
      }
    }
  }); // act

  const result = await instance.getPermissionManager('counter', 'subtract'); // assert

  t.is(result, 'im manager');
});
(0, _ava.default)('should be able to decode an evm call script with a single transaction', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  const script = encodeCallScript([{
    to: '0xcafe1a77e84698c83ca8931f54a755176ef75f2c',
    data: '0xcafe'
  }]); // act

  const decodedScript = instance.decodeTransactionPath(script); // assert

  t.deepEqual(decodedScript, [{
    data: '0xcafe',
    to: '0xcafe1a77e84698c83ca8931f54a755176ef75f2c'
  }]);
});
(0, _ava.default)('should be able to decode an evm call script with multiple transactions', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  const script = encodeCallScript([{
    to: '0xcafe1a77e84698c83ca8931f54a755176ef75f2c',
    data: '0xcafe'
  }, {
    to: '0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0xbeef'
  }, {
    to: '0xbaaabaaa03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0x'
  }]); // act

  const decodedScript = instance.decodeTransactionPath(script); // assert

  t.deepEqual(decodedScript, [{
    to: '0xcafe1a77e84698c83ca8931f54a755176ef75f2c',
    data: '0xcafe'
  }, {
    to: '0xbeefbeef03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0xbeef'
  }, {
    to: '0xbaaabaaa03c7e5a1c29e0aa675f8e16aee0a5fad',
    data: '0x'
  }]);
});
(0, _ava.default)('should be able to decode an evm call script with multiple nested transactions', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  /* eslint-disable no-multi-spaces */

  const script = encodeCallScript([{
    to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '0000000000000000000000000000000000000000000000000000000000000060' + // 96 data bytes length
    '00000001' + // spec id
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '00000044' + // 68 data bytes length
    '40c10f19' + // mint
    '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + // token holder
    '0000000000000000000000000000000000000000000000003782dace9d900000' // 4e18

  }, {
    to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '00000000000000000000000000000000000000000000000000000000000000c0' + // 192 data bytes length
    '00000001' + // spec id
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '000000a4' + // 164 data bytes length
    'bfe07da6' + // deposit
    '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + // token holder
    '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + // 1e18
    '0000000000000000000000000000000000000000000000000000000000000020' + // 1 word
    '0000000000000000000000000000000000000000000000000000000000000004' + // 4 bytes
    '4141414100000000000000000000000000000000000000000000000000000000' // "AAAA" encoded

  }]);
  /* eslint-enable no-multi-spaces */
  // act

  const decodedScript = instance.decodeTransactionPath(script); // assert

  t.deepEqual(decodedScript, [{
    to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
    data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000060' + '00000001' + '14a3208711873b6aab2005f6cca0f91658e287ef' + '00000044' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
    children: [{
      data: '0x' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
      to: '0x14a3208711873b6aab2005f6cca0f91658e287ef'
    }]
  }, {
    to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
    data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '00000000000000000000000000000000000000000000000000000000000000c0' + '00000001' + '14a3208711873b6aab2005f6cca0f91658e287ef' + '000000a4' + 'bfe07da6' + '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000004' + '4141414100000000000000000000000000000000000000000000000000000000',
    children: [{
      data: '0x' + 'bfe07da6' + '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000004' + '4141414100000000000000000000000000000000000000000000000000000000',
      to: '0x14a3208711873b6aab2005f6cca0f91658e287ef'
    }]
  }]);
});
(0, _ava.default)('should be able to decode an evm call script with a complex nested transaction', async t => {
  const {
    createAragon
  } = t.context;
  t.plan(1); // arrange

  const instance = createAragon();
  /* eslint-disable no-multi-spaces */

  const nestedScript = encodeCallScript([{
    to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '0000000000000000000000000000000000000000000000000000000000000060' + // 96 data bytes length
    '00000001' + // spec id
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '00000044' + // 68 data bytes length
    '40c10f19' + // mint
    '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + // token holder
    '0000000000000000000000000000000000000000000000003782dace9d900000' // 4e18

  }, {
    to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '00000000000000000000000000000000000000000000000000000000000000c0' + // 192 data bytes length
    '00000001' + // spec id
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '000000a4' + // 164 data bytes length
    'bfe07da6' + // deposit
    '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + // token holder
    '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + // 1e18
    '0000000000000000000000000000000000000000000000000000000000000020' + // 1 word
    '0000000000000000000000000000000000000000000000000000000000000004' + // 4 bytes
    '4141414100000000000000000000000000000000000000000000000000000000' // "AAAA" encoded

  }]).substring(2); // cut off '0x' prefix
  // Divide by 2 for hex, convert number into hex string, and pad for uint256

  const nestedScriptDataLength = `${(nestedScript.length / 2).toString(16)}`.padStart(64, 0);
  const script = encodeCallScript([{
    to: '0x62451b8705e6691b92afaa7766c0722c93a0e204',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    nestedScriptDataLength + // previous script data bytes length
    nestedScript // previous script data

  }]);
  /* eslint-enable no-multi-spaces */
  // act

  const decodedScript = instance.decodeTransactionPath(script); // assert

  t.deepEqual(decodedScript, [{
    to: '0x62451b8705e6691b92afaa7766c0722c93a0e204',
    data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + nestedScriptDataLength + nestedScript,
    children: [{
      to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
      data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000060' + '00000001' + '14a3208711873b6aab2005f6cca0f91658e287ef' + '00000044' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
      children: [{
        data: '0x' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
        to: '0x14a3208711873b6aab2005f6cca0f91658e287ef'
      }]
    }, {
      to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
      data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '00000000000000000000000000000000000000000000000000000000000000c0' + '00000001' + '14a3208711873b6aab2005f6cca0f91658e287ef' + '000000a4' + 'bfe07da6' + '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000004' + '4141414100000000000000000000000000000000000000000000000000000000',
      children: [{
        data: '0x' + 'bfe07da6' + '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000004' + '4141414100000000000000000000000000000000000000000000000000000000',
        to: '0x14a3208711873b6aab2005f6cca0f91658e287ef'
      }]
    }]
  }]);
});
(0, _ava.default)('should not decode non-call scripts', async t => {
  const {
    createAragon
  } = t.context;
  const badSpecId = '0x00000002';
  t.plan(1); // arrange

  const instance = createAragon();
  const script = `${badSpecId}${'123'.padStart(64, 0)}`; // assert

  t.throws(() => instance.decodeTransactionPath(script), {
    instanceOf: Error,
    message: `Script could not be decoded: ${script}`
  });
});
(0, _ava.default)('should be only able to decode call scripts when there are multiple nested transactions', async t => {
  const {
    createAragon
  } = t.context;
  const badSpecId = '0x00000002';
  t.plan(1); // arrange

  const instance = createAragon();
  /* eslint-disable no-multi-spaces */

  const script = encodeCallScript([{
    to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '0000000000000000000000000000000000000000000000000000000000000060' + // 96 data bytes length
    '00000001' + // spec id
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '00000044' + // 68 data bytes length
    '40c10f19' + // mint
    '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + // token holder
    '0000000000000000000000000000000000000000000000003782dace9d900000' // 4e18

  }, {
    to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
    data: '0x' + 'd948d468' + // forward signature
    '0000000000000000000000000000000000000000000000000000000000000020' + // offset
    '00000000000000000000000000000000000000000000000000000000000000c0' + // 192 data bytes length
    badSpecId.substring(2) + // **BAD SPEC ID**
    '14a3208711873b6aab2005f6cca0f91658e287ef' + // forward target
    '000000a4' + // 164 data bytes length
    'bfe07da6' + // deposit
    '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + // token holder
    '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + // 1e18
    '0000000000000000000000000000000000000000000000000000000000000020' + // 1 word
    '0000000000000000000000000000000000000000000000000000000000000004' + // 4 bytes
    '4141414100000000000000000000000000000000000000000000000000000000' // "AAAA" encoded

  }]);
  /* eslint-enable no-multi-spaces */
  // act

  const decodedScript = instance.decodeTransactionPath(script); // assert

  t.deepEqual(decodedScript, [{
    to: '0xbfd1f54dc1c3b50ddf2f1d5fe2f8a6b9c29bb598',
    data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000060' + '00000001' + '14a3208711873b6aab2005f6cca0f91658e287ef' + '00000044' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
    children: [{
      data: '0x' + '40c10f19' + '000000000000000000000000b4124cEB3451635DAcedd11767f004d8a28c6eE7' + '0000000000000000000000000000000000000000000000003782dace9d900000',
      to: '0x14a3208711873b6aab2005f6cca0f91658e287ef'
    }]
  }, {
    to: '0x634faa183ba1f5f968cb96656d24dff66021f5a2',
    data: '0x' + 'd948d468' + '0000000000000000000000000000000000000000000000000000000000000020' + '00000000000000000000000000000000000000000000000000000000000000c0' + badSpecId.substring(2) + '14a3208711873b6aab2005f6cca0f91658e287ef' + '000000a4' + 'bfe07da6' + '0000000000000000000000008401eb5ff34cc943f096a32ef3d5113febe8d4eb' + '0000000000000000000000000000000000000000000000000de0b6b3a7640000' + '0000000000000000000000000000000000000000000000000000000000000020' + '0000000000000000000000000000000000000000000000000000000000000004' + '4141414100000000000000000000000000000000000000000000000000000000' // ignores the second target's children because it's not a call script forward

  }]);
});
//# sourceMappingURL=index.test.js.map