import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import * as EnergyActions from '../actions';

@Injectable()
export class EnergyEffects {
  constructor(private auth: AuthorizationService, private actions$: Actions) {
  }

  @Effect() init$ = this.actions$
    .ofType(EnergyActions.DataRegisterRequest.typeString)
    .map(toPayload)
    .switchMap(() => Observable.forkJoin(
      this.auth.get('/points'),
      this.auth.get('/areas')
    ))
    .map(([ points, areas ]) =>
      new EnergyActions.DataRegister({ points, areas }));
}

export const effects = [ EnergyEffects ];
