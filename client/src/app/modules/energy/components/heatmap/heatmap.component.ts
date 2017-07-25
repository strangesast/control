import { SimpleChanges, Input, ElementRef, ViewChild, Component, OnInit } from '@angular/core';
import { Selection } from 'd3';
import * as d3 from 'd3';
import { Observable, Subject } from 'rxjs';

import { Feature, FeatureCollection } from '../../models';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.less']
})
export class HeatmapComponent implements OnInit {
  @ViewChild('svg') svgEl: ElementRef;
  @ViewChild('canvas') svg2El: ElementRef;
  svg: Selection<any, any, any, any>;
  map: FeatureCollection;
  path;
  projection;
  zoom;
  active$: Subject<string> = new Subject();
  @Input('active') active;

  constructor(private service: MapService) { }

  ngOnInit() {
    this.svg = d3.select(this.svgEl.nativeElement);

    let init$ = this.service.map$.withLatestFrom(this.service.features$).first().map(([ featureCollection ]) => {
      this.init(featureCollection);
    }).share();

    init$.withLatestFrom(this.service.features$).flatMap(([_, featureMap]) => {

      //let pointMap = Object.keys(featureMap).filter(id => featureMap[id].properties.layer == 'point');

      return this.active$.map(activeId => {
        let active = featureMap[activeId];

        this.zoomTo(active);

      })
    }).subscribe();

    init$.flatMap(() => this.service.pointValues$).subscribe(values => this.heat(values));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active) {
      this.active$.next(changes.active.currentValue);
    }
  }

  heat(points) {
    let svg2 = d3.select(this.svg2El.nativeElement);
    let filter = svg2.append('defs').append('filter').attr('id', 'blur').append('feGaussianBlur').attr('stdDeviation', 8);

    let { width, height } = this.svg.node().getBoundingClientRect();

    //let pixelSize = 50;
    //let [n, m] = [width, height].map(d => Math.floor(d/pixelSize));

    let i0 = d3.interpolateHslLong(d3.hsl(0, 100, 0.65), d3.hsl(60, 80, 0.90)),
        i1 = d3.interpolateHslLong(d3.hsl(100, 100, 0.90), d3.hsl(200, 100, 0.95)),
        interpolateTerrain = function(t) { return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2); },
        color = d3.scaleSequential(interpolateTerrain).domain([90, 190]);

    let data = points.map(point => {
      let pt = point.feature.geometry.coordinates;
      let [x, y] = this.projection(pt);
      let v = point.data.last - 70;
      return { x, y, v };
    });
    svg2.selectAll('circle').data(data)
      .enter()
      .append('circle')
      .style('fill-opacity', 0.5)
      .attr('filter', 'url(#blur)')
      .attr('r', 30)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('fill', (d: any) => color(d.v))
 
  }

  init(featureCollection) {
    let { width, height } = this.svg.node().getBoundingClientRect();
    let center = d3.geoCentroid(featureCollection);
    let offset = [width/2, height/2];
    let scale = 1;
  
    let rot = 180-112.0;
  
    let projection = d3.geoMercator()
      .rotate(center.map(i => i*-1).concat(rot) as [number, number, number])
      .center([0, 0])
      .scale(scale)
      .translate(offset as [number, number])
    let path = d3.geoPath().projection(projection)
    let bounds = path.bounds(featureCollection);
    let hscale = scale*width  / (bounds[1][0] - bounds[0][0]);
    let vscale = scale*height / (bounds[1][1] - bounds[0][1]);
    scale = (hscale < vscale) ? hscale : vscale;
    offset = [
      width - (bounds[0][0] + bounds[1][0])/2,
      height - (bounds[0][1] + bounds[1][1])/2
    ];

    this.projection = d3.geoMercator()
      .rotate(center.map(i => i*-1).concat(rot) as [number, number, number])
      .center([0, 0])
      .scale(scale)
      .translate(offset as [number, number]);
    this.path = path.projection(this.projection);

 
    let g = this.svg.append('g')
    g.append('path')
      .datum(featureCollection)
      .attr('d', path)
      .attr('stroke', 'black')

    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function() {
        g.style('stroke-width', 1.5 / d3.event.transform.k + 'px');
        g.attr('transform', d3.event.transform);
      })

  }

  zoomTo(feature) {
    let t = d3.transition(null).duration(750);
    if (feature) {
      let { width, height } = this.svg.node().getBoundingClientRect();
      let bounds = this.path.bounds(feature),
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
      this.svg.transition(t).call(this.zoom.transform, d3.zoomIdentity);
    }
  }


}
