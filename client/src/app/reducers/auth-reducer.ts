import * as Actions from '../actions';
import * as Models from '../models';

export interface State {
  user: Models.User;
  token: string;
}

export const initialState: State = {
  user: null,
  token: null
};

export function reducer (state: State = initialState, action: Actions.AuthAction) {
  let { type, payload } = action;

  switch (type) {
    case Actions.LOGIN:
      let { user, token } = payload;
      return { ...state, user, token };

    case Actions.LOGOUT:
      return { ...state, user: null, token: null };

    default:
      return state;
  }
}
