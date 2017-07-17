import { Application } from './application';
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

export interface UserLoad {
  user: User;
  token: string;
  applications?: Application[];
}
