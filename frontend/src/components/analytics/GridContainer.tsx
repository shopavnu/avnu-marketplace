import React, { ReactNode } from "react";
import { Grid } from "@mui/material";

interface GridContainerProps {
  children: ReactNode;
  spacing?: number;
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  className?: string;
  sx?: any;
}

/**
 * A wrapper component for Material UI Grid that correctly applies the 'container' prop
 * This helps fix TypeScript errors with the Grid component in MUI v5+
 */
const GridContainer = ({
  children,
  spacing = 3,
  justifyContent,
  alignItems,
  direction,
  wrap,
  className,
  sx,
}: GridContainerProps) => {
  // Create a props object with only the properties that MUI Grid accepts
  const gridProps: any = { spacing };

  // Add grid properties
  if (justifyContent) gridProps.justifyContent = justifyContent;
  if (alignItems) gridProps.alignItems = alignItems;
  if (direction) gridProps.direction = direction;
  if (wrap) gridProps.wrap = wrap;
  if (className) gridProps.className = className;
  if (sx) gridProps.sx = sx;

  return (
    <Grid container {...gridProps}>
      {children}
    </Grid>
  );
};

export default GridContainer;
