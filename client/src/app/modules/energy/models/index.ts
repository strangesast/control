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
