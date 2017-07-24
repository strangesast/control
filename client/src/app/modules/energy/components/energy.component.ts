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

  activeTreeView: string = 'features'; // | 'layers'

  activeBuilding$: Observable<any>;
  activeLayerKey$: Observable<string>;
  layers$: Observable<any>;

  constructor(private data: DataService) {
    let strat = stratify().id(d => d._id).parentId(d => d.parent || d.area);
    let t = tree().nodeSize([0, 1]);

    this.tree$ = Observable.combineLatest(this.data.areas$, this.data.points$)
      .filter(([a, p]) => a.length > 0)
      .map(([ areas, points ]) => {
        points = points.map(point => Object.assign({}, point, { type: 'point' }));
        let node = t(strat([...areas, ...points]));
        // "close" all but root node, children
        node.eachAfter(n => {
          if (n !== node
            && node.children.indexOf(n) == -1
            && n.children) {
            n._children = n.children;
            delete n.children;
          }
        });
        return node;
      });

    this.activeNode$ = this.data.activeNode$;
    this.activeNodeId$ = this.data.activeNodeId$;
    this.layers$ = this.data.layers$;
  }

  setActiveNode(nodeId: string) {
    this.data.setActiveNode(nodeId);
  }

  ngOnInit() {
    this.data.init();
  }

  ngOnDestroy() {
    this.data.uninit();
  }
}
