import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthorizationService } from '../../../services/authorization.service';
import { Feature, FeatureCollection } from '../models';
import { BehaviorSubject, Observable } from 'rxjs';

const layerPriority = [
  'building',
  'wing',
  'department',
  'room',
  'point'
];

function layerSort (a, b) {
  return layerPriority.indexOf(a.key) > layerPriority.indexOf(b.key) ? -1 : 1;
}

@Injectable()
export class MapService {
  options$: Observable<Partial<RequestOptions>>;
  layers$: Observable<any[]>
  features$: Observable<{ [id: string]: any }>
  map$: Observable<FeatureCollection>;

  building$: Observable<string>;

  constructor(private auth: AuthorizationService, private http: Http) {
    this.options$ = this.auth.requestOptions;
    this.map$ = Observable.of(null).withLatestFrom(this.options$)
      .switchMap(([_, options]) => this.http.get(`/api/user/features/buildings`, options).map(res => res.json()));

    this.features$ = this.options$.flatMap(options => this.http.get(`/api/user/features`, options).map(res => res.json()))
      .scan((obj, arr: Feature[]) => arr.reduce((a, feature) => ({ ...a, [ feature._id ] : feature }), obj), {}).shareReplay(1);
  }

  //getLayer(layerName) {
  //  let uri = `/api/user/buildings/0/layers/${ layerName }/features`;
  //  return this.options$.take(1).flatMap(options =>
  //    this.http.get(uri, options).map(res => res.json()));
  //}

  resolve() {
  }

}
