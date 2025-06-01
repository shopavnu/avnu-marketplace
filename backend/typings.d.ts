// Global type definitions for GeoJSON
declare module 'geojson' {
  export interface GeoJsonObject {
    type: string;
    bbox?: number[];
    coordinates?: any[];
  }

  export interface Point extends GeoJsonObject {
    type: 'Point';
    coordinates: number[];
  }

  export interface LineString extends GeoJsonObject {
    type: 'LineString';
    coordinates: number[][];
  }

  export interface Polygon extends GeoJsonObject {
    type: 'Polygon';
    coordinates: number[][][];
  }

  export interface MultiPoint extends GeoJsonObject {
    type: 'MultiPoint';
    coordinates: number[][];
  }

  export interface MultiLineString extends GeoJsonObject {
    type: 'MultiLineString';
    coordinates: number[][][];
  }

  export interface MultiPolygon extends GeoJsonObject {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  }

  export interface GeometryCollection extends GeoJsonObject {
    type: 'GeometryCollection';
    geometries: GeoJsonObject[];
  }

  export interface Feature extends GeoJsonObject {
    type: 'Feature';
    geometry: GeoJsonObject;
    properties: any;
    id?: string | number;
  }

  export interface FeatureCollection extends GeoJsonObject {
    type: 'FeatureCollection';
    features: Feature[];
  }
}
