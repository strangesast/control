import { ViewChild, ElementRef, Input, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
//import * as topojson from 'topojson';
import * as d3 from 'd3';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  @ViewChild('svg') el: ElementRef; 
  layers$: Observable<any[]>;

  constructor(private service: MapService) {
    this.layers$ = service.layers$;

    this.layers$.do(x => console.log('layernames', x)).flatMap(layers => this.service.getLayer(layers[1])).subscribe(x => this.build(x));
  }

  ngOnInit() {
  }

  build(featureCollection) {
    let features = featureCollection.features;
    let active = d3.select(null);
   
    let zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    
    let svg = d3.select(this.el.nativeElement)
        .on("click", stopped, true);
 
    let { width, height } = svg.node().getBoundingClientRect();

    let center = d3.geoCentroid(featureCollection);
    let offset = [width/2, height/2];
    let scale = 150;

    let r = 112.0;
    let rot = center.map(i => i*-1).concat(180-r);

    let calcProjection = (rot?: number) => {
      return (rot ?
        d3.geoMercator().rotate(center.map(i => i*-1).concat(180-rot)).center([0, 0]) :
        d3.geoMercator().rotate([0, 0, 0]).center(center)
      ).scale(scale).translate(offset);
    }

    let projection = calcProjection();

    let path = d3.geoPath()
      .projection(projection)

    let bounds = path.bounds(featureCollection);
    let hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
    let vscale = scale*height / (bounds[1][1] - bounds[0][1]);
    scale   = (hscale < vscale) ? hscale : vscale;
    offset  = [
      width - (bounds[0][0] + bounds[1][0])/2,
      height - (bounds[0][1] + bounds[1][1])/2
    ];

    projection = calcProjection();
    path = path.projection(projection);
            
    svg.append("rect")
      .attr("fill-opacity", 0)
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", reset);
    
    let g = svg.append("g");
    
    // delete this line to disable free zooming
    svg.call(zoom);
    
    let selection = g.selectAll("path").data(features)
      .enter().append("path")
        .attr("d", path)
        .attr("class", "feature")
        .on("click", clicked);
    
    g.append("path")
      .datum(features)
      .attr("class", "mesh")
      .attr("d", path);
    
    function clicked(d) {
      if (active.node() === this) return reset();
      projection = calcProjection(r);
      path = path.projection(projection);
      let t = d3.transition().duration(750);
      selection.transition(t).attr('d', path);

      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      ({ width, height } = svg.node().getBoundingClientRect());
    
      let bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
          translate = [width / 2 - scale * x, height / 2 - scale * y];
    
      svg.transition(t)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale)
        );
    }
    
    function reset() {
      projection = calcProjection();
      path = path.projection(projection);
      let t = d3.transition().duration(750);
      selection.transition(t).attr('d', path);

      active.classed("active", false);
      active = d3.select(null);
    
      svg.transition(t)
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
    }
    
    function zoomed() {
      g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      g.attr("transform", d3.event.transform); // updated for d3 v4
    }
    
    function stopped() {
      // also stop propagation so we don’t click-to-zoom.
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }
  }

}
