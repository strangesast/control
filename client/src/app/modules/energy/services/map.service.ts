import { Injectable } from '@angular/core';
import { AuthorizationService } from '../../../services/authorization.service';
import { BasePoint, Feature, FeatureCollection } from '../models';
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
  layers$: Observable<any[]>
  features$: Observable<{ [id: string]: BasePoint }>
  map$: Observable<FeatureCollection>;

  pointValues$;

  building$: Observable<string>;

  constructor(private auth: AuthorizationService) {
    // get all features
    // on element select, orient to that feature, doubleclick to go down level, click outside to go up
    // depth:
    //   buildings overview
    //   building
    //   wings
    //   departments
    //   rooms
    let req = this.auth.get(`/features`).share();

    this.map$ = this.auth.get(`/assets/floorplan.geojson`, null, false).shareReplay(1);

    this.layers$ = req.map(({ layers }: { layers: string[] }) => layers);

    this.pointValues$ = this.auth.get(`/points`);

    this.features$ = req.map(({ features }: { features: BasePoint[] }) => features.reduce((a, obj) => ({ ...a, [obj._id]: obj }), {}))
      .shareReplay(1)
  }
}
