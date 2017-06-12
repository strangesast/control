import {
  Input,
  Output,
  OnInit,
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  ComponentFactoryResolver
} from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { Observable, Subject } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-thermostat-gauge',
  templateUrl: './thermostat-gauge.component.html',
  styleUrls: ['./thermostat-gauge.component.less']
})
export class ThermostatGaugeComponent extends GenericComponent implements OnInit {
  @ViewChild('graph') graphElement: ElementRef;


  @Input() min: number = 60;
  @Input() max: number = 85;
  @Input() label: string;

  //@Input() color: string = '#4279da';//'#5EA3F4';
  //@Input() color: string = '#5EA3F4';
  @Input() color: string = '#000';
  //@Input() backgroundColor: string = '#e1ecff';
  //@Input() backgroundColor: string = '#f6f9ff';
  @Input() backgroundColor: string = '#fff';

  // temperature
  @Input() temperature: number;

  // setPoint
  setPointValue: number;
  @Input() get setPoint() {
    return this.setPointValue;
  }
  @Output() setPointChange: EventEmitter<number> = new EventEmitter();
  set setPoint(setPoint) {
    this.setPointValue = setPoint;
    this.setPointChange.emit(this.setPointValue);
  }

  ngOnInit() {
    this.setup();
  }

  ngOnChanges(changes) {
    this.redraw(1000);
  }

  //setup() {
  //  let element = this.graphElement.nativeElement;
  //  let svg = d3.select(element);

  //  let backgroundColor = this.backgroundColor;
  //  let backgroundbrighter = d3.hsl(this.backgroundColor).brighter(0.15);
  //  let color = this.color;
  //  let colormuted = d3.hsl(this.color);
  //  colormuted.l = colormuted.l + (1 - colormuted.l)*0.5;

  //  let size = this.size * 0.9;
  //  let radius = size * 0.97 / 2;
  //  let cx = size / 2;
  //  let cy = size / 2;
  //  let min = this.min;
  //  let max = this.max;
  //  let range = max - min;
  //  let transitionDuration = 1000;

  //  let body = d3.select(element)
  //    .attr('class', 'gauge')
  //    .attr('width', size)
  //    .attr('height', size);

  //  function mouseAngle() {
  //    let dx = d3.event.x-size/2;
  //    let dy = d3.event.y-size/2;
  //    let a = Math.atan2(dy, dx);
  //    a -= Math.PI/2;
  //    a = a < 0 ? a + Math.PI*2 : a;
  //    a -= Math.PI/2;
  //    a = degreesToValue(a*180/Math.PI);
  //    a = Math.min(max, Math.max(min, a));
  //    return Math.round(a);
  //  }
  //  let drag = d3.drag()
  //    .on('drag', (d) => {
  //      this.redraw(mouseAngle(), undefined, true)
  //    })
  //    .on('end', (d) => {
  //      this.value = mouseAngle();
  //    });

  //  // background circle
  //  body.append('circle')
  //      .attr('cx', cx)
  //      .attr('cy', cy)
  //      .attr('r', radius)
  //      .style('fill', backgroundColor)
  //      .call(drag)
  //  
  //  // foreground circle
  //  body.append('circle')
  //      .attr('cx', cx)
  //      .attr('cy', cy)
  //      .attr('r', 0.8 * radius)
  //      .style('fill', backgroundbrighter)
  //  
  //  function recalculate(setPoint, current) {
  //    let step = range/180;
  //    let activeRangeMin = Math.min(setPoint, current);
  //    let activeRangeMax = Math.max(setPoint, current);
  //
  //    let arr = [];
  //    for (let i=0; i<101; i++) {
  //      let j = min + range*i/100
  //      arr.push({
  //        p1: valueToPoint(j, 0.8),
  //        p2: valueToPoint(j, 1.0),
  //        active: j <= activeRangeMax && j >= activeRangeMin,
  //        j,
  //        i
  //      });
  //    }
  //    let [spi, ci] = arr.reduce(([i1a, i1b], { j }, i2) => [
  //      Math.abs(arr[i1a].j - setPoint) > Math.abs(j - setPoint) ? i2 : i1a,
  //      Math.abs(arr[i1b].j - current) > Math.abs(j - current) ? i2 : i1b
  //    ], [0, 0])

