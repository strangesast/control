export interface Application {
  _id: string,
  name: string,
  // used for loadChildren
  modulePath: string,
  // used for url path
  path: string;
  // used to subscribe to / modify values
  data: { [id: string]: any }
}

export interface User {
  _id: string,
  name: string,
  username: string,
  password?: string,
  groups?: string[],
  applications?: string[],
  defaultApplication?: string
}
