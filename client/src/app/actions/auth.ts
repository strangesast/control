import * as Models from '../models';
import BaseAction from './base-action';

export const LOGIN         = '[Auth] LOGIN';
export const LOGIN_REQUEST = '[Auth] LOGIN REQUEST';
export const LOGIN_FAILURE = '[Auth] LOGIN FAILURE';

export const LOGOUT         = '[Auth] LOGOUT';
export const LOGOUT_REQUEST = '[Auth] LOGOUT REQUEST';

export const REGISTER         = '[Auth] REGISTER';
export const REGISTER_REQUEST = '[Auth] REGISTER REQUEST';
export const REGISTER_FAILURE = '[Auth] REGISTER FAILURE';

export class Login extends BaseAction {
  readonly type = LOGIN;

  constructor(payload: { user: Models.User, token: string, applications: Models.Application[] }, timestamp?) {
    super(payload, timestamp);
  }
}

export class Logout extends BaseAction {
  readonly type = LOGOUT;
}

export class LoginRequest extends BaseAction {
  readonly type = LOGIN_REQUEST;

  constructor(payload: { username: string, password: string }, timestamp?) {
    super(payload, timestamp);
  }
}

export class RegisterRequest extends BaseAction {
  readonly type = REGISTER_REQUEST;

  constructor(payload: Partial<Models.User>, timestamp?) {
    super(payload, timestamp);
  }
}

export class Register extends BaseAction {
  readonly type = REGISTER;

  constructor(payload: { user: Models.User, token: string, applications: Models.Application[] }, timestamp?) {
    super(payload, timestamp);
  }
}

export class RegisterFailure extends BaseAction {
  readonly type = REGISTER_FAILURE;
}

export class LoginFailure extends BaseAction {
  readonly type = LOGIN_FAILURE;
}

export class LogoutRequest extends BaseAction {
  readonly type = LOGOUT_REQUEST;
}

export type All =
    Login
  | Logout
  | RegisterRequest
  | Register
  | LoginRequest
  | LogoutRequest
  | LoginFailure
  | RegisterFailure;
