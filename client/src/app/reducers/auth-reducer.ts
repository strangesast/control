import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as Actions from '../actions';
import * as Models from '../models';

export interface State {
  user: Models.User;
  token: string;
  errors: any[];
  applications: Models.Application[];
}

export const initialState: State = {
  user: null,
  token: null,
  applications: [],
  errors: []
};

export function reducer (state: State = initialState, action: Actions.Auth.All) {
  let { type, payload } = action;

  switch (type) {
    case Actions.Auth.LOGIN:
      let { user, token, applications } = payload;
      console.log(applications);
      return { user, token, errors: [], applications };

    case Actions.Auth.LOGOUT:
      return { user: null, token: null, errors: [], applications: [] };

    case Actions.Auth.REGISTER_FAILURE:
    case Actions.Auth.LOGIN_FAILURE:
      return { user: null, token: null, errors: payload, applications: [] };

    default:
      return state;
  }
}
