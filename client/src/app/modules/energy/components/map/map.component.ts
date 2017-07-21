import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
//import * as topojson from 'topojson';
import { Selection } from 'd3';
import * as d3 from 'd3';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  // inputs
  //   layer
  //   activeElement
  @Output() layerChange = new EventEmitter();
  @Input('layer') layer: string;

  @Output('activeChange')
  activeElementChange = new EventEmitter();

  @Input('active')
  activeElement: string;

  @ViewChild('svg') el: ElementRef; 
  layers$: Observable<any[]>;

  featureCollection;

  constructor(private service: MapService) {
    this.layers$ = service.layers$;

    this.layers$.flatMap(layers => this.service.getLayer(layers[1])).subscribe(x => this.build(x));
  }

  active
  r: number;
  svg
  zoom
  selection: Selection;
  transforms = { center: [], offset: [], scale: 150 };

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.svg) {
      if (changes.activeElement && changes.activeElement.currentValue) {
        this.clicked(changes.activeElement.currentValue.data.feature);
      }
    }
  }

  build(featureCollection) {
    let self = this;
    let features = featureCollection.features;
    this.featureCollection = featureCollection;
    this.active = d3.select(null);
   
    this.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);
    
    this.svg = d3.select(this.el.nativeElement)
        .on('click', stopped, true);
 
    let { width, height } = this.svg.node().getBoundingClientRect();

    let center = d3.geoCentroid(featureCollection);
    let offset = [width/2, height/2];
    let scale = 150;
    this.transforms = { center, offset, scale };


    this.r = 112.0;

    let projection = this.calcProjection();
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
    this.transforms = { center, offset, scale };

    projection = this.calcProjection();
    path = path.projection(projection);
            
    this.svg.append('rect')
      .attr('fill-opacity', 0)
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', () => {
        self.reset()
      });
    
    let g = this.svg.append('g');
    
    // delete this line to disable free zooming
    this.svg.call(this.zoom);
    
    this.selection = g.selectAll('path').data(features)
      .enter().append('path')
        .attr('d', path)
        .attr('data-id', (d) => d._id)
        .attr('class', 'feature')
        .on('click', function ({ _id: id }) {
          self.activeElementChange.emit(id);
          if (self.active.node() === this) return self.reset();
          self.clicked(id);
        });
    
    g.append('path')
      .datum(features)
      .attr('class', 'mesh')
      .attr('d', path);
   
    function zoomed() {
      g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
      g.attr('transform', d3.event.transform); // updated for d3 v4
    }
    
    function stopped() {
      // also stop propagation so we don’t click-to-zoom.
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }
  }

  calcProjection (rot?: number) {
    let { center, scale, offset } = this.transforms;
    return (rot ?
      d3.geoMercator().rotate(center.map(i => i*-1).concat(180-rot)).center([0, 0]) :
      d3.geoMercator().rotate([0, 0, 0]).center(center)
    ).scale(scale).translate(offset);
  }

  reset() {
    let { scale, center } = this.transforms;
    let projection = this.calcProjection();
    let { width, height } = this.svg.node().getBoundingClientRect();
    let path = d3.geoPath()
      .projection(projection)
    let bounds = path.bounds(this.featureCollection);
    let offset  = [
      width - (bounds[0][0] + bounds[1][0])/2,
      height - (bounds[0][1] + bounds[1][1])/2
    ];
    this.transforms = { center, offset, scale };

    projection = this.calcProjection();
    path = d3.geoPath()
      .projection(projection)
    let t = d3.transition().duration(750);
    this.selection.transition(t).attr('d', path);

    this.active.classed('active', false);
    this.active = d3.select(null);
  
    this.svg.transition(t)
      .call( this.zoom.transform, d3.zoomIdentity ); // updated for d3 v4
  }

  clicked(id) {
    let d = this.featureCollection.features.find(x => x._id == id);
    if (d == null) return;
    let el = this.svg.select(`[data-id="${ d._id }"]`).node();
    let projection = this.calcProjection(this.r);
    let path = d3.geoPath()
      .projection(projection)
    let t = d3.transition().duration(750);
    this.selection.transition(t).attr('d', path);

    this.active.classed('active', false);
    this.active = d3.select(el).classed('active', true);

    let { width, height } = this.svg.node().getBoundingClientRect();
  
    let bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];
  
    this.svg.transition(t)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale)
      );
  }
 

}
