import {
  Input,
  OnInit,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-thermostat',
  templateUrl: './thermostat.component.html',
  styleUrls: ['./thermostat.component.css']
})
export class ThermostatComponent extends GenericComponent implements AfterViewInit {
  @ViewChild('graph') graphElement: ElementRef;
  @Input() size: number = 400;
  @Input() min: number = 60;
  @Input() max: number = 85;
  @Input() label: string;
  @Input() setPoint: number = 50;
  @Input() backgroundColor: string = '#e1ecff';
  @Input() color: string = '#4279da';//'#5EA3F4';

  constructor() {
    super();
  }

  ngAfterViewInit() {
    this.setup();
    this.valueSubject.asObservable().distinctUntilChanged().map((value, i) => {
      value = Math.round(value);
      this.redraw(value, 75, true);
    }).subscribe();
  }

  //setup() {
  //  let element = this.graphElement.nativeElement;
  //  let svg = d3.select(element);

  //  let background = this.backgroundColor;
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

  //  function calc() {
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
  //      this.redraw(calc(), undefined, true)
  //    })
  //    .on('end', (d) => {
  //      this.value = calc();
  //    });

  //  // background circle
  //  body.append('circle')
  //      .attr('cx', cx)
  //      .attr('cy', cy)
  //      .attr('r', radius)
  //      .style('fill', background)
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
    let background = this.backgroundColor;
    let backgroundbrighter = d3.hsl(this.backgroundColor).brighter(0.15);
    let color = this.color;
    let colormuted = d3.hsl(this.color);

    let max = this.max;
    let min = this.min;

    let element = this.graphElement.nativeElement;
    let svg = d3.select(element);
 
    let bbox = svg.node().getBoundingClientRect();
    console.log(bbox);
    let { width, height } = bbox;

    let size = 400,
        g = svg.append('g').attr('transform', 'translate(' + size / 2 + ',' + size / 2 + ')');

    let range = max - min;
    var barc = d3.arc()
        .innerRadius(size/2 - 64)
        .outerRadius(size/2)
        .startAngle(Math.PI*1.2);

    let ir = size/2 - 30;
    let or = size/2 - 4;
    var larc = d3.arc()
        .innerRadius(ir)
        .outerRadius(or)
        .startAngle(Math.PI*1.2);

    
   //svg.attr('size', size).attr('height', size)

    
    g.append('circle')
      .style('fill', backgroundbrighter)
      .attr('r', size/2)

    var foreground = g.append('path')
        .datum({endAngle: Math.PI*2 })
        .style('fill', color)
        .attr('d', larc);

    function calc() {
      let { x, y } = d3.event;
      let a = Math.atan2(y, x) - Math.PI/2;
      a = a < 0 ? a + Math.PI*2 : a;
      return Math.max(0, Math.min(1, (a-Math.PI*0.2)/(Math.PI*1.6)))*range + min;
      //a = Math.min(max, Math.max(min, a));
    }
    let drag = d3.drag()
      .on('drag', (d) => {
        console.log('drag');
        this.redraw(calc(), undefined, false);
      })
      .on('end', (d) => {
        this.value = Math.round(calc());
      });

    g.append('path')
      .attr('class', 'drag')
      .datum({ endAngle: Math.PI*2.8 })
      .attr('d', barc)
      .attr('opacity', 0.0)
      .call(drag)

    let setPointFontSize = Math.round(this.size / 3);
    var tempText = g.append('text')
      .attr('dy', setPointFontSize / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', setPointFontSize + 'px')
      .style('fill', color)
      .style('stroke-width', '0px')

    let coolingStateFontSize = Math.round(size / 22);
    let coolingStateText = g.append('text')
      .attr('y', -setPointFontSize/2)
      .attr('text-anchor', 'middle')
      .style('font-size', coolingStateFontSize + 'px')
      .style('fill', color)

    let controlFontSize = 20;
    let e = g.selectAll('.control').data([-1, 1]).enter()
      .append('g')
      .attr('class', 'control')
      .attr('transform', (d) => `translate(${ d*size/10 }, ${ ir })`)
    e.on('click', (d) => {
      this.redraw(this.value += d, undefined, true);
    });
    e.append('circle').attr('r', size/20).attr('opacity', 0.0)
    e.append('text')
      .attr('font-size', controlFontSize)
      .attr('fill', color)
      .attr('dy', controlFontSize/4)
      .attr('text-anchor', 'middle')
      .text((d) => d == 1 ? '▲' : '▼')
    
    this.redraw(min, undefined, true);

    let lastCurrent;
    this.redraw = function(value, current=lastCurrent, animate=true) {
      lastCurrent = current;
      let a = transform(value, min, max);
      let b = transform(current, min, max);
      let pad = (a > b ? -1 : 1) * Math.PI/100;
      larc.startAngle(b);

      if (animate) {
        let t = d3.transition().duration(500);
        foreground.transition(t).attrTween('d', arcTween(a+pad));
        tempText.transition(t).tween('text', function() {
          var that = d3.select(this);
          let i = d3.interpolateNumber(that.text(), Math.round(value))
          return function(t) {
            that.text(Math.round(i(t)));
          }
        });

      } else {
        tempText.text(Math.round(value))
        foreground.attr('d', (d) => larc(Object.assign(d, { endAngle: a+pad })));
      }
      coolingStateText.text(Math.abs(value - current) < 1 ? 'STEADY' : value > current ? 'HEATING' : 'COOLING')
    }
    
    function arcTween(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return larc(d);
        };
      };
    }
  }
    
  redraw(setPoint, current, animate) {
  }
}

function transform(value, min, max) {
  let range = max - min;
  return (Math.max(min, Math.min(max, value)) - min)/range*1.6*Math.PI + 1.2*Math.PI;
}
