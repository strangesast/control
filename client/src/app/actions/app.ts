import * as Models from '../models';
import BaseAction from './base-action';

export const AUTH_PREFIX = '[AUTH] ';
const LOGIN = AUTH_PREFIX + 'LOGIN';
export class Login extends BaseAction {
  static typeString = LOGIN;
  readonly type = LOGIN;

  constructor(payload: Models.UserLoad, timestamp?) {
    super(payload, timestamp);
  }
}

const LOGOUT = AUTH_PREFIX + 'LOGOUT';
export class Logout extends BaseAction {
  static typeString = LOGOUT;
  readonly type = LOGOUT;
}

const LOGIN_REQUEST = AUTH_PREFIX + 'LOGIN REQUEST';
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

const REGISTER_REQUEST = AUTH_PREFIX + 'REGISTER REQUEST';
export class RegisterRequest extends BaseAction {
  static typeString = REGISTER_REQUEST;
  readonly type = REGISTER_REQUEST;

  constructor(payload: Partial<Models.User>, timestamp?) {
    super(payload, timestamp);
  }
}

const REGISTER = AUTH_PREFIX + 'REGISTER';
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

const REGISTER_FAILURE = AUTH_PREFIX + 'REGISTER FAILURE';
export class RegisterFailure extends BaseAction {
  static typeString = REGISTER_FAILURE;
  readonly type = REGISTER_FAILURE;
}

const LOGIN_FAILURE = AUTH_PREFIX + 'LOGIN FAILURE';
export class LoginFailure extends BaseAction {
  static typeString = LOGIN_FAILURE;
  readonly type = LOGIN_FAILURE;
}

const LOGOUT_REQUEST = AUTH_PREFIX + 'LOGOUT REQUEST';
export class LogoutRequest extends BaseAction {
  static typeString = LOGOUT_REQUEST;
  readonly type = LOGOUT_REQUEST;
}

const USER_LOAD_SUCCESS = AUTH_PREFIX + 'USER LOAD SUCCESS';
export class UserLoadSuccess extends BaseAction {
  static typeString = USER_LOAD_SUCCESS;
  readonly type = USER_LOAD_SUCCESS;

  constructor (public payload: Models.UserLoad, timestamp?) {
    super(payload, timestamp);
  }
}

const USER_LOAD_FAILURE = AUTH_PREFIX + 'USER LOAD FAILURE';
export class UserLoadFailure extends BaseAction {
  static typeString = USER_LOAD_FAILURE;
  readonly type = USER_LOAD_FAILURE;

  constructor (public payload, timestamp?) {
    super(payload, timestamp);
  }
}

const INIT = AUTH_PREFIX + 'INIT';
export class Init extends BaseAction {
  static typeString = INIT;
  readonly type = INIT;
}

const LOAD_APPLICATIONS = AUTH_PREFIX + 'LOAD APPLICATIONS';
export class LoadApplications extends BaseAction {
  static typeString = LOAD_APPLICATIONS;
  readonly type = LOAD_APPLICATIONS;
}

const LOAD_APPLICATIONS_SUCCESS = AUTH_PREFIX + 'LOAD APPLICATIONS SUCCESS';
export class LoadApplicationsSuccess extends BaseAction {
  static typeString = LOAD_APPLICATIONS_SUCCESS;
  readonly type = LOAD_APPLICATIONS_SUCCESS;

  constructor(payload: Models.Application[], timestamp?) {
    super(payload, timestamp);
  }
}

const LOAD_APPLICATIONS_FAILURE = AUTH_PREFIX + 'LOAD APPLICATIONS FAILURE';
export class LoadApplicationsFailure extends BaseAction {
  static typeString = LOAD_APPLICATIONS_FAILURE;
  readonly type = LOAD_APPLICATIONS_FAILURE;
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
  | UserLoadFailure
  | LoadApplications;
