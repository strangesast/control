export interface BasePoint {
  _id?: string;
  type: string;
  name: string;
  feature?: Feature;
}

export interface Point extends BasePoint {
  parent?: string;
}

export interface Sensor extends BasePoint {
  room: string;
}

export interface Area {
  _id?: string;
  name: string;
  category: string; // building/ department/ etc
  type: string; // area/ room
  parent?: string; // parent area id
  feature?: string; // whats the geometric representation
}

export interface Layer {
  name: string;
  key: string;
}

export interface FeatureCollection {
  type: string;
  crs: { type: string, properties: { name: string }};
  features: Feature[]
}

export interface Feature {
  _id: string;
  type: string;
  geometry: { type: string, coordinates: (number[])[] };
  properties: { layer: string, building: string, area?: string, point?: string };
}