  //    arr[spi] = Object.assign(arr[spi], {
  //      p1: valueToPoint(arr[spi].j, 0.75),
  //      p2: valueToPoint(arr[spi].j, 1.0),
  //      active: true,
  //      setPoint: true
  //    });
  //    arr[ci] = Object.assign(arr[ci], {
  //      p1: valueToPoint(arr[ci].j, 0.80),
  //      p2: valueToPoint(arr[ci].j, 1.0),
  //      active: true,
  //      current: true
  //    });

  //    return arr;
  //  }

  //  let pointerContainer = body.append('g').attr('class', 'pointerContainer');
  //  let midValue = (min + max) / 2;
  //  let setPointFontSize = Math.round(size / 3);
  //  pointerContainer.append('text').attr('class', 'set-point')
  //    .attr('x', cx)
  //    .attr('y', cy)//size - cy / 4 - fontSize)
  //    .attr('dy', setPointFontSize / 3)
  //    .attr('text-anchor', 'middle')
  //    .style('font-size', setPointFontSize + 'px')
  //    .style('fill', color)
  //    .style('stroke-width', '0px');

  //  let coolingStateFontSize = Math.round(size / 20);
  //  pointerContainer.append('text').attr('class', 'cooling-state')
  //    .attr('x', cx)
  //    .attr('y', cy - setPointFontSize*2/3)//size - cy / 4 - fontSize)
  //    .attr('dy', coolingStateFontSize / 2)
  //    .attr('text-anchor', 'middle')
  //    .style('font-size', coolingStateFontSize + 'px')
  //    .style('fill', color)

  //  this.redraw(min, undefined, false);
  //  
  //  let lastCurrent;
  //  this.redraw = function(setPoint, current, animate) {
  //    current = current != undefined ? current : lastCurrent;
  //    lastCurrent = current;
  //    let ticks = body.selectAll('line.tick').data(recalculate(setPoint, current), ({i}) => i)
  //    let t = d3.transition().duration(100)
  //    ticks = ticks.enter().append('line').attr('class', 'tick')
  //      .merge(ticks)

  //    if (animate) {
  //      ticks = ticks.transition(t)
  //    }
  //    ticks
  //      .attr('x1', ({ p1 }) => p1.x)
  //      .attr('y1', ({ p1 }) => p1.y)
  //      .attr('x2', ({ p2 }) => p2.x)
  //      .attr('y2', ({ p2 }) => p2.y)
  //      .style('stroke', ({ active }) => active ? color : colormuted)
  //      .style('stroke-width', (d) => ((d.current || d.setPoint) ? 3 : 1) + 'px')

  //    let pointerContainer = body.select('.pointerContainer');
  //    pointerContainer.select('text.set-point').transition(t).tween('text', function() {
  //      var that = d3.select(this);
  //      let i = d3.interpolateNumber(that.text(), Math.round(setPoint))
  //      return function(t) {
  //        that.text(Math.round(i(t)));
  //      }
  //    });
  //    pointerContainer.select('text.cooling-state').text(setPoint > current ? 'heating' : 'cooling')
  //  }
  //  
  //  function valueToDegrees (value) {
  //    return value / range * 280 - (min / range * 280 + 50);
  //  }

  //  function degreesToValue (deg) {
  //    return range / 280 * (deg + min / range * 280 + 50)
  //  }
  //  
  //  function valueToRadians (value) {
  //    return valueToDegrees(value) * Math.PI / 180;
  //  }
  //  
  //  function valueToPoint (value, factor) {
  //    return {
  //      x: cx - radius * factor * Math.cos(valueToRadians(value)),
  //      y: cy - radius * factor * Math.sin(valueToRadians(value))
  //    };
  //  }
  //}

