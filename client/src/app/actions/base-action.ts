import { Action } from '@ngrx/store';

class BaseAction implements Action {
  readonly type: string;

  constructor(public payload?, public timestamp: number = Date.now()) {}
}

export default BaseAction;
