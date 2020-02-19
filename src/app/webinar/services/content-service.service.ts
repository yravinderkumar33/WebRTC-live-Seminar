import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
      header: {
        'Content-Type': 'application/json',
        'Authorization': environment.bearer
      },
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
        'Content-Type': 'application/json',
        'Authorization': environment.bearer,
        'x-channel-id': 'devcon'
      },
      data: {
        "request": {
          "rootId": rootId,
          "unitId": unitId,
          "children": children
        }
      },
      baseUrl: `${environment.baseUrl}/action/`,
      url: 'content/v3/hierarchy/add'
    }
    return this.patchRequestCall(requestObj);
  }

  createContent({ name, description = 'this is a test file', mediaType = undefined, mimeType, code, contentType, startTime = undefined, endTime = undefined, sessionDetails = undefined }) {
    const data = {
      "request": {
        "content": {
          "name": name,
          "mimeType": mimeType,
          "code": code,
          "contentType": contentType,
          description
        }
      }
    };
    if (mediaType) {
      data.request.content["mediaType"] = mediaType;
    }
    if (startTime) {
      data.request.content["startTime"] = startTime;
    }
    if (sessionDetails) {
      data.request.content["sessionDetails"] = sessionDetails;
    }
    if (endTime) {
      data.request.content["endTime"] = endTime;
    }

    const requestObj = {
      header: {
        'Content-Type': 'application/json',
        'Authorization': environment.bearer,
        'x-channel-id': 'devcon'
      },
      data,
      baseUrl: `${environment.baseUrl}/action/`,
      url: 'content/v3/create'
    }
    return this.postRequestCall(requestObj)
  }

  public uploadContent({ fileName = 'test.webm', contentId }) {
    const data = {
      "request": {
        "content": {
          "fileName": fileName
        }
      }
    }
    const requestObj = {
      header: {
        'Content-Type': 'application/json',
        'Authorization': environment.bearer
      },
      data,
      baseUrl: `${environment.baseUrl}/api/private/`,
      url: `content/v3/upload/url/${contentId}`
    }
    return this.postRequestCall(requestObj)
  }

  // method to upload the webinar recording to the azure blob storage.
  uploadFile({ url, contentData, fileName = 'recording.webm' }) {
    const blob = new Blob(contentData, { type: 'video/webm' });
    const file = new File([blob], `${fileName}`, { type: 'video/webm' });
    const httpOptions = {
      headers: new HttpHeaders({
        'enctype': 'multipart/form-data',
        'x-ms-blob-type': 'BlockBlob',
        'processData': 'false'
      })
    };
    return this.http.put(url, file, httpOptions);
  }

  updateContentWithVideo(fileURL, contentId) {
    const data = new FormData();
    data.append('fileUrl', fileURL);
    data.append('mimeType', 'video/webm');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': environment.bearer,
        'user-id': 'mahesh',
        'X-Channel-Id': 'devcon',
        'enctype': 'multipart/form-data',
        'processData': 'false',
        'contentType': 'false',
        'cache': 'false'
      })
    };
    const url = `https://devcon.sunbirded.org/api/private/content/v3/url/${contentId}`;
    return this.http.post(url, data, httpOptions);
  }

  public getCollectionHierarchy(identifier: string) {
    const req = {
      baseUrl: `${environment.baseUrl}/action/`,
      url: `content/v3/hierarchy/${identifier}?mode=edit`,
      header: {
        'Content-Type': 'application/json',
        'Authorization': environment.bearer,
        'X-Channel-Id': 'devcon'
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
