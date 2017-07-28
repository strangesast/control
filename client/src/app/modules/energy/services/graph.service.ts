import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthorizationService } from '../../../services/authorization.service';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable()
export class GraphService {
  options$: Observable<Partial<RequestOptions>>;

  data$: Observable<any[]>;
  point$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(private auth: AuthorizationService, private http: Http) {
    this.data$ = this.point$.switchMap(point => point ? this.auth.get(`/user/points/${ point }`) : Observable.of([]));
  }

  getData(point) {
    this.point$.next(point);
  }

}
