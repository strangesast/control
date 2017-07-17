import * as Models from '../models';
import BaseAction from './base-action';

export const PREFIX = '[AUTH] ';
const LOGIN = PREFIX + 'LOGIN';
export class Login extends BaseAction {
  static typeString = LOGIN;
  readonly type = LOGIN;

  constructor(payload: Models.UserLoad, timestamp?) {
    super(payload, timestamp);
  }
}

const LOGOUT = PREFIX + 'LOGOUT';
export class Logout extends BaseAction {
  static typeString = LOGOUT;
  readonly type = LOGOUT;
}

const LOGIN_REQUEST = PREFIX + 'LOGIN REQUEST';
export class LoginRequest extends BaseAction {
  static typeString = LOGIN_REQUEST;
  readonly type = LOGIN_REQUEST;

  constructor(
    payload: {
      username: string,
      password: string
    },
    timestamp?) {
    super(payload, timestamp);
  }
}

const REGISTER_REQUEST = PREFIX + 'REGISTER REQUEST';
export class RegisterRequest extends BaseAction {
  static typeString = REGISTER_REQUEST;
  readonly type = REGISTER_REQUEST;

  constructor(payload: Partial<Models.User>, timestamp?) {
    super(payload, timestamp);
  }
}

const REGISTER = PREFIX + 'REGISTER';
export class Register extends BaseAction {
  static typeString = REGISTER;
  readonly type = REGISTER; 

  constructor(
    payload: {
      user: Models.User,
      token: string,
      applications: Models.Application[]
    },
    timestamp?) {
    super(payload, timestamp);
  }
}

const REGISTER_FAILURE = PREFIX + 'REGISTER FAILURE';
export class RegisterFailure extends BaseAction {
  static typeString = REGISTER_FAILURE;
  readonly type = REGISTER_FAILURE;
}

const LOGIN_FAILURE = PREFIX + 'LOGIN FAILURE';
export class LoginFailure extends BaseAction {
  static typeString = LOGIN_FAILURE;
  readonly type = LOGIN_FAILURE;
}

const LOGOUT_REQUEST = PREFIX + 'LOGOUT REQUEST';
export class LogoutRequest extends BaseAction {
  static typeString = LOGOUT_REQUEST;
  readonly type = LOGOUT_REQUEST;
}

const USER_LOAD_SUCCESS = PREFIX + 'USER LOAD SUCCESS';
export class UserLoadSuccess extends BaseAction {
  static typeString = USER_LOAD_SUCCESS;
  readonly type = USER_LOAD_SUCCESS;

  constructor (public payload: Models.UserLoad, timestamp?) {
    super(payload, timestamp);
  }
}

const USER_LOAD_FAILURE = PREFIX + 'USER LOAD FAILURE';
export class UserLoadFailure extends BaseAction {
  static typeString = USER_LOAD_FAILURE;
  readonly type = USER_LOAD_FAILURE;

  constructor (public payload, timestamp?) {
    super(payload, timestamp);
  }
}

const INIT = PREFIX + 'INIT';
export class Init extends BaseAction {
  static typeString = INIT;
  readonly type = INIT;
}

export type Actions =
    Login
  | Logout
  | RegisterRequest
  | Register
  | LoginRequest
  | LogoutRequest
  | LoginFailure
  | RegisterFailure
  | UserLoadSuccess
  | UserLoadFailure;
