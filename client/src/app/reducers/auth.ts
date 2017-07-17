import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as AuthActions from '../actions/auth';
import * as Models from '../models';

export interface State {
  ready: boolean;
  user: Models.User;
  token: string;
  errors: any[];
  applications: Models.Application[];
}

export const initialState: State = {
  ready: false,
  user: null,
  token: null,
  applications: [],
  errors: []
};

export function reducer (state: State = initialState, action: AuthActions.Actions) {
  let { type, payload } = action;

  switch (type) {
    case AuthActions.UserLoadSuccess.typeString: {
      let payload = (action as AuthActions.UserLoadSuccess).payload
      let applications = payload.applications;
      let token = payload.token;
      let ready = Boolean(!token || (applications && applications.length));
      console.log('READY', ready);
      return { ...state, token, ready, applications };
    }

    // reset state on requesting new credentials
    case AuthActions.LoginRequest.typeString:
    case AuthActions.RegisterRequest.typeString:
    case AuthActions.Logout.typeString:
      return { user: null, token: null, errors: [], applications: [] };

    // forego adding token until userloadsuccess
    case AuthActions.Login.typeString:
      let { user, applications } = payload;
      return { user, errors: [], applications };

    case AuthActions.RegisterFailure.typeString:
    case AuthActions.LoginFailure.typeString:
      return { user: null, token: null, errors: payload, applications: [] };

    default:
      return state;
  }
}
