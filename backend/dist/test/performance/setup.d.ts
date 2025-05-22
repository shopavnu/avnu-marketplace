declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUnderPerformanceThreshold(threshold: number): R;
    }
  }
}
export {};
