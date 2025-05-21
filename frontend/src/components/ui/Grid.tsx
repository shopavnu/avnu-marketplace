import React, { ReactNode } from 'react';
import { Grid as MuiGrid, SxProps, Theme } from '@mui/material';

// Custom Grid component to handle TypeScript errors with Material-UI v5
export interface GridProps {
  children: ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  spacing?: number;
  sx?: SxProps<Theme>;
  className?: string;
}

// This component acts as a wrapper for MUI Grid to handle TypeScript issues
const Grid = ({
  children,
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  sx = {},
  className,
  ...rest
}: GridProps) => {
  // Create props object with correct MUI v5 syntax
  const gridProps: any = {
    sx,
    className,
    ...rest
  };
  
  // Add grid properties
  if (container) gridProps.container = true;
  if (item) gridProps.item = true;
  if (xs !== undefined) gridProps.xs = xs;
  if (sm !== undefined) gridProps.sm = sm;
  if (md !== undefined) gridProps.md = md;
  if (lg !== undefined) gridProps.lg = lg;
  if (xl !== undefined) gridProps.xl = xl;
  if (spacing !== undefined && container) gridProps.spacing = spacing;
  
  return (
    <MuiGrid {...gridProps}>
      {children}
    </MuiGrid>
  );
};

// Convenience component for Grid container
const GridContainer = ({
  children,
  spacing = 2,
  sx = {},
  className,
  ...rest
}: Omit<GridProps, 'container' | 'item'>) => {
  return (
    <Grid container spacing={spacing} sx={sx} className={className} {...rest}>
      {children}
    </Grid>
  );
};

// Convenience component for Grid item
const GridItem = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  sx = {},
  className,
  ...rest
}: Omit<GridProps, 'container' | 'item'>) => {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} sx={sx} className={className} {...rest}>
      {children}
    </Grid>
  );
};

// Export all components
export { Grid, GridContainer, GridItem };
