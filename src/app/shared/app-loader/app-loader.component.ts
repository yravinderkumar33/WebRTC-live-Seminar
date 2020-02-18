import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import * as _ from 'lodash-es';

/**
 * loader component
 */
@Component({
  selector: 'app-loader',
  templateUrl: './app-loader.component.html'
})
export class AppLoaderComponent implements OnInit {
  @Input() data;
  headerMessage: string = 'Please wait...';
  loaderMessage: string = 'Please wait while we are fetching data...';

  constructor() {
  }

  ngOnInit() {
    if (this.data) {
      this.headerMessage = this.data.headerMessage || this.headerMessage;
      this.loaderMessage = this.data.loaderMessage || this.loaderMessage;
    }
  }
}
