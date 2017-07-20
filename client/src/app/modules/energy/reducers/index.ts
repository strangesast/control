import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as Actions from '../actions';
import { Area, Point } from '../models';

export interface DataState {
  points: Point[];
  areas: Area[];
}

export const initialDataState: DataState = {
  points: [],
  areas: []
};

export function dataReducer(state: DataState = initialDataState, action: Actions.All): DataState {
  let { type, payload } = action;

  switch (type) {
    case Actions.DataRegister.typeString:
      let { points, areas } = payload;
      return { points, areas };
  }

  return state;
}

export interface ViewState {
  activeNode: string;
}

export const initialViewState: ViewState = {
  activeNode: null
}

export function viewReducer(state: ViewState = initialViewState, action: Actions.All): ViewState {
  let { type, payload } = action;
  switch (type) {
    case Actions.ViewSetActiveNode.typeString:
      return { ...state, activeNode: payload };
  }

  return state;
}

export interface EnergyState {
  data: DataState;
  view: ViewState;
}

export const reducers = {
  data: dataReducer,
  view: viewReducer
}


export const selectRoot = createFeatureSelector<EnergyState>('energy');
export const selectDataPoints = createSelector(selectRoot, (state: EnergyState) => state.data.points);
export const selectDataAreas = createSelector(selectRoot, (state: EnergyState) => state.data.areas);

export const selectView = createSelector(selectRoot, (state) => state.view);
export const selectViewActiveNode = createSelector(selectView, (state: ViewState) => state.activeNode);
