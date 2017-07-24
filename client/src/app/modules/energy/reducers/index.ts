import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as Actions from '../actions';
import { Area, Point, Layer } from '../models';

export interface DataState {
  points: Point[];
  areas: Area[];
  layers: Layer[];
}

export const initialDataState: DataState = {
  points: [],
  areas: [],
  layers: []
};

export function dataReducer(state: DataState = initialDataState, action: Actions.All): DataState {
  let { type, payload } = action;

  switch (type) {
    case Actions.DataRegister.typeString:
      let { points, areas, layers } = payload;
      return { points, areas, layers };
  }

  return state;
}

export interface ViewState {
  activeNode: string;
  activeLayer: string;
}

export const initialViewState: ViewState = {
  activeNode: null,
  activeLayer: null
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
export const selectDataLayers = createSelector(selectRoot, (state: EnergyState) => state.data.layers);

export const selectView = createSelector(selectRoot, (state) => state.view);
export const selectViewActiveNode = createSelector(selectView, (state: ViewState) => state.activeNode);
export const selectViewActiveLayer = createSelector(selectView, (state: ViewState) => state.activeLayer);
