import { trigger, state, animate, style, keyframes, transition } from '@angular/animations';

export function navigationTransition() {
  return movement();
}


const right = style({ transform: 'translate(100%, 0)', });
const left = style({ transform: 'translate(-100%, 0)', });
const center = style({ position: 'absolute', top: 0, width: '100%', transform: 'translate(0, 0)' });

function movement() {
  return trigger('navigationTransition', [
    state('*', center),
    transition('void => right', [
      right,
      animate('0.4s ease', center)
    ]),
    transition('void => left', [
      left,
      animate('0.4s ease', center)
    ]),
    transition('right => void', [
      animate('0.4s ease', right)
    ]),
    transition('left => void', [
      animate('0.4s ease', left)
    ])
  ]);
}
