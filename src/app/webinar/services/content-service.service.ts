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

  removeResourceFromHierarchy({ rootId, unitId, children }) {
    const requestObj = {
      header: {},
      data: {
        "request": {
          "rootId": rootId,
          "unitId": unitId,
          "children": children
        }
      },
      baseUrl: `${environment.baseUrl}/action/`,
      url: 'content/v3/hierarchy/remove'
    }
    return this.deleteRequestCall(requestObj);
  }

  addResourceToHierarchy({ rootId, unitId, children }) {
    const requestObj = {
      header: {
        'contentType': 'application/json',
        'Authorization': environment.bearer,
        'X-Channel-ID': 'devcon'
      },
      data: {
        "request": {
          "rootId": rootId,
          "unitId": unitId,
          "children": children
        }
      },
      baseUrl: `${environment.baseUrl}/api/`,
      url: 'private/content/v3/hierarchy/add'
    }
    return this.patchRequestCall(requestObj);
  }

  createContent({ name, mimeType, code, contentType, startTime, endTime }) {
    const requestObj = {
      header: {
        'contentType': 'application/json',
        'user-id': 'mahesh',
        'Authorization': environment.bearer,
        'X-Channel-ID': 'devcon'
      },
      data: {
        "request": {
          "content": {
            "name": name,
            "mimeType": mimeType,
            "code": code,
            "contentType": contentType,
            "startTime": startTime,
            "endTime": endTime
          }
        }
      },
      baseUrl: `${environment.baseUrl}/api/`,
      url: 'private/content/v3/create'
    }

    return this.postRequestCall(requestObj)
  }

  public getCollectionHierarchy(identifier: string) {
    const req = {
      baseUrl: `${environment.baseUrl}/api/`,
      url: `private/content/v3/hierarchy/${identifier}?mode=edit`,
      header: {
        'contentType': 'application/json',
        'user-id': 'mahesh',
        'Authorization': environment.bearer,
        'X-Channel-ID': 'devcon'
      }
    };
    return this.getRequestCall(req).pipe(
      map(res => _.get(res, 'result.content'))
    );
  }

  patchRequestCall(requestParam): Observable<any> {
    const httpOptions = {
      params: requestParam.param,
      headers: _.get(requestParam, 'header')
    };
    return this.http.patch(_.get(requestParam, 'baseUrl') + _.get(requestParam, 'url'), _.get(requestParam, 'data'), httpOptions).pipe(
      mergeMap((data: any) => {
        if (_.get(data, 'responseCode') !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
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

  deleteRequestCall(requestParam) {
    const httpOptions = {
      headers: _.get(requestParam, 'header'),
      params: requestParam.param,
      body: requestParam.data
    };
    return this.http.delete(_.get(requestParam, 'baseUrl') + requestParam.url, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode !== 'OK') {
          return throwError(data);
        }
        return of(data);
      }));
  }

}
