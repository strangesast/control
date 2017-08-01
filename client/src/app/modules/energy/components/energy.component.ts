import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
//import { routerTransition } from '../../catalog/directives/router.animations';
import { Observable, Subject } from 'rxjs';
import { tree, stratify, hierarchy, HierarchyNode } from 'd3';
import { FeatureCollection, Feature, Area, Point } from '../models';

const layerOrder = ['building', 'wing', 'department', 'room', 'point'];

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less', './ful.less', './mid.less', './mob.less'],
  host: {
    '[class.side-active]': 'activeSide'
  }
  //animations: [routerTransition()]
})
export class EnergyComponent {
  tree$: Observable<HierarchyNode<Area|Point>>;

  activeTreeView: string = 'features'; // | 'layers'

  activeBuilding$: Observable<any>;
  activeLayerKey$: Observable<string>;
  layers$: Observable<any>;
  map$: Observable<any>

  layerOverride$: Subject<string> = new Subject();
  layer$: Observable<string>;

  features$: Observable<FeatureCollection>;

  activeSide: boolean = false;
  activeContent: string = 'map'; // 'graph';

  constructor(public data: DataService) {
    let strat = stratify().id((d: any) => d._id).parentId((d: any) => d.parent || d.room);
    let t = tree().nodeSize([0, 1]);

    this.layer$ = Observable.merge(this.data.active$.filter(d => d != null).map(d => d.type), this.layerOverride$).startWith(null).shareReplay(1).do(x => console.log('layer', x));

    this.map$ = this.data.building$.flatMap(building => {
      if (building == null) return Observable.of(null);
      return this.data.getMap(building);
    }).shareReplay(1);

    this.features$ = Observable.combineLatest(this.data.building$, this.layer$).flatMap(([ building, layer ]) => {
      console.log('building', building, 'layer', layer);
      if (building && layer) {
        return (layer == 'point' ? this.data.points$ : this.data.areas$.map(areas => areas.filter(area => area.type == layer)))
          .map((arr: (Point|Area)[]) => arr.map(d => ({ ...d.feature, properties: { ...d.feature.properties, id: d._id, layer: 0, type: d.type }})));

      } else {
        return this.data.buildings$.map(arr => arr.map(d => ({ ...d.feature, properties: { ...d.feature.properties, id: d._id, layer: 0, type: 'building' }})));
      }
    }).map(wrapCollection);

    this.tree$ = this.data.building$.switchMap((building: Area) => {
      if (building) {
        return Observable.combineLatest(this.data.areas$, this.data.points$).map(([ areas, points ]) => {
          let node = t(strat(areas));
          node.sort((a: any, b: any) =>
            layerOrder.indexOf(a.data.type) < layerOrder.indexOf(b.data.type) ? -1 : 1);
          // "close" all but root node, children
          node.eachAfter(n => {
            if (n !== node
              && node.children.indexOf(n) == -1
              && n.children) {
              (<any>n)._children = n.children;
              delete n.children;
            }
          });
          return node as HierarchyNode<any>;
        });
      } else {
        return this.data.buildings$.map(buildings => {
          return hierarchy(buildings);
        });
      }
    });
  }

  // side bar hidden / visible
  toggleSide(active?) {
    this.activeSide = active != null ? active : !this.activeSide;
  }

  // mobile active window
  toggleActiveContent(activeContent?) {
    this.activeContent = activeContent != null ? activeContent : (this.activeContent == 'map' ? 'graph' : 'map');
  }
}

function wrapCollection(features: Feature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
}
