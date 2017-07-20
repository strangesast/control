import { ElementRef, Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { hierarchy, HierarchyNode } from 'd3';

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  styleUrls: ['./tree-list.component.less']
})
export class TreeListComponent implements OnInit {
  activeNodeValue = null;
  @Input()
  get activeNode() {
    return this.activeNodeValue;
  }
  @Output() activeNodeChange = new EventEmitter();

  set activeNode(node) {
    this.activeNodeValue = node;
    this.activeNodeChange.emit(node);
  }

  treeValue;
  @Input()
  get tree(): HierarchyNode {
    return this.treeValue;
  }

  set tree(tree) {
    console.log('tree', tree);
    this.treeValue = tree;
    if (tree instanceof hierarchy) {
      this.treeList = getDescendants(tree)
      console.log('tree', this.treeList);
    } else {
      this.treeList = [];
    }
  }
  treeList: HierarchyNode[] = []

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  selectNode(node, scrollTo=true) {
    this.activeNode = node;
    if (scrollTo) {
      let childEl = this.el.nativeElement.querySelector(`[data-id="${ node.data._id }"]`);
      childEl.scrollIntoView();
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
