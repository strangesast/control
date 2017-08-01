import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as Actions from '../actions';
import { Area, Point, Layer } from '../models';

interface GenericAction {
  type: string;
  payload?: any;
}

export interface DataState {
  active: Point|Area,
  building: Area,
  points: Point[];
  areas: Area[];
  layers: Layer[];
}

export const initialDataState: DataState = {
  active: null,
  building: null,
  points: [],
  areas: [],
  layers: []
};

export function dataReducer(state: DataState = initialDataState, action: GenericAction): DataState {
  let { type, payload } = action;

  switch (type) {
    case Actions.DataRegister.typeString:
      let { points, areas, layers, building } = payload;
      return { building, points, areas, layers, active: null };
    case Actions.DataSetActive.typeString:
      let id = payload;
      let active: Point|Area = state.areas.find(a => a._id == id);
      if (!active) active = state.points.find(a => a._id == id);
      return { ...state, active };
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

export function viewReducer(state: ViewState = initialViewState, action: GenericAction): ViewState {
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
export const selectDataBuilding = createSelector(selectRoot, (state: EnergyState) => state.data.building);
export const selectDataPoints = createSelector(selectRoot, (state: EnergyState) => state.data.points);
export const selectDataAreas = createSelector(selectRoot, (state: EnergyState) => state.data.areas);
export const selectDataLayers = createSelector(selectRoot, (state: EnergyState) => state.data.layers);
export const selectDataActive = createSelector(selectRoot, (state: EnergyState) => state.data.active);

export const selectView = createSelector(selectRoot, (state) => state.view);
export const selectViewActiveNode = createSelector(selectView, (state: ViewState) => state.activeNode);
export const selectViewActiveLayer = createSelector(selectView, (state: ViewState) => state.activeLayer);
