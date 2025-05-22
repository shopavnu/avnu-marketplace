/**
 * Custom type declarations for Next.js
 * This helps resolve TypeScript errors related to Next.js and React
 */

// Fix for React import issues
declare module "react" {
  export = React;
  export as namespace React;
}

// Fix for JSX issues
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Fix for Next.js module imports
declare module "VAR_MODULE_GLOBAL_ERROR" {
  import { ComponentType } from "react";
  const GlobalError: ComponentType<{
    error: Error;
    reset: () => void;
  }>;
  export default GlobalError;
}

// Fix for webpack types
declare module "next/dist/compiled/webpack/webpack" {
  export const webpack: any;
  export default webpack;
  export namespace webpack {
    export type RuleSetUseItem = any;
    export type DefinePlugin = any;
    export type Configuration = any;
  }
}
