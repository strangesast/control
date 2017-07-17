import { createSelector, createFeatureSelector } from '@ngrx/store';
import { User, Application } from '../models';
import * as AppActions from '../actions/app';

export interface ValidationError {
  code?: number;
  field: string;
  message: string;
}

export interface AuthState {
  user: User;
  token: string;
  errors: ValidationError[];
  applications: Application[];
}

export interface AppState {
  auth: AuthState,
  userInitialized: boolean; // has a user been loaded from localstorage
  appsInitialized: boolean; // have apps been requested
}

export interface State {
  app: AppState
}

export const initialState = {
  auth: {
    user: null,
    token: null,
    errors: [],
    applications: []
  },
  userInitialized: false,
  appsInitialized: false
}

export function appReducer (state: AppState = initialState, action: AppActions.Actions): AppState {
  let { type, payload } = action;

  switch (type) {
    case AppActions.UserLoadSuccess.typeString: {
      let payload = (action as AppActions.UserLoadSuccess).payload
      let { user, token, applications } = payload;
      console.log('from user load', applications);
      return {
        ...state,
        appsInitialized: applications && applications.length > 0,
        userInitialized: true,
        auth: { user, token, applications, errors: [] }
      };
    }

    case AppActions.LoadApplicationsSuccess.typeString: {
      let applications = (action as AppActions.LoadApplicationsSuccess).payload;
      return { ...state, appsInitialized: true, auth: { ...state.auth, applications }};
    }

    // reset state on requesting new credentials
    case AppActions.LoginRequest.typeString:
    case AppActions.RegisterRequest.typeString:
    case AppActions.Logout.typeString:
      return { ...state, auth: { user: null, token: null, errors: [], applications: [] }};

    // forego adding token until userloadsuccess
    case AppActions.Login.typeString:
      let { user, applications } = payload;
      return { ...state, auth: { user, token: null, errors: [], applications }};

    case AppActions.RegisterFailure.typeString:
    case AppActions.LoginFailure.typeString:
      return { ...state, auth: { user: null, token: null, errors: payload, applications: [] }};

    default:
      return state;
  }




}

export const reducers = {
  app: appReducer
};

export const selectApp = createFeatureSelector<AppState>('app');
export const selectAuth = createSelector(selectApp, (state: AppState) => state.auth);
export const selectAuthUser         = createSelector(selectAuth, (state: AuthState) => state.user);
export const selectAuthToken        = createSelector(selectAuth, (state: AuthState) => state.token);
export const selectAuthErrors       = createSelector(selectAuth, (state: AuthState) => state.errors);
export const selectAuthApplications = createSelector(selectAuth, (state: AuthState) => state.applications);
export const selectUserInit = createSelector(selectApp, (state: AppState) => state.userInitialized);
export const selectAppsInit = createSelector(selectApp, (state: AppState) => state.appsInitialized);
//export const selectAuthReady        = createSelector(selectAuth, (state: AuthState) => state.ready);
