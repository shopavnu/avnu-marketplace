// /Users/taylorjackson/avnu-marketplace/frontend/src/types/react-next-modules.d.ts

// This file is intended to provide custom type declarations or augmentations
// for modules, particularly where the provided types are insufficient or
// causing issues with the TypeScript compiler.

// Framer Motion
// Attempt to ensure that Framer Motion's types are correctly recognized
// and to provide a place for any necessary augmentations.
declare module 'framer-motion' {
  // Re-exporting types from the specific path where they are usually located
  // can sometimes help with module resolution issues in certain TypeScript setups.
  // This ensures that we are working with the library's own types as a base.
  export * from 'framer-motion/dist/framer-motion';

  // If specific issues persist after this declaration (e.g., with `motion.div`,
  // `motion.a`, or certain props not being recognized), further, more specific
  // augmentations or explicit type definitions for motion components might be
  // needed within this module declaration.
}
