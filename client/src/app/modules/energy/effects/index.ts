import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import * as EnergyActions from '../actions';

@Injectable()
export class EnergyEffects {
  constructor(private authorization: AuthorizationService, private actions$: Actions, private http: Http) {
  }

  @Effect() init$ = this.actions$
    .ofType(EnergyActions.DataRegisterRequest.typeString)
    .map(toPayload)
    .withLatestFrom(this.authorization.requestOptions)
    .switchMap(([_, options]) => {
      return Observable.forkJoin(
        this.http.get('/api/user/points', options).map(res => res.json()),
        this.http.get('/api/user/areas', options).map(res => res.json())
      ).map(([ points, areas ]) => new EnergyActions.DataRegister({ points, areas }))
    });
}

export const effects = [ EnergyEffects ];
