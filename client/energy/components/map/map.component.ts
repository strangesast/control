import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { Point, Area, Building } from '../../models';
import { Selection } from 'd3';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo-projection';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

import { DataService } from '../../services/data.service';

interface NestEntry<T> {
  key: string;
  values: T[];
}
type NestEntries<T> = NestEntry<T>[];

import { AuthorizationService } from '../../../app/services/authorization.service';

import { Feature, FeatureCollection } from '../../models';
const [ width, height ] = [100, 100];
const offset = [width/2, height/2];

const skewAngle = 30;
const rotAngle = -30;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  // input / output
  /* floorplan: string
   * render building floorplan on primary, all, or no layers
   * 'one'|'many'|void
   * not set internally
   * url: /buildings/<this.building>/floorplan
   */
  @Input() floorplan: string = 'one';

  /* many: string
   * render each floor/layer for building or just the active floor/layer
   * 'layers'|'floors'|void
   * not set internally
   */
  @Input() many: string;

  /* projection: string
   * d3 geo projection to use for features
   * 'orthographic'|'perspective'|'satellite'
   * not set internally
   */
  @Input() projection: string = 'orthographic';

  /* building: id|short_name
   * active building
   * 'some_building'
   * url: /buildings/<this.building>
   */
  @Input() set building(_building: string|Building) {
    if (typeof _building == 'string') {
      this._buildingId = _building;
    } else if (_building != null && typeof _building._id == 'string') {
      this._building = _building;
      this._buildingId = _building._id;
    } else {
      this._building = null;
      this._buildingId = null;
    }
    this.floor = null;
    this.layer = null;
  };
  get building() {
    return this._buildingId;
  }
  private _building: Building;
  private _buildingId: string;
  @Output() buildingChange: EventEmitter<string> = new EventEmitter();

  /* area: id|short_name
   * active area
   * 'some_room'
   */
  @Input() area: string;
  private _area: Area;
  @Output() areaChange: EventEmitter<string> = new EventEmitter();
  
  /* floor: string|void
   * active floor key filter
   * 'floor_1'|'1'
   * url: /buildings/<this.building>/areas?floor=<this.floor>
   */
  @Input() floor: string;
  @Output() floorChange: EventEmitter<string> = new EventEmitter();

  /* layer: string|void
   * active layer key filter
   * 'department'|'layer_1'
   * url: /buildings/<this.building>/areas?layer=<this.layer>
   */
  @Input() layer: string;
  @Output() layerChange: EventEmitter<string> = new EventEmitter();

  /* value: string|void
   * value string used to extract number from areas
   * 'data.temperature-data.set_point'
   */
  @Input() value: string = 'data.temperature';

  /* color: string|void
   * if defined, use this color to determine the static or interpolated color
   * for each feature based on computed value
   * 'red'|'RdYlBu'|null
   */
  @Input() color: string = 'RdYlBu';

  /* min/max: number
   * range for value interpolation
   * 60|80
   */
  @Input() min: number = 60;
  @Input() max: number = 80;

  /* init: string
   * starting building.short_name or coordinates to center map on
   * 'some_building'|'-72.8,42.2'
   * url: /buildings?near=<this.init>
   */
  @Input() init: string;

  // used internally
  @ViewChild('svg') el: ElementRef; 
  svg: Selection<any, any, any, any>;

  valueParser; // last 'data.temperature' parsing fn
  colorScale; // last interpolation fn
  
  // zoom fn, used for transforms
  zoom;
  path;
  center;

  inputs$ = new BehaviorSubject(this);
  areas$
  constructor(private auth: AuthorizationService, private data: DataService) {
    let path$ =       this.inputs$.pluck('path').distinctUntilChanged();
    let floorplan$ =  this.inputs$.pluck('floorplan').distinctUntilChanged();
    let projection$ = this.inputs$.pluck('projection').distinctUntilChanged();
    let building$ =   this.inputs$.pluck('building').distinctUntilChanged();
    let abuilding$ = building$.filter(b => !!b);
    let floor$ = this.inputs$.pluck('floor')
      .withLatestFrom(abuilding$)
      .switchMap(([floor, building]) => typeof floor !== 'string' ? this.auth.get(`/buildings/${ building }/floors`).map(floors => this.floor = floors[0]) : Observable.of(floor))
      .distinctUntilChanged();
    let layer$ = this.inputs$.pluck('layer')
      .withLatestFrom(abuilding$)
      .switchMap(([layer, building]) => typeof layer !== 'string' ? this.auth.get(`/buildings/${ building }/layers`).map(layers => this.layer = 'room' || layers[0]) : Observable.of(layer))
      .distinctUntilChanged();

    let many$ =       this.inputs$.pluck('many').distinctUntilChanged();
    let buildings$ =  this.auth.get(`/buildings`);

    // determine areas based on building, floor, layer, & many
    this.areas$ = Observable.combineLatest(building$, buildings$).switchMap(([building, buildings]) => {
      if (building) {
        return Observable.combineLatest(floor$, layer$, many$).switchMap(([floor, layer, many]) => {
          return this.data.cacheOrGet(many, building, floor, layer).map(areas => buildings.concat(areas));
        });

      } else {
        this.layer = 'building'
        return Observable.of(buildings);
      }
    });

    this.areas$.subscribe(areas => this.update(areas));
    // ehhhh
    //projection$.withLatestFrom(this.areas$).subscribe(([_, areas]) => this.update(areas))
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value != null ||
      this.valueParser == null) {
      this.valueParser = parseValueString(this.value);
    }
    if (this.colorScale == null ||
      changes.color != null ||
      changes.min != null ||
      changes.max != null) {
      let { color, min, max } = this;
      this.colorScale = createColorScale(color, min, max);
    }
    this.inputs$.next(this);
  }

  async ngOnInit() {
    let self = this;
    this.zoom = d3.zoom()
      .scaleExtent([1, 100])
      .on('zoom', zoomed);

    this.svg = d3.select(this.el.nativeElement)
      .on('click', stopped, true);

    // prevent zoom on drag
    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

     // disable zoom in on dblclick
    this.svg.call(this.zoom).on('dblclick.zoom', null);
   
    this.svg.append('rect')
      .attr('class', 'background')
      .attr('opacity', 0)
      .attr('width', width)
      .attr('height', height)
      .on('dblclick', reset);
    

    let g = this.svg.append('g').attr('id', 'container');
   
    function reset() {
      self.buildingChange.emit(null);
      let t = d3.transition(null).duration(750);
      self.svg.transition(t).call( self.zoom.transform as any, d3.zoomIdentity );
    }
    
    function zoomed() {
      g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
      g.attr('transform', d3.event.transform);
    }

    //let perspectiveTransform = d3.geoTransform({
    //  point: function(x, y) {
    //    this.stream.point(a * x + b * y + tx, c * x + d * y + ty);
    //  }
    //});

    let projectionFn = d3.geoMercator()
    this.path = d3.geoPath().projection(projectionFn);
    this.inputs$.next(this);
  }

  async update(areas) {
    let self = this;
    let { path, floorplan, projection, layer, _building, building, floor, many } = this;

    let byLayer: NestEntries<Area> = d3.nest()
      .key(many == 'floors' ? (d:Area) => d.floor : (d:Area) => d.type)
      .entries(areas)
      .sort((a, b) => _building[many || 'layers'].indexOf(a.key) > _building[many || 'layers'].indexOf(b.key) ? 1 : -1)
      // always render buildings, except when many
      // render other layers if active
      .filter(({ key }) => key != 'null' && (key == 'building' ? !many : (many || key == layer)))
      .map(e => Object.assign(e, { floorplan: e.key == 'building' || e.key == layer }));

    let layersSelection = this.svg.select('#container').selectAll('g.layer')
      .data(byLayer, (d:NestEntry<Area>) => d.key);

    let transition = d3.transition(null).duration(750);

    let layersSelectionExiting = layersSelection.exit();

    layersSelectionExiting.transition(transition)
      .attr('transform', (d: NestEntry<Area>) => {
        let transform = `translate(0, 0)`
        if (projection=='perspective'){
          let b = path.bounds(wrapCollection(d.values.map(a => a.feature)));
          return calcPerspectiveTransform(transform, b);
        }
        return transform;
      })
      .attr('opacity', 0)
      .remove();

    layersSelectionExiting.selectAll('path.feature').transition(transition)
      .attrTween('d', function(_d: Area) {
        let center = d3.geoCentroid(activeFeature);
        let rot = d3.interpolate(path.projection().rotate(), center.concat(r).map(i => i*-1));

        return function(t) {
          path.projection().rotate(rot(t) as [number, number, number])
          return path(_d.feature);
        }
      })
      .attr('opacity', 0)
      .remove();

    layersSelection = layersSelection.enter().append('g').classed('layer', true)
      .attr('opacity', 1)
      .attr('transform', (d) => {
        let transform = `translate(0, 0)`
        if (projection=='perspective'){
          let b = path.bounds(wrapCollection(d.values.map(a => a.feature)));
          return calcPerspectiveTransform(transform, b);
        }
        return transform;
      })
      .merge(layersSelection)

    layersSelection.transition(transition).attr('transform', d => {
      let transform = `translate(0, 0)`
      if (many) {
        let dy = _building[many || 'layers'].indexOf(many == 'layers' ? layer : floor) - _building[many || 'layers'].indexOf(d.key);
        //let bounds = path.bounds(wrapCollection(d.values.map(a => a.feature)));
        transform = `translate(0, ${ dy*(projection == 'perspective' ? 28 : 24) })`;
      }

      if (projection == 'perspective') {
        let b = path.bounds(wrapCollection(d.values.map(a => a.feature)));
        transform = calcPerspectiveTransform(transform, b);
      }

      return transform;
    });

    let featuresSelection = layersSelection.selectAll('path.feature').data(d => d.values, (d: Area|Building) => d._id);
    
    let r = building ? _building.feature.properties.gamma : 0;
    let activeFeature: any = building ? _building.feature : wrapCollection(byLayer.find(e => e.key == 'building').values.map(a => a.feature));
    let center = d3.geoCentroid(<Feature>activeFeature);

    if (path.projection().rotate().slice(0, 2).every(n => n == 0)) {
      path.projection().rotate(center.concat(r).map(i => i*-1) as [number, number, number]).fitSize([100, 100], activeFeature);
    }

    featuresSelection = featuresSelection.enter().append('path').classed('feature', true)
      .on('click', function(d) {
        let transition = d3.transition(null).duration(750);

        if (d.type == 'building' && building == d._id) {
          return;
        }
        var bounds = path.bounds(d.feature),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        var transform = d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale);

        self.svg.transition(transition).duration(750).call(self.zoom.transform, transform);
      })
      .on('dblclick', function(d) {
        let trans = d3.zoomTransform(self.svg.node())
        self.svg.transition().call(self.zoom.transform, d3.zoomIdentity.translate(trans.x, trans.y).scale(trans.k))
        if (d.type == 'building') {
          self.buildingChange.emit(d._id);
        } else {
          console.log(_building.layers.indexOf(d.type));
        }
      })
      .merge(featuresSelection);

    featuresSelection.transition(transition)
      .attr('fill', d => {
        if (building && d.type == 'building') {
          return 'darkgrey';
        }
        return this.colorScale(this.valueParser(d));
      })
      .attr('opacity', d => {
        if (building && d.type == 'building') {
          return building == d._id ? 0 : projection == 'orthographic' ? 0.5: 0;
        } else if (d.type != 'building' && d.building != building) {
          return 0;
        }
        return 1;
      })
      .attrTween('d', function(_d) {
        let center = d3.geoCentroid(activeFeature);
        let rot = d3.interpolate(path.projection().rotate(), center.concat(r).map(i => i*-1));

        return function(t) {
          path.projection().rotate(rot(t) as [number, number, number])
          return path(_d.feature);
        }
      }).on('end', function() {
        let transition = d3.transition(null).duration(750);
        var bounds = path.bounds(activeFeature),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y];
        self.svg.transition(transition).call( self.zoom.transform as any, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale) );
      });

  }

  ngOnDestroy() {}
}

