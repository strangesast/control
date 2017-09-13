import { trigger, transition, query, style } from '@angular/animations';

export const routerAnimations = trigger('routerAnimations', [
  transition('* => *', [
    query(':enter', []),
    query(':leave', [])
  ])
]);
