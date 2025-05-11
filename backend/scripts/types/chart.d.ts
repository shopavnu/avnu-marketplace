declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any[];
  export function register(...items: any[]): void;

  export interface ChartConfiguration {
    type: string;
    data: ChartData;
    options?: ChartOptions;
  }

  export interface ChartData {
    labels?: (string | string[])[];
    datasets: ChartDataset[];
  }

  export interface ChartDataset {
    label?: string;
    data: (number | null | undefined)[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    [key: string]: any;
  }

  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      x?: { [key: string]: any };
      y?: { [key: string]: any };
    };
    plugins?: { [key: string]: any };
    [key: string]: any;
  }
}
