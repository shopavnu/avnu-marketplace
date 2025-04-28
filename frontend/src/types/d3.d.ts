// This file ensures TypeScript recognizes the d3 module
declare module 'd3' {
  // Selection
  export function select(selector: string | Element | null): any;
  export function selectAll(selector: string): any;
  
  // Scales
  export function scaleTime(): any;
  export function scaleLinear(): any;
  export function scaleOrdinal(): any;
  
  // Arrays
  export function max(array: any[], accessor?: (d: any) => number): number | undefined;
  export function extent(array: any[], accessor?: (d: any) => any): [any, any];
  
  // Shapes
  export function line(): any;
  export function area(): any;
  export const curveMonotoneX: any;
  export const curveBasis: any;
  
  // Axes
  export function axisBottom(scale: any): any;
  export function axisLeft(scale: any): any;
  export function axisRight(scale: any): any;
  export function axisTop(scale: any): any;
  
  // Time
  export const timeDay: any;
  export function timeFormat(specifier: string): (date: Date) => string;
  
  // Other utilities
  export function format(specifier: string): (n: number) => string;
  export function randomUniform(min: number, max: number): () => number;
}
