import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { Point, Area, Building } from '../../models';
import { Selection } from 'd3';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo-projection';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

interface NestEntry<T> {
  key: string;
  values: T[];
}
type NestEntries<T> = NestEntry<T>[];

import { AuthorizationService } from '../../../app/services/authorization.service';

import { Feature, FeatureCollection } from '../../models';
const [ width, height ] = [100, 100];
const offset = [width/2, height/2];

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

  constructor(private auth: AuthorizationService) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
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
    if (this.svg) {
      this.update();
    }
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
      //active.classed('active', false);
      //active = d3.select(null);
    
      let t = d3.transition(null).duration(750);
      self.svg.transition(t).call( self.zoom.transform as any, d3.zoomIdentity );
    }
    
    function zoomed() {
      g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
      g.attr('transform', d3.event.transform);
    }

    let projectionFn = d3.geoMercator()
    this.path = d3.geoPath().projection(projectionFn);
    this.update();
  }

  async update() {
    let self = this;
    let { path, floorplan, projection, layer, _building, building, floor, many } = this;

    let areas: Area[] = await this.auth.get(`/buildings`).toPromise();

    if (building) {
      if (!_building || _building._id != building) {
        this._building = _building = await this.auth.get(`/buildings/${ building }`).toPromise();
      }
      if (typeof floor !== 'string') {
        let floors = await this.auth.get(`/buildings/${ building }/floors`).toPromise();
        this.floor = floor = floors[0];
      }
      if (typeof layer !== 'string') {
        let layers = await this.auth.get(`/buildings/${ building }/layers`).toPromise();
        this.layer = layer = 'room' //layers[0];
      }

      let qp = new URLSearchParams();
      if (many != 'floors') {
        qp.set('floor', floor);
      }
      if (many != 'layers') {
        qp.set('layer', layer);
      }

      let moreAreas = await this.auth.get(`/buildings/${ building }/areas`, { search: qp }).toPromise();
      areas.push(...moreAreas);

    } else {
      layer = 'building'
    }

    let byLayer: NestEntries<Area> = d3.nest()
      .key(many == 'floors' ? (d:Area) => d.floor : (d:Area) => d.type)
      .entries(areas)
      .sort((a, b) => _building[many || 'layers'].indexOf(a.key) > _building[many || 'layers'].indexOf(b.key) ? -1 : 1)
      // always render buildings, except when many
      // render other layers if active
      .filter(({ key }) => key != 'null' && (key == 'building' ? !many : (many || key == layer)))
      .map(e => Object.assign(e, { floorplan: e.key == 'building' || e.key == layer }));

    let layersSelection = this.svg.select('#container').selectAll('g.layer')
      .data(byLayer, (d:NestEntry<Area>) => d.key);

    let transition = d3.transition(null).duration(750);

    layersSelection.exit().transition(transition)
      .attr('transform', (d) => {
        let transform = `translate(0, 0)`
        if (projection=='perspective'){
          return `${ transform }rotate(-30)skewX(30)`
        }
        return transform;
      })
      .attr('opacity', 0)
      .remove();

    layersSelection = layersSelection.enter().append('g').classed('layer', true)
      .attr('opacity', 1)
      .attr('transform', (d) => {
        let transform = `translate(0, 0)`
        if (projection=='perspective'){
          return `${ transform }rotate(-30)skewX(30)`
        }
        return transform;
      })
      .merge(layersSelection)

    layersSelection.transition(transition).attr('transform', d => {
      let transform = `translate(0, 0)`
      if (many) {
        let dy = _building[many || 'layers'].indexOf(many == 'layers' ? layer : floor) - _building[many || 'layers'].indexOf(d.key);
        console.log(dy);
        //let bounds = path.bounds(wrapCollection(d.values.map(a => a.feature)));
        transform = `translate(0, ${ dy*30 })`;
      }

      if (projection == 'perspective') {
        transform = `${ transform }rotate(-30)skewX(30)`
      }

      return transform;
    })

    let featuresSelection = layersSelection.selectAll('path.feature').data(d => d.values);
    
    let r = building ? _building.feature.properties.gamma : 0;
    let activeFeature: any = building ? _building.feature : wrapCollection(byLayer.find(e => e.key == 'building').values.map(a => a.feature));
    let center = d3.geoCentroid(<Feature>activeFeature);

    if (path.projection().rotate().slice(0, 2).every(n => n == 0)) {
      path.projection().rotate(center.concat(r).map(i => i*-1) as [number, number, number]).fitSize([100, 100], activeFeature);
    }

    let featuresSelectionExiting = featuresSelection.exit()

    featuresSelection = featuresSelection.enter().append('path').classed('feature', true)
      .on('click', function(d) {
        let transition = d3.transition(null).duration(750);

        //if (d.type == 'building' && building != d._id) {
        //  self.svg.transition(transition).call( self.zoom.transform as any, d3.zoomIdentity );
        //  featuresSelection.transition(transition).delay((d, i) => i*10).attrTween('d', function(_d) {
        //    let nrot = d3.geoCentroid(d.feature).concat(d.feature.properties.gamma);
        //    let rot = d3.interpolate(path.projection().rotate(), center.map(i => i*-1));

        //    return function(t) {
        //      path.projection().rotate(rot(t) as [number, number, number])
        //      return path(_d.feature);
        //    }
        //  });
        //} else {
        
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

        //}
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

    featuresSelection.merge(featuresSelectionExiting as any).transition(transition)
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

    featuresSelectionExiting.transition(transition).attr('opacity', 0).remove();


    //if (building) {
    //  let bounds = path.bounds(_building.feature),
    //      dx = bounds[1][0] - bounds[0][0],
    //      dy = bounds[1][1] - bounds[0][1],
    //      x = (bounds[0][0] + bounds[1][0]) / 2,
    //      y = (bounds[0][1] + bounds[1][1]) / 2,
    //      bscale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
    //      vt = [width / 2 - bscale * x, height / 2 - bscale * y];
    //    
    //  bscale = d3.zoomTransform(self.svg.node()).k;
    //  self.svg.transition(t).call( self.zoom.transform as any, d3.zoomIdentity.translate(vt[0],vt[1]).scale(bscale) );
    //}

    /*
    let features = sel.selectAll('path.feature').data(buildings)

    features = features.enter().append('path')
      .attr('class', 'feature')
      .attr('fill', (d) => this.colorScale(this.valueParser(d)))
      .on('click', function(d) {
        let id = d._id;
        let [cx, cy] = d3.geoCentroid(d.feature);
        let r = d.feature.properties.gamma;

        sel.selectAll('path.feature')
          .interrupt()
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          //.attrTween('d', projectionTween(projectionFn, projectionFn = calcProjection(d.feature, r)));

      })
      .on('dblclick', function(d) {
        console.log(d);
      })
      .on('mouseover', function() {
        (<any>this).parentNode.appendChild(this);
      })
      .on('mouseleave', function() {
        //if (self.activeSelection) {
        //  (<any>this).parentNode.appendChild(self.activeSelection.node());
        //}
      })
      .merge(features)

    let fc = wrapCollection(buildings.map(b => b.feature));
    let center= d3.geoCentroid(fc as any);

    let scale = 2e6;

    let calcProjection = (feature, r=0, center?) => {
      center = center || d3.geoCentroid(feature);
      let projection = d3.geoMercator().scale(1).center([0, 0]).rotate(center.map(i => i*-1).concat(r) as [number, number, number]).translate([0, 0]);
      let path = d3.geoPath().projection(projection);
      let b = path.bounds(feature);
      let s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      let t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2] as [number, number];
      console.log(s, t);
      return projection.scale(s).translate(t)
    };

    //let projectionFn = d3.geoMercator().scale(1).center([0, 0]).rotate(center.map(i => i*-1).concat(0) as [number, number, number]).translate([0, 0])//.scale(scale).translate(offset as [number, number]);
    let projectionFn = calcProjection(fc);

    let path = d3.geoPath().projection(projectionFn);
    //var b = path.bounds(fc),
    //    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    //    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2] as [number, number];

    //console.log(...center, 'scale', s, 'translate', t);
    //projectionFn
    //    .scale(s)
    //    .translate(t)

    features//.attr('d', (d) => path(d.feature));
          .interrupt()
          .transition()
          .duration(1000)
          .ease(d3.easeLinear)
          .attrTween('d', projectionTween(projectionFn, projectionFn = calcProjection(fc)));
    */

  }

  ngOnDestroy() {}

  /*
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

    entering.filter(d => d.properties.id == this.active).each(function() {
      self.styleActive(this);
    });

    entering
      .on('click', function(d) {
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
      })
      .on('dblclick', function(d) {
        console.log(d);
      })
      .on('mouseover', function() {
        (<any>this).parentNode.appendChild(this);
      })
      .on('mouseleave', function() {
        if (self.activeSelection) {
          (<any>this).parentNode.appendChild(self.activeSelection.node());
        }
      })

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
    //this.selection
    //  .transition(t)
    //  .attr('opacity', visible ? 0.8 : 0.8);
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
      self.styleActive(this)
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

  styleActive (el): void {
    this.activeSelection = d3.select(el).classed('active', true);
    el.parentNode.appendChild(el);
  }

  updateMap(fc: FeatureCollection) {
    this.mapSelection.datum(fc).attr('d', this.path);
  }
  */
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
  scale = Math.min(2e6, scale)
  projection.scale(scale).translate(offset as [number, number]);
  path.projection(projection);
  let transforms = { center, scale, offset };
  return { path, transforms };
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

function wrapCollection(features: Feature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  };
}
function projectionTween(projection0, projection1) {
  return function(d) {
    var t = 0;
    var projection = d3.geoProjection(project)
      .scale(1)
      .center([0, 0])
      .translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);
    function project(λ, φ) {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI;
      var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]] as [number, number];
    }
    return function(_) {
      t = _;
      return path(d.feature);
    };
  };
}
