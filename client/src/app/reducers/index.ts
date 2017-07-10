import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromApplications from './applications-reducer';
import * as fromAuth from './auth-reducer';

export interface State {
  auth: fromAuth.State,
  currentApplication: string,
  applications: fromApplications.State
}

export const initialState: State = {
  auth: fromAuth.initialState,
  currentApplication: null,
  applications: fromApplications.initialState
};

export const reducers = {
  auth: fromAuth.reducer,
  applications: fromApplications.reducer
};

export const selectAuth = createFeatureSelector<fromAuth.State>('auth');
export const selectAuthUser = createSelector(selectAuth, (state: fromAuth.State) => state.user);
