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
import * as d3 from 'd3';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent extends GenericComponent implements AfterViewInit {
  @ViewChild('graph') graphElement: ElementRef;
  @Input() keepCount: number = 100;
  values;

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
  }

  ngAfterViewInit() {
    this.setup();
  }

  setup() {
    let element = this.graphElement.nativeElement
    let svg = d3.select(element),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append('g').attr('class', 'xaxis');
    g.append('g').attr('class', 'yaxis').append('text')
    
    this.redraw = function draw(data) {
      var x = d3.scaleTime()
          .rangeRound([0, width]);
      
      var y = d3.scaleLinear()
          .rangeRound([height, 0]);
      
      var line = d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); });
      
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain(d3.extent(data, function(d) { return d.value; }));
      
      g.select("g.xaxis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
        .select(".domain")
          .remove();
      
      g.select("g.yaxis")
          .call(d3.axisLeft(y))
        .select("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("temperature (°C)");
      
      g.select("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);
    }
  }

  redraw(data) {
  }
}
