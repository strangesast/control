export interface Point {
  _id?: string;
  name: string;
  type: string;
  value: string;
  building: string;
  feature: Feature;
  room: string;
  data: { time: any, last: number };
}

export interface Area {
  _id?: string;
  name: string;
  shortname: string;
  type: string; // area/ room
  parent?: string; // parent area id
  feature: Feature; // whats the geometric representation
  building: string; // id of building
  floor?: string; // id of floor
  data: { time: any, last: number };
}

export type Layer = string;
export type Layers = Layer[];

export interface FeatureCollection {
  type: string;
  crs: { type: string, properties: { name: string }};
  features: Feature[]
}

export interface Feature {
  _id: string;
  type: string;
  geometry: { type: string, coordinates: (number[])[] };
  properties: any;//{ layer: string, building: string, area?: string, point?: string };
}
