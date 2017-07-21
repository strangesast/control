import { SimpleChanges, ElementRef, Input, Output, Component, OnChanges, EventEmitter } from '@angular/core';
import { hierarchy, HierarchyNode } from 'd3';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.less']
})
export class TreeListComponent implements OnChanges {
  @Input()
  activeNode: HierarchyNode
  @Output() activeNodeChange = new EventEmitter();

  treeValue;
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
    if (changes.activeNode) {
      let node = changes.activeNode.currentValue;
      if (node instanceof hierarchy) {
        let childEl = this.el.nativeElement.querySelector(`[data-id="${ node.data._id }"]`);
        childEl.scrollIntoView();
      }
    }
  }

  selectNode(node) {
    this.activeNode = node;
    this.activeNodeChange.emit(node);
  }

  toggleOpen(node) {
    if (node.children) {
      node._children = node.children;
      delete node.children;
    } else if (node._children) {
      node.children = node._children;
      delete node._children;
    }
    this.calculateTreeList();
  }

  calculateTreeList() {
    if (this.treeValue instanceof hierarchy) {
      this.treeList = getDescendants(this.treeValue)
    } else {
      this.treeList = [];
    }
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
