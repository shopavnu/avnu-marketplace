/**
 * This file contains polyfills needed for Node.js compatibility across different environments
 *
 * Note: We need to handle the crypto global for @nestjs/schedule in Node.js 18.x
 * The crypto.randomUUID() function is used by the scheduler but crypto isn't available globally
 */

// Make sure crypto is globally available for @nestjs/schedule
import * as cryptoModule from 'crypto';

// Only add the polyfill if crypto is not already defined globally
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error - We're explicitly adding crypto to the global scope
  globalThis.crypto = cryptoModule;
}

// Ensure randomUUID is available (used by @nestjs/schedule)
if (
  typeof globalThis.crypto.randomUUID !== 'function' &&
  typeof cryptoModule.randomUUID === 'function'
) {
  // Add randomUUID to crypto global
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: cryptoModule.randomUUID,
    configurable: false,
    writable: false,
  });
}
