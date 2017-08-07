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
  tree$: Observable<HierarchyNode<any>>;

  activeTreeView: string = 'features'; // | 'layers'
  activeTreeViewType: string = 'building'// | 'areas'; // | 'layers'

  activeBuilding$: Observable<any>;
  activeLayerKey$: Observable<string>;
  layers$: Observable<any>;
  map$: Observable<any>

  layerOverride$: Subject<string> = new Subject();
  layer$: Observable<string>;
  active$: Observable<Area|Point>;

  features$: Observable<FeatureCollection>;

  activeSide: boolean = false;
  activeContent: string = 'map'; // 'graph';

  constructor(public data: DataService) {
    let strat = stratify().id((d: any) => d._id).parentId((d: any) => d.parent || d.room);
    let t = tree().nodeSize([0, 1]);

    this.layers$ = data.layers$.map(arr => hierarchy({ children: arr.map(key => ({ name: key, key, _id: key })) }));
    this.active$ = data.active$;

    this.layer$ = Observable.merge(this.data.active$.map(d => d && d.type), this.layerOverride$)
      .distinctUntilChanged()
      .shareReplay(1);

    this.map$ = this.data.building$
      .flatMap(building => building == null ? Observable.of(null) : this.data.getMap(building))
      .shareReplay(1);

    this.features$ = Observable.combineLatest(this.data.building$, this.layer$)
      .flatMap(([ building, layer ]) => {
        let stuff$;
        if (layer == 'point') {
          stuff$ = this.data.points$;
        } else if (building && layer) {
          stuff$ = this.data.areas$.map(areas => areas.filter(area => area.type == layer));
        } else {
          stuff$ = this.data.buildings$.map(arr => arr.map(b => ({ ...b, type: 'building' })));
        }

        return stuff$.map((arr: (Point|Area)[]) => arr.map(({ feature, _id, type, data }) => {
          let properties = { ...feature.properties, id: _id, layer: 0, type, data };
          return { ...feature, properties };
        }));
      })
      .map(wrapCollection)

    this.tree$ = Observable.combineLatest(this.data.building$, this.data.buildings$)
      .switchMap(([ building, buildings]: [Area, Area[]]) => {
        return (building ? Observable.combineLatest(this.data.areas$, this.data.points$) : Observable.of([[], []])).map(([ areas, points ]) => {
          buildings = buildings.map(b => ({ ...b, parent: 'undefined' }));
          if (building) {
            let i = buildings.findIndex(b => b._id == building._id);
            if (i > -1) {
              buildings.splice(i, 1);
            }
          }
          let b = areas.find(a => a.type == 'building');
          if (b) {
            b.parent = 'undefined';
          }

          let node = t(strat(buildings.concat(areas).concat([{ _id: 'undefined' } as Area])));
          node.each(n => n.y-=1);
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

  setActiveLayer(layer: { key: string, name: string }) {
    let key = layer && layer.key;
    if (key) {
      this.layerOverride$.next(key);
    }
  }

  setActive(area: Area|Point) {
    if (area) {
      let id = area._id;
      if (area.type == 'building') {
        this.data.setBuilding(id);
      } else {
        this.data.setActive(id);
      }
    } else {
      this.data.setActive(null);
    }
  }
}

function wrapCollection(features: Feature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
}
