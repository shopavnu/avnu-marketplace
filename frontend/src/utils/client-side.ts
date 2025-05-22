/**
 * Utility functions for safely handling client-side code
 * to prevent "window is not defined" errors during server-side rendering
 */

/**
 * Check if code is running in browser environment
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Safely access window object
 * @returns window object or undefined if not in browser
 */
export const getWindow = (): (Window & typeof globalThis) | undefined => {
  return isBrowser ? window : undefined;
};

/**
 * Safely access document object
 * @returns document object or undefined if not in browser
 */
export const getDocument = (): Document | undefined => {
  return isBrowser ? document : undefined;
};

/**
 * Safely run a function only on the client side
 * @param callback Function to run on client side
 */
export const runOnlyOnClient = (callback: () => void): void => {
  if (isBrowser) {
    callback();
  }
};

/**
 * Safely add an event listener that only runs on the client
 * @param target The event target (window, document, etc.)
 * @param event Event name
 * @param callback Event handler
 * @param options Event listener options
 * @returns A cleanup function to remove the listener
 */
export const safeAddEventListener = (
  target: EventTarget | undefined | null,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!target) return () => {};

  target.addEventListener(event, callback, options);
  return () => target.removeEventListener(event, callback, options);
};
