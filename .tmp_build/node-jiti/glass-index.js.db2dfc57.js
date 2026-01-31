"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _objectjs = require('./object.js'); var _objectjs2 = _interopRequireDefault(_objectjs);
var _addPrefixjs = require('../../functions/addPrefix.js');

exports. default = ({ addUtilities, prefix = '' }) => {
  const prefixedglass = _addPrefixjs.addPrefix.call(void 0, _objectjs2.default, prefix);
  addUtilities({ ...prefixedglass });
};
 /* v7-35e379c4a2d6882d */