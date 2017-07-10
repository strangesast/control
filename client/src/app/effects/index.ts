import { Http, RequestOptions, Headers } from '@angular/http';
import { Effect, Actions } from '@ngrx/effects';
import { LOGIN_REQUEST, LOGIN, LOGIN_FAILURE } from '../actions';

import { Observable } from 'rxjs';

export class AuthEffects {
  constructor(private actions$: Actions, private http: Http) {}

  readonly defaultOptions: Partial<RequestOptions> = { headers: new Headers({ 'Content-Type': 'application/json' }) };

  @Effect() login$ = this.actions$
    .ofType(LOGIN_REQUEST)
    .do((x) => console.log('effect', x))
    .map((action: any) => JSON.stringify(action.payload))
    .switchMap(payload => this.http.post('/api/login', payload, this.defaultOptions)
      .map(res => ({ type: LOGIN, payload: res.json()}))
      .catch((res) => Observable.of({ type: LOGIN_FAILURE, payload: res.json() }))
    );
}
