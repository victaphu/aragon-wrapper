"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(request, proxy) {
  const method = request.params[0];
  return proxy.call(method, ...request.params.slice(1));
}
//# sourceMappingURL=call.js.map