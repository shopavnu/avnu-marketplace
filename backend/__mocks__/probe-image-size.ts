const mock = jest.fn();
// Assign to module.exports for direct CJS require (e.g., const probe = require('probe-image-size'))
module.exports = mock;
// Also assign to module.exports.default for ESM import interop (e.g., import * as probe from 'probe-image-size'; probe.default())
// or (import probe from 'probe-image-size'; probe() if esModuleInterop and library has default export)
module.exports.default = mock;
