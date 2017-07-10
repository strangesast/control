import { Action } from '@ngrx/store';
import * as Models from '../models';

export const LOADED = '[Applications] LOAD';

export const LOGIN = '[Auth] LOGIN';
export const LOGOUT = '[Auth] LOGOUT';
export const LOGIN_REQUEST = '[Auth] LOGIN_REQUEST';
export const LOGIN_FAILURE = '[Auth] LOGIN_FAILURE';
export const LOGOUT_REQUEST = '[Auth] LOGOUT_REQUEST';
export const REGISTER_REQUEST = '[Auth] REGISTER_REQUEST';
export const REGISTER_FAILURE = '[Auth] REGISTER_FAILURE';
export const REGISTER = '[Auth] REGISTER';

class BaseAction implements Action {
  readonly type: string;

  constructor(public payload?, public timestamp: number = Date.now()) {}
}

export class Load extends BaseAction {
  readonly type = LOADED;
}

export class Login extends BaseAction {
  readonly type = LOGIN;
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
}

export class RegisterFailure extends BaseAction {
  readonly type = REGISTER_FAILURE;
}

export class LogoutRequest extends BaseAction {
  readonly type = LOGOUT_REQUEST;
}

export type All = Load;
export type AuthAction = Login
  | Logout
  | LoginRequest
  | LogoutRequest;
