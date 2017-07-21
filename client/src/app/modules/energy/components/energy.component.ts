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
  activeNode$: Observable<HierarchyNode>;
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

    this.activeNode$ = this.data.activeNode$.withLatestFrom(this.tree$).map(([ id, tree ]) => {
      let activeNode;
      if (tree) {
        tree.each(n => {
          if (n.data._id == id) {
            activeNode = n;
          }
        });
      }
      return activeNode;
    });
  }

  setActiveNode(node) {
    this.data.setActiveNode(node.data._id);
  }

  ngOnInit() {
    this.data.init();
  }

  ngOnDestroy() {
    this.data.uninit();
  }
}
