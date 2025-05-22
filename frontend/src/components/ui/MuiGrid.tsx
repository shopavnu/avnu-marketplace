import React, { ReactNode } from "react";
import { Grid as MuiGrid, SxProps, Theme } from "@mui/material";

// This is a wrapper for MUI v5 Grid component to handle TypeScript errors
// In MUI v5, the Grid API has changed significantly from v4

interface GridProps {
  children: ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | "auto" | boolean;
  sm?: number | "auto" | boolean;
  md?: number | "auto" | boolean;
  lg?: number | "auto" | boolean;
  xl?: number | "auto" | boolean;
  spacing?: number;
  sx?: SxProps<Theme>;
  className?: string;
}

// In MUI v5, we need to use the new Grid v2 component
// This wrapper handles the transition from v4 to v5 syntax
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
  sx = {},
  className,
}: GridProps) => {
  // Create props object with correct MUI v5 syntax
  const gridProps: any = {
    sx: {
      ...sx,
    },
    className,
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

  return <MuiGrid {...gridProps}>{children}</MuiGrid>;
};

export const GridContainer = ({
  children,
  spacing = 2,
  sx = {},
  className,
  ...rest
}: Omit<GridProps, "container" | "item">) => {
  return (
    <Grid container spacing={spacing} sx={sx} className={className} {...rest}>
      {children}
    </Grid>
  );
};

export const GridItem = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  sx = {},
  className,
  ...rest
}: Omit<GridProps, "container" | "item">) => {
  return (
    <Grid
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={sx}
      className={className}
      {...rest}
    >
      {children}
    </Grid>
  );
};
