import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromApplications from './applications-reducer';
import * as fromAuth from './auth-reducer';

export interface State {
  auth: fromAuth.State,
  currentApplication: string,
  applications: fromApplications.State
}

export const initialState: State = {
  auth: undefined,
  currentApplication: null,
  applications: undefined
};

export function debug(reducer) {
  return function (state, action) {
    console.log('action', action);

    return reducer(state, action);
  }
}

export const reducers = {
  auth: fromAuth.reducer,
  applications: fromApplications.reducer
};

export const selectAuth = createFeatureSelector<fromAuth.State>('auth');
export const selectAuthUser         = createSelector(selectAuth, (state: fromAuth.State) => state.user);
export const selectAuthToken        = createSelector(selectAuth, (state: fromAuth.State) => state.token);
export const selectAuthErrors       = createSelector(selectAuth, (state: fromAuth.State) => state.errors);
export const selectAuthApplications = createSelector(selectAuth, (state: fromAuth.State) => state.applications);
