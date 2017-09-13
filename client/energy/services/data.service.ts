import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

import { AuthorizationService } from '../../app/services/authorization.service';
import * as Actions from '../actions';
import * as fromRoot from '../reducers';
import { FeatureCollection, Area, Point, Layer } from '../models';

@Injectable()
export class DataService {
  building$: Observable<Area>;
  points$: Observable<Point[]>;
  areas$: Observable<Area[]>;
  layers$: Observable<Layer[]>;
  active$: Observable<Area|Point>;

  buildings$: Observable<Area[]>
  areaCache = {};
  idCache = {};


  constructor(private auth: AuthorizationService, private store: Store<fromRoot.DataState>, private http: Http) {
    this.building$ = this.store.select(fromRoot.selectDataBuilding);
    this.points$ = this.store.select(fromRoot.selectDataPoints);
    this.areas$ = this.store.select(fromRoot.selectDataAreas);
    this.layers$ = this.store.select(fromRoot.selectDataLayers);
    this.active$ = this.store.select(fromRoot.selectDataActive);
    //this.activeLayerKey$ = this.store.select(fromRoot.selectViewActiveLayer);

    // refresh buildings whenever building is unset
    this.buildings$ = this.getBuildings().shareReplay(1);

    //this.activeNode$ = this.activeNodeId$.withLatestFrom(this.points$, this.areas$).map(([id, points, areas]) => {
    //  for (let point of points) {
    //    if (point._id == id) return point;
    //  }
    //  for (let area of areas) {
    //    if (area._id == id) return area;
    //  }
    //  return null;
    //});
  }

  setActiveLayer(key: string) {
  }

  setBuilding(id: string) {
    this.store.dispatch(new Actions.DataRegisterRequest(id));
  }

  setActive(id: string) {
    this.store.dispatch(new Actions.DataSetActive(id));
  }

  unsetBuilding() {
    this.store.dispatch(new Actions.DataDeregisterRequest());
  }

  getIdFromFeatureId(featId) {
    return this.areas$.first().map(areas => {
      return areas.find(({ feature }) => feature == featId);
    });
  }

  getBuildings(): Observable<Area[]> {
    return this.auth.get(`/buildings`);
  }

  getMap(building): Observable<FeatureCollection> {
    return this.auth.get(`/assets/floorplans/${ building.shortname }_floorplan.geojson`, null, false);
  }

  cacheOrGet(many, building, floor, layer): Observable<Area[]> {
    let key = [building, layer, floor, many].map(k => JSON.stringify(k)).join('-');
    let cached = this.idCache[key];
    if (cached) {
      return Observable.of(cached.map(id => this.areaCache[id]));
    }
    let qp = new URLSearchParams();
    if (many != 'floors') {
      qp.set('floor', floor);
    }
    if (many != 'layers') {
      qp.set('layer', layer);
    }

    return this.auth.get(`/buildings/${ building }/areas`, { search: qp }).map(areas => {
      this.idCache[key] = areas.map(area => {
        let id = area._id;
        this.areaCache[id] = area;
        return id;
      });
      return areas;
    });
  }
}
