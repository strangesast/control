import { trigger, state, animate, style, keyframes, transition } from '@angular/animations';

export function routerTransition() {
  return slideToLeft();
}

function slideToLeft() {
  return trigger('routerTransition', [
    state('void', style({
      position: 'fixed',
      width: '100%'
    })),
    state('*', style({
      position: 'fixed',
      width: '100%'
    })),
    transition(':enter', [
      style({ transform: 'scale(0.9) translate(111%, 5px)', 'box-shadow': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'}),
      animate('0.5s 0.5s ease', style({ transform: 'scale(0.9) translate(0%)' })),
      animate('0.4s ease', style({ transform: 'scale(1.0) translate(0%)', 'box-shadow': 'none'}))
    ]),
    transition(':leave', [
      style({ transform: 'scale(1.0) translate(0, 0)', 'box-shadow': 'none'}),
      animate('0.5s ease', style({ transform: 'scale(0.9) translate(0%)', 'box-shadow': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'})),
      animate('0.4s ease', style({ transform: 'scale(0.9) translate(-111%, 5px)'}))
    ]),
  ]);
}
