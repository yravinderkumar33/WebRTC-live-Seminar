import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mergeMap, map, catchError } from 'rxjs/operators'
import { throwError, of, from, forkJoin, Observable } from 'rxjs';
import * as _ from 'lodash-es';


@Injectable({
  providedIn: 'root'
})
export class ContentServiceService {

  constructor(private http: HttpClient) {
  }

  readContents(ids: string[]) {
    return forkJoin(_.map(ids, id => this.getCollectionHierarchy(id))).pipe(
      catchError(err => of([]))
    )
  }

  public getCollectionHierarchy(identifier: string) {
    const req = {
      baseUrl: `${environment.baseUrl}/api/`,
      url: `course/v1/hierarchy/${identifier}`
    };
    return this.getRequestCall(req).pipe(
      map(res => _.get(res, 'result.content'))
    );
  }


  public createWebinar(request) {

  }

  getRequestCall(requestParam): Observable<any> {
    const httpOptions = {
      headers: requestParam.header ? requestParam.header : {},
      params: requestParam.param
    };
    return this.http.get(_.get(requestParam, 'baseUrl') + requestParam.url, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
  }

  postRequestCall(requestParam) {
    const httpOptions = {
      params: requestParam.param,
      headers: _.get(requestParam, 'header')
    };
    return this.http.post(_.get(requestParam, 'baseUrl') + _.get(requestParam, 'url'), _.get(requestParam, 'data'), httpOptions).pipe(
      mergeMap((data: any) => {
        if (_.get(data, 'responseCode') !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
  }

  updateToc() {

  }

}
