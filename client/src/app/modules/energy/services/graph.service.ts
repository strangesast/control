import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthorizationService } from '../../../services/authorization.service';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable()
export class GraphService {
  options$: Observable<Partial<RequestOptions>>;

  data$: Observable<any[]>;
  point$: BehaviorSubject<any>;

  constructor(private auth: AuthorizationService, private http: Http) {
    this.options$ = this.auth.requestOptions;
    this.point$ = new BehaviorSubject(null);
    this.data$ = this.point$.withLatestFrom(this.options$).switchMap(([point, options]) => {
      if (!point) return Observable.of([]);
      return this.http.get(`/api/user/points/${ point }`, options).map(res => res.json());
    });
  }

  getData(point) {
    this.point$.next(point);
  }

}
