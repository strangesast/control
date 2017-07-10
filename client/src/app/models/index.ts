export interface Application {
  _id: string,
  name: string,
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
