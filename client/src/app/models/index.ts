export * from './application';

export interface User {
  _id: string,
  name: string,
  username: string,
  password?: string,
  groups?: string[],
  applications?: string[],
  defaultApplication?: string
}
