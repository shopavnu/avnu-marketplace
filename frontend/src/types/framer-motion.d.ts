// src/types/framer-motion.d.ts
import 'framer-motion';
import React from 'react'; // Ensure React is imported for CSSProperties

declare module 'framer-motion' {
  export interface MotionProps {
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    // Add other common HTML attributes if needed
    // e.g., onClick?: React.MouseEventHandler<any>;
    // role?: string;
    // 'aria-label'?: string;
  }
}
