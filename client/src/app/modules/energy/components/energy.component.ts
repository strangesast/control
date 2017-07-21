import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
//import { routerTransition } from '../../catalog/directives/router.animations';
import { Observable } from 'rxjs';
import { tree, stratify, hierarchy, HierarchyNode } from 'd3';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less'],
  //animations: [routerTransition()]
})
export class EnergyComponent implements OnInit {
  activeNode$: Observable<any>;
  activeNodeId$: Observable<string>;
  tree$: Observable<HierarchyNode>;

  constructor(private data: DataService) {
    let strat = stratify().id(d => d._id).parentId(d => d.parent || d.area);
    let t = tree().nodeSize([0, 1]);

    this.tree$ = Observable.combineLatest(this.data.areas$, this.data.points$).debounceTime(200).switchMap(([ areas, points ]) => {
      if (areas.length) {
        let node = t(strat([...areas, ...points.map(point => Object.assign({}, point, { type: 'point' }))]));
        // "close" all but root node, children
        node.eachAfter(n => {
          if (n !== node
            && node.children.indexOf(n) == -1
            && n.children) {
            n._children = n.children;
            delete n.children;
          }
        });
        return Observable.of(node);

      } else {
        return Observable.never();
      }
    });

    this.activeNode$ = this.data.activeNode$.do(x => console.log('activeNode', x));
    this.activeNodeId$ = this.data.activeNodeId$;
  }

  setActiveNode(nodeId: string) {
    this.data.setActiveNode(nodeId);
  }

  setActiveNodeByFeature(featId) {
    console.log('setting by feat');
    return this.data.getIdFromFeatureId(featId).map(area => {
      console.log('got', area);
      this.data.setActiveNode(area._id);
    }).subscribe();
  }

  ngOnInit() {
    this.data.init();
  }

  ngOnDestroy() {
    this.data.uninit();
  }
}
