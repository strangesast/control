import * as Actions from '../actions';
import * as Models from '../models';

export interface State {
  [id:string]: Models.Application
}

export const initialState: State = {};

export function reducer (state: State = initialState, action: Actions.All): State {
  let { type, payload } = action;
  switch (type) {
    default:
      return state;
  }
}
