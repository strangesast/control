import { SimpleChanges, EventEmitter, ViewChild, ElementRef, Output, Input, Component, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
//import * as topojson from 'topojson';
import { Point, Area } from '../../models';
import { Selection } from 'd3';
import * as d3 from 'd3';

import { Feature, FeatureCollection } from '../../models';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  @ViewChild('svg') el: ElementRef; 

  // when a new floor is clicked
  @Output() layerChange = new EventEmitter();
  // when a new feature is clicked
  // string
  @Output() buildingChange: EventEmitter<string> = new EventEmitter();
  @Output() activeChange: EventEmitter<string> = new EventEmitter();
  @Input() active: string;
  @Input() features: FeatureCollection;
  // like {
  //    ...
  //    features: [{
  //       ...
  //       properties: {
  //         ...
  //         id: string,
  //         layer: number // only display 0 layer
  //       }
  //    }, ... ]
  // }
  @Input() map: FeatureCollection;

  // which projection
  @Input() state: string = 'normal';

  ngOnChanges(changes: SimpleChanges) {
    if (this.features && (changes.features || changes.active)) {
      this.setActive(this.features, this.active);
    }
    if (changes.map) {
      this.renderMap(this.map);
    }
  }

  activeSelection: Selection<any, any, any, any>;
  r: number;
  svg: Selection<any, any, any, any>;
  zoom;
  path;
  selection: Selection<any, any, any, any>;
  projection: d3.GeoProjection;
  transforms = { center: [], offset: [], scale: 150 };

  ngOnInit() {
    this.activeSelection = d3.select(null);
    let [width, height] = [100, 100];
   
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

    let g = this.svg.append('g');

    this.selection = g.selectAll('path');

    this.svg.append('rect')
      .attr('opacity', 0)
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', () => {
        // toggle up
        //self.reset$.next(-1);
        //self.reset()
      });
    
    
    this.svg.call(this.zoom)
      .on('dblclick.zoom', null)
  }

  ngOnDestroy() {}


  renderMap(features: FeatureCollection) {
  }

  setActive(fc: FeatureCollection, active?: string) {
    // remove old features, add new features
    let self = this;
    let { features } = fc;

    let [ width, height ] = [100, 100];

    let center = d3.geoCentroid(fc);
    let offset = [width/2, height/2];
    let scale = 150;
    let transforms = { center, offset, scale };

    let path;
    if (!this.projection) {
      let projection;
      if (active) {
        projection = d3.geoMercator().rotate(center.map(i => i*-1).concat(112) as [number, number, number]).center([0, 0])
      } else {
        projection = d3.geoMercator().rotate([0, 0, 0]).center(center as [number, number]);
      }
      projection.scale(scale).translate(offset as [number, number]);

      path = d3.geoPath().projection(projection)

      let bounds = path.bounds(fc);
      let hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
      let vscale = scale*height / (bounds[1][1] - bounds[0][1]);
      scale = (hscale < vscale) ? hscale : vscale;
      offset = [
        width - (bounds[0][0] + bounds[1][0])/2,
        height - (bounds[0][1] + bounds[1][1])/2
      ];

      if (active) {
        projection = d3.geoMercator().rotate(center.map(i => i*-1).concat(112) as [number, number, number]).center([0, 0])
      } else {
        projection = d3.geoMercator().rotate([0, 0, 0]).center(center as [number, number]);
      }
      projection.scale(scale).translate(offset as [number, number]);
      this.projection = projection;
    }

    path = path.projection(this.projection);
            
    let t = d3.transition(null).ease(d3.easePoly).duration(750);

    let selection = this.selection.data(features, (d) => d.properties._id)

    let entering = selection.enter().append('path')
        .attr('d', path)
        .attr('data-id', d => d.properties.id)
        .attr('class', 'feature')
        .on('click', function (d) {
          let { type, id } = d.properties;
          if (type == 'building') {
            self.buildingChange.emit(id);
          } else if (type == 'point') {
          } else {
            self.activeChange.emit(id);
          }
          //if (self.activeSelection.node() === this) {
          //} else {
          //}
        })

    this.selection = entering.merge(selection);
    this.selection.transition(t)
      .attr('d', path)
      .attr('opacity', 1);


    selection.exit().transition(t).attr('opacity', 0).attr('d', path).remove();

    this.selection = entering.merge(this.selection);

    this.activeSelection.classed('active', false);

    this.selection.classed('active', false)
      .filter(d => d.properties._id == active)
      .classed('active', true)
      .each((d, i) => {
        if (i !== 0) return;
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
      });
  }
}

function projectionTween(projection0, projection1, width, height) {
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
