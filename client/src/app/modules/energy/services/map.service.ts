import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthorizationService } from '../../../services/authorization.service';
import { Observable } from 'rxjs';

const layerPriority = [
  'building',
  'wing',
  'department',
  'room',
  'point'
];

function layerSort (a, b) {
  return layerPriority.indexOf(a) > layerPriority.indexOf(b) ? -1 : 1;
}

@Injectable()
export class MapService {
  options$: Observable<Partial<RequestOptions>>;
  layers$: Observable<any[]>

  constructor(private auth: AuthorizationService, private http: Http) {
    this.options$ = this.auth.requestOptions;
    this.layers$ = this.options$.take(1).flatMap(options =>
      this.http.get('/api/user/layers', options).map(res => res.json().sort(layerSort)));
  }

  getLayer(layerName) {
    return this.options$.take(1).flatMap(options => this.http.get(`/api/user/layers/${ layerName }`, options).map(res => res.json()));
  }

  resolve() {
  }

}
