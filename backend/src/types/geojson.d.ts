// Reference the existing @types/geojson package
/// <reference types="geojson" />

// Re-export GeoJSON types to make them available in this project
declare module 'geojson' {
  export * from '@types/geojson';
}
