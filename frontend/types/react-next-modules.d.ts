/**
 * Custom declarations to fix TypeScript module resolution issues
 */

// React module declarations
declare module 'react' {
  export * from 'react';
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useContext: any;
  export const createContext: any;
  export const useReducer: any;
  export const Fragment: any;
  export const forwardRef: any;
  export const memo: any;
  export const lazy: any;
  export const Suspense: any;
  // Add other React exports as needed
}

// Next.js module declarations
declare module 'next/router' {
  export const useRouter: any;
  export default { useRouter };
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

// Framer Motion module declarations
declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  // Add other framer-motion exports as needed
}
