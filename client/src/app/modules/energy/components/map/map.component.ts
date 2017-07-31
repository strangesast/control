import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { BasePoint } from '../../models';
import { Selection } from 'd3';
import * as d3 from 'd3';

import { Feature, FeatureCollection } from '../../models';
import { MapService } from '../../services/map.service';

function getFeatures(map: { [key: string]: BasePoint }, key) {
  console.log('map', map, 'key', key);
  return Object.keys(map).map(id => map[id]).filter(f => f.type == key);
}

function wrapCollection(points: BasePoint[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features: points.map(p => p.feature)
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
  activeEl$: Observable<BasePoint>;

  @ViewChild('svg') el: ElementRef; 

  map$: Observable<FeatureCollection>;

  // 'room' -> 'department' -> 'wing' -> 'building' -> null
  reset$: Subject<number>; // start at current layer, go up to null

  @Output('layerChange') layer$: Observable<string>;

  constructor(private service: MapService) {
    this.reset$ = new Subject();

    let data$ = service.features$.flatMap(featureMap =>
      this.active$.distinctUntilChanged().scan(({ active: prevActive, layer: prevLayer, points }, activeId) => {
        let active = activeId && featureMap[activeId];
        let layer = active ? active.type: null;

        // only recalculate feature list when layer changes.  if active = null,
        // use the same feature list
        if (
          active != null &&
          (prevActive && prevActive.type) != active.type
        ) {
          layer = active.type;
          points = getFeatures(featureMap, layer);
        } else if (layer == null) {
          // also disable floorplan
          points = getFeatures(featureMap, 'building');
        } else {
          layer = prevLayer;
        }
        console.log('points', points, active, layer);

        return { active, layer, points };
      }, { active: null, layer: null, points: [] }),
    ).shareReplay(1);

    this.layer$ = <Observable<string>>data$.pluck('layer').distinctUntilChanged()

    data$.take(1).subscribe(({ active, layer, points }) => this.init(points));


    data$.skip(1).subscribe(({ active, layer, points }) => {
      if (layer) {
        this.clicked(active, points);
      } else {
        this.reset(points, false);
      }
    });

    Observable.forkJoin(this.service.layers$, this.service.features$).flatMap(([ layers, featureMap]) => this.reset$.withLatestFrom(data$).switchMap(([ dir, { active, layer: prevLayer, points }]) => {
      let i = layers.findIndex((l) => l.key == prevLayer);
      let layer = layers[Math.min(i+dir, layers.length)];
      let layerKey = layer ? layer.key : null;
      if (layerKey != prevLayer) {
        points = getFeatures(featureMap, layerKey || 'building');
        console.log('points', points);
        return Observable.of({ active, layer: layerKey, points });
      }
      return Observable.never();
    })).subscribe(({ active, layer, points }) => {
      console.log('layer', layer, 'points', points);
      if (layer != null) {
        this.clicked(active, points);
      } else {
        this.reset(points, false);
      }
    });
  }

  activeSelection: Selection<any, any, any, any>;
  r: number;
  svg: Selection<any, any, any, any>;
  zoom;
  path;
  selection: Selection<any, BasePoint, any, any>;
  transforms = { center: [], offset: [], scale: 150 };

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnDestroy() {}

  init(points: BasePoint[]) {
    let self = this;
    let featureCollection = wrapCollection(points);
    //this.featureCollection = featureCollection;
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
    let path = d3.geoPath().projection(projection)
    let bounds = path.bounds(featureCollection);
    let hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
    let vscale = scale*height / (bounds[1][1] - bounds[0][1]);
    scale = (hscale < vscale) ? hscale : vscale;
    offset = [
      width - (bounds[0][0] + bounds[1][0])/2,
      height - (bounds[0][1] + bounds[1][1])/2
    ];
    this.transforms = { center, offset, scale };

    projection = this.calcProjection();
    this.path = path.projection(projection);
            
    this.svg.append('rect')
      .attr('opacity', 0)
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', () => {
        // toggle up
        self.reset$.next(-1);
        //self.reset()
      });
    
    let g = this.svg.append('g');
    
    this.svg.call(this.zoom)
      .on('dblclick.zoom', null)
    
    this.selection = g.selectAll('path');

    this.selection = this.selection.data(points, (d) => d._id)
      .enter().append('path')
        .attr('d', (d) => this.path(d.feature))
        .attr('data-id', (d: BasePoint) => d._id)
        .attr('class', 'feature')
        .on('click', function (d: BasePoint) {
          if (self.activeSelection.node() === this) {
            self.reset$.next(-1);
            //self.reset();
          } else {
            let id = d._id;
            self.active = id;
            self.activeChange.emit(id);
          }
        })
      .merge(this.selection);
  }

  calcProjection (rot?: number) {
    let { center, scale, offset } = this.transforms;
    let projection = rot ?
      d3.geoMercator().rotate(center.map(i => i*-1).concat(rot) as [number, number, number]).center([0, 0]) :
      d3.geoMercator().rotate([0, 0, 0]).center(center as [number, number])
    return projection.scale(scale).translate(offset as [number, number]);
  }

  reset(points, rot) {
    let featureCollection = wrapCollection(points);
    let { scale, center } = this.transforms;
    //let projection = this.calcProjection();
    let projection = this.calcProjection(rot ? this.r : null);
    let { width, height } = this.svg.node().getBoundingClientRect();
    this.svg.select('rect').attr('width', width).attr('height', height);

    let path = d3.geoPath().projection(projection)
    let bounds = path.bounds(featureCollection);
    let offset  = [
      width - (bounds[0][0] + bounds[1][0])/2,
      height - (bounds[0][1] + bounds[1][1])/2
    ];
    this.transforms = { center, offset, scale };

    projection = this.calcProjection(rot ? this.r : null);
    this.path = d3.geoPath().projection(projection)
    let t = d3.transition(null).duration(750);
    this.selection.transition(t).attr('d', (d) => this.path(d.feature));

    this.activeSelection.classed('active', false);
    this.activeSelection = d3.select(null);
  
    this.svg.transition(t).call(this.zoom.transform, d3.zoomIdentity);
  }

  clicked(active: BasePoint, points: BasePoint[]) {
    let self = this;
    let projection = this.calcProjection(this.r);
    let path = d3.geoPath()
      .projection(projection)

    let t = d3.transition(null).ease(d3.easePoly).duration(750);

    let selection = this.selection.data(points, (d) => d._id)

    let { width, height } = this.svg.node().getBoundingClientRect();
    this.svg.select('rect').attr('width', width).attr('height', height);

    selection.exit().attr('opacity', 1).transition(t).attr('d', (d: BasePoint) => path(d.feature)).attr('opacity', 0).remove();

    let entering = selection.enter()
      .append('path')
      .attr('opacity', 0)
      .attr('d', (d) => this.path(d.feature))
      .attr('data-id', (d) => d._id)
      .attr('class', 'feature')
      .on('click', function (d) {
        if (self.activeSelection.node() === this) {
          self.reset$.next(-1);
          //self.reset();
        } else {
          let id = d._id;
          self.active = id;
          self.activeChange.emit(id);
        }
      });

    this.selection = entering.merge(this.selection);
    this.selection.transition(t).attr('d', (d) => path(d.feature)).attr('opacity', 1);
    this.activeSelection.classed('active', false);

    this.path = path;

    if (active) {
      let id = active._id;
      let el = this.svg.select(`[data-id="${ id }"]`).node();
      this.activeSelection = d3.select(el).classed('active', true);

  
      let bounds = path.bounds(active.feature),
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
    } else {
      this.reset(points, true);
    }
  }
}
