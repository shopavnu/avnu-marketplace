// src/types/framer-motion.d.ts
import 'framer-motion';

declare module 'framer-motion' {
  // This extends the existing HTMLMotionProps to ensure standard HTML attributes are recognized.
  // Framer Motion's own types should already include most standard HTML attributes,
  // but sometimes explicit augmentation is needed, especially if there are conflicts
  // or specific setups that confuse TypeScript's inference.
  export interface HTMLMotionProps<T extends keyof JSX.IntrinsicElements>
    extends React.HTMLAttributes<HTMLElementTagNameMap[T]> {
    // No need to explicitly add 'className' here as React.HTMLAttributes<...> includes it.
    // This augmentation primarily helps TypeScript correctly merge and recognize these attributes
    // on motion components.
  }

  // You might also need to augment MotionProps if the issue is more general
  // export interface MotionProps extends React.HTMLAttributes<any> {}
  // However, start with augmenting HTMLMotionProps as it's more specific.
}
