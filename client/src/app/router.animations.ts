import { trigger, state, animate, style, keyframes, transition } from '@angular/animations';

export function routerTransition() {
  return slideToLeft();
}

const shadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
const right = style({ transform: 'scale(0.9) translate(111%, 5px)', 'box-shadow': shadow });
const left = style({ transform: 'scale(0.9) translate(-111%, 5px)', 'box-shadow': shadow });
const centerSmall = style({ transform: 'scale(0.9) translate(0%, 5px)', 'box-shadow': shadow });
const center = style({ position: 'absolute', width: '100%', transform: 'scale(1.0) translate(0, 0)' });

function slideToLeft() {
  return trigger('routerTransition', [
    state('void', style({
      position: 'absolute',
      width: '100%'
    })),
    //state('*', center),
    state('expanded', centerSmall),
    state('default', center),
    transition('default <=> expanded', animate('0.2s ease')),
    transition('expanded => void', [
      animate('0.4s ease', right)
    ]),
    transition('void => expanded', [
      left,
      animate('0.4s 0.2s ease', centerSmall)
    ]),
    transition('default => void', [
      animate('0.2s ease', centerSmall),
      animate('0.4s ease', right)
    ]),
    transition('void => default', [
      left,
      animate('0.4s 0.2s ease', centerSmall),
      animate('0.2s ease', center)
    ])

  ]);
}
