import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { Point, Area } from '../../models';
import { Selection } from 'd3';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo-projection';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

import { Feature, FeatureCollection } from '../../models';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  // ideally:
  //   @Input('layer')
  //   @Output('layerChange')
  //
  //   @Input('active')
  //   @Output('activeChange')
  //
  //   @Input('floor')
  //   @Output('floorChange')
  //
  //   @Input('building')
  //   @Output('buildingChange')
  //
  //   internal service fetches features based on the filters above
  //
  //   @Input('init') # building.shortname or coordinates for first view
  //
  //
  //   fn buildingsNear(coord or buiding.shortname)
  //     returns building list
  @ViewChild('svg') el: ElementRef; 

  // when a new floor is clicked
  @Output() layerChange = new EventEmitter();

  // active building id
  @Output() buildingChange: EventEmitter<string> = new EventEmitter();
  // active area|point id
  @Output() activeChange: EventEmitter<string> = new EventEmitter();
  @Input() active: string;

  @Input() features: FeatureCollection;
  @Input('hide-map') hideMap: boolean = false;
  @Input() map: FeatureCollection;

  // which projection
  @Input() state: string = 'normal';

  ngOnChanges(changes: SimpleChanges) {
    if (this.svg) {
      let t;
      if (changes.features) {
        t = this.updateFeatures(changes.features.currentValue, t);
      }
      if (changes.active) {
        t = this.updateActive(changes.active.currentValue, t);
      }
      if (changes.map) {
        this.updateMap(this.map);
      }
    }
  }

  // active feature path
  activeSelection: Selection<any, any, any, any>;
  svg: Selection<any, any, any, any>;
  // zoom fn, used for transforms
  zoom;
  // features selections
  selection: Selection<any, any, any, any>;
  // current projection 
  projection: d3.GeoProjection;
  // current path, using above projection
  path;
  // use the same transforms after proj def
  transforms = { center: [], offset: [], scale: 150 };
  // ugly (but pretty) color interp fn
  color = (i) => d3ScaleChromatic.interpolateRdYlBu(d3.scaleLinear().domain([60, 80])(i));
  // features container
  fcontainer;
  // annotations container
  acontainer;
  // map (floorplan) outline container
  mcontainer;
  // the map path itself
  mapSelection;

  transformed: boolean = false;

  ngOnInit() {
    let [ width, height ] = [100, 100];
    
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);
    
    this.svg = d3.select(this.el.nativeElement)
        //.attr('width', width)
        //.attr('height', height)
        .on('click', stopped, true);
   
    this.svg.append('rect')
        .attr('class', 'background')
        .attr('opacity', 0)
        .attr('width', width)
        .attr('height', height)
        //.on('click', reset);
    

    let g = this.svg.append('g').attr('id', 'container');

    this.fcontainer = g.append('g').attr('transform-origin', '50 50');
    this.selection = this.fcontainer.attr('class', 'features transform').selectAll('path');
    this.mcontainer = g.append('g').attr('transform-origin', '50 50');
    this.mapSelection = this.mcontainer.attr('class', 'map transform').append('path');
    this.acontainer = g.append('g');
    

    this.svg.call(this.zoom).on('dblclick.zoom', null);
   
    //function reset() {
    //  active.classed('active', false);
    //  active = d3.select(null);
    //
    //  let t = d3.transition(null).duration(750);
    //  this.svg.transition(t).call( this.zoom.transform as any, d3.zoomIdentity );
    //}
    
    function zoomed() {
      g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
      g.attr('transform', d3.event.transform);
    }
    
    // prevent zoom on drag
    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }
  }

  ngOnDestroy() {}

  updateFeatures(fc: FeatureCollection, t?) {
    let self = this;
    let { features } = fc || { features: [] };
    let g = this.svg.select('g');
    let selection = this.selection.data(features, (d) => d.properties.id);

    if (this.path == null) {
      ({ path: this.path, transforms: this.transforms } = centerFeatures(fc));
      this.projection = this.path.projection();
    }

    t = t || d3.transition(null).duration(200);

    selection.exit().transition(t).attr('opacity', 0).remove();

    let entering = selection.enter().append('path')
      .attr('fill', (d) => d.properties.data ? this.color(d.properties.data.last) : 'darkgrey')
      .attr('class', 'feature')
      .attr('opacity', 0)

    entering.on('click', function(d) {
        console.log(d);
        let id = d.properties.id;
        if (d.properties.type === 'building') {
          self.buildingChange.emit(id);
        } else {
          self.activeChange.emit(id);
        }
        self.updateActive(id);
        //if (active.node() === this) {
        //  return reset();
        //} else {
        //  self.updateActive(d);
        //}
      });

    entering
      .on('mouseover', function() {
        (<any>this).parentNode.appendChild(this);
      })
      .on('mouseleave', function() {
        if (self.activeSelection) {
          (<any>this).parentNode.appendChild(self.activeSelection.node());
        }
      });

    this.selection = entering.merge(selection)
      .attr('d', this.path)

    this.selection
      .transition(t)
      .attr('opacity', 0.8);

    return t;
  }

  updateMapVisibilityState(visible?) {
    visible = visible != null ? visible : !(this.hideMap = !this.hideMap);
    let t = d3.transition(null).duration(750);
    this.mapSelection.transition(t).attr('opacity', visible ? 1 : 0);
    this.selection
      .transition(t)
      .attr('opacity', visible ? 0.8 : 1.0);
  }

  changeProjection() {
    let t0 = d3.transition(null).duration(1000);
    let t1 = t0.transition().duration(1000);
    if (this.transformed = !this.transformed) {
      this.svg.select('g').selectAll('g').transition(t0).attr('transform', 'rotate(-20, 0,100) skewX(60)');
      this.svg.select('g').selectAll('g').transition(t1).attr('transform', (d, i) => `translate(0, ${ i *10 }) rotate(-20, 0,100) skewX(60)`);
    } else {
      this.svg.select('g').selectAll('g').transition(t0).attr('transform', (d, i) => `translate(0, 0) rotate(-20, 0,100) skewX(60)`);
      this.svg.select('g').selectAll('g').transition(t1).attr('transform', 'rotate(0, 0,100) skewX(0)');
    }
  }

  // set projection
  // highlight, center active
  updateActive(id: string, t?) {
    let self = this;
    t = t || d3.transition(null).duration(200);
    this.selection.classed('active', false).transition(t).attr('d', self.path).filter(d => d.properties.id == id).on('start', function() {
      this.activeSelection = d3.select(this).classed('active', true);
      this.parentNode.appendChild(this);
    }).on('end', function(d) {
      let { center, scale, offset } = self.transforms;
      //let center = d3.geoCentroid(d);
      let gamma = d.properties.gamma;
      self.projection.rotate(center.map(i => i*-1).concat(-gamma) as [number, number, number]).center([0, 0])
      self.path.projection(self.projection);

      let t = d3.transition(null).duration(200);
      self.selection.transition(t).attr('d', self.path);
      self.mapSelection.transition(t).attr('d', self.path);

      let [ width, height ] = [100, 100];

      var bounds = self.path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          bscale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
          translate = [width / 2 - bscale * x, height / 2 - bscale * y];
        
      //self.svg.transition(d3.active(this)).call( self.zoom.transform as any, d3.zoomIdentity.translate(translate[0],translate[1]).scale(bscale) );
    });
  }

  updateMap(fc: FeatureCollection) {
    this.mapSelection.datum(fc).attr('d', this.path);
  }
}

