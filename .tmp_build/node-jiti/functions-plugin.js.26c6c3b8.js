"use strict";Object.defineProperty(exports, "__esModule", {value: true}); const plugin = {
  withOptions: (pluginFunction, configFunction = () => ({})) => {
    const optionsFunction = (options) => {
      const handler = pluginFunction(options)
      const config = configFunction(options)
      return { handler, config }
    }
    optionsFunction.__isOptionsFunction = true
    return optionsFunction
  },
}; exports.plugin = plugin
 /* v7-2c2b14b6d3ad5b48 */