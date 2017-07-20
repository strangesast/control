import { Action } from '@ngrx/store';
import * as Models from '../models';

const DATA_REGISTER_REQUEST = '[ENERGY] DATA REGISTER REQUEST';
export class DataRegisterRequest implements Action {
  readonly type = DATA_REGISTER_REQUEST;
  static typeString = DATA_REGISTER_REQUEST;

  constructor(public payload?) {}
}

const DATA_DEREGISTER_REQUEST = '[ENERGY] DATA DEREGISTER REQUEST';
export class DataDeregisterRequest implements Action {
  readonly type = DATA_DEREGISTER_REQUEST;
  static typeString = DATA_DEREGISTER_REQUEST;

  constructor(public payload?) {}
}

const DATA_REGISTER = '[ENERGY] DATA REGISTER';
export class DataRegister implements Action {
  readonly type = DATA_REGISTER;
  static typeString = DATA_REGISTER;

  constructor(public payload: { points: Models.Point[], areas: Models.Area[] }) {}
}

const VIEW_SET_ACTIVE_NODE = '[ENERGY] VIEW SET ACTIVE NODE';
export class ViewSetActiveNode implements Action {
  readonly type = VIEW_SET_ACTIVE_NODE;
  static typeString = VIEW_SET_ACTIVE_NODE;

  constructor(public payload: string) {}
}

export type All = DataRegisterRequest
  | DataDeregisterRequest;
