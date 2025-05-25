// types/framer-motion.d.ts
import 'framer-motion';
import React from 'react'; // Ensure React is imported for CSSProperties

declare module 'framer-motion' {
  // Ensure original UseScrollOptions is imported or referenced if needed, 
  // though module augmentation should extend it.
  // import { UseScrollOptions as OriginalUseScrollOptions } from 'framer-motion'; // This might be needed if we're not purely augmenting

  // Augment UseScrollOptions for useScroll hook
  export interface UseScrollOptions {
    target?: React.RefObject<string>; // Diagnostic: Changed to string a ref to HTMLElement or null
    container?: React.RefObject<HTMLElement | null>;
    offset?: string[] | number[];
    smooth?: number;
    axis?: 'x' | 'y';
    // Add other properties from the original UseScrollOptions if necessary
  }

  export interface MotionProps {
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    onClick?: React.MouseEventHandler<any>;
    // Add other common HTML attributes if needed
    // e.g., onClick?: React.MouseEventHandler<any>;
    // role?: string;
    // 'aria-label'?: string;
  }
}
