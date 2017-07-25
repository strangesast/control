import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { Selection } from 'd3';
import * as d3 from 'd3';

import { Feature, FeatureCollection } from '../../models';
import { MapService } from '../../services/map.service';

function getFeatures(map, key) {
  return Object.keys(map).map(id => map[id]).filter(f => f.properties.layer == key);
}

function wrapCollection(features) {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  // inputs
  //   layer
  //   activeElement
  //@Output() layerChange = new EventEmitter();
  //@Input('layer') layer: string;

  @Output()
  activeChange = new EventEmitter();

  active$ = new BehaviorSubject(null);
  @Input('active')
  set active(active) {
    this.active$.next(active);
  };
  get active() {
    return this.active$.getValue();
  }
  activeEl$: Observable<Feature>;

  @ViewChild('svg') el: ElementRef; 

  map$: Observable<FeatureCollection>;

  featureCollection: Observable<FeatureCollection>;

  constructor(private service: MapService) {
    let data$ = service.features$.flatMap(featureMap => {
      let features = getFeatures(featureMap, 'building');
      return this.active$.distinctUntilChanged().scan(({ active: prevActive, features }, activeId) => {
        let active = activeId && featureMap[activeId];

        // only recalculate feature list when layer changes.  if active = null, use the same feature list
        if (active != null && (prevActive && prevActive.properties.layer) != active.properties.layer) {
          features = getFeatures(featureMap, active.properties.layer);
        }

        return { active, features };
      }, { active: null, features });
    });


    data$.first().subscribe(({ active, features }) => {
      this.build(wrapCollection(features));
    });

    // data$.subscribe(...)
  }

  activeSelection
  r: number;
  svg
  zoom
  selection: Selection;
  transforms = { center: [], offset: [], scale: 150 };

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {}

  build(featureCollection) {
    console.log('building...');
    let self = this;
    let features = featureCollection.features;
    this.featureCollection = featureCollection;
    this.activeSelection = d3.select(null);
   
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function() {
        g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
        g.attr('transform', d3.event.transform);
      })
    
    this.svg = d3.select(this.el.nativeElement)
      .on('click', function () {
        // also stop propagation so we don’t click-to-zoom.
        if (d3.event.defaultPrevented) d3.event.stopPropagation();
      }, true);

 
    let { width, height } = this.svg.node().getBoundingClientRect();

    let center = d3.geoCentroid(featureCollection);
    let offset = [width/2, height/2];
    let scale = 150;
    this.transforms = { center, offset, scale };


    this.r = 180-112.0;

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
      .on('click', () => self.reset());
    
    let g = this.svg.append('g');
    
    this.svg.call(this.zoom); // delete this line to disable free zooming
    
    this.selection = g.selectAll('path').data(features)
      .enter().append('path')
        .attr('d', path)
        .attr('data-id', (d) => d.properties['area'] || d.properties['point'])
        .attr('class', 'feature')
        .on('click', function (d) {
          if (self.activeSelection.node() === this) {
            self.reset();
          } else {
            let id = d.properties['area'] || d.properties['point'];
            self.clicked(id);
            self.activeChange.emit(id);
          }
        });
    
    g.append('path')
      .datum(features)
      .attr('class', 'mesh')
      .attr('d', path);
   
  }

  calcProjection (rot?: number) {
    let { center, scale, offset } = this.transforms;
    return (rot ?
      d3.geoMercator().rotate(center.map(i => i*-1).concat(rot)).center([0, 0]) :
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

    this.activeSelection.classed('active', false);
    this.activeSelection = d3.select(null);
  
    this.svg.transition(t)
      .call( this.zoom.transform, d3.zoomIdentity );
  }

  clicked(id) {
    this.active$.next(id);
  }

  /*
  clicked(id) {
    let feature = this.featureCollection.features.find(({ properties: p }) =>
      p['area'] == id || p['point'] == id)
    if (feature == null) return;
    let el = this.svg.select(`[data-id="${ feature.properties['area'] || feature.properties['point'] }"]`).node();
    let projection = this.calcProjection(this.r);
    let path = d3.geoPath()
      .projection(projection)
    let t = d3.transition().duration(750);
    this.selection.transition(t).attr('d', path);

    this.activeSelection.classed('active', false);
    this.activeSelection = d3.select(el).classed('active', true);

    let { width, height } = this.svg.node().getBoundingClientRect();
  
    let bounds = path.bounds(feature),
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
  */
}
