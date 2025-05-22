import React, { ReactNode } from "react";
import { Grid } from "@mui/material";

interface GridItemProps {
  children: ReactNode;
  xs?: number | boolean | "auto";
  sm?: number | boolean | "auto";
  md?: number | boolean | "auto";
  lg?: number | boolean | "auto";
  xl?: number | boolean | "auto";
  className?: string;
  sx?: any;
}

/**
 * A wrapper component for Material UI Grid that correctly applies the 'item' prop
 * This helps fix TypeScript errors with the Grid component in MUI v5+
 */
const GridItem = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className,
  sx,
}: GridItemProps) => {
  // Create a props object with only the properties that MUI Grid accepts
  const gridProps: any = {};

  // Add grid properties
  if (xs !== undefined) gridProps.xs = xs;
  if (sm !== undefined) gridProps.sm = sm;
  if (md !== undefined) gridProps.md = md;
  if (lg !== undefined) gridProps.lg = lg;
  if (xl !== undefined) gridProps.xl = xl;
  if (className) gridProps.className = className;
  if (sx) gridProps.sx = sx;

  return (
    <Grid item {...gridProps}>
      {children}
    </Grid>
  );
};

export default GridItem;
