import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
//import { routerTransition } from '../../catalog/directives/router.animations';
import { Observable } from 'rxjs';
import { tree, stratify, hierarchy, HierarchyNode } from 'd3';
import { Point, Area } from '../models';

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
export class EnergyComponent implements OnInit {
  activeNode$: Observable<any>;
  activeNodeId$: Observable<string>;
  tree$: Observable<HierarchyNode<any>>;

  activeTreeView: string = 'features'; // | 'layers'

  activeBuilding$: Observable<any>;
  activeLayerKey$: Observable<string>;
  layers$: Observable<any>;
  layer: string;

  activeSide: boolean = false;
  activeContent: string = 'map'; // 'graph';

  constructor(private data: DataService) {
    let strat = stratify().id((d: any) => d._id).parentId((d: any) => d.parent || d.area);
    let t = tree().nodeSize([0, 1]);

    this.tree$ = Observable.combineLatest(this.data.areas$, this.data.points$).do(x => console.log('x', x))
      .filter(([a, p]) => a.length > 0)
      .map(([ areas, points ]) => {
        points = points.map(point => Object.assign({}, point, { type: 'point' }));
        let node = t(strat([...areas, ...points]));
        node.sort((a: any, b: any) => layerOrder.indexOf(a.data.type) < layerOrder.indexOf(b.data.type) ? -1 : 1);
        // "close" all but root node, children
        node.eachAfter(n => {
          if (n !== node
            && node.children.indexOf(n) == -1
            && n.children) {
            (<any>n)._children = n.children;
            delete n.children;
          }
        });
        return node;
      }).do(x => console.log('got tree', x));

    this.activeNode$ = this.data.activeNode$;
    this.activeNodeId$ = this.data.activeNodeId$;
    this.layers$ = this.data.map.layers$;
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

  toggleSide(active?) {
    this.activeSide = active != null ? active : !this.activeSide;
  }

  toggleActiveContent(activeContent?) {
    this.activeContent = activeContent != null ? activeContent : (this.activeContent == 'map' ? 'graph' : 'map');
  }
}
