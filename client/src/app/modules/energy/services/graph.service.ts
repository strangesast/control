import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { AuthorizationService } from '../../../services/authorization.service';
import { Observable } from 'rxjs';


@Injectable()
export class GraphService {
  options$: Observable<Partial<RequestOptions>>;

  constructor(private auth: AuthorizationService, private http: Http) {
    this.options$ = this.auth.requestOptions;
  }

}
