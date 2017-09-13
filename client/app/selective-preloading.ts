import { NgModule, Injectable } from '@angular/core';
import { Routes, Route, PreloadingStrategy, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preloadedModules: string[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      this.preloadedModules.push(route.path);
      return load();

    } else {
      return Observable.of(null);

    }
  }
}
