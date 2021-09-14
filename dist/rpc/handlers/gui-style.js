"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(request, proxy, wrapper) {
  const [operation] = request.params;

  if (operation === 'observe') {
    return wrapper.guiStyle;
  }

  return Promise.reject(new Error('Invalid guiStyle operation'));
}
//# sourceMappingURL=gui-style.js.map