import { ViewContainerRef, Directive } from '@angular/core';

@Directive({
  selector: '[appGroup]'
})
export class GroupDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
