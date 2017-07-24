export interface Point {
  _id?: string;
  name: string;
  area?: string; // positioned in which area
  feature?: string; // position feature description
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
  features: { type: string, properties: any }[];
}

export interface Feature {
  _id: string;
  geometry: { type: string, coordinates: (number[])[] };
  properties: { layer: string, building: string, area?: string, point?: string };
}
