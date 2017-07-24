import { SimpleChanges, ElementRef, Input, Output, Component, OnChanges, EventEmitter } from '@angular/core';
import { hierarchy, HierarchyNode } from 'd3';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.less']
})
export class TreeListComponent implements OnChanges {
  activeNodeIdSet: string;
  activeNode: HierarchyNode;

  @Input('active')
  activeNodeId: string;
  @Output() activeNodeChange = new EventEmitter();

  treeValue: HierarchyNode;
  @Input()
  get tree(): HierarchyNode {
    return this.treeValue;
  }

  set tree(tree) {
    this.treeValue = tree;
    this.calculateTreeList();
  }
  treeList: HierarchyNode[] = []

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.treeValue) {
      if (changes.activeNodeId) {
        let id = changes.activeNodeId.currentValue;
        if (id !== this.activeNodeIdSet) {
          let n = searchTree(this.treeValue, id)
          if (n) {
            for (let pn of n.ancestors()) {
              if (pn != n && pn._children) {
                pn.children = pn._children;
                delete pn._children;
              }
            }
            this.calculateTreeList();
            let childEl = this.el.nativeElement.querySelector(`[data-id="${ id }"]`);
            if (childEl) {
              childEl.scrollIntoView();
            }
            this.activeNode = n;
          }
        }
      }
    }
  }

  selectNode(node) {
    this.activeNode = node;
    this.activeNodeIdSet = node.data._id;
    this.activeNodeChange.emit(node.data._id);
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
      this.treeList = getDescendants(this.treeValue)
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
