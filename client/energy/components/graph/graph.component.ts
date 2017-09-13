import { SimpleChanges, Input, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.less']
})
export class GraphComponent implements OnInit {
  @Input('point') point;
  data$: Observable<any[]>;

  constructor(private service: GraphService) {
    this.data$ = service.data$;
    //this.data$.subscribe(d => this.build(d));
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.point) {
      this.service.getData(changes.point.currentValue);
    }
  }

  build(data: any[]) {
    var margin = {top: 20, right: 20, bottom: 110, left: 50},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;
    
    var parseDate = d3.timeParse("%b %Y");
    
    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);
    
    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);
    
    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed);
    
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);
    
    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
    
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.price; })+200]);
    x2.domain(x.domain());
    y2.domain(y.domain());
    
    var dots = focus.append("g");
       dots.attr("clip-path", "url(#clip)");
       dots.selectAll("dot")
           .data(data)
           .enter().append("circle")
           .attr('class', 'dot')
           .attr("r",5)
           .style("opacity", .5)
           .attr("cx", function(d) { return x(d.date); })
           .attr("cy", function(d) { return y(d.price); })
            
    focus.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    
    focus.append("g")
          .attr("class", "axis axis--y")
          .call(yAxis);
          
    focus.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Price");  
          
    svg.append("text")             
          .attr("transform",
                "translate(" + ((width + margin.right + margin.left)/2) + " ," + 
                               (height + margin.top + margin.bottom) + ")")
          .style("text-anchor", "middle")
          .text("Date");
          
    // append scatter plot to brush chart area      
    var dots = context.append("g");
        dots.attr("clip-path", "url(#clip)");
        dots.selectAll("dot")
           .data(data)
           .enter().append("circle")
           .attr('class', 'dotContext')
           .attr("r",3)
           .style("opacity", .5)
           .attr("cx", function(d) { return x2(d.date); })
           .attr("cy", function(d) { return y2(d.price); })
            
    context.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height2 + ")")
          .call(xAxis2);
    
    context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, x.range());

    //create brush function redraw scatterplot with selection
    function brushed() {
      var selection = d3.event.selection;
      x.domain(selection.map(x2.invert, x2));
      focus.selectAll(".dot")
            .attr("cx", function(d: any) { return x(d.date); })
            .attr("cy", function(d: any) { return y(d.price); });
      focus.select(".axis--x").call(xAxis);
    }
    
    
    function type(d) {
      d.date = parseDate(d.date);
      d.price = +d.price;
      return d;
    }
  }
}
