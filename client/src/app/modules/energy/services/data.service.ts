import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import * as Actions from '../actions';
import { DataState } from '../reducers';
import * as fromRoot from '../reducers';
import { Area, Point } from '../models';

@Injectable()
export class DataService {
  points$: Observable<Point[]>;
  areas$: Observable<Area[]>;

  activeNode$: Observable<string>;

  constructor(private authorization: AuthorizationService, private store: Store<DataState>, private http: Http) {
    this.points$ = this.store.select(fromRoot.selectDataPoints);
    this.areas$ = this.store.select(fromRoot.selectDataAreas);
    this.activeNode$ = this.store.select(fromRoot.selectViewActiveNode).do(x => console.log('got active'));
  }

  setActiveNode(id: string) {
    this.store.dispatch(new Actions.ViewSetActiveNode(id));
  }

  init() {
    this.store.dispatch(new Actions.DataRegisterRequest());
  }

  uninit() {
    this.store.dispatch(new Actions.DataDeregisterRequest());
  }

}
