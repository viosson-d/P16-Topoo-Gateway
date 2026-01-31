"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _objectjs = require('./object.js'); var _objectjs2 = _interopRequireDefault(_objectjs);
var _addPrefixjs = require('../../functions/addPrefix.js');

exports. default = ({ addUtilities, prefix = '' }) => {
  const prefixedtypography = _addPrefixjs.addPrefix.call(void 0, _objectjs2.default, prefix);
  addUtilities({ ...prefixedtypography });
};
 /* v7-b461d7b7eabfa9c9 */