  setup() {
    let backgroundColor = this.backgroundColor;
    let color = this.color;

    let max = this.max;
    let min = this.min;

    let element = this.graphElement.nativeElement;
    let svg = d3.select(element);
 
    let { width, height } = svg.node().getBoundingClientRect();
    let size = 400;
    let g = svg.append('g').attr('transform', 'translate(' + size / 2 + ',' + size / 2 + ')');

    let range = max - min;
    var barc = d3.arc()
        .innerRadius(size/2 - 100)
        .outerRadius(size/2)
        .startAngle(Math.PI*1.2);

    let or = size/2 - 4;
    let ir = size/2 - 30;
    var larc = d3.arc()
        .innerRadius(ir)
        .outerRadius(or)
    
    //g.append('circle')
    //  .attr('r', size/2)
    //  .style('fill', backgroundColor)

    g.append('path').datum({ innerRadius: size/2-34, outerRadius: size/2, startAngle: 0, endAngle: Math.PI*2 }).attr('d', d3.arc()).style('fill', backgroundColor);

    var foreground = g.append('path')
      .datum({ startAngle: 2*Math.PI, endAngle: 2*Math.PI })
      .style('fill', color)
      .attr('d', larc);

    let drag = d3.drag()
      .on('drag', (d) => {
        let setPoint = mouseAngle(range, min);
        this.setPoint = setPoint;
        this.redraw(0);
      })
      //.on('end', (d) => {
      //  let setPoint = mouseAngle(range, min);
      //  this.setPoint = setPoint;
      //});

    let sw = 2;
    let pointer = g.append('path')
      .datum({ angle: Math.PI*2 })
      .attr('class', 'pointer')
      .attr('stroke', backgroundColor)
      .attr('stroke-width', `${sw}px`)
      .attr('fill', color)

    let setPointGroup = g.append('g');
    let tempGroup = g.append('g').attr('opacity', 0);
    let setPointFontSize = size / 3;
    let coolingStateFontSize = size / 22;
    let controlFontSize = size/20;

    var setPointText = setPointGroup.append('text')
      .attr('dy', setPointFontSize / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', setPointFontSize + 'px')
      .style('fill', color)
      .style('stroke-width', '0px')

    var tempText = tempGroup.append('text')
      .attr('dy', setPointFontSize / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', setPointFontSize + 'px')
      .style('fill', color)
      .style('stroke-width', '0px')

    let coolingStateText = g.append('text')
      .attr('y', -setPointFontSize/2)
      .attr('dy', -coolingStateFontSize/2)
      .attr('text-anchor', 'middle')
      .style('font-size', coolingStateFontSize + 'px')
      .style('fill', color)

    tempGroup.append('text')
      .attr('y', setPointFontSize/2)
      .attr('dy', coolingStateFontSize)
      .attr('text-anchor', 'middle')
      .style('font-size', coolingStateFontSize + 'px')
      .style('fill', color)
      .text('TEMPERATURE')

    setPointGroup.append('text')
      .attr('y', setPointFontSize/2)
      .attr('dy', coolingStateFontSize)
      .attr('text-anchor', 'middle')
      .style('font-size', coolingStateFontSize + 'px')
      .style('fill', color)
      .text('SET POINT')

    let e = g.selectAll('.control').data([-1, 1]).enter()
      .append('g')
      .attr('class', 'control')
      .attr('transform', (d, i) => `translate(${ (i == 0 ? 1 : -1 )*Math.sin(Math.PI/12)*(or+ir)/2 }, ${ Math.cos(Math.PI/12)*(or+ir)/2 })`)
    e.on('click', (d) => {
      let setPoint = this.setPoint + d;
      this.setPoint = setPoint;
      this.redraw(0);
    });
    e.append('circle').attr('r', size/14).attr('opacity', 0.0)
    e.append('text')
      .attr('font-size', controlFontSize)
      .attr('fill', color)
      .attr('dy', controlFontSize/4)
      .attr('text-anchor', 'middle')
      .text((d) => d == 1 ? '▲' : '▼')
    g.append('path')
      .attr('class', 'drag')
      .datum({ startAngle: 0, endAngle: Math.PI*2.8 })
      .attr('d', barc)
      .attr('opacity', 0.0)
      .call(drag)

    this.redraw(1000);

    var end;
    var start;
    var sp;

    let lastState = true;
    this.redraw = function(animate=500) {
      let setPoint = this.setPoint;
      let temperature = this.temperature;
      let a = transform(setPoint, min, max);
      let b = transform(temperature, min, max);
      let steady = Math.abs(setPoint - temperature) < 0.1;
      if (lastState != steady) {
        lastState = steady;
        let t = d3.transition().duration(500);
        setPointGroup.transition(t).attr('transform', `translate(${ steady ? 0 : size/8 }, 0) scale(${ steady ? 1 : 0.5 })`);
        tempGroup.transition(t).attr('transform', `translate(${ steady ? 0 : -size/8 }, 0) scale(${ steady ? 1 : 0.5 })`).attr('opacity', steady ? 0.0 : 1.0);
        coolingStateText.text(steady ? 'STEADY' : setPoint > temperature ? 'HEATING' : 'COOLING')
      }

      if (animate) {
        let t = d3.transition().duration(animate);
        foreground.transition(t).attrTween('d', arcTween(b, a));
        pointer.transition(t).attrTween('d', lineTween(a));
        setPointText.transition(t).tween('text', setPointTweener(setPoint));
        tempText.transition(t).tween('text', textTweener(temperature));


      } else {
        end = () => a;
        sp = () => Math.round(setPoint);
        setPointText.text(Math.round(setPoint))
        tempText.text(Math.round(temperature))
        foreground.attr('d', (d) => {
          return larc({ startAngle: b, endAngle: a })
        })
        pointer.datum({ angle: a}).attr('d', (d) => drawPointer(d, or+sw/2, ir));
      }

    }
    
    function arcTween(newStart, newEnd) {
      return function(d) {
        end = d3.interpolate(d.endAngle, newEnd);
        start = d3.interpolate(d.startAngle, newStart);
        return function(t) {
          d.endAngle = end(t);
          d.startAngle = start(t);
          return larc(d);
        };
      };
    }

    function lineTween(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.angle, newAngle);
        if (d.angle == newAngle) {
          let str = drawPointer(d, or+sw/2, ir);
          return function() {
            return str;
          }
        } else {
          return function(t) {
            d.angle = interpolate(t)
            return drawPointer(d, or+sw/2, ir);
          };
        }
      };
    }

    function setPointTweener(value) {
      return function() {
        var that = d3.select(this);
        sp = d3.interpolateNumber(that.text(), Math.round(value))
        return function(t) {
          that.text(Math.round(sp(t)));
        }
      }
    }
  }
    
