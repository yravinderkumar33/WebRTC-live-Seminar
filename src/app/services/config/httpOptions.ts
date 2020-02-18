import { HttpParams, HttpHeaders } from '@angular/common/http';

export interface HttpOptions {

    headers?: HttpHeaders | {[header: string]: string | any};

    params?: HttpParams | {
        [param: string]: string | string[];
    };

    reportProgress?: boolean;

    responseType?: 'json';

    body?: any;
    observe?: any;

}
