import {
  Input,
  OnInit,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ComponentFactoryResolver
} from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent extends GenericComponent implements AfterViewInit{
  @ViewChild('graph') graphElement: ElementRef;
  @Input() label: string;

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
  }

  ngAfterViewInit() {
    this.setup();
  }

  setup() {
    let element = this.graphElement.nativeElement;
    let svg = d3.select(element);

    let label = this.label;
    let min, max;

    var config: any = {
      size: 120,
      label: label,
      min: undefined != min ? min : 0,
      max: undefined != max ? max : 100,
      minorTicks: 5
    }

    var range = config.max - config.min;
    config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
    config.redZones = [{ from: config.min + range*0.9, to: config.max }];

    config.size = config.size * 0.9;
    config.radius = config.size * 0.97 / 2;
    config.cx = config.size / 2;
    config.cy = config.size / 2;
    config.min = undefined != config.min ? config.min : 0; 
    config.max = undefined != config.max ? config.max : 100; 
    config.range = config.max - config.min;
    config.majorTicks = config.majorTicks || 5;
    config.minorTicks = config.minorTicks || 2;
    config.greenColor = config.greenColor || '#109618';
    config.yellowColor = config.yellowColor || '#FF9900';
    config.redColor = config.redColor || '#DC3912';
    config.transitionDuration = config.transitionDuration || 1000;

    var body;

    body = d3.select(element)
      .attr('class', 'gauge')
      .attr('width', config.size)
      .attr('height', config.size);

    body.append('circle')
        .attr('cx', config.cx)
        .attr('cy', config.cy)
        .attr('r', config.radius)
        .style('fill', '#ccc')
        .style('stroke', '#000')
        .style('stroke-width', '0.5px');
    
    body.append('circle')
        .attr('cx', config.cx)
        .attr('cy', config.cy)
        .attr('r', 0.9 * config.radius)
        .style('fill', '#fff')
        .style('stroke', '#e0e0e0')
        .style('stroke-width', '2px');
    
    for (var index in config.greenZones) {
      drawBand(config.greenZones[index].from, config.greenZones[index].to, config.greenColor);
    }
    
    for (var index in config.yellowZones) {
      drawBand(config.yellowZones[index].from, config.yellowZones[index].to, config.yellowColor);
    }
    
    for (var index in config.redZones) {
      drawBand(config.redZones[index].from, config.redZones[index].to, config.redColor);
    }
    
    if (undefined != config.label) {
        var fontSize = Math.round(config.size / 9);
        body.append('text')
          .attr('x', config.cx)
          .attr('y', config.cy / 2 + fontSize / 2)
          .attr('dy', fontSize / 2)
          .attr('text-anchor', 'middle')
          .text(config.label)
          .style('font-size', fontSize + 'px')
          .style('fill', '#333')
          .style('stroke-width', '0px');
    }
    
    var fontSize = Math.round(config.size / 16);
    var majorDelta = config.range / (config.majorTicks - 1);
    for (var major = config.min; major <= config.max; major += majorDelta) {
      var minorDelta = majorDelta / config.minorTicks;
      for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, config.max); minor += minorDelta) {
        var point1 = valueToPoint(minor, 0.75);
        var point2 = valueToPoint(minor, 0.85);
        
        body.append('line')
          .attr('x1', point1.x)
          .attr('y1', point1.y)
          .attr('x2', point2.x)
          .attr('y2', point2.y)
          .style('stroke', '#666')
          .style('stroke-width', '1px');
      }
      
      var point1 = valueToPoint(major, 0.7);
      var point2 = valueToPoint(major, 0.85);
      
      body.append('line')
        .attr('x1', point1.x)
        .attr('y1', point1.y)
        .attr('x2', point2.x)
        .attr('y2', point2.y)
        .style('stroke', '#333')
        .style('stroke-width', '2px');
      
      if (major == config.min || major == config.max) {
        var point = valueToPoint(major, 0.63);

        body.append('text')
          .attr('x', point.x)
          .attr('y', point.y)
          .attr('dy', fontSize / 3)
          .attr('text-anchor', major == config.min ? 'start' : 'end')
          .text(major)
          .style('font-size', fontSize + 'px')
          .style('fill', '#333')
          .style('stroke-width', '0px');
      }
    }
    
    var pointerContainer = body.append('g').attr('class', 'pointerContainer');
    
    var midValue = (config.min + config.max) / 2;
    
    var pointerPath = buildPointerPath(midValue);
    
    var pointerLine = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveCatmullRom.alpha(0.5))
    
    pointerContainer.selectAll('path').data([pointerPath])
      .enter().append('path')
        .attr('d', pointerLine)
        .style('fill', '#dc3912')
        .style('stroke', '#c63310')
        .style('fill-opacity', 0.7)
    
    pointerContainer.append('circle')
      .attr('cx', config.cx)
      .attr('cy', config.cy)
      .attr('r', 0.12 * config.radius)
      .style('fill', '#4684EE')
      .style('stroke', '#666')
      .style('opacity', 1);
    
    var fontSize = Math.round(config.size / 10);
    pointerContainer.selectAll('text').data([midValue])
      .enter().append('text')
        .attr('x', config.cx)
        .attr('y', config.size - config.cy / 4 - fontSize)
        .attr('dy', fontSize / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', fontSize + 'px')
        .style('fill', '#000')
        .style('stroke-width', '0px');

    this.redraw(config.min);
    
    function buildPointerPath (value) {
      var delta = config.range / 13;
      
      var head = _valueToPoint(value, 0.85);
      var head1 = _valueToPoint(value - delta, 0.12);
      var head2 = _valueToPoint(value + delta, 0.12);
      
      var tailValue = value - (config.range * (1/(270/360)) / 2);
      var tail = _valueToPoint(tailValue, 0.28);
      var tail1 = _valueToPoint(tailValue - delta, 0.12);
      var tail2 = _valueToPoint(tailValue + delta, 0.12);
      
      return [head, head1, tail2, tail, tail1, head2, head];
      
      function _valueToPoint (value, factor) {
        var point = valueToPoint(value, factor);
        point.x -= config.cx;
        point.y -= config.cy;
        return point;
      }
    }
    
    function drawBand (start, end, color) {
      if (0 >= end - start) return;
      
      body.append('path')
        .style('fill', color)
        .attr('d', d3.arc()
          .startAngle(valueToRadians(start))
          .endAngle(valueToRadians(end))
          .innerRadius(0.65 * config.radius)
          .outerRadius(0.85 * config.radius)
        )
        .attr('transform', function() { return 'translate(' + config.cx + ', ' + config.cy + ') rotate(270)' });
    }
    
    var _currentRotation;

    this.redraw = function(value) {
      var pointerContainer = body.select('.pointerContainer');
      pointerContainer.selectAll('text').text(Math.round(value));
      var pointer = pointerContainer.selectAll('path');
      pointer
        .transition().duration(config.transitionDuration)
        .attrTween('transform', () => {
          var pointerValue = value;
          if (value > config.max) {
            pointerValue = config.max + 0.02*config.range;
          } else if (value < config.min) {
            pointerValue = config.min - 0.02*config.range;
          }
          var targetRotation = (valueToDegrees(pointerValue) - 90);
          var currentRotation = _currentRotation || targetRotation;
          _currentRotation = targetRotation;
      
          return function(step) {
            var rotation = currentRotation + (targetRotation-currentRotation)*step;
            return `translate(${ config.cx }, ${ config.cy }) rotate(${ rotation })`; 
          }
        });
        //.attr('transform', () => {
        //  var pointerValue = value;
        //  if (value > config.max) {
        //    pointerValue = config.max + 0.02*config.range;
        //  } else if (value < config.min) {
        //    pointerValue = config.min - 0.02*config.range;
        //  }
        //  var rotation = valueToDegrees(pointerValue) - 90;
        //  return `translate(${ config.cx }, ${ config.cy }) rotate(${ rotation })`; 
        //})
    }
    
    function valueToDegrees (value) {
      return value / config.range * 270 - (config.min / config.range * 270 + 45);
    }
    
    function valueToRadians (value) {
      return valueToDegrees(value) * Math.PI / 180;
    }
    
    function valueToPoint (value, factor) {
      return {
        x: config.cx - config.radius * factor * Math.cos(valueToRadians(value)),
        y: config.cy - config.radius * factor * Math.sin(valueToRadians(value))
      };
    }
  }
    
  redraw(value) {
  }
}
