import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
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
    .switchMap((id) => {
      return this.auth.get(`/buildings/${ id }`).flatMap(building => {
        if (!building) throw new Error('no building with that id');
        let params: URLSearchParams = new URLSearchParams();
        params.set('values', 'true');

        return Observable.forkJoin(
          this.auth.get(`/buildings/${ id }/points`, { search: params }),
          this.auth.get(`/buildings/${ id }/areas`, { search: params }),
          this.auth.get(`/buildings/${ id }/layers`, { search: params })
        ).map(a => [building, ...a]);
      });
    })
    .map(([ building, points, areas, layers ]) => console.log('layers', layers) ||
      new EnergyActions.DataRegister({ building, points, areas, layers }));
}

export const effects = [ EnergyEffects ];
