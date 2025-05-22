import React, { ReactNode } from 'react';
import { Grid as MuiGrid } from '@mui/material';

// This is a wrapper component to handle the breaking changes in MUI v5 Grid
// In v5, Grid props like 'item' and 'container' are now boolean flags
// This wrapper makes it easier to migrate from v4 to v5

interface GridProps {
  children: ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  spacing?: number;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  className?: string;
  sx?: any;
}

export const Grid = ({
  children,
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  direction,
  justifyContent,
  alignItems,
  className,
  sx,
}: GridProps) => {
  // Create a props object with only the properties that MUI Grid accepts
  const gridProps: any = {};
  
  // Only add defined properties to avoid passing undefined values
  if (container) gridProps.container = container;
  if (item) gridProps.item = item;
  if (xs !== undefined) gridProps.xs = xs;
  if (sm !== undefined) gridProps.sm = sm;
  if (md !== undefined) gridProps.md = md;
  if (lg !== undefined) gridProps.lg = lg;
  if (xl !== undefined) gridProps.xl = xl;
  if (spacing !== undefined) gridProps.spacing = spacing;
  if (direction) gridProps.direction = direction;
  if (justifyContent) gridProps.justifyContent = justifyContent;
  if (alignItems) gridProps.alignItems = alignItems;
  if (className) gridProps.className = className;
  if (sx) gridProps.sx = sx;
  
  return (
    <MuiGrid {...gridProps}>
      {children}
    </MuiGrid>
  );
};
