// Global type declarations for the project

// Component module declarations
declare module "*/components/admin/MetricCard" {
  import { ReactNode } from "react";

  export interface MetricCardProps {
    title: string;
    value: string;
    icon?: string | ReactNode;
    subtitle?: string;
    className?: string;
  }

  const MetricCard: React.FC<MetricCardProps>;
  export default MetricCard;
}

declare module "*/components/charts/MockChart" {
  export interface MockChartProps {
    type?: "bar" | "line" | "pie" | "radar" | "doughnut";
    height?: number | string;
    className?: string;
  }

  const MockChart: React.FC<MockChartProps>;
  export default MockChart;
}

// Material-UI Grid overrides
declare module "@mui/material/Grid" {
  import { ElementType, ReactNode } from "react";
  import { SxProps, Theme } from "@mui/material/styles";

  interface GridBaseProps {
    children?: ReactNode;
    sx?: SxProps<Theme>;
    container?: boolean;
    item?: boolean;
    spacing?: number | string;
    xs?: number | "auto" | boolean;
    sm?: number | "auto" | boolean;
    md?: number | "auto" | boolean;
    lg?: number | "auto" | boolean;
    xl?: number | "auto" | boolean;
  }

  interface GridTypeMap {
    props: GridBaseProps;
    defaultComponent: ElementType;
  }

  type GridProps = GridBaseProps & {
    component?: ElementType;
  };

  const Grid: React.ComponentType<GridProps>;
  export default Grid;
}
