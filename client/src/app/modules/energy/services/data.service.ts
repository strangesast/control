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

  activeNodeId$: Observable<string>;
  activeNode$: Observable<any>;

  constructor(private authorization: AuthorizationService, private store: Store<DataState>, private http: Http) {
    this.points$ = this.store.select(fromRoot.selectDataPoints);
    this.areas$ = this.store.select(fromRoot.selectDataAreas);
    this.activeNodeId$ = this.store.select(fromRoot.selectViewActiveNode);
    this.activeNode$ = this.activeNodeId$.withLatestFrom(this.points$, this.areas$).map(([id, points, areas]) => {
      for (let point of points) {
        if (point._id == id) return point;
      }
      for (let area of areas) {
        if (area._id == id) return area;
      }
      return null;
    });
  }

  setActiveNode(id: string) {
    console.log('setting', id);
    this.store.dispatch(new Actions.ViewSetActiveNode(id));
  }

  init() {
    this.store.dispatch(new Actions.DataRegisterRequest());
  }

  uninit() {
    this.store.dispatch(new Actions.DataDeregisterRequest());
  }

  getIdFromFeatureId(featId) {
    return this.areas$.first().map(areas => {
      return areas.find(({ feature }) => feature == featId);
    });
  }

}