  redraw(animate?:number) {
  }
}

function transform(value, min, max) {
  let range = max - min;
  return (Math.max(min, Math.min(max, value)) - min)/range*1.6*Math.PI + 1.2*Math.PI;
}

function textTweener(value) {
  return function() {
    var that = d3.select(this);
    let i = d3.interpolateNumber(that.text(), Math.round(value))
    return function(t) {
      that.text(Math.round(i(t)));
    }
  }
}



function drawPointer({ angle }, or, ir) {
  let _angle = angle*-1 + Math.PI;
  let l1 = or;
  let l2 = or - (or-ir)*3.0;

  let s = Math.PI/100;
  let pts = [-1, 0, 1, 1, 0, -1].map((j, i) => [_angle + s*j, i < 3 ? l1 : l2]).map(([a, b]) => [Math.sin(a)*b, Math.cos(a)*b]);
  return ptsToPoly(pts);
}

function ptsToPoly(pts) {
  return 'M ' + pts[0].join(' ') + pts.slice(1).map(p => 'L ' + p.join(' ')).join(' ') + 'Z';
}

function mouseAngle(range, min) {
  let { x, y } = d3.event;
  let a = Math.atan2(y, x) - Math.PI/2;
  a = a < 0 ? a + Math.PI*2 : a;
  return Math.max(0, Math.min(1, (a-Math.PI*0.2)/(Math.PI*1.6)))*range + min;
}
