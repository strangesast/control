import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromApplications from './applications-reducer';
import * as fromAuth from './auth';
import { State as AuthState } from './auth';
export { State as AuthState } from './auth';

export interface State {
  auth: AuthState,
  applications: fromApplications.State
}

export const initialState: State = {
  auth: undefined,
  applications: undefined
};

export const reducers = {
  auth: fromAuth.reducer,
  applications: fromApplications.reducer
};

export const selectAuth = createFeatureSelector<fromAuth.State>('auth');
export const selectAuthUser         = createSelector(selectAuth, (state: fromAuth.State) => state.user);
export const selectAuthToken        = createSelector(selectAuth, (state: fromAuth.State) => state.token);
export const selectAuthErrors       = createSelector(selectAuth, (state: fromAuth.State) => state.errors);
export const selectAuthApplications = createSelector(selectAuth, (state: fromAuth.State) => state.applications);
export const selectAuthReady        = createSelector(selectAuth, (state: fromAuth.State) => state.ready);
