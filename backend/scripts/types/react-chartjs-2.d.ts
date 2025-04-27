declare module 'react-chartjs-2' {
  import { ChartConfiguration } from 'chart.js';
  import * as React from 'react';

  export interface ChartComponentProps extends Omit<ChartConfiguration, 'type'> {
    width?: number;
    height?: number;
    redraw?: boolean;
    fallbackContent?: React.ReactNode;
    [key: string]: any;
  }

  export class Line extends React.Component<ChartComponentProps> {}
  export class Bar extends React.Component<ChartComponentProps> {}
  export class Pie extends React.Component<ChartComponentProps> {}
  export class Doughnut extends React.Component<ChartComponentProps> {}
  export class Radar extends React.Component<ChartComponentProps> {}
  export class PolarArea extends React.Component<ChartComponentProps> {}
  export class Bubble extends React.Component<ChartComponentProps> {}
  export class Scatter extends React.Component<ChartComponentProps> {}
}