function createColorScale (str: string, min?, max?) {
  if (['RdYlBu'].indexOf(str) > -1) {
    let color = d3ScaleChromatic[`interpolate${ str }`];
    return d3.scaleLinear()
      .domain([min, max])
      .range([0, 1])
      .interpolate(() => color);
  } else {
    let color = d3.color(str) || '#000000';
    return () => color;
  }
}

var opsRe = /[\+\-*\/]/g;
function parseValueString (str: string) {
  var ops = [], keys = [], i = 0;
  while (true) {
    let arr = opsRe.exec(str);
    let { 0: op, index } = arr || {} as any;
    let key = str.substring(i, index);
    keys.push(key);
    if (index == null) break;
    ops.push(op);
    i = index+1;
  }

  return function(obj) {
    let i = 0;
    let value = applyKeys(obj, keys[i++].split('.'));
    while (i < keys.length) {
      let op = ops.shift();
      let val = applyKeys(obj, keys[i++].split('.'));
      switch (op) {
        case '+':
          value += val
          break;
        case '-':
          value -= val
          break;
        case '*':
          value *= val
          break;
        case '/':
          value /= val
          break;
        default:
          throw new Error('invalid value string');
      }
    }
    return value;
  }
}

function applyKeys (obj, keys) {
  return keys.reduce((a, key) => (a && a[key]) || null, obj);
}

/*
(function test() {
  let obj = { '1': { '1': 1 }, '2': 2, '3': 3, '4': 4 };
  let value = '1.1+2-4*3/2';

  let fn = parseValueString(value);
  // should apply operations sequentially
  let res = fn(obj);
  if (res !== -1.5) throw new Error('failed test');

  // should simply read value
  value = '1.1';
  fn = parseValueString(value);
  res = fn(obj);
  if (res !== 1) throw new Error('failed test');
})();
*/

function wrapCollection(features: Feature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
}

function calcPerspectiveTransform (transform, bounds) {
  let [[x0, y0], [xi, yi]] = bounds;
  let offy = Math.sqrt(3)*(yi-y0)/2; // <-- lil trig
  return `${ transform }translate(0,${ offy })translate(${ x0 },${ y0 })rotate(${ rotAngle })skewX(${ skewAngle })translate(${ -x0 },${ -y0 })`;
}

