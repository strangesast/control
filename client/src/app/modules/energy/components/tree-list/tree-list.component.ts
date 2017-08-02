import { SimpleChanges, ElementRef, Input, Output, Component, OnChanges, EventEmitter } from '@angular/core';
import { hierarchy, HierarchyNode } from 'd3';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.less']
})
export class TreeListComponent implements OnChanges {
  @Input() active: any;
  activeNode: HierarchyNode<any>;
  @Input('include-root') includeRoot: boolean = true;
  @Output() activeChange = new EventEmitter();

  treeValue: HierarchyNode<any>;
  @Input()
  get tree(): HierarchyNode<any> {
    return this.treeValue;
  }

  set tree(tree) {
    this.treeValue = tree;
    this.calculateTreeList();
  }
  treeList: HierarchyNode<any>[] = []

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.treeValue) {
      if (changes.active && changes.active.currentValue && (!changes.active.previousValue || changes.active.currentValue._id !== changes.active.previousValue._id)) {
        let id = changes.active.currentValue._id;
        let n = searchTree(this.treeValue, id)
        if (n) {
          this.activeNode = n;
          for (let pn of n.ancestors()) {
            if (pn != n && pn._children) {
              pn.children = pn._children;
              delete pn._children;
            }
          }
          this.calculateTreeList();
          //let childEl = this.el.nativeElement.querySelector(`[data-id="${ id }"]`);
          //if (childEl) {
          //  childEl.scrollIntoView();
          //}
        }
      }
    }
  }

  selectNode(node) {
    this.activeNode = node;
    this.activeChange.emit(node.data);
  }

  toggleOpen(node, recalculate=true) {
    if (node.children) {
      node._children = node.children;
      delete node.children;
    } else if (node._children) {
      node.children = node._children;
      delete node._children;
    }
    if (recalculate) {
      this.calculateTreeList();
    }
  }

  calculateTreeList() {
    if (this.treeValue instanceof hierarchy) {
      this.treeList = getDescendants(this.treeValue, this.includeRoot);
    } else {
      this.treeList = [];
    }
  }

  classFromType(type, active) {
    return (type == 'building' ? 'fa-building' : type == 'point' ? 'fa-circle' : 'fa-folder') + (active ? '' : '-o');
  }
}

function getDescendants(node, includeRoot=true) {
  let descendants = [];
  node.eachBefore(n => {
    if (!includeRoot && n === node) {
    } else {
      descendants.push(n);
    }
  })
  return descendants;
}

function searchTree(tree, id) {
  let children;
  if (tree.data && tree.data && tree.data._id == id) {
    return tree;
  } else if (children = (tree.children || tree._children)) {
    for (let child of children) {
      let res = searchTree(child, id);
      if (res) {
        return res;
      }
    }
  }
  return null;
}
