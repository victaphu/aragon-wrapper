"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
const METHOD_WHITELIST = new Set(['estimateGas', 'getAccounts', 'getBalance', 'getBlock', 'getBlockNumber', 'getBlockTransactionCount', 'getCode', 'getCoinbase', 'getCompilers', 'getGasPrice', 'getHashrate', 'getPastLogs', 'getProtocolVersion', 'getStorageAt', 'getTransaction', 'getTransactionCount', 'getTransactionFromBlock', 'getTransactionReceipt', 'getWork', 'getUncle', 'isMining', 'isSyncing']);

async function _default(request, proxy, wrapper) {
  const web3 = wrapper.web3;
  const [method, ...params] = request.params;
  return METHOD_WHITELIST.has(method) ? Promise.resolve(web3.eth[method](...params)) : Promise.reject(new Error(`Given web3.eth method (${method}) is not whitelisted`));
}
//# sourceMappingURL=web3-eth.js.map