function centerFeatures(fc) {
  let [ width, height ] = [ 100, 100 ];
  let center = d3.geoCentroid(fc);
  let offset = [width/2, height/2];
  let scale = 1;

  let projection = d3.geoMercator().rotate([0, 0, 0]).center(center as [number, number]).scale(scale).translate(offset as [number, number]);
  
  let path = d3.geoPath().projection(projection)
  
  let bounds = path.bounds(fc);
  let hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
  let vscale = scale*height / (bounds[1][1] - bounds[0][1]);
  scale = (hscale < vscale) ? hscale : vscale;
  offset = [
    width - (bounds[0][0] + bounds[1][0])/2,
    height - (bounds[0][1] + bounds[1][1])/2
  ];
  projection = d3.geoMercator().rotate([0, 0, 0]).center(center as [number, number]);
  projection.scale(scale).translate(offset as [number, number]);
  path.projection(projection);
  let transforms = { center, scale, offset };
  return { path, transforms };
}

function projectionTween(projection0, projection1) {
  let [ width, height ] = [ 100, 100 ];
  return function(d) {
    var t = 0;
    var projection = d3.geoProjection(project)
        .scale(1)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);

    function project(λ, φ): [number, number] {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI;
      var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
    }
    return function(_) {
      t = _;
      return path(d);
    };
  };
